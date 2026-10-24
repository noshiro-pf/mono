/** Running `git`, `gh` and `pnpm` from a command, and quoting what they take. */

import { Result } from 'ts-data-forge';
import { $ } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Runs a git or gh command silently and resolves to its stdout, or to a
 * message that includes what it printed to stderr. `unblock-prs` runs its
 * `pnpm` commands through it too.
 */
export const git = async (
  command: string,
  cwd: string = projectRootPath,
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
