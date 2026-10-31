import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteAppConfig } from '../../../tools/configs/vite-app-config.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { pagesAppBase } from '../../../tools/configs/pages-apps.mjs';

export default defineViteAppConfig({
  packageRoot: workspaceRootPath,
  framework: 'react',
  jsxImportSource: '@emotion/react',
  // Served from the repository's Pages site rather than a host of its own, so
  // the asset URLs carry the whole prefix. The table it comes from is the one
  // `build-pages-site.mts` copies by.
  base: pagesAppBase(workspaceRootPath),
});
