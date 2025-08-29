import * as childProcess from 'node:child_process';
import { Result } from 'ts-data-forge';

type ExecOptionsCustom = Readonly<{
  silent?: boolean;
}>;

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
  options?:
    | ExecOptionsCustom
    | Readonly<{ encoding: BufferEncoding } & ExecOptions>,
): Promise<ExecResult<string>>;

export function $(
  command: string,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  options?: Readonly<{ encoding: 'buffer' | null } & ExecOptions>,
): Promise<ExecResult<Buffer>>;

export function $(
  command: string,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  options?: Readonly<
    { encoding?: BufferEncoding | 'buffer' | null } & ExecOptions
  >,
): Promise<ExecResult<string | Buffer>> {
  const { silent = false, ...restOptions } = options ?? {};

  if (!silent) {
    echo(`$ ${command}`);
  }

  return new Promise((resolve) => {
    // eslint-disable-next-line security/detect-child-process
    childProcess.exec(command, restOptions, (error, stdout, stderr) => {
      if (!silent) {
        if (stdout !== '') {
          echo(stdout);
        }
        if (stderr !== '') {
          console.error(stderr);
        }
      }

      if (error !== null) {
        resolve(Result.err(error));
      } else {
        resolve(Result.ok({ stdout, stderr }));
      }
    });
  });
}
