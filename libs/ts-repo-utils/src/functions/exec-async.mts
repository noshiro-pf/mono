import * as childProcess from 'node:child_process';
import { Result } from 'ts-data-forge';

type ExecOptionsCustom = Readonly<{
  silent?: boolean;
}>;

type ExecOptionsWithStringEncoding =
  childProcess.ExecOptionsWithStringEncoding & ExecOptionsCustom;

type ExecOptionsWithBufferEncoding =
  childProcess.ExecOptionsWithBufferEncoding & ExecOptionsCustom;

type NormalizedExecOptions = childProcess.ExecOptions &
  Readonly<{ encoding?: BufferEncoding | 'buffer' | null }>;

export type ExecOptions = childProcess.ExecOptions & ExecOptionsCustom;

export type ExecResult<T extends string | Buffer> = Result<
  Readonly<{ stdout: T; stderr: T }>,
  childProcess.ExecException
>;

/**
 * Executes a shell command asynchronously.
 *
 * `command` is a command line, and it is run by a shell. That is the contract,
 * and it is what makes `$` useful — but it also means **a value that is data
 * must not be interpolated into it**. A branch name, a path, a message, or
 * anything else that came from a caller or from the environment stops being
 * data once it is part of this string: the shell reads its punctuation as
 * syntax, and whatever program runs then reads the rest as its own options.
 *
 * Build an argv and start the process without a shell instead — `execGit` in
 * `diff.mts` is the example to copy. Use `$` for a command line that is
 * entirely written here, in this repository, by us.
 *
 * @param command - The command to execute. A literal command line, not a
 *   template filled with values from elsewhere.
 * @param options - Optional configuration for command execution.
 * @returns A promise that resolves with the command result.
 */

export function $(
  command: string,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  options?: ExecOptionsWithStringEncoding,
): Promise<ExecResult<string>>;

export function $(
  command: string,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  options: ExecOptionsWithBufferEncoding,
): Promise<ExecResult<Buffer>>;

export function $<
  TOptions extends
    ExecOptionsWithBufferEncoding | ExecOptionsWithStringEncoding | undefined =
    undefined,
>(
  command: string,
  options?: TOptions,
): Promise<
  ExecResult<TOptions extends ExecOptionsWithBufferEncoding ? Buffer : string>
>;

export function $(
  command: string,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  options?: ExecOptionsWithStringEncoding | ExecOptionsWithBufferEncoding,
): Promise<ExecResult<string | Buffer>> {
  const { silent = false, ...restOptions } = options ?? {};

  const normalizedOptions: NormalizedExecOptions = restOptions;

  if (!silent) {
    console.info(`$ ${command}`);
  }

  return new Promise((resolve) => {
    const handleResult = <T extends string | Buffer>(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      error: childProcess.ExecException | null,
      stdout: T,
      stderr: T,
    ): void => {
      if (!silent) {
        if (!isEmpty(stdout)) {
          console.info(stdout);
        }

        if (!isEmpty(stderr)) {
          console.error(stderr);
        }
      }

      if (error !== null) {
        resolve(Result.err(error));

        return;
      }

      resolve(
        Result.ok<Readonly<{ stdout: T; stderr: T }>>({ stdout, stderr }),
      );
    };

    const encoding = normalizedOptions.encoding;

    if (encoding === 'buffer' || encoding === null) {
      // eslint-disable-next-line security/detect-child-process
      childProcess.exec(
        command,
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        normalizedOptions as childProcess.ExecOptionsWithBufferEncoding,
        (error, stdout, stderr) => {
          handleResult(error, stdout, stderr);
        },
      );

      return;
    }

    // eslint-disable-next-line security/detect-child-process
    childProcess.exec(
      command,
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      normalizedOptions as childProcess.ExecOptionsWithStringEncoding,
      (error, stdout, stderr) => {
        handleResult(error, stdout, stderr);
      },
    );
  });
}

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const isEmpty = (value: string | Buffer): boolean =>
  typeof value === 'string' ? value === '' : value.length === 0;
