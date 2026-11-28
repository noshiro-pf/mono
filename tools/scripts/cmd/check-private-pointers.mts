import { Arr, asPositiveUint32, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { listCheckoutFiles, readRepositoryFile } from '../lib/repo-files.mjs';
// From the hook rather than from `tools/scripts/lib/`: the hook runs with plain
// `node` and may import nothing but `node:*`, so the pattern lives there.
import { findPointers } from './claude-code-public-write-gate.mjs';

/**
 * Fails when a file of the checkout, by its path or its text, points into the
 * private security repository: an issue number of it, or a path below it.
 *
 * This repository is public, and a pointer tells every reader where to look in
 * a repository they cannot see, which is itself what that repository holds
 * ("Private information" in CLAUDE.md). The Claude Code hook
 * `claude-code-public-write-gate.mts` refuses one in the text a call carries
 * and in the messages a push sends, but not in its diffs; this reads those as
 * files, tracked and untracked alike, before the push in `check-changed` and on
 * any diff in CI. The pattern is the hook's, read by its {@link findPointers}, so
 * the two cannot disagree.
 *
 * It reads the checkout, not a commit: in `check-changed` that is what is about
 * to be committed, in CI it is the commit. A commit pushed that differs from
 * the checkout is the hook's review to catch.
 *
 * Naming the repository as where findings go is not a pointer. `experimental/`,
 * which nothing else checks, is read too, as it is published like the rest. A
 * diff touching it alone skips the check workflows; `verify-lockfile.yml` reads
 * it then, with the hook's `--scan`, which needs no install.
 */
export const checkPrivatePointers = async (): Promise<
  Result<number, string>
> => {
  const listed = await listCheckoutFiles();

  if (Result.isErr(listed)) {
    return Result.err(`❌ ${listed.value}`);
  }

  // In batches, so that the files open at once stay well under a machine's
  // limit (macOS allows a few thousand).
  const mut_read: Result<readonly string[], string>[] = [];

  for (const batch of Arr.chunk(listed.value, BATCH_SIZE)) {
    const results = await Promise.all(
      batch.map(async (file) =>
        Result.map(await readRepositoryFile(file), (content) =>
          findPointers(file, content),
        ),
      ),
    );

    mut_read.push(...results);
  }

  const read: readonly Result<readonly string[], string>[] = mut_read;

  // A file that cannot be read fails the check rather than passing unread.
  const failed = read.find(Result.isErr);

  if (failed !== undefined) {
    return Result.err(`❌ ${failed.value}`);
  }

  const offenders = read.flatMap((result) =>
    Result.isOk(result) ? result.value : [],
  );

  if (Arr.isNonEmpty(offenders)) {
    return Result.err(
      [
        `❌ ${offenders.length} pointer(s) into the private repository:`,
        '',
        ...offenders.map((offender) => `  ${offender}`),
        '',
        'This repository is public: a pointer tells every reader where to look',
        'in a repository they cannot see. Name the change by what it does here,',
        'and leave the private repository to say what it closes.',
      ].join('\n'),
    );
  }

  return Result.ok(listed.value.length);
};

/** How many files are read at once. */
const BATCH_SIZE = asPositiveUint32(256);

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkPrivatePointers().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} file(s) of the checkout read; none points into the private repository.`,
  );
}
