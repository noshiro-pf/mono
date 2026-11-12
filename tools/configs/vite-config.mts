import * as fs from 'node:fs';
import * as path from 'node:path';
import { Arr, castMutable } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import type { TestProjectConfiguration, ViteUserConfig } from 'vitest/config';
import type { InlineConfig, ProjectConfig } from 'vitest/node';

/** The value of `browser.provider`, e.g. `playwright()`. */
type BrowserProvider = NonNullable<
  NonNullable<ProjectConfig['browser']>['provider']
>;

type ProjectOverrides = DeepReadonly<{
  includeSource?: string[];
  include?: string[];
  /**
   * Replaces the default. The Node.js project excludes `test/browser/**` after
   * it all the same (`nodeProjectExclude`).
   */
  exclude?: string[];
  testTimeout?: number;
  /** Run before each test file, in its module graph (Vitest's `setupFiles`). */
  setupFiles?: string[];
  /** Run once before the project's tests (Vitest's `globalSetup`). */
  globalSetup?: string[];
}>;

type BrowserOptions = ProjectOverrides &
  DeepReadonly<{
    /**
     * The browser provider, e.g. `playwright()`. Passed in rather than chosen
     * here so that a package testing in a browser declares the driver it needs,
     * instead of inheriting it from this directory.
     */
    provider: BrowserProvider;
    /**
     * Every third-party module the browser tests reach, named up front.
     *
     * Vite optimizes these and nothing else (`noDiscovery`, below). With
     * discovery on, a module its scan missed — one imported by a workspace
     * sibling rather than by a test file, or by a test file the scan had not
     * reached — was optimized on first import instead, which reloaded the page
     * mid-run and dropped the tests still loading. Now an ES module left out is
     * served as it is, and a CommonJS one fails to load ("does not provide an
     * export named …"), failing the run; add it here.
     * `vitest > expect-type` is one: Vitest imports it.
     *
     * A module the package does not itself depend on has to be named through
     * the sibling that does — `'ts-fortress > @sindresorhus/is'` — because a
     * bare name is resolved from the package root, where pnpm has not put it.
     *
     * Measured on `synstate`, deleting its `node_modules/.vite` before each
     * run: 6 of 6 runs pass with the list, 4 of 4 fail without it.
     * Warm, it passes either way — which is why this failed only in CI.
     */
    optimizeDepsInclude?: string[];
    /**
     * Defaults to `false` — see the comment on the emitted option. Pass `true`
     * to opt out and run the browser tests in parallel.
     */
    fileParallelism?: boolean;
  }>;

