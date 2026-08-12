import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  alias: {
    synstate: path.resolve(workspaceRootPath, './src/index.mts'),
    'synstate-react-hooks': path.resolve(
      workspaceRootPath,
      '../synstate-react-hooks/src/index.mts',
    ),
  },
  passWithNoTests: true,
  node: {
    testTimeout: 30_000,
  },
  browser: {
    includeSource: ['src/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
    testTimeout: 30_000,
  },
});
