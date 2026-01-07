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
    includeSource: ['src/functions/**/*.mts', 'samples/**/*.mts'],
    include: ['src/functions/**/*.test.mts'],
    exclude: [
      '**/*.d.mts',
      '**/index.mts',
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
