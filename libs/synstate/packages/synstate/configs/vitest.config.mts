import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../configs/vite-config.mjs';

export default defineViteConfig({
  workspaceRootPath,
  testTimeout: 30_000,
  alias: {
    'synstate-react-hooks': path.resolve(
      workspaceRootPath,
      '../synstate-react-hooks/src/index.mts',
    ),
  },
});
