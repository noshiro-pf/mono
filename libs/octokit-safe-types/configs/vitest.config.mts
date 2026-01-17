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
        'octokit-safe-types': path.resolve(
          projectRootPath,
          './src/entry-point.mts',
        ),
      },

      passWithNoTests: true,
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
    includeSource: ['src/**/*.mts', 'scripts/**/*.mts', 'samples/**/*.mts'],
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
