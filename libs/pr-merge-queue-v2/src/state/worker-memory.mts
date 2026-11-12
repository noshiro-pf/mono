/**
 * The worker's memory file (`spec/worker.md`, "Memory"): one per repository,
 * under `~/.local/state/unblock-prs/worker/`, replaced whole after each cycle.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { RepoRef } from 'pr-report-core-v2';
import { Result, unknownToString } from 'ts-data-forge';

/** Where the memory of `repo` is, under the state directory `root`. */
export const workerMemoryPath = (root: string, repo: RepoRef): string =>
  path.join(root, 'worker', repo.owner, `${repo.name}.json`);

/**
 * Writes `text` to `file` by writing a temporary file beside it and renaming it
 * over, so that a run stopped midway leaves the old file or the new one, never
 * half of either.
 */
export const replaceFile = async (
  file: string,
  text: string,
): Promise<Result<undefined, string>> => {
  const temporary = `${file}.${process.pid}.tmp` as const;

  // Every path here is under the state root.
  const written = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs
      .mkdir(path.dirname(file), { recursive: true })
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      .then(async () => fs.writeFile(temporary, text))
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      .then(async () => fs.rename(temporary, file)),
  );

  return Result.isErr(written)
    ? Result.err(`cannot write ${file}: ${unknownToString(written.value)}`)
    : Result.ok(undefined);
};
