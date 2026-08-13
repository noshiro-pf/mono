import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  alias: {
    'synstate-preact-hooks': path.resolve(workspaceRootPath, './src/index.mts'),
    synstate: path.resolve(workspaceRootPath, '../synstate/src/index.mts'),
  },
  passWithNoTests: true,
  // `test/browser/` renders components, so it belongs to the browser project
  // alone; everything directly under `test/` runs in both.
  node: {
    include: ['src/**/*.test.mts', 'test/*.test.mts'],
  },
  browser: {
    provider: playwright(),
    includeSource: ['src/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
    optimizeDepsInclude: [
      '@testing-library/preact',
      'preact',
      'preact/compat',
      'preact/hooks',
      'ts-data-forge > @sindresorhus/is',
    ],
  },
});
