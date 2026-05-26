import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { type ViteUserConfig } from 'vitest/config';
import { type CoverageOptions, type ProjectConfig } from 'vitest/node';
import { projectRootPath } from '../scripts/project-root-path.mjs';

const aliasMap = {
  'ts-fortress': path.resolve(projectRootPath, './src/entry-point.mts'),
};

// https://github.com/vitest-dev/vitest/blob/v1.5.0/test/import-meta/vite.config.ts
const config = () =>
  ({
    test: {
      coverage: coverageSettings(),

      projects: [
        {
          test: {
            name: 'Node.js',
            environment: 'node',
            alias: aliasMap,
            ...projectConfig(),
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
            alias: aliasMap,
            ...projectConfig(),
            // https://vitest.dev/config/browser/playwright
            browser: {
              enabled: true,
              headless: true,
              screenshotFailures: false,
              provider: playwright(),
              instances: [{ browser: 'chromium' }],
            },
          },
          optimizeDeps: {
            include: ['ts-data-forge', 'io-ts', 'zod', 'io-ts/PathReporter'],
          },
        },
      ],
    },
  }) as const satisfies ViteUserConfig;

const projectConfig = (
  options?: Readonly<{
    additionalExcludes?: readonly string[];
  }>,
) =>
  ({
    dir: projectRootPath,
    globals: true,
    restoreMocks: true,
    hideSkippedTests: true,
    includeSource: ['src/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
    exclude: [
      '**/*.d.mts',
      '**/index.mts',
      'src/entry-point.mts',
      ...(options?.additionalExcludes ?? []),
    ],
  }) as const satisfies ProjectConfig;

const coverageSettings = () =>
  ({
    provider: 'v8',
    reporter: ['html', 'lcov', 'text'],
    include: ['src/**/*.{mts,tsx}'],
    exclude: ['**/index.mts', 'src/entry-point.mts'],
  }) as const satisfies CoverageOptions;

export default config();
