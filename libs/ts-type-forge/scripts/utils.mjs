import { exec } from 'node:child_process';

/**
 * Executes a shell command asynchronously.
 * @param {string} cmd - The command to execute.
 * @returns {Promise<string>} - A promise that resolves with the command's stdout.
 */
export const execAsync = (cmd) =>
  new Promise((resolve, reject) => {
    exec(cmd, (error, stdout) => {
      if (error !== null) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
