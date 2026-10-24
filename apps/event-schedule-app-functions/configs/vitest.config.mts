import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  coverage: {
    include: ['src/**/*.mts'],
  },
  node: {
    // `scripts/build.mts` bundles `src/` as it is, so no test lives in it.
    includeSource: [],
    include: ['src/**/*.test.mts'],
  },
});
