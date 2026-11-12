import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';
import { emulatorTests } from './emulator-tests.mjs';

/**
 * `check:test:rules` only: the tests of `firestore.rules` need the Firestore
 * emulator, which `vitest.config.mts` (and so `check:test`) leaves out. Every
 * other test under `test/` is `check:test`'s.
 */
export default defineViteConfig({
  packageRoot: workspaceRootPath,
  node: {
    includeSource: [],
    include: emulatorTests,
    testTimeout: 30_000,
  },
});
