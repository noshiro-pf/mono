/** Running `git`, `gh` and `pnpm` from a command, and quoting what they take. */

import { Result } from 'ts-data-forge';
import { $ } from 'ts-repo-utils';

/**
 * Runs a git or gh command silently and resolves to its stdout, or to a
 * message that includes what it printed to stderr. `unblock-prs` runs its
 * `pnpm` commands through it too. It runs where the command was started
 * unless told otherwise; git finds the repository from any directory in it.
 */
export const git = async (
  command: string,
  cwd: string = process.cwd(),
): Promise<Result<string, string>> => {
  const result = await $(command, {
    cwd,
    silent: true,
    env: childEnv,
    maxBuffer: 64 * 1024 * 1024,
  });

  return Result.isOk(result)
    ? Result.ok(result.value.stdout)
    : Result.err(result.value.message.trim());
};

/**
 * The root of the repository the command runs in, where its configuration
 * files are read from: the working tree holding the current directory, or
 * the current directory itself where git finds none (a tree without `.git`).
 */
export const repoRoot = async (): Promise<string> => {
  const top = await git('git rev-parse --show-toplevel');

  return Result.isOk(top) ? top.value.trim() : process.cwd();
};

/** Single-quotes a string for a POSIX shell. */
export const sh = (value: string): string =>
  `'${value.replaceAll("'", String.raw`'\''`)}'` as const;

/**
 * Passed to every git and gh invocation. `GIT_TERMINAL_PROMPT=0` turns a
 * missing credential into a failure instead of a hang; `GIT_EDITOR=true`
 * keeps any editor git might want out of the way.
 */
const childEnv: NodeJS.ProcessEnv = {
  ...process.env,
  GIT_TERMINAL_PROMPT: '0',
  GIT_EDITOR: 'true',
} as const;
