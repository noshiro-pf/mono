import * as path from 'node:path';
import { projectRootPath } from '../scripts/project-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteConfig } from '../../../tools/configs/vite-config.mjs';

export default defineViteConfig({
  packageRoot: projectRootPath,
  alias: {
    'octokit-safe-types': path.resolve(
      projectRootPath,
      './src/entry-point.mts',
    ),
  },
  passWithNoTests: true,
  coverage: {
    include: ['src/**/*.{mts,tsx}'],
  },
  node: {
    includeSource: ['src/**/*.mts', 'scripts/**/*.mts', 'samples/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
  },
  browser: false,
});
