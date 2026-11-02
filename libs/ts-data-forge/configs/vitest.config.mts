import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  alias: {
    // Before the package name, which would otherwise match the subpath as a
    // prefix and resolve it under `entry-point.mts`.
    'ts-data-forge/array': path.resolve(
      workspaceRootPath,
      './src/array/impl/index.mts',
    ),
    'ts-data-forge/number': path.resolve(
      workspaceRootPath,
      './src/number/num/impl/index.mts',
    ),
    'ts-data-forge': path.resolve(workspaceRootPath, './src/entry-point.mts'),
  },
  coverage: {
    include: ['src/**/*.{mts,tsx}'],
  },
  node: {
    includeSource: ['src/**/*.mts', 'samples/**/*.mts'],
  },
  browser: {
    provider: playwright(),
    includeSource: ['src/**/*.mts', 'samples/**/*.mts'],
    exclude: [
      '**/*.d.mts',
      '**/index.mts',
      'src/entry-point.mts',
      'samples/**/*',
      // Runs ESLint, which needs Node.js.
      'test/eslint-config.test.mts',
      // Reads the source directory.
      'test/branded-number-guards.test.mts',
    ],
    optimizeDepsInclude: ['react'],
  },
});
