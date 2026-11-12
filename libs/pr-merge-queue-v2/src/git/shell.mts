/**
 * Running a command the repository's configuration wrote (`.github/
 * unblock-prs.json`: Auto-fix's and Regenerate's), which is a shell line by
 * design, and quoting what goes into one.
 */

import { execFile } from 'node:child_process';
import { Num, Result, unknownToString } from 'ts-data-forge';
import { gitEnv } from './run.mjs';

/**
 * What `command`, run by `sh -c` in `cwd`, printed, or why it failed with the
 * last lines it printed, in {@link gitEnv}.
 */
export const shell = (
  cwd: string,
  command: string,
): Promise<Result<string, string>> =>
  new Promise((resolve) => {
    execFile(
      'sh',
      ['-c', command],
      {
        cwd,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
        env: gitEnv(process.env),
      },
      (error, stdout, stderr) => {
        const printed = [stdout.trim(), stderr.trim()]
          .filter((part) => part !== '')
          .join('\n');

        resolve(
          error === null
            ? Result.ok(stdout)
            : Result.err(
                printed === ''
                  ? unknownToString(error)
                  : lastLines(printed, 60),
              ),
        );
      },
    );
  });

/** Single-quotes `value` for a POSIX shell. */
export const shellQuote = (value: string): string =>
  `'${value.replaceAll("'", String.raw`'\''`)}'` as const;

/**
 * `run` with `$1` to `$9` replaced by `groups`, each quoted: a fixer's command
 * from a failed context's name, a generator's from a conflicted path, both
 * whatever a job or a pull request chose.
 */
export const withCaptures = (
  run: string,
  groups: readonly (string | undefined)[],
): string =>
  run.replaceAll(/\$([1-9])/gu, (_, index: string | undefined) =>
    shellQuote(
      groups[Result.unwrapOkOr(Num.safeParseInt(index ?? ''), Number.NaN)] ??
        '',
    ),
  );

/** The last `count` lines of `text`. */
export const lastLines = (text: string, count: number): string =>
  text.split('\n').slice(-count).join('\n');
