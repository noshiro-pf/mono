import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  alias: {
    // `io-ts-types` is private and has no build output, so both the type
    // checker (see tsconfig.json `paths`) and the test run read its source.
    'io-ts-types': path.resolve(
      workspaceRootPath,
      '../io-ts-types/src/index.mts',
    ),
  },
  coverage: {
    include: ['src/**/*.mts'],
  },
  node: {
    includeSource: ['src/**/*.mts'],
    include: ['src/**/*.test.mts'],
  },
});
