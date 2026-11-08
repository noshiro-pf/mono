import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  alias: {
    'synstate-next/internal': path.resolve(
      workspaceRootPath,
      './src/internal.mts',
    ),
    'synstate-next': path.resolve(workspaceRootPath, './src/index.mts'),
  },
  coverage: {
    exclude: ['**/index.mts', 'src/**/*.test.mts'],
  },
  node: {
    // `samples/docs-site/` holds the code blocks of apps/synstate-next-docs,
    // each a test in the file it is embedded from.
    includeSource: ['src/**/*.mts', 'samples/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
    exclude: ['**/*.d.mts', '**/index.mts'],
  },
  browser: {
    provider: playwright(),
    includeSource: [],
    include: [],
  },
});
