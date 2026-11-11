import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Arr } from 'ts-data-forge';
import { runInherited } from '../scripts/lib/child-process.mjs';
import { projectRootPath } from '../scripts/project-root-path.mjs';

/**
 * Prettier over a workspace member, honoring the root ignore files: every
 * member's `fix:fmt:full` (through `tools/scripts/cmd/format-package.mts`, run
 * with the member as the working directory), and any member script or generator
 * that formats what it wrote.
 *
 * Prettier reads `.gitignore` and `.prettierignore` only from the directory it
 * runs in, so a bare `prettier --write .` in a member reformats what the root
 * `.gitignore` ignores (`dist/`, TypeDoc `docs/`, local data). Prettier 3
 * resolves the patterns of an `--ignore-path` file against that file's own
 * directory, so the root files passed here mean what they mean at the root. A
 * member's own `.prettierignore`, where it has one, is read after them, as a
 * bare run would have read it.
 *
 * With no patterns it formats `.`, and a file Prettier has no parser for, or a
 * pattern that matches nothing, is not an error. Patterns given name what a
 * generator wrote, so one that matches nothing fails, as it would have with
 * Prettier run directly.
 *
 * `check:root:format-scripts` holds every member to this.
 */
export const prettierArguments = ({
  rootDir,
  packageIgnoreFile,
  patterns,
}: Readonly<{
  rootDir: string;
  /** The member's own `.prettierignore`, when it has one. */
  packageIgnoreFile: string | undefined;
  patterns: readonly string[];
}>): readonly string[] =>
  [
    '--config',
    path.join(rootDir, '.prettierrc'),
    '--ignore-path',
    path.join(rootDir, '.prettierignore'),
    '--ignore-path',
    path.join(rootDir, '.gitignore'),
    ...(packageIgnoreFile === undefined
      ? ([] as const)
      : (['--ignore-path', packageIgnoreFile] as const)),
    '--ignore-unknown',
    ...(Arr.isEmpty(patterns)
      ? (['--no-error-on-unmatched-pattern', '--write', '.'] as const)
      : Arr.toUnshifted('--write')(patterns)),
  ] as const;

/**
 * Runs Prettier as above in `cwd` (a member's directory) over `patterns`, and
 * returns its exit status.
 */
export const formatPackage = async ({
  cwd,
  patterns,
}: Readonly<{
  cwd: string;
  patterns: readonly string[];
}>): Promise<number> => {
  const ownIgnoreFile = path.join(cwd, '.prettierignore');

  const prettierCli = fileURLToPath(
    import.meta.resolve('prettier/bin/prettier.cjs'),
  );

  const result = await runInherited(
    process.execPath,
    Arr.toUnshifted(prettierCli)(
      prettierArguments({
        rootDir: projectRootPath,
        packageIgnoreFile:
          path.resolve(cwd) !== projectRootPath &&
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- the member's own directory.
          fs.existsSync(ownIgnoreFile)
            ? ownIgnoreFile
            : undefined,
        patterns,
      }),
    ),
    { cwd },
  );

  if (result.error !== undefined) {
    console.error(result.error);
  }

  return result.status ?? 1;
};
