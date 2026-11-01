import * as path from 'node:path';
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules -- tools/ is not a package; this is how apps reach its shared scripts
import type { ExtensionPackageOptions } from '../../../tools/configs/chrome-extension-packaging.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Only the source maps come off `dist/` on the way to the store, and `key` in
 * the manifest if there is one, which the store refuses.
 *
 * Unlike `split-view-extension`, a `key` here is optional rather than required.
 * That extension pins the id of its unpacked build so that a checkout loaded
 * from another path keeps the layouts it saved in `chrome.storage`; this one
 * stores nothing at all, so there is nothing for a changing id to lose. Add a
 * `key` to `public/manifest.json` if the unpacked build and the published one
 * should be the same extension anyway — the packaging handles both.
 */
export const storePackageOptions = {
  packageRoot: workspaceRootPath,
  packageName: 'github-view-defaults-extension',
  requireManifestKey: false,
  stripManifestKeys: [],
  signingKeyPassEnv: 'GITHUB_DIFF_DEFAULTS_SIGNING_KEY_PASS',
  defaultPassEntry: 'github-view-defaults-extension',
} as const satisfies ExtensionPackageOptions;

export const distPath = path.resolve(workspaceRootPath, 'dist');
