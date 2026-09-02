import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  // `tiny-router-observable` is a private package with no build output, so
  // node resolution cannot find it at test time — the `paths` entry in
  // `tsconfig.json` only satisfies TypeScript. `uriWithQueryParams` calls
  // `Router.utils.withSlash`, so its test does reach the module.
  alias: {
    'tiny-router-observable': path.resolve(
      workspaceRootPath,
      '../tiny-router-observable/src/index.mts',
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
