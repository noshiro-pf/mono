import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  browser: false,
  coverage: {
    include: ['src/layout/**/*.mts', 'src/state/**/*.mts'],
  },
  node: {
    includeSource: ['src/**/*.mts'],
    // `scripts/` holds the packing, whose manifest rewrite is tested beside it.
    include: ['test/**/*.test.mts', 'scripts/**/*.test.mts'],
  },
});
