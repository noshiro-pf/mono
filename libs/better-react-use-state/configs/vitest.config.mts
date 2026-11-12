import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  alias: {
    'better-react-use-state': path.resolve(
      workspaceRootPath,
      './src/index.mts',
    ),
  },
  // `test/browser/` renders hooks, so it belongs to the browser project alone;
  // the type tests directly under `test/` run in Node.js.
  node: {
    include: ['test/*.test.mts'],
  },
  browser: {
    provider: playwright(),
    include: ['test/browser/**/*.test.mts'],
    optimizeDepsInclude: [
      '@testing-library/react',
      'react',
      'react-dom',
      'react-dom/client',
    ],
  },
});
