import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { definePlaywrightAppConfig } from '../../../tools/configs/playwright-config.mjs';

export default definePlaywrightAppConfig({
  packageRoot: workspaceRootPath,
  basePath: '/mono/synstate/',
  // The site as it ships. Under `astro dev`, Vite reloads the first pages it
  // serves while its dependency scan settles, and a page that reloads cannot be
  // measured.
  server: {
    build: 'pnpm run build:astro',
    preview: 'pnpm run preview',
    timeoutMs: 300_000,
  },
});
