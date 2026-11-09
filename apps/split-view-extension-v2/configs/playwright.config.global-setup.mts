import { execSync } from 'node:child_process';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';

/** Builds `dist/` before a local e2e run; see `playwright.config.mts`. */
const buildBeforeE2e = (): void => {
  execSync('pnpm run build', { cwd: workspaceRootPath, stdio: 'inherit' });
};

export default buildBeforeE2e;
