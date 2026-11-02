import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { appDevPort } from '../../../tools/configs/app-dev-ports.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { definePlaywrightAppConfig } from '../../../tools/configs/playwright-config.mjs';

// The extension is loaded from `dist/`, which `build` makes before the server
// starts, and in CI the build job does. The server is the one for the pages
// shown in panes; the extension's own pages need none.
export default definePlaywrightAppConfig({
  packageRoot: workspaceRootPath,
  server: {
    build: 'pnpm run build',
    preview: `pnpm run z:e2e-pages ${appDevPort(workspaceRootPath).toString()}`,
    output: 'dist',
    timeoutMs: 120_000,
  },
});
