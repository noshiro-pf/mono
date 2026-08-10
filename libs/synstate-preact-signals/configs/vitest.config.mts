import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../configs/vite-config.mjs';

export default defineViteConfig({
  workspaceRootPath,
  alias: {
    'synstate-preact-signals': path.resolve(
      workspaceRootPath,
      './src/index.mts',
    ),
    synstate: path.resolve(workspaceRootPath, '../synstate/src/index.mts'),
  },
});
