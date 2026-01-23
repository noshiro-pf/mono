import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { type ViteUserConfig } from 'vitest/config';
import { type CoverageOptions, type ProjectConfig } from 'vitest/node';
import { projectRootPath } from '../scripts/project-root-path.mjs';

// https://github.com/vitest-dev/vitest/blob/v1.5.0/test/import-meta/vite.config.ts
const config = () =>
  ({
    test: {
      coverage: coverageSettings(),

      alias: {
        'ts-codemod-lib': path.resolve(
          projectRootPath,
          './src/entry-point.mts',
        ),
      },

      projects: [
        {
          test: {
            name: 'Node.js',
            environment: 'node',
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
            ...projectConfig({
              additionalExcludes: ['samples/**/*'],
            }),
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
            include: [
              'dedent',
              'typescript',
              'ts-morph',
              'ts-data-forge',
              'prettier/parser-typescript',
              'prettier/plugins/babel',
              'prettier/plugins/estree',
              'prettier/standalone',
            ],
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
    includeSource: ['src/functions/**/*.mts', 'samples/**/*.mts'],
    include: ['src/functions/**/*.test.mts', 'samples/**/*.mts'],
    exclude: [
      '**/*.d.mts',
      '**/index.mts',
      'samples/readme/apply-transformers-to-src-directory.mts',
      ...(options?.additionalExcludes ?? []),
    ],
  }) as const satisfies ProjectConfig;

const coverageSettings = () =>
  ({
    provider: 'v8',
    reporter: ['html', 'lcov', 'text'],
    include: ['src/**/*.mts'],
    exclude: ['**/index.mts', 'src/entry-point.mts'],
  }) as const satisfies CoverageOptions;

export default config();
