import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  alias: {
    'synstate-router-preact': path.resolve(
      workspaceRootPath,
      './src/index.mts',
    ),
    'synstate-router': path.resolve(
      workspaceRootPath,
      '../synstate-router/src/index.mts',
    ),
  },
  // `test/browser/` renders components and clicks links, so it belongs to the
  // browser project alone.
  browser: {
    provider: playwright(),
    include: ['test/browser/**/*.test.{mts,tsx}'],
    optimizeDepsInclude: [
      '@testing-library/preact',
      'preact',
      'preact/compat',
      'preact/hooks',
      'preact/jsx-dev-runtime',
      'preact/jsx-runtime',
      'preact-render-to-string',
      'ts-data-forge > @sindresorhus/is',
    ],
  },
});
