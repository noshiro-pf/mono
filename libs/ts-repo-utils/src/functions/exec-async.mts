import * as childProcess from 'node:child_process';
import { Result } from 'ts-data-forge';

type ExecOptionsCustom = Readonly<{
  silent?: boolean;
}>;

type ExecOptionsWithStringEncoding = Readonly<
  childProcess.ExecOptionsWithStringEncoding & ExecOptionsCustom
>;

type ExecOptionsWithBufferEncoding = Readonly<
  childProcess.ExecOptionsWithBufferEncoding & ExecOptionsCustom
>;

type NormalizedExecOptions = Readonly<
  childProcess.ExecOptions & { encoding?: BufferEncoding | 'buffer' | null }
>;

export type ExecOptions = childProcess.ExecOptions & ExecOptionsCustom;

export type ExecResult<T extends string | Buffer> = Result<
  Readonly<{ stdout: T; stderr: T }>,
  childProcess.ExecException
>;

/**
 * Executes a shell command asynchronously.
 *
 * @param command - The command to execute.
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
    | ExecOptionsWithBufferEncoding
    | ExecOptionsWithStringEncoding
    | undefined = undefined,
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
    echo(`$ ${command}`);
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
          echo(stdout);
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
