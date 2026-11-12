/**
 * The record `rework-pr start` keeps of taking `merge-queued` off a pull
 * request: the id of that label event, under the clone's common git directory
 * (`pr-merge-queue/rework-pr/<n>.queued`, where v1 keeps it, so that either
 * version's `done` reads the other's `start`), so that every worktree of the
 * clone reads the same one, and nothing in the working tree changes.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { hasKey, isRecord, Result, unknownToString } from 'ts-data-forge';
import { git } from './run.mjs';

/** The record of pull request `number`; `undefined` for none. */
export const readReworkRecord = async (
  cwd: string,
  number: number,
): Promise<Result<string | undefined, string>> => {
  const file = await recordPath(cwd, number);

  if (Result.isErr(file)) {
    return file;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the command's own record
  const read = await Result.fromPromise(fs.readFile(file.value, 'utf8'));

  return Result.isOk(read)
    ? read
    : isMissing(read.value)
      ? Result.ok(undefined)
      : Result.err(`cannot read ${file.value}: ${unknownToString(read.value)}`);
};

export const writeReworkRecord = async (
  cwd: string,
  number: number,
  text: string,
): Promise<Result<undefined, string>> => {
  const file = await recordPath(cwd, number);

  if (Result.isErr(file)) {
    return file;
  }

  const written = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the command's own record
    fs
      .mkdir(path.dirname(file.value), { recursive: true })
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- the command's own record
      .then(async () => fs.writeFile(file.value, text)),
  );

  return Result.isErr(written)
    ? Result.err(
        `cannot write ${file.value}: ${unknownToString(written.value)}`,
      )
    : Result.ok(undefined);
};

export const removeReworkRecord = async (
  cwd: string,
  number: number,
): Promise<Result<undefined, string>> => {
  const file = await recordPath(cwd, number);

  if (Result.isErr(file)) {
    return file;
  }

  const removed = await Result.fromPromise(fs.rm(file.value, { force: true }));

  return Result.isErr(removed)
    ? Result.err(
        `cannot remove ${file.value}: ${unknownToString(removed.value)}`,
      )
    : Result.ok(undefined);
};

const recordPath = async (
  cwd: string,
  number: number,
): Promise<Result<string, string>> =>
  Result.map(await git(cwd, ['rev-parse', '--git-common-dir']), (dir) =>
    path.resolve(
      cwd,
      dir.trim(),
      'pr-merge-queue',
      'rework-pr',
      `${number}.queued`,
    ),
  );

const isMissing = (error: unknown): boolean =>
  isRecord(error) && hasKey(error, 'code') && error.code === 'ENOENT';
