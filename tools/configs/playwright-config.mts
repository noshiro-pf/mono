import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from '@playwright/test';
import * as path from 'node:path';
import { appDevPort } from './app-dev-ports.mjs';

/**
 * Builds the Playwright config for an app under `apps/` whose specs live in
 * `<package-root>/e2e`, or in another package's directory named by `testDir`,
 * and whose configs live in `<package-root>/configs`.
 *
 * `testIdAttribute` is `data-e2e`, which is what the restored sources are
 * marked up with — Playwright's own default is `data-testid`, and pointing it
 * there would make every `getByTestId` match nothing while the assertions read
 * as if they were checking something.
 *
 * Chromium only. CI installs one browser, headless
 * (`playwright install --only-shell chromium`), and these are smoke tests of
 * the app's own rendering rather than of browser differences; three engines
 * would triple the runtime for the same answer.
 */
export const definePlaywrightAppConfig = ({
  packageRoot,
  basePath = '/',
  server,
  testDir = path.resolve(packageRoot, 'e2e'),
}: Readonly<{
  /**
   * The package's root directory, i.e. the parent of `configs` and of `e2e`
   * when the specs are its own.
   */
  packageRoot: string;

  /**
   * The path the dev server serves the app under, with both slashes: an Astro
   * site's `base`, such as `/mono/synstate/`. The server answers 404 at `/`
   * then, which Playwright would wait on until it timed out, and a spec's
   * `page.goto('guides/')` resolves against it.
   */
  basePath?: `/${string}`;

  /**
   * For a site checked as it ships rather than under its dev server
   * (`pnpm run dev`, given a minute to answer): the command that serves the
   * build (`preview`) and the one that makes it (`build`).
   *
   * CI runs `preview` alone, over the `dist/` that the `code-check.yml` entry
   * running this suite built with `ws:build` before it (`ws:build:deps` builds
   * no app, so an entry with such a site has to name the whole build); locally
   * `build` runs first, so that a stale `dist/` is never what is measured. A
   * server already listening on the port is never reused, since it may be the
   * dev server or a preview of an older build: the port being taken fails the
   * run instead.
   */
  server?: Readonly<{
    build: string;
    preview: string;
    /**
     * The directory `build` writes, relative to the package. In CI it has to
     * exist before the suite starts; when it does not, the server command fails
     * and says so, rather than leaving `preview` to time out.
     */
    output: string;
    timeoutMs: number;
  }>;

  /**
   * The directory of the specs, `e2e` of the package unless another package's
   * suite is run against this app: two apps that draw the same pages share one
   * suite, and the package that holds it says so beside the specs.
   */
  testDir?: string;
}>): PlaywrightTestConfig => {
  const port = appDevPort(packageRoot);

  const isCi = process.env['CI'] !== undefined;

  // In CI the build is checked for in the command rather than here: knip and
  // other tools load this config too, under `CI` as well, with no app built.
  const serverCommand =
    server === undefined
      ? 'pnpm run dev'
      : isCi
        ? (`if [ -d ${server.output} ]; then ${server.preview}; else echo "${server.output}/ is missing: in CI this suite serves the build it finds, so the code-check.yml entry running it has to build with ws:build (ws:build:deps builds no app)." >&2; exit 1; fi` as const)
        : (`${server.build} && ${server.preview}` as const);

  const baseURL = `http://localhost:${port}${basePath}` as const;

  return defineConfig({
    testDir,

    // One worker, everywhere. Each of these suites is backed by a single Vite
    // dev server for a single app, and the heavier apps do enough work on load
    // — `cant-stop-probability` builds a 165-row probability table — that
    // parallel contexts starve one another: measured, its three tests timed out
    // at 30s each in parallel and passed in 3.6s in sequence. There is no
    // parallelism to win here, only flakiness.
    fullyParallel: false,
    workers: 1,

    // A `test.only` left in the source fails the run rather than quietly
    // reducing it to one test.
    forbidOnly: isCi,
    retries: isCi ? 2 : 0,

    // Not `html`: that writes a report directory and starts a server after the
    // run, neither of which a CI job or `ws:check:e2e` has any use for.
    reporter: isCi ? 'line' : 'list',

    use: {
      baseURL,
      trace: 'on-first-retry',
      testIdAttribute: 'data-e2e',
    },

    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

    webServer: {
      command: serverCommand,
      timeout: server?.timeoutMs ?? 60_000,
      cwd: packageRoot,
      url: baseURL,
      // Locally, attach to a dev server that is already up; the port is this
      // app's alone, so it cannot be another app's. On CI there is never one,
      // and a `server` is never reused (see its documentation above).
      reuseExistingServer: server === undefined && !isCi,
    },
  });
};
