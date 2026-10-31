import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

/**
 * `test:rules` only: the tests under `test/` need the Firestore emulator, which
 * `vitest.config.mts` (and so `check:test`) leaves out.
 */
export default defineViteConfig({
  packageRoot: workspaceRootPath,
  node: {
    includeSource: [],
    include: ['test/**/*.test.mts'],
    testTimeout: 30_000,
  },
});
