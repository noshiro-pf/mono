import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from '@playwright/test';
import * as path from 'node:path';
import { appDevPort } from './app-dev-ports.mjs';

/**
 * Builds the Playwright config for an app under `apps/` whose specs live in
 * `<package-root>/e2e` and whose configs live in `<package-root>/configs`.
 *
 * `testIdAttribute` is `data-e2e`, which is what the restored sources are
 * marked up with — Playwright's own default is `data-testid`, and pointing it
 * there would make every `getByTestId` match nothing while the assertions read
 * as if they were checking something.
 *
 * Chromium only. CI installs one browser (`playwright install chromium`), and
 * these are smoke tests of the app's own rendering rather than of browser
 * differences; three engines would triple the runtime for the same answer.
 */
export const definePlaywrightAppConfig = ({
  packageRoot,
  basePath = '/',
  server,
}: Readonly<{
  /** The package's root directory, i.e. the parent of `configs` and `e2e`. */
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
   * CI runs `preview` alone, over the `dist/` that `code-check.yml`'s build job
   * made from the same commit and unpacks before `ws:check:e2e`; locally
   * `build` runs first, so that a stale `dist/` is never what is measured. A
   * server already listening on the port is never reused, since it may be the
   * dev server or a preview of an older build: the port being taken fails the
   * run instead.
   */
  server?: Readonly<{ build: string; preview: string; timeoutMs: number }>;
}>): PlaywrightTestConfig => {
  const port = appDevPort(packageRoot);

  const isCi = process.env['CI'] !== undefined;

  const serverCommand =
    server === undefined
      ? 'pnpm run dev'
      : isCi
        ? server.preview
        : (`${server.build} && ${server.preview}` as const);

  const baseURL = `http://localhost:${port}${basePath}` as const;

  return defineConfig({
    testDir: path.resolve(packageRoot, 'e2e'),

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
