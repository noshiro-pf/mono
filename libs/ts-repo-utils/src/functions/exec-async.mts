import {
  exec,
  type ExecException,
  type ExecOptions as ExecOptions_,
} from 'node:child_process';
import { Result } from 'ts-data-forge';

type ExecOptionsCustom = Readonly<{
  silent?: boolean;
}>;

export type ExecOptions = DeepReadonly<ExecOptions_ & ExecOptionsCustom>;

export type ExecResult<T extends string | Buffer> = Result<
  Readonly<{ stdout: T; stderr: T }>,
  ExecException
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
  options?: ExecOptionsCustom,
): Promise<ExecResult<string>>;

export function $(
  command: string,
  options: Readonly<{ encoding: 'buffer' | null } & ExecOptions>,
): Promise<ExecResult<Buffer>>;

export function $(
  command: string,
  options: Readonly<{ encoding: BufferEncoding } & ExecOptions>,
): Promise<ExecResult<string>>;

export function $(
  command: string,
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
    exec(
      command,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      restOptions as {
        encoding?: 'buffer' | null | BufferEncoding;
      } & ExecOptions_,
      (error, stdout, stderr) => {
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
      },
    );
  });
}
