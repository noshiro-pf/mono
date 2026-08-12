import { playwright } from '@vitest/browser-playwright';
import * as path from 'node:path';
import { castMutable } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import {
  type TestProjectConfiguration,
  type ViteUserConfig,
} from 'vitest/config';
import { type InlineConfig, type ProjectConfig } from 'vitest/node';

type ProjectOverrides = DeepReadonly<{
  includeSource?: readonly string[];
  include?: readonly string[];
  exclude?: readonly string[];
  testTimeout?: number;
}>;

/**
 * Builds the Vitest config for a package whose configs live under
 * `<package-root>/configs`.
 *
 * What is shared is the shape: the coverage provider, the Node.js project's
 * settings, and the browser project with its `fileParallelism` workaround.
 * What each package passes is what it genuinely does differently — which
 * files are tests, which are in-source tests, what to alias.
 */
export const defineViteConfig = ({
  packageRoot,
  alias,
  passWithNoTests,
  coverage,
  node,
  browser,
}: DeepReadonly<{
  /** The package's root directory. */
  packageRoot: string;
  alias?: InlineConfig['alias'];
  /** Omitted rather than defaulted, because Vitest's own default is `false`. */
  passWithNoTests?: boolean;
  coverage?: {
    include?: readonly string[];
    exclude?: readonly string[];
  };
  node?: ProjectOverrides;
  /** Pass `false` for a package with no browser tests. */
  browser?:
    | false
    | (ProjectOverrides & {
        optimizeDepsInclude?: readonly string[];
        retry?: number;
        /**
         * Defaults to `false` — see the comment on the emitted option. Pass
         * `true` to opt out and run the browser tests in parallel.
         */
        fileParallelism?: boolean;
      });
}>) => {
  const nodeProject = {
    test: {
      name: 'Node.js',
      environment: 'node',
      alias: castMutable(alias),
      ...projectConfig(packageRoot, node),
      typecheck: {
        tsconfig: path.resolve(packageRoot, './configs/tsconfig.test.json'),
      },
    },
  } as const satisfies TestProjectConfiguration;

  const browserProject =
    browser === false || browser === undefined
      ? undefined
      : ({
          test: {
            name: 'Browser',
            alias: castMutable(alias),
            ...projectConfig(packageRoot, browser),
            // Browser mode fetches each test file over the Vite dev server.
            // Requesting them concurrently intermittently fails with "Failed
            // to fetch dynamically imported module" for an arbitrary file, and
            // vitest's `retry` cannot help: the file never loads, so there is
            // no test to retry. Requesting them one at a time removes the race.
            fileParallelism: browser.fileParallelism ?? false,
            ...(browser.retry === undefined ? {} : { retry: browser.retry }),
            // https://vitest.dev/config/browser/playwright
            browser: {
              enabled: true,
              headless: true,
              screenshotFailures: false,
              provider: playwright(),
              instances: [{ browser: 'chromium' as const }],
            },
          },
          optimizeDeps: {
            include: castMutable(browser.optimizeDepsInclude),
          },
        } as const satisfies TestProjectConfiguration);

  const projects: readonly TestProjectConfiguration[] =
    browserProject === undefined
      ? [nodeProject]
      : [nodeProject, browserProject];

  return {
    test: {
      coverage: {
        provider: 'v8',
        reporter: ['html', 'lcov', 'text'],
        include: castMutable(coverage?.include) ?? ['src/**/*.mts'],
        exclude: castMutable(coverage?.exclude) ?? [
          '**/index.mts',
          'src/entry-point.mts',
        ],
      },
      ...(passWithNoTests === undefined ? {} : { passWithNoTests }),
      projects: castMutable(projects),
    },
  } as const satisfies ViteUserConfig;
};

const projectConfig = (packageRoot: string, overrides?: ProjectOverrides) =>
  ({
    dir: packageRoot,
    globals: true,
    restoreMocks: true,
    hideSkippedTests: true,
    includeSource: castMutable(overrides?.includeSource) ?? [
      'src/**/*.mts',
      'samples/**/*.{mts,tsx}',
    ],
    include: castMutable(overrides?.include) ?? [
      'src/**/*.test.mts',
      'test/**/*.test.mts',
      'samples/**/*.mts',
    ],
    exclude: castMutable(overrides?.exclude) ?? [
      '**/*.d.mts',
      '**/index.mts',
      'src/entry-point.mts',
    ],
    testTimeout: overrides?.testTimeout,
  }) as const satisfies ProjectConfig;
