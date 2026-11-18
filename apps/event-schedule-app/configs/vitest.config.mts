/* eslint-disable import-x/no-relative-packages */
import {
  defaultExclude,
  defineViteConfig,
} from '../../../tools/configs/vite-config.mjs';
/* eslint-enable import-x/no-relative-packages */
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
import { emulatorTests } from './emulator-tests.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  coverage: {
    include: ['src/**/*.mts'],
  },
  node: {
    includeSource: ['src/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
    exclude: [
      ...defaultExclude,
      // Need the emulator, and are run by `vitest.rules.config.mts` alone.
      ...emulatorTests,
    ],
  },
});
