import * as path from 'node:path';
import { defineConfig } from 'vitest/config';
import { projectRootPath } from '../scripts/project-root-path.mjs';

// https://github.com/vitest-dev/vitest/blob/v1.5.0/test/import-meta/vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    dir: path.resolve(projectRootPath, './samples'),
    includeSource: [path.resolve(projectRootPath, './samples/**/*.mts')],
    typecheck: {
      tsconfig: path.resolve(projectRootPath, './samples/tsconfig.json'),
    },
    alias: {
      'ts-data-forge': path.resolve(projectRootPath, './src/index.mts'),
    },
    passWithNoTests: true,
    restoreMocks: true,
    hideSkippedTests: true,
  },
});
