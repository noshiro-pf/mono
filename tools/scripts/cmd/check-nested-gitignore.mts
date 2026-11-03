import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { listTrackedFiles } from '../lib/repo-files.mjs';

/**
 * Fails when a `.gitignore` other than the root one is tracked.
 *
 * Prettier reads `.gitignore` only from the directory it runs in, so a pattern
 * in a nested one keeps git quiet while Prettier goes on reformatting the files
 * it names. A deck or package started by copying a directory that has one
 * inherits it without anyone deciding to. The reason is written at the
 * "mono-specific" header of the root `.gitignore`; the pattern goes there
 * instead.
 *
 * `experimental/` is left alone: nothing there is formatted or checked, and its
 * imported repositories keep their files as they were.
 */
export const checkNestedGitignore = async (): Promise<
  Result<number, string>
> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return Result.err(`❌ ${tracked.value}`);
  }

  const offenders = findNestedGitignores(tracked.value);

  if (Arr.isNonEmpty(offenders)) {
    return Result.err(
      [
        `❌ ${offenders.length} tracked \`.gitignore\` file(s) besides the root one:`,
        '',
        ...offenders.map((file) => `  ${file}`),
        '',
        'Prettier reads `.gitignore` only from the directory it runs in (the',
        'root), so a nested one hides files from git but not from Prettier.',
        'Move its patterns into the root `.gitignore`, prefixed with its',
        'directory (`/build` in `libs/a/` becomes `/libs/a/build`), and delete it.',
      ].join('\n'),
    );
  }

  return Result.ok(tracked.value.length);
};

/** The tracked `.gitignore` files other than the root one, outside `experimental/`. */
export const findNestedGitignores = (
  trackedFiles: readonly string[],
): readonly string[] =>
  trackedFiles.filter(
    (file) =>
      file !== GITIGNORE &&
      // Lowercased, because a case-insensitive file system (macOS by default)
      // applies `.GitIgnore` as git's `.gitignore`.
      path.posix.basename(file).toLowerCase() === GITIGNORE &&
      !file.startsWith('experimental/'),
  );

const GITIGNORE = '.gitignore';

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkNestedGitignore().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} tracked file(s) checked; the root \`.gitignore\` is the only one outside \`experimental/\`.`,
  );
}
