/** Running git without a shell, so a branch name is passed as it is. */

import { type ExecException, execFile } from 'node:child_process';
import { Result, unknownToString } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';

/** What `git args…` printed in `cwd`, or why it failed, run in {@link gitEnv}. */
export const git = (
  cwd: string,
  args: readonly string[],
): Promise<Result<string, string>> =>
  new Promise((resolve) => {
    runGit(cwd, args, (error, stdout, stderr) => {
      resolve(
        error === null
          ? Result.ok(stdout)
          : Result.err(
              `git ${args.join(' ')}: ${stderr.trim() === '' ? unknownToString(error) : stderr.trim()}`,
            ),
      );
    });
  });

/**
 * The exit code of `git args…` in `cwd`, run as {@link git} runs it, or why it
 * could not be run.
 */
export const gitExitCode = (
  cwd: string,
  args: readonly string[],
): Promise<Result<number, string>> =>
  new Promise((resolve) => {
    runGit(cwd, args, (error) => {
      resolve(
        error === null
          ? Result.ok(0)
          : typeof error.code === 'number'
            ? Result.ok(error.code)
            : Result.err(`git ${args.join(' ')}: ${unknownToString(error)}`),
      );
    });
  });

/**
 * `env` as the package's git commands run in it, through {@link git},
 * {@link gitExitCode} or a configured shell line, and the hooks and commands
 * those run. No credential is asked for, which nobody is there to answer (a
 * missing one fails rather than hangs), and no editor waited on (`GIT_EDITOR`
 * wins over `core.editor`), so `rebase --continue` keeps each message.
 *
 * The clone's configuration that would change what a rebase or a cherry-pick
 * replays is pinned for every command, by the environment rather than by
 * arguments, so no way of building them can miss one: the merge backend (which
 * drops a commit emptied by a resolution rather than stopping on it), merges
 * flattened and no other branch moved along, and no recorded resolution used,
 * which every stop reads: one would leave a conflicted file staged and the stop
 * reading as the environment's, and record into the clone's shared cache. The
 * pins are appended to `GIT_CONFIG_PARAMETERS`, where `-c` puts what it sets,
 * read after every other source and the last entry winning: an inherited `-c`
 * cannot undo them, and only a `-c` of the queue's own command line could.
 */
export const gitEnv = (
  env: Readonly<NodeJS.ProcessEnv>,
): Readonly<NodeJS.ProcessEnv> =>
  ({
    ...env,
    GIT_TERMINAL_PROMPT: '0',
    GIT_EDITOR: 'true',
    GIT_CONFIG_PARAMETERS: [
      env['GIT_CONFIG_PARAMETERS'] ?? '',
      PINNED_PARAMETERS,
    ]
      .filter((part) => part.trim() !== '')
      .join(' '),
  }) as const;

/**
 * Each `'key=value'` single-quoted as `-c` writes them, the form every git
 * reads.
 */
const PINNED_PARAMETERS = (
  [
    ['rebase.backend', 'merge'],
    ['rebase.rebaseMerges', 'false'],
    ['rebase.updateRefs', 'false'],
    ['rerere.enabled', 'false'],
  ] as const
)
  .map(
    ([key, value]) =>
      `'${`${key}=${value}`.replaceAll("'", String.raw`'\''`)}'`,
  )
  .join(' ');

/** `git args…` in `cwd`, in {@link gitEnv}. */
const runGit = (
  cwd: string,
  args: readonly string[],
  done: (
    error: DeepReadonly<ExecException> | null,
    stdout: string,
    stderr: string,
  ) => void,
): void => {
  execFile(
    'git',
    args,
    {
      cwd,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      env: gitEnv(process.env),
    },
    done,
  );
};
