import { playwright } from '@vitest/browser-playwright';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  coverage: {
    include: ['src/**/*.mts'],
  },
  node: {
    includeSource: ['src/**/*.mts'],
    include: ['src/**/*.test.mts'],
  },
  browser: {
    provider: playwright(),
    includeSource: [],
    include: ['test/browser/**/*.test.{mts,tsx}'],
    // See the comment on `optimizeDepsInclude` in the shared config.
    optimizeDepsInclude: ['vitest > expect-type'],
  },
});
