import * as path from 'node:path';
import { defineConfig } from 'vitest/config';
import { projectRootPath } from '../scripts/project-root-path.mjs';

// https://github.com/vitest-dev/vitest/blob/v1.5.0/test/import-meta/vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    dir: projectRootPath,
    includeSource: ['src/**/*.mts', 'scripts/**/*.mts'],
    typecheck: {
      tsconfig: path.resolve(projectRootPath, './configs/tsconfig.test.json'),
    },
    passWithNoTests: true,
    restoreMocks: true,
    hideSkippedTests: true,
    alias: {
      'eslint-config-typed': path.resolve(
        projectRootPath,
        './src/entry-point.mts',
      ),
    },
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['html', 'lcov', 'text'],
      include: ['src/**/*.{mts,tsx}'],
      exclude: ['**/index.mts', 'src/entry-point.mts'],
    },
  },
});
