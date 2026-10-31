import { defineConfig, devices } from '@playwright/test';
import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';

/**
 * The end-to-end tests against the deployed app, run daily by
 * `.github/workflows/e2e-production.yml`.
 *
 * Unlike `playwright.config.mts` it starts no dev server: the site is the one
 * people use. It runs the `@smoke` tests, which only read, and the
 * `@production` ones, which write to the production Firestore and put back what
 * they wrote; `e2e/production.spec.mts` says how.
 *
 * `E2E_BASE_URL` points the same tests elsewhere, which is how they are tried
 * out against `pnpm run dev` and the emulators before they meet production.
 */
export default defineConfig({
  testDir: path.resolve(workspaceRootPath, 'e2e'),

  // Playwright imports every spec before it filters by tag, and the daily job
  // installs this app alone and builds nothing, so no spec under `e2e/` may
  // import a workspace package at run time; one that does fails the job with
  // "Cannot find module".
  grep: /@smoke|@production/u,

  // One worker, for the reason the shared config gives, and because the
  // `@production` tests share one event: two of them at once would read each
  // other's writes.
  fullyParallel: false,
  workers: 1,

  forbidOnly: process.env['CI'] !== undefined,

  // A retry after a failure partway through is also what puts the event back:
  // each `@production` test starts by clearing what an earlier attempt left.
  retries: process.env['CI'] !== undefined ? 2 : 0,

  reporter: process.env['CI'] !== undefined ? 'line' : 'list',

  // Firestore round trips from a CI runner to `asia-northeast2` are slower than
  // to a local emulator.
  timeout: 60_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL:
      process.env['E2E_BASE_URL'] ?? 'https://event-schedule-app.web.app',
    // No trace: one would hold the fixture event's URL, which is what admits a
    // writer to it (see `e2e/production.spec.mts`), and the workflow keeps the
    // logs, where GitHub masks the secret, as the only output.
    trace: 'off',
    testIdAttribute: 'data-e2e',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
