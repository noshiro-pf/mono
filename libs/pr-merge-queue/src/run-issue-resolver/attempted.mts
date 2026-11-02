/** The issues earlier sessions were handed, kept across runs of the command. */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { RepoRef } from 'pr-report-core';
import { Arr, isRecord, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { pullRequestNumber, readJsonFile } from '../lib/index.mjs';

/**
 * Where the issues handed to sessions in `repo` are kept, beside the worker's
 * worktrees under `root`. In a file rather than in the process, because the
 * command exits after `--max-sessions`: an issue a session could not finish
 * would otherwise be paid for again on every run. Removing the file hands every
 * issue on once more. A directory per owner, since either name may hold a `-`.
 */
export const attemptedFile = (root: string, repo: RepoRef): string =>
  path.join(root, 'run-issue-resolver', repo.owner, `${repo.name}.json`);

/**
 * Each issue handed to a session, with its `updatedAt` as the session left it,
 * or `undefined` where that could not be read. No file yet is none.
 */
export const loadAttempted = async (
  file: string,
): Promise<Result<ReadonlyMap<number, string | undefined>, string>> => {
  const exists = await Result.fromPromise(fs.access(file));

  // Only a file that is not there is none: one that cannot be read would hand
  // every issue on again.
  if (Result.isErr(exists)) {
    return isRecord(exists.value) && exists.value['code'] === 'ENOENT'
      ? Result.ok(new Map<number, string | undefined>())
      : Result.err(
          `cannot read ${file}: ${unknownToString(exists.value)}; remove the file to hand every issue on once more`,
        );
  }

  const read = await readJsonFile(file, AttemptedSchema);

  return Result.isErr(read)
    ? Result.err(
        `${read.value}; remove the file to hand every issue on once more`,
      )
    : Result.ok(
        new Map<number, string | undefined>(
          Arr.generate(function* () {
            for (const [key, updatedAt] of Object.entries(
              read.value.attempted,
            )) {
              const number = pullRequestNumber(key);

              // Not one this command wrote; nothing to hold back.
              if (number !== undefined) {
                yield [number, updatedAt ?? undefined] as const;
              }
            }
          }),
        ),
      );
};

/**
 * Adds one issue to the record in `file`, read again first so that a second run
 * of the command on the same repository keeps what the first one wrote, and
 * written through a file of this process's own beside it, so that a command
 * stopped mid-write leaves the previous record rather than half of one.
 * Resolves to the record as written.
 */
export const recordAttempted = async (
  file: string,
  number: number,
  updatedAt: string | undefined,
): Promise<Result<ReadonlyMap<number, string | undefined>, string>> => {
  const loaded = await loadAttempted(file);

  if (Result.isErr(loaded)) {
    return loaded;
  }

  const attempted = new Map<number, string | undefined>([
    ...loaded.value,
    [number, updatedAt],
  ]);

  const body = {
    attempted: Object.fromEntries(
      Array.from(attempted, ([each, at]) => [each.toString(), at ?? null]),
    ),
  } as const;

  const partial = `${file}.${process.pid}.partial` as const;

  const written = await Result.fromPromise(
    (async () => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- the command's own state file
      await fs.mkdir(path.dirname(file), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- the command's own state file
      await fs.writeFile(partial, `${JSON.stringify(body, undefined, 2)}\n`);

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- the command's own state file
      await fs.rename(partial, file);
    })(),
  );

  return Result.isErr(written)
    ? Result.err(`cannot write ${file}: ${unknownToString(written.value)}`)
    : Result.ok(attempted);
};

/** Each issue by its number, with its `updatedAt` or `null`. */
const AttemptedSchema = t.record({
  attempted: t.keyValueRecord(t.string(), t.union([t.string(), t.nullType])),
});
