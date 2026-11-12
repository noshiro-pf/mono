/** Where this machine keeps what the commands remember between runs. */

import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { isRecord, Result, unknownToString } from 'ts-data-forge';

/** `~/.local/state/unblock-prs`, beside the worker's worktrees. */
export const stateRoot = (): string =>
  path.join(os.homedir(), '.local', 'state', 'unblock-prs');

/**
 * The text of `file`, a state file or the repository's configuration;
 * `undefined` when there is none. One that cannot be read is the error, not
 * none: a record read as empty hands back what it holds back.
 */
export const readTextFile = async (
  file: string,
): Promise<Result<string | undefined, string>> => {
  // The path is built from the state root or the repository root.
  const text = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(file, 'utf8'),
  );

  return Result.isOk(text)
    ? text
    : isRecord(text.value) && text.value['code'] === 'ENOENT'
      ? Result.ok(undefined)
      : Result.err(`cannot read ${file}: ${unknownToString(text.value)}`);
};
