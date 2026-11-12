import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result, Arr } from 'ts-data-forge';
import { makeEmptyDir } from 'ts-repo-utils';
import type { Context } from '../context.mjs';
import {
  getSrcFileList,
  type ConverterConfig,
} from '../convert-dts/common.mjs';
import {
  convert,
  registeredLibFileNames,
  sharedGlobalVarNames,
} from '../convert-dts/convert-main.mjs';
import { movedWithoutConverter } from '../convert-dts/moved-without-converter.mjs';
import { rewriteTsTypeForgeRefs } from './codemod/rewrite-ts-type-forge-refs.mjs';

/** Generate files to `output/lib-files` and `output/lib-files-branded` */
export const genLibFiles = async (
  ctx: Context,
): Promise<Result<undefined, unknown>> => {
  const tsVersion = ctx.versionConfig.typescriptVersion;

  const srcFileList = await getSrcFileList(
    ctx.paths.strictTsLib.source.temp.codemodFixed.$,
  );

  // Before anything is written: a lib file TypeScript renamed would otherwise
  // be generated with no rewrite at all, and nothing would say so.
  const moved = movedWithoutConverter(registeredLibFileNames, srcFileList);

  if (Arr.isNonEmpty(moved)) {
    return Result.err(
      [
        `TypeScript ${tsVersion} has lib files that look like the new home of a file a converter is registered for.`,
        'Register each in `perFileConverters` (convert-main.mts): with the same converter if it was moved, or as `() => idFn` with the reason if it needs none.',
        ...moved.map(
          ({ registered, present }) =>
            `  ${present} (registered: ${registered})`,
        ),
      ].join('\n'),
    );
  }

  await Promise.all([
    makeEmptyDir(ctx.paths.strictTsLib.output.libFiles.$),
    makeEmptyDir(ctx.paths.strictTsLib.output.libFilesBranded.$),
  ]);

  await Promise.all(
    ctx.configs.map((config) =>
      createDtsFiles(ctx, config, tsVersion, srcFileList),
    ),
  );

  return Result.ok(undefined);
};

const createDtsFiles = async (
  ctx: Context,
  config: ConverterConfig,
  tsVersion: string,
  srcFileList: readonly Readonly<{ filename: string; content: string }>[],
): Promise<void> => {
  const sharedGlobals = sharedGlobalVarNames(srcFileList);

  const outDir =
    ctx.paths.strictTsLib.output[
      config.useBrandedNumber ? 'libFilesBranded' : 'libFiles'
    ].$;

  await Promise.all(
    srcFileList.map(async ({ content, filename }) => {
      const outputFile = path.resolve(outDir, filename);

      await fs.writeFile(
        outputFile,
        // Route ts-type-forge types through inline `import(...)` and drop the
        // global reference so the lib doesn't leak ts-type-forge's globals
        // into consumers.
        rewriteTsTypeForgeRefs(
          convert(filename, config, tsVersion, sharedGlobals)(content),
        ),
      );

      console.info(`${outputFile} generated.`);
    }),
  );
};
