import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  alias: {
    'synstate-i18n': path.resolve(workspaceRootPath, './src/index.mts'),
    'synstate-next': path.resolve(
      workspaceRootPath,
      '../synstate-next/src/index.mts',
    ),
  },
  node: {
    // The samples' locale and store modules are imported by the samples, and
    // hold no tests of their own.
    include: [
      'src/**/*.test.mts',
      'test/**/*.test.mts',
      'samples/readme/[0-9]*.mts',
    ],
  },
  browser: false,
});
