import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  alias: {
    'blueprint-synstate': path.resolve(workspaceRootPath, './src/index.mts'),
  },
  coverage: {
    exclude: ['**/index.mts', 'src/**/*.test.mts'],
  },
  node: {
    includeSource: ['src/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
    exclude: ['**/*.d.mts', '**/index.mts'],
  },
  browser: {
    provider: playwright(),
    includeSource: [],
    include: ['test/browser/**/*.test.{mts,tsx}'],
    // See the comment on `optimizeDepsInclude` in the shared config.
    optimizeDepsInclude: ['ts-data-forge > @sindresorhus/is'],
  },
});
