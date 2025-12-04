import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { type ViteUserConfig as ViteUserConfig_ } from 'vitest/config';
import { type CoverageOptions, type ProjectConfig } from 'vitest/node';
import { projectRootPath } from '../scripts/project-root-path.mjs';

type ViteUserConfig = DeepReadonly<ViteUserConfig_>;

// https://github.com/vitest-dev/vitest/blob/v1.5.0/test/import-meta/vite.config.ts
const config = (): ViteUserConfig =>
  ({
    test: {
      alias: {
        'ts-data-forge': path.resolve(projectRootPath, './src/entry-point.mts'),
      },
      passWithNoTests: true,
      coverage: coverageSettings('istanbul'),
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
              additionalExcludes: [
                'src/array/impl/array-utils-transformation.test.mts',
              ],
            }),
            // https://vitest.dev/config/browser/playwright
            browser: {
              enabled: true,
              headless: true,
              screenshotFailures: false,
              connectTimeout: 60000,
              provider: playwright(),
              instances: [{ browser: 'chromium' }],
            },
          },
        },
      ],
    },

    // Bind the server to all network interfaces.
    // This allows Playwright to access the server from within the GitHub Actions execution environment (host machine, Docker container, etc.).
    // server: {
    //   host: '127.0.0.1',
    //   port: 3000,
    //   strictPort: true,
    // },
  }) as const;

const projectConfig = (
  options?: Readonly<{
    additionalExcludes?: readonly string[];
  }>,
): DeepReadonly<ProjectConfig> =>
  ({
    dir: projectRootPath,
    globals: true,
    restoreMocks: true,
    hideSkippedTests: true,
    testTimeout: 60000,
    includeSource: ['src/**/*.mts', 'samples/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
    exclude: [
      '**/*.d.mts',
      '**/index.mts',
      'src/entry-point.mts',
      ...(options?.additionalExcludes ?? []),
    ],
  }) as const;

const coverageSettings = (
  provider: 'v8' | 'istanbul',
): DeepReadonly<CoverageOptions> =>
  ({
    provider,
    reporter: ['html', 'lcov', 'text'],
    include: ['src/**/*.{mts,tsx}'],
    exclude: ['**/index.mts', 'src/entry-point.mts'],
  }) as const;

export default config();
