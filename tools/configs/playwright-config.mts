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
}: Readonly<{
  /** The package's root directory, i.e. the parent of `configs` and `e2e`. */
  packageRoot: string;
}>): PlaywrightTestConfig => {
  const port = appDevPort(packageRoot);

  const baseURL = `http://localhost:${port}`;

  return defineConfig({
    testDir: path.resolve(packageRoot, 'e2e'),

    // One worker, everywhere. Each of these suites is backed by a single Vite
    // dev server for a single app, and the heavier apps do enough work on load
    // — `cant-stop-probability-app` builds a 165-row probability table — that
    // parallel contexts starve one another: measured, its three tests timed
    // out at 30s each in parallel and passed in 3.6s in sequence. There is no
    // parallelism to win here, only flakiness.
    fullyParallel: false,
    workers: 1,

    // A `test.only` left in the source fails the run rather than quietly
    // reducing it to one test.
    forbidOnly: process.env['CI'] !== undefined,
    retries: process.env['CI'] !== undefined ? 2 : 0,

    // Not `html`: that writes a report directory and starts a server after the
    // run, neither of which a CI job or `ws:e2e` has any use for.
    reporter: process.env['CI'] !== undefined ? 'line' : 'list',

    use: {
      baseURL,
      trace: 'on-first-retry',
      testIdAttribute: 'data-e2e',
    },

    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

    webServer: {
      command: 'pnpm run dev',
      cwd: packageRoot,
      url: baseURL,
      // Locally, attach to a server that is already up; the port is this app's
      // alone, so it cannot be another app's. On CI there is never one.
      reuseExistingServer: process.env['CI'] === undefined,
    },
  });
};
