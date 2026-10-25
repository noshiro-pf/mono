import type { UserConfig } from 'vite';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteAppConfig } from '../../../tools/configs/vite-app-config.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { pagesAppBase } from '../../../tools/configs/pages-apps.mjs';

const shared: UserConfig = defineViteAppConfig({
  packageRoot: workspaceRootPath,
  framework: 'synstate-dom',
  // Served from the repository's Pages site rather than a host of its own,
  // so the asset URLs carry the whole prefix. The table it comes from is the
  // one `build-pages-site.mts` copies by.
  base: pagesAppBase(workspaceRootPath),
});

export default {
  ...shared,
  // Every third-party module the page reaches, named up front. The dev
  // server otherwise finds those behind `main.tsx`'s dynamic import of the
  // backend only when they are first loaded, optimizes them then and reloads
  // the page, mid-run for the e2e suite.
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
} satisfies UserConfig;
