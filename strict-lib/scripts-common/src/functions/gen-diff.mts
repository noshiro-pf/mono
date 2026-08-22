import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { Result, type UnknownResult } from 'ts-data-forge';
import { $, glob, makeEmptyDir } from 'ts-repo-utils';
import { type Context } from '../context.mjs';
import { formatDir } from './utils/format.mjs';
import { wrapStartEnd } from './utils/wrap-start-end.mjs';

export const prepareCopiedForDiff = async (
  ctx: Context,
): Promise<UnknownResult> => {
  const { copied, copiedForDiff } = ctx.paths.strictTsLib.source.temp;

  await makeEmptyDir(copiedForDiff.$);

  {
    const res = await $(`cp ${copied.$}/* ${copiedForDiff.$}/`);

    if (Result.isErr(res)) {
      console.error(res.value);

      return res;
    }
  }

  return wrapStartEnd(
    () => formatDir(copiedForDiff.$),
    'formatFiles("source/temp/copied-for-diff")',
  );
};

/**
 * Compare `source/temp/copied-for-diff/*` and `output/lib-files/*` and generate
 * `.diff` files to `output/diff`
 */
export const genDiff = async (
  ctx: Context,
): Promise<Result<undefined, unknown>> => {
  const { copiedForDiff } = ctx.paths.strictTsLib.source.temp;

  const { diff, libFiles } = ctx.paths.strictTsLib.output;

  const files = await glob(`${copiedForDiff.$}/*`);

  if (Result.isErr(files)) {
    return files;
  }

  await makeEmptyDir(diff.$);

  for (const file of files.value) {
    const filename = path.basename(file);

    const name = path.basename(file, '.d.ts');

    console.info(filename);

    const args = [
      '--no-index',
      `${copiedForDiff.$}/${name}.d.ts`,
      `${libFiles.$}/${name}.d.ts`,
    ].join(' ');

    const result = await $(`git diff ${args} || true`, {
      maxBuffer: 100 * 1024 * 1024, // 100MB
    });

    if (Result.isErr(result)) {
      return result;
    }

    const output = result.value.stdout;

    await fs.writeFile(
      path.resolve(diff.$, `${name}.diff`),
      Arr.skip(output.split('\n'), 4).join('\n'),
    );
  }

  return Result.ok(undefined);
};
