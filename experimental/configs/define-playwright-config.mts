import { castMutable } from '@noshiro/mono-utils';
import { defineConfig, devices } from '@playwright/test';

/** Read environment variables from file. https://github.com/motdotla/dotenv */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/** See https://playwright.dev/docs/test-configuration. */
export const definePlaywrightConfig = ({
  baseURL,
  testDir,
  webServer,
}: Readonly<{
  baseURL: string;
  testDir: string;
  // webServer?: readonly PlaywrightTestConfig['webServer'][];
  webServer?: readonly Readonly<{ command: string; url: string }>[];
}>) =>
  defineConfig({
    testDir,
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: process.env['CI'] !== undefined,
    /* Retry on CI only */
    retries: process.env['CI'] !== undefined ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env['CI'] !== undefined ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
      /* Base URL to use in actions like `await page.goto('/')`. */
      baseURL,

      /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
      trace: 'on-first-retry',

      testIdAttribute: 'data-e2e',
    },

    /* Configure projects for major browsers */
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },

      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },

      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      },

      /* Test against mobile viewports. */
      // {
      //   name: 'Mobile Chrome',
      //   use: { ...devices['Pixel 5'] },
      // },
      // {
      //   name: 'Mobile Safari',
      //   use: { ...devices['iPhone 12'] },
      // },

      /* Test against branded browsers. */
      // {
      //   name: 'Microsoft Edge',
      //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
      // },
      // {
      //   name: 'Google Chrome',
      //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      // },
    ],

    /* Run your local dev server before starting the tests */
    webServer: castMutable(
      webServer?.map(({ url, command }) => ({
        url,
        command,
        reuseExistingServer: process.env['CI'] === undefined,
      })) ?? [],
    ),
  });
