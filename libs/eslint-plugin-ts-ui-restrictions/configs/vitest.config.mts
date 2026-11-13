import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  coverage: {
    exclude: ['**/index.mts', 'src/**/*.test.mts'],
  },
  node: {
    includeSource: [],
    include: ['src/**/*.test.mts'],
    exclude: ['**/*.d.mts', '**/index.mts'],
    testTimeout: 30_000,
  },
  browser: false,
});
