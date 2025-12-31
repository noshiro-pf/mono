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
      coverage: coverageSettings(),

      alias: {
        'typescript-template': path.resolve(
          projectRootPath,
          './src/entry-point.mts',
        ),
      },

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
            include: [],
          },
        },
      ],
    },
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
    includeSource: ['src/**/*.mts', 'samples/**/*.mts'],
    include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
    exclude: [
      '**/*.d.mts',
      '**/index.mts',
      'src/entry-point.mts',
      ...(options?.additionalExcludes ?? []),
    ],
  }) as const;

const coverageSettings = (): DeepReadonly<CoverageOptions> =>
  ({
    provider: 'v8',
    reporter: ['html', 'lcov', 'text'],
    include: ['src/**/*.{mts,tsx}'],
    exclude: ['**/index.mts', 'src/entry-point.mts'],
  }) as const;

export default config();
