import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  alias: {
    'synstate-router-dom': path.resolve(workspaceRootPath, './src/index.mts'),
    'synstate-router': path.resolve(
      workspaceRootPath,
      '../synstate-router/src/index.mts',
    ),
  },
  // `test/browser/` mounts components and clicks links, so it belongs to the
  // browser project alone.
  browser: {
    provider: playwright(),
    include: ['test/browser/**/*.test.{mts,tsx}'],
    optimizeDepsInclude: ['ts-data-forge > @sindresorhus/is'],
  },
});
