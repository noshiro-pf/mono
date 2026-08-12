import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  alias: {
    'ts-fortress': path.resolve(workspaceRootPath, './src/entry-point.mts'),
  },
  coverage: {
    include: ['src/**/*.{mts,tsx}'],
  },
  node: {
    includeSource: ['src/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
  },
  browser: {
    provider: playwright(),
    includeSource: ['src/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
    optimizeDepsInclude: [
      'ts-data-forge',
      'io-ts',
      'zod',
      'io-ts/PathReporter',
    ],
  },
});
