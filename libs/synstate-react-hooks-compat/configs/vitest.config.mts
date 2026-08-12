import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  alias: {
    'synstate-react-hooks-compat': path.resolve(
      workspaceRootPath,
      './src/index.mts',
    ),
    synstate: path.resolve(workspaceRootPath, '../synstate/src/index.mts'),
  },
  passWithNoTests: true,
  browser: {
    includeSource: ['src/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
  },
});
