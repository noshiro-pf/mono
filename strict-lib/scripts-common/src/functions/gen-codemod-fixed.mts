import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { makeEmptyDir } from 'ts-repo-utils';
import { type Context } from '../context.mjs';
import { transformDeclarationFile } from './codemod/transform-dts.mjs';

/**
 * Declaration files kept mutable, mirroring the `!(lib.dom|lib.webworker)`
 * glob that the ESLint `functional/prefer-readonly-type` rule was scoped to in
 * the now-removed `defineGenEslintConfig`.
 */
const readonlyExcludedFiles: ReadonlySet<string> = new Set([
  'lib.dom.d.ts',
  'lib.webworker.d.ts',
]);

/**
 * Read `lib*.d.ts` files in `source/temp/copied` and write transformed files to
 * `source/temp/codemod-fixed`.
 *
 * This replaces the previous ESLint `--fix` pass, applying the same two source
 * transformations that `defineGenEslintConfig` performed, via the fast
 * text-splice transform in {@link transformDeclarationFile}:
 *
 * - `any` -> `unknown` (formerly `@typescript-eslint/no-explicit-any` with
 *   `fixToUnknown: true`).
 * - readonly modifiers (formerly `functional/prefer-readonly-type`). As before,
 *   the files listed in {@link readonlyExcludedFiles} are left mutable.
 */
export const genCodemodFixed = async (
  ctx: Context,
): Promise<Result<undefined, unknown>> => {
  const { copied, codemodFixed } = ctx.paths.strictTsLib.source.temp;

  await makeEmptyDir(codemodFixed.$);

  const copiedFilenames = await fs.readdir(copied.$);

  const filenames = copiedFilenames.filter(
    (filename) => filename.startsWith('lib') && filename.endsWith('.d.ts'),
  );

  await Promise.all(
    filenames.map(async (filename) => {
      const originalCode = await fs.readFile(
        path.resolve(copied.$, filename),
        'utf8',
      );

      // `lib.dom` / `lib.webworker` skip the readonly conversion, matching the
      // previous ESLint config.
      const transformedCode = transformDeclarationFile(
        originalCode,
        !readonlyExcludedFiles.has(filename),
      );

      await fs.writeFile(
        path.resolve(codemodFixed.$, filename),
        transformedCode,
        'utf8',
      );
    }),
  );

  return Result.ok(undefined);
};
