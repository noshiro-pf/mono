/**
 * What only the checkout says: its `origin`, its root manifest, and `gh`'s
 * token. Each answers `undefined` or an error rather than throwing, so that a
 * tree without `.git` or a machine without `gh` falls through to the next
 * source.
 */

import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';

/** What `command args…` printed, or why it failed. */
export const run = (
  command: string,
  args: readonly string[],
): Promise<Result<string, string>> =>
  new Promise((resolve) => {
    execFile(command, args, { encoding: 'utf8' }, (error, stdout) => {
      resolve(
        error === null
          ? Result.ok(stdout)
          : Result.err(`${command}: ${unknownToString(error)}`),
      );
    });
  });

export const originUrl = async (): Promise<string | undefined> =>
  Result.unwrapOkOr(
    Result.map(await run('git', ['remote', 'get-url', 'origin']), (url) =>
      url.trim(),
    ),
    undefined,
  );

/**
 * The repository URL of the root `package.json` as committed: read through
 * `git`, which knows where the root is, rather than from a path on disk.
 */
export const manifestUrl = async (): Promise<string | undefined> => {
  const text = await run('git', ['show', 'HEAD:package.json']);

  if (Result.isErr(text)) {
    return undefined;
  }

  const manifest = Result.fromThrowable((): unknown => JSON.parse(text.value));

  return Result.isErr(manifest)
    ? undefined
    : Result.unwrapOkOr(
        Result.map(ManifestSchema.validate(manifest.value), ({ repository }) =>
          typeof repository === 'string' ? repository : repository.url,
        ),
        undefined,
      );
};

/**
 * A file of the checkout as it is in the working tree, by its path from the
 * root; `undefined` when there is none.
 */
export const checkoutFile = async (
  pathFromRoot: string,
): Promise<string | undefined> => {
  const root = await run('git', ['rev-parse', '--show-toplevel']);

  if (Result.isErr(root)) {
    return undefined;
  }

  // The path is the repository's own, joined to the root git names.
  const text = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.join(root.value.trim(), pathFromRoot), 'utf8'),
  );

  return Result.unwrapOkOr(text, undefined);
};

export const ghAuthToken = (): Promise<Result<string, string>> =>
  run('gh', ['auth', 'token']);

const ManifestSchema = t.record({
  repository: t.union([t.string(), t.record({ url: t.string() })]),
});
