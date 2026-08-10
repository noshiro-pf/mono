import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { castMutable } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import { type ViteUserConfig } from 'vitest/config';
import {
  type CoverageOptions,
  type InlineConfig,
  type ProjectConfig,
} from 'vitest/node';

// Builds a Vitest config that runs Node.js and browser projects for a package
// whose configs live under <project-root>/configs.
export const defineViteConfig = ({
  workspaceRootPath,
  additionalExcludesInNode,
  additionalExcludesInBrowser,
  optimizeDepsIncludesForBrowser,
  alias,
}: DeepReadonly<{
  workspaceRootPath: string;
  additionalExcludesInNode?: readonly string[];
  additionalExcludesInBrowser?: readonly string[];
  optimizeDepsIncludesForBrowser?: readonly string[];
  alias?: InlineConfig['alias'];
}>) =>
  ({
    test: {
      coverage: coverageSettings(),
      passWithNoTests: true,
      projects: [
        {
          test: {
            name: 'Node.js',
            environment: 'node',
            ...projectConfig(workspaceRootPath, {
              additionalExcludes: additionalExcludesInNode,
            }),
            typecheck: {
              tsconfig: path.resolve(workspaceRootPath, 'tsconfig.test.json'),
            },
            alias,
          },
        },
        {
          test: {
            name: 'Browser',
            ...projectConfig(workspaceRootPath, {
              additionalExcludes: additionalExcludesInBrowser,
              includeSource: ['src/**/*.mts'],
              include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
            }),
            alias,
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
            include: castMutable(optimizeDepsIncludesForBrowser),
          },
        },
      ],
    },
  }) as const satisfies ViteUserConfig;

const projectConfig = (
  workspaceRootPath: string,
  options?: Readonly<{
    additionalExcludes?: readonly string[];
    includeSource?: readonly string[];
    include?: readonly string[];
  }>,
) =>
  ({
    dir: workspaceRootPath,
    globals: true,
    restoreMocks: true,
    hideSkippedTests: true,
    includeSource: castMutable(options?.includeSource) ?? ['src/**/*.mts'],
    include: castMutable(options?.include) ?? [
      'src/**/*.test.mts',
      'test/**/*.test.mts',
    ],
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
    include: ['src/**/*.mts'],
    exclude: ['**/index.mts', 'src/entry-point.mts'],
  }) as const satisfies CoverageOptions;