/**
 * Builds the Vitest config for a package whose configs live under
 * `<package-root>/configs`.
 *
 * What is shared is the shape: the coverage provider, the Node.js project's
 * settings, and the browser project with its `fileParallelism` workaround.
 * What each package passes is what it genuinely does differently — which files
 * are tests, which are in-source tests, what to alias.
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
  /**
   * Only for a package with no tests at all: refused when the package has any
   * ({@link hasTestFiles}), because it also turns a run whose globs match
   * nothing — a renamed directory, a narrowed `include` — into a pass. Omitted
   * rather than defaulted, because Vitest's own default is `false`.
   */
  passWithNoTests?: boolean;
  coverage?: {
    include?: string[];
    exclude?: string[];
  };
  node?: ProjectOverrides;
  /** Pass `false` for a package with no browser tests. */
  browser?: false | BrowserOptions;
}>) => {
  if (passWithNoTests === true && hasTestFiles(packageRoot)) {
    throw new Error(
      `${packageRoot}: passWithNoTests is only for a package with no tests, and this one has some. Remove it, so that a run matching no test file fails.`,
    );
  }

  const nodeConfig = projectConfig(packageRoot, node);

  const nodeExclude = nodeProjectExclude(nodeConfig.exclude);

  const nodeProject = {
    test: {
      name: 'Node.js',
      environment: 'node',
      alias: castMutable(alias),
      ...nodeConfig,
      exclude: castMutable(nodeExclude),
      // One module graph per worker rather than per test file. Isolated, each
      // file imported its module graph afresh, and with in-source tests every
      // source file is a test file: `ts-data-forge`'s Node.js tests spent 85%
      // of their time importing, and took 17 s instead of 203 s without it.
      //
      // What a test changes outside its module — fake timers, a stubbed
      // global or environment variable, the working directory — it restores
      // before it ends, since the next file in the worker runs on whatever is
      // left. A module mock cannot be kept to its file at all: a module another
      // file has already imported in the worker keeps the real dependency, so
      // whether the mock applies depends on the order the files ran in. A
      // package whose tests mock a module is therefore run isolated, decided
      // here rather than declared, so that adding the first `vi.mock` cannot
      // forget it.
      isolate: usesModuleMocks(packageRoot),
      typecheck: {
        tsconfig: path.resolve(packageRoot, './configs/tsconfig.test.json'),
      },
    },
  } as const satisfies TestProjectConfiguration;

  const browserProject =
    browser === false || browser === undefined
      ? undefined
      : defineBrowserProject({ packageRoot, alias, browser });

  const projects: readonly TestProjectConfiguration[] =
    browserProject === undefined
      ? ([nodeProject] as const)
      : ([nodeProject, browserProject] as const);

  return {
    test: {
      coverage: {
        // istanbul instruments only the files `include` names, as Vite
        // transforms them; V8's precise coverage slows every function the
        // process runs. Suites that run the TypeScript compiler or ESLint took
        // two to three and a half times as long under V8 (eslint-config-typed
        // 86 s, eslint-plugin-ts-data-forge 70 s; 40 s and 20 s under istanbul,
        // on four cores), and the rest no less.
        // Branch counts differ slightly between the two.
        provider: 'istanbul',
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

/**
 * The browser project of {@link defineViteConfig}, named `name`. A package
 * calls it itself only for a browser project besides that one, such as
 * `synstate-react-hooks-compat`'s on older React versions; its `name` starts
 * with `Browser` so that `--project='Browser*'`, its `check:test:browser`, runs
 * them all.
 */
export const defineBrowserProject = ({
  packageRoot,
  name = 'Browser',
  alias,
  browser,
}: DeepReadonly<{
  /** The package's root directory. */
  packageRoot: string;
  name?: `Browser${string}`;
  alias?: InlineConfig['alias'];
  browser: BrowserOptions;
}>) =>
  ({
    test: {
      name,
      alias: castMutable(alias),
      ...projectConfig(packageRoot, browser),
      // Browser mode fetches each test file over the Vite dev server, and
      // requesting them one at a time narrows the window in which a
      // mid-run reload can catch a file in flight. `optimizeDepsInclude`
      // is what removes the reload itself; see the comment there.
      fileParallelism: browser.fileParallelism ?? false,
      // https://vitest.dev/config/browser/playwright
      browser: {
        enabled: true,
        headless: true,
        screenshotFailures: false,
        provider: castMutable(browser.provider),
        instances: [{ browser: 'chromium' }],
      },
    },
    optimizeDeps: {
      include: castMutable(browser.optimizeDepsInclude),
      // No discovery: Vite optimizes `include` and nothing else, so a module
      // missing from it is never optimized on first import, which reloaded the
      // page and dropped the tests still loading — with a cold cache, as in CI,
      // blueprint-synstate ran 40 of its 346 tests and passed (#3421). An ES
      // module missing from it is served as it is; a CommonJS one fails to
      // load, and fails the run.
      noDiscovery: true,
    },
  }) as const satisfies TestProjectConfiguration;

/**
 * A project's `exclude` when the package passes none; one that passes its own
 * and means to keep these spreads them into it.
 */
export const defaultExclude = Object.freeze([
  '**/*.d.mts',
  '**/index.mts',
  'src/entry-point.mts',
] as const);

/**
 * Whether the package has a test: a `*.test.*` file under `src/` or `test/`, or
 * an in-source test block under `src/`.
 */
export const hasTestFiles = (packageRoot: string): boolean =>
  Arr.isNonEmpty(
    fs.globSync('{src,test}/**/*.test.{mts,ts,tsx}', {
      cwd: packageRoot,
      exclude: (file) => file.includes('node_modules'),
    }),
  ) ||
  fs
    .globSync('src/**/*.{mts,ts,tsx}', {
      cwd: packageRoot,
      exclude: (file) => file.includes('node_modules'),
    })
    .some((file) =>
      inSourceTestBlock.test(
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.readFileSync(path.resolve(packageRoot, file), 'utf8'),
      ),
    );

/**
 * Whether a file under the package's `src/`, `test/` or `samples/` calls
 * `vi.mock` or `vi.doMock`. Any such file counts, test or not: a false positive
 * costs speed, a false negative an order-dependent failure.
 */
export const usesModuleMocks = (packageRoot: string): boolean =>
  fs
    .globSync('{src,test,samples}/**/*.{mts,ts,tsx}', {
      cwd: packageRoot,
      exclude: (file) => file.includes('node_modules'),
    })
    .some((file) =>
      moduleMockCall.test(
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.readFileSync(path.resolve(packageRoot, file), 'utf8'),
      ),
    );

/**
 * The Node.js project's `exclude`: the package's own, then `test/browser/`.
 * That directory is the browser project's, whatever its files end in and
 * whatever `include` a package passes: run in Node.js, a DOM test fails on a
 * missing global such as `KeyboardEvent`.
 */
export const nodeProjectExclude = (
  exclude: readonly string[],
): readonly string[] => Arr.toPushed(exclude, 'test/browser/**');

const projectConfig = (packageRoot: string, overrides?: ProjectOverrides) =>
  ({
    dir: packageRoot,
    globals: true,
    restoreMocks: true,
    // Left out of `css.include`, a CSS Module is stubbed with a default
    // export only, so `import * as styles` (the form the generated
    // `*.module.d.css.ts` declares, see `gen-css-module-types.mts`) reads
    // `undefined` for every class under test while the types say `string`.
    css: { include: [/\.module\.css(?:$|\?)/u] },
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
    // A copy, so that Vitest, which adds the command line's `--exclude` to the
    // array it is given, cannot change `defaultExclude` for the projects after
    // it.
    exclude: Array.from(overrides?.exclude ?? defaultExclude),
    testTimeout: overrides?.testTimeout,
    setupFiles: castMutable(overrides?.setupFiles),
    globalSetup: castMutable(overrides?.globalSetup),
  }) as const satisfies ProjectConfig;

// A pattern, never the plain text: Vitest takes a file whose text holds the
// in-source test guard for one with in-source tests, and this one has none.
const inSourceTestBlock = /\bimport\.meta\.vitest\b/u;

const moduleMockCall = /\bvi\s*\.\s*(?:mock|doMock)\s*\(/u;
