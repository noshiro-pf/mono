import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { type ViteUserConfig } from 'vitest/config';
import { type CoverageOptions, type ProjectConfig } from 'vitest/node';
import { projectRootPath } from '../scripts/project-root-path.mjs';

// https://github.com/vitest-dev/vitest/blob/v1.5.0/test/import-meta/vite.config.ts
const config = (): ViteUserConfig => ({
  test: {
    alias: {
      'octokit-safe-types': path.resolve(
        projectRootPath,
        './src/entry-point.mts',
      ),
    },
    passWithNoTests: true,
    coverage: coverageSettings('istanbul'),
    projects: [
      {
        test: {
          name: 'Node.js',
          environment: 'node',
          ...projectConfig({
            additionalExcludes: ['src/browser/**'],
          }),
          typecheck: {
            tsconfig: path.resolve(
              projectRootPath,
              './configs/tsconfig.test.json',
            ),
          },
        },
      },
      {
        test: {
          name: 'Browser',
          ...projectConfig({
            additionalExcludes: ['src/node/**'],
            includeSource: ['src/browser/**/*.mts'],
            include: [
              'src/browser/**/*.test.mts',
              'test/browser/**/*.test.mts',
            ],
          }),
          browser: {
            enabled: true,
            headless: true,
            screenshotFailures: false,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});

const projectConfig = (
  options?: Readonly<{
    additionalExcludes?: readonly string[];
    includeSource?: readonly string[];
    include?: readonly string[];
  }>,
): ProjectConfig => ({
  dir: projectRootPath,
  globals: true,
  restoreMocks: true,
  hideSkippedTests: true,
  includeSource: Array.from(options?.includeSource ?? ['src/**/*.mts']),
  include: Array.from(
    options?.include ?? ['src/**/*.test.mts', 'test/**/*.test.mts'],
  ),
  exclude: [
    '**/*.d.mts',
    '**/index.mts',
    'src/entry-point.mts',
    ...(options?.additionalExcludes ?? []),
  ],
});

const coverageSettings = (provider: 'v8' | 'istanbul'): CoverageOptions => ({
  provider,
  reporter: ['html', 'lcov', 'text'],
  include: ['src/**'],
  exclude: ['**/index.mts', 'src/entry-point.mts'],
});

export default config();
