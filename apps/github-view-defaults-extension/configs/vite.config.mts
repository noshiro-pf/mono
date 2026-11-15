import { defineConfig } from 'vite';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { writeManifestVersion } from '../../../tools/configs/chrome-extension-manifest.mjs';
import { outDir, scriptConfig } from './script.config.mjs';

/**
 * The first build: the content script that sets the defaults, and the manifest
 * and icons beside it. The other scripts the manifest names are built after it
 * by the configs beside this one (`script.config.mts`).
 *
 * `public/` is copied by Vite's `publicDir` handling, the manifest given the
 * `package.json` version on the way, so `dist/` is what `chrome://extensions`
 * loads as-is once `pnpm run build` has run every build.
 */
export default defineConfig({
  ...scriptConfig({
    entry: 'src/content.mts',
    globalName: 'githubDiffDefaults',
    first: true,
  }),

  plugins: [writeManifestVersion({ packageRoot: workspaceRootPath, outDir })],
});
