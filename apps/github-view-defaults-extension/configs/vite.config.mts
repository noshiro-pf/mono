import * as path from 'node:path';
import { defineConfig } from 'vite';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { writeManifestVersion } from '../../../tools/configs/chrome-extension-manifest.mjs';

/**
 * The whole build: one content script, and the manifest and icons beside it.
 *
 * A content script is evaluated as a classic script, not as a module, so it
 * cannot carry `import` statements. Library mode with the `iife` format emits
 * one self-contained file, which is what the manifest names.
 *
 * `public/` is copied by Vite's `publicDir` handling, the manifest given the
 * `package.json` version on the way, so `dist/` is what `chrome://extensions`
 * loads as-is.
 */
const outDir = path.resolve(workspaceRootPath, 'dist');

export default defineConfig({
  root: workspaceRootPath,

  plugins: [writeManifestVersion({ packageRoot: workspaceRootPath, outDir })],

  build: {
    outDir,
    emptyOutDir: true,
    sourcemap: true,

    // Only ever loaded by the Chrome the manifest's `minimum_chrome_version`
    // names, so there is no reason to down-level anything.
    target: 'chrome116',

    lib: {
      entry: path.resolve(workspaceRootPath, 'src/content.mts'),
      formats: ['iife'],
      name: 'githubDiffDefaults',
      fileName: (): string => 'content.js',
    },
  },
});
