import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
/* eslint-disable import-x/no-relative-packages */
import {
  defaultExclude,
  defineViteConfig,
} from '../../../tools/configs/vite-config.mjs';
/* eslint-enable import-x/no-relative-packages */

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  // The samples import this package by its name, as a consumer does.
  alias: {
    'ts-fsm-forge': path.resolve(workspaceRootPath, './src/index.mts'),
  },
  node: {
    exclude: Arr.toPushed(
      defaultExclude,
      // Imported by the other samples, with no test of its own.
      'samples/readme/00-fetch-machine.mts',
    ),
  },
  browser: false,
});
