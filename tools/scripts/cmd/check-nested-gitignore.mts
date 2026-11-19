import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { listTrackedFiles } from '../lib/repo-files.mjs';

/**
 * Fails when a `.gitignore` other than the root one is tracked, or a
 * `.prettierignore` other than the root one and those on
 * {@link ALLOWED_PRETTIERIGNORES}.
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

  const prettierignores = findNestedPrettierignores(tracked.value);

  const problems = [
    ...(Arr.isNonEmpty(offenders)
      ? ([
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
        ] as const)
      : ([] as const)),
    ...(Arr.isNonEmpty(prettierignores.notAllowed)
      ? ([
          [
            `❌ ${prettierignores.notAllowed.length} tracked \`.prettierignore\` file(s) besides the root one and ALLOWED_PRETTIERIGNORES in tools/scripts/cmd/check-nested-gitignore.mts:`,
            '',
            ...prettierignores.notAllowed.map((file) => `  ${file}`),
            '',
            'A package-level `.prettierignore` is read only by the Prettier run',
            "started in its directory (the package's own `fix:fmt`), not by the",
            'root one, so its patterns belong in the root `.prettierignore`.',
            'Delete it, or add it to ALLOWED_PRETTIERIGNORES with the reason the',
            'root file cannot serve.',
          ].join('\n'),
        ] as const)
      : ([] as const)),
    ...(Arr.isNonEmpty(prettierignores.stale)
      ? ([
          [
            `❌ ${prettierignores.stale.length} ALLOWED_PRETTIERIGNORES entries naming no tracked file:`,
            '',
            ...prettierignores.stale.map((file) => `  ${file}`),
            '',
            'Remove the entry from tools/scripts/cmd/check-nested-gitignore.mts.',
          ].join('\n'),
        ] as const)
      : ([] as const)),
  ] as const;

  return Arr.isNonEmpty(problems)
    ? Result.err(problems.join('\n\n'))
    : Result.ok(tracked.value.length);
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

/**
 * The tracked package-level `.prettierignore` files outside `experimental/` not
 * on `allowed`, and the entries of `allowed` that name no tracked file.
 */
export const findNestedPrettierignores = (
  trackedFiles: readonly string[],
  allowed: ReadonlyMap<string, string> = ALLOWED_PRETTIERIGNORES,
): Readonly<{ notAllowed: readonly string[]; stale: readonly string[] }> => {
  const nested = trackedFiles.filter(
    (file) =>
      file !== PRETTIERIGNORE &&
      path.posix.basename(file).toLowerCase() === PRETTIERIGNORE &&
      !file.startsWith('experimental/'),
  );

  return {
    notAllowed: nested.filter((file) => !allowed.has(file)),
    stale: Array.from(allowed.keys()).filter(
      (file) => !trackedFiles.includes(file),
    ),
  };
};

/**
 * The package-level `.prettierignore` files kept on purpose, each with why the
 * root one cannot serve.
 */
export const ALLOWED_PRETTIERIGNORES: ReadonlyMap<string, string> = new Map<
  string,
  string
>([
  [
    'languages/sumi/conformance/.prettierignore',
    "the package's fmt script runs Prettier from this directory, which resolves its ignore path from there and does not read the root file (its header says so)",
  ],
]);

const GITIGNORE = '.gitignore';

const PRETTIERIGNORE = '.prettierignore';

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkNestedGitignore().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} tracked file(s) checked; the root \`.gitignore\` is the only one outside \`experimental/\`, and every other \`.prettierignore\` is on the allow-list.`,
  );
}
