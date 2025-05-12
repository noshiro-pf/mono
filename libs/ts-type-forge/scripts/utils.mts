import { exec, type ExecException } from 'node:child_process';
import * as path from 'node:path';

export type ExecResult = Readonly<
  | { type: 'ok'; stdout: string; stderr: string }
  | { type: 'error'; exception: ExecException }
>;

/**
 * Executes a shell command asynchronously.
 * @param {TemplateStringsArray} cmd - The command to execute.
 * @returns {Promise<string>} - A promise that resolves with the command's stdout.
 */
export const $ = (cmd: string): Promise<ExecResult> => {
  console.log(`$ ${cmd}`);

  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      console.log(stdout);
      console.error(stderr);
      if (error !== null) {
        reject({ type: 'error', exception: error });
      } else {
        resolve({ type: 'ok', stdout, stderr });
      }
    });
  });
};

export const projectRootPath = path.resolve(import.meta.dirname, '..');
