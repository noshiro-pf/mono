import { defineConfig, devices } from '@playwright/test';
import * as path from 'node:path';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';

/**
 * The e2e suite (spec D4). Written out rather than through the shared
 * `definePlaywrightAppConfig`, which serves an app on a fixed port: here the
 * extension is loaded from `dist/`, and the pages the panes show are served by
 * a fixture on port 0 (spec D3), so there is no server to configure.
 *
 * `dist/` is built first outside CI, so that a stale build is never what is
 * measured; in CI the job's `ws:build` made it.
 */
const isCi = process.env['CI'] !== undefined;

export default defineConfig({
  testDir: path.resolve(workspaceRootPath, 'e2e'),
  ...(isCi
    ? {}
    : {
        globalSetup: path.resolve(
          workspaceRootPath,
          'configs/playwright.config.global-setup.mts',
        ),
      }),

  // One worker: every test launches a browser with the extension loaded.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  reporter: isCi ? 'line' : 'list',

  use: {
    trace: 'on-first-retry',
    testIdAttribute: 'data-e2e',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
