import * as path from 'node:path';
import { type ViteUserConfig } from 'vitest/config';
import { type CoverageOptions, type ProjectConfig } from 'vitest/node';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';

const aliasMap = {
  'ts-data-forge': path.resolve(
    workspaceRootPath,
    '../ts-data-forge/src/entry-point.mts',
  ),
};

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
                workspaceRootPath,
                './configs/tsconfig.test.json',
              ),
            },
          },
        },
      ],
    },
  }) as const satisfies ViteUserConfig;

const projectConfig = () =>
  ({
    dir: workspaceRootPath,
    globals: true,
    restoreMocks: true,
    hideSkippedTests: true,
    // Type-aware rule tests spin up a TypeScript program via @typescript-eslint's
    // projectService; the first test in each file pays that cold-start cost,
    // which can exceed the default 5s timeout on slower CI runners.
    testTimeout: 30_000,
    include: ['src/**/*.test.mts'],
    exclude: ['**/*.d.mts', '**/index.mts'],
  }) as const satisfies ProjectConfig;

const coverageSettings = () =>
  ({
    provider: 'v8',
    reporter: ['html', 'lcov', 'text'],
    include: ['src/**/*.mts'],
    exclude: ['**/index.mts', 'src/**/*.test.mts'],
  }) as const satisfies CoverageOptions;

export default config();
