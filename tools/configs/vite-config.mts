import * as path from 'node:path';
import { castMutable } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import {
  type TestProjectConfiguration,
  type ViteUserConfig,
} from 'vitest/config';
import { type InlineConfig, type ProjectConfig } from 'vitest/node';

/** The value of `browser.provider`, e.g. `playwright()`. */
type BrowserProvider = NonNullable<
  NonNullable<ProjectConfig['browser']>['provider']
>;

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
        /**
         * The browser provider, e.g. `playwright()`. Passed in rather than
         * chosen here so that a package testing in a browser declares the
         * driver it needs, instead of inheriting it from this directory.
         */
        provider: BrowserProvider;
        /**
         * Every third-party module the browser tests reach, named up front.
         *
         * Vite pre-bundles dependencies by scanning the test files. Anything
         * the scan misses is optimized on first import instead, and that
         * reloads the page mid-run — which surfaces as "Failed to fetch
         * dynamically imported module" for whichever file was loading at the
         * time. The scan misses two kinds of module here: one imported by a
         * workspace sibling rather than by a test file, and one imported by a
         * test file the scan has not reached yet.
         *
         * A module the package does not itself depend on has to be named
         * through the sibling that does — `'ts-data-forge > @sindresorhus/is'`
         * — because a bare name is resolved from the package root, where pnpm
         * has not put it.
         *
         * Measured on `synstate`, deleting its `node_modules/.vite` before
         * each run: 6 of 6 runs pass with the list, 4 of 4 fail without it.
         * Warm, it passes either way — which is why this failed only in CI.
         */
        optimizeDepsInclude?: readonly string[];
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
            // Browser mode fetches each test file over the Vite dev server,
            // and requesting them one at a time narrows the window in which a
            // mid-run reload can catch a file in flight. `optimizeDepsInclude`
            // is what removes the reload itself; see the comment there.
            fileParallelism: browser.fileParallelism ?? false,
            // https://vitest.dev/config/browser/playwright
            browser: {
              enabled: true,
              headless: true,
              screenshotFailures: false,
              provider: castMutable(browser.provider),
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
