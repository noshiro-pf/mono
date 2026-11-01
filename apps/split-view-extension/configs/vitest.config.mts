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
    // `scripts/` holds the packing options, tested beside them against the real
    // manifest; the shared packaging is tested under `tools/configs/`.
    include: ['test/**/*.test.mts', 'scripts/**/*.test.mts'],
  },
});
