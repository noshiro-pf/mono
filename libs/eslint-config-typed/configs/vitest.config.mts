import * as path from 'node:path';
import { type ViteUserConfig } from 'vitest/config';
import { type CoverageOptions } from 'vitest/node';
import { projectRootPath } from '../scripts/project-root-path.mjs';

// https://github.com/vitest-dev/vitest/blob/v1.5.0/test/import-meta/vite.config.ts
const config = (): ViteUserConfig => ({
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
    coverage: coverageSettings('v8'),
  },
});

const coverageSettings = (provider: 'v8' | 'istanbul'): CoverageOptions => ({
  provider,
  reporter: ['html', 'lcov', 'text'],
  include: ['src/**/*.{mts,tsx}'],
  exclude: ['**/index.mts', 'src/entry-point.mts'],
});

export default config();
