import { exec, type ExecException } from 'node:child_process';
import { Result } from 'ts-data-forge';

/**
 * Executes a shell command asynchronously.
 * @param cmd - The command to execute.
 * @param options - Optional configuration for command execution.
 * @returns A promise that resolves with the command result.
 */
export const $ = (
  cmd: string,
  options: Readonly<{ silent?: boolean; timeout?: number }> = {},
): Promise<
  Result<Readonly<{ stdout: string; stderr: string }>, ExecException>
> => {
  const { silent = false, timeout = 30000 } = options;

  if (!silent) {
    console.log(`$ ${cmd}`);
  }

  return new Promise((resolve) => {
    const execOptions = { timeout };

    exec(cmd, execOptions, (error, stdout, stderr) => {
      if (!silent) {
        if (stdout !== '') {
          console.log(stdout);
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
};
