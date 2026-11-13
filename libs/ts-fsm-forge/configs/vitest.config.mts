import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  // The samples import this package by its name, as a consumer does.
  alias: {
    'ts-fsm-forge': path.resolve(workspaceRootPath, './src/index.mts'),
  },
  node: {
    exclude: [
      '**/*.d.mts',
      '**/index.mts',
      // Imported by the other samples, with no test of its own.
      'samples/readme/00-fetch-machine.mts',
    ],
  },
  browser: false,
});
