import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,
  coverage: {
    include: ['scripts/reference-text.mts'],
  },
  node: {
    include: ['scripts/**/*.test.mts'],
  },
  browser: false,
});
