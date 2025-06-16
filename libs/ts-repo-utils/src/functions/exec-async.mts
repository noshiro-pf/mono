import { exec, type ExecException } from 'node:child_process';

export type ExecResult = Readonly<
  | { type: 'ok'; stdout: string; stderr: string }
  | { type: 'error'; exception: ExecException }
>;

/**
 * Executes a shell command asynchronously.
 * @param cmd - The command to execute.
 * @param options - Optional configuration for command execution.
 * @returns A promise that resolves with the command result.
 */
export const $ = (
  cmd: string,
  options: Readonly<{ silent?: boolean; timeout?: number }> = {},
): Promise<ExecResult> => {
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
        resolve({ type: 'error', exception: error });
      } else {
        resolve({ type: 'ok', stdout, stderr });
      }
    });
  });
};
