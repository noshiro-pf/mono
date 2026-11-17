import * as path from 'node:path';
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules -- tools/ is not a package; this is how apps reach its shared scripts
import type { ExtensionPackageOptions } from '../../../tools/configs/chrome-extension-packaging.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Only the source maps come off `dist/` on the way to the store, and `key` in
 * the manifest, which the store refuses, since it assigns the id from the key
 * it holds.
 *
 * The `key` stays in `public/manifest.json` all the same, and is required there:
 * it pins the id of the _unpacked_ build, which is the one Split View acts for
 * in its panes (`paneBridgePartnerIds` in `split-view-link`, and
 * `test/extension-id.test.mts`). A build from the store has an id of its own,
 * and Split View draws no button for it.
 */
export const storePackageOptions = {
  packageRoot: workspaceRootPath,
  packageName: 'github-view-defaults-extension',
  requireManifestKey: true,
  stripManifestKeys: [],
  signingKeyPassEnv: 'GITHUB_DIFF_DEFAULTS_SIGNING_KEY_PASS',
  defaultPassEntry: 'github-view-defaults-extension',
} as const satisfies ExtensionPackageOptions;

export const distPath = path.resolve(workspaceRootPath, 'dist');
