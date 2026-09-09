import { projectRootPath } from '../scripts/project-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: projectRootPath,
  coverage: {
    include: ['src/**/*.mts'],
  },
  node: {
    includeSource: ['src/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
  },
  browser: false,
});
