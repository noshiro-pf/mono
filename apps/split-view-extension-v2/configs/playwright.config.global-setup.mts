import { spawn } from 'node:child_process';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';

/** Builds `dist/` before a local e2e run; see `playwright.config.mts`. */
const buildBeforeE2e = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['run', 'build'], {
      cwd: workspaceRootPath,
      stdio: 'inherit',
    });

    child.once('error', reject);

    child.once('close', (status, signal) => {
      if (status === 0) {
        resolve();
      } else {
        const reason =
          signal ?? (status === null ? 'no exit code' : `exit code ${status}`);

        reject(new Error(`pnpm run build failed (${reason})`));
      }
    });
  });

export default buildBeforeE2e;
