import { exec, type ExecException } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

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

export const projectRootPath = path.resolve(import.meta.dirname, '..');

/**
 * Checks if a file or directory exists.
 * @param filePath - The path to check.
 * @returns True if the path exists.
 */
export const pathExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates that a path exists and throws if it doesn't.
 * @param filePath - The path to validate.
 * @param description - Description for error message.
 * @throws Error if path doesn't exist.
 */
export const ensurePathExists = async (
  filePath: string,
  description = 'Path',
): Promise<void> => {
  if (!(await pathExists(filePath))) {
    throw new Error(`${description} does not exist: ${filePath}`);
  }
};
