// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules -- tools/ is not a package; this is how apps reach its shared scripts
import type { ExtensionPackageOptions } from '../../../tools/configs/chrome-extension-packaging.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * What comes off `dist/` on the way to the store, besides the source maps:
 *
 * - **`key` in the manifest**, which the store refuses, since it assigns the id
 *   from the key it holds. It stays in `public/manifest.json` all the same, and
 *   is required there: it pins the id of the _unpacked_ build, so that a
 *   checkout loaded from another path is still the same extension with the
 *   same saved layouts.
 * - **`web_accessible_resources`**, for the same reason from the other side.
 *   It lets the PR Manager open `split.html` from a link, and that link names
 *   the pinned id, which a store install does not have — so in the package it
 *   would reach nobody, and would only let every page it lists tell that the
 *   extension is installed.
 *
 * `store-package.test.mts` runs these options on `public/manifest.json`.
 */
export const storePackageOptions = {
  packageRoot: workspaceRootPath,
  packageName: 'split-view-extension',
  requireManifestKey: true,
  stripManifestKeys: ['web_accessible_resources'],
  signingKeyPassEnv: 'SPLIT_VIEW_SIGNING_KEY_PASS',
  defaultPassEntry: 'split-view-extension',
} as const satisfies ExtensionPackageOptions;
