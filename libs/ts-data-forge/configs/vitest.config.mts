import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  alias: {
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
    ],
    optimizeDepsInclude: ['@sindresorhus/is', 'dedent', 'react'],
  },
});
