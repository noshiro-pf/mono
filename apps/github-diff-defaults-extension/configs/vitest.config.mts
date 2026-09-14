import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: workspaceRootPath,

  // `content.mts` is the only thing here that needs a DOM, and it is glue: what
  // it decides lives in `diff-url.mts`, which is what these tests cover.
  browser: false,

  coverage: {
    include: ['src/diff-url.mts'],
  },

  node: {
    include: ['test/**/*.test.mts'],
  },
});
