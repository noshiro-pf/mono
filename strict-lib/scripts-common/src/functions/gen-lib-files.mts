import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { makeEmptyDir } from 'ts-repo-utils';
import { type Context } from '../context.mjs';
import {
  getSrcFileList,
  type ConverterConfig,
} from '../convert-dts/common.mjs';
import { convert } from '../convert-dts/convert-main.mjs';
import { rewriteTsTypeForgeRefs } from './codemod/rewrite-ts-type-forge-refs.mjs';

/** Generate files to `output/lib-files` and `output-branded/lib-files` */
export const genLibFiles = async (
  ctx: Context,
): Promise<Result<undefined, unknown>> => {
  const tsVersion = ctx.versionConfig.typescriptVersion;

  await Promise.all([
    makeEmptyDir(ctx.paths.strictTsLib.output.libFiles.$),
    makeEmptyDir(ctx.paths.strictTsLib.outputBranded.libFiles.$),
  ]);

  await Promise.all(
    ctx.configs.map((config) => createDtsFiles(ctx, config, tsVersion)),
  );

  return Result.ok(undefined);
};

const createDtsFiles = async (
  ctx: Context,
  config: ConverterConfig,
  tsVersion: string,
): Promise<void> => {
  const srcFileList = await getSrcFileList(
    ctx.paths.strictTsLib.source.temp.codemodFixed.$,
  );

  const outDir =
    ctx.paths.strictTsLib[config.useBrandedNumber ? 'outputBranded' : 'output']
      .libFiles.$;

  await Promise.all(
    srcFileList.map(async ({ content, filename }) => {
      const outputFile = path.resolve(outDir, filename);

      await fs.writeFile(
        outputFile,
        // Route ts-type-forge types through inline `import(...)` and drop the
        // global reference so the lib doesn't leak ts-type-forge's globals
        // into consumers.
        rewriteTsTypeForgeRefs(convert(filename, config, tsVersion)(content)),
      );

      console.info(`${outputFile} generated.`);
    }),
  );
};
