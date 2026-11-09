import {
  test as base,
  chromium,
  expect,
  type BrowserContext,
  type Worker as PlaywrightWorker,
} from '@playwright/test';
import * as path from 'node:path';
import { startPageServer, type PageServer } from '../scripts/index.mjs';

/**
 * Playwright's `test` with the built extension loaded, its storage emptied, and
 * the pages the panes show served on port 0.
 *
 * An extension needs a persistent context and Chromium itself rather than the
 * headless shell: `channel: 'chromium'`. Installing it opens a split view (spec
 * T3), which is waited for, closed and cleared before a test starts.
 *
 * A fixture's last parameter is `provide`, not Playwright's `use`, which reads
 * as a React hook.
 */
export const test = base.extend<
  Readonly<{
    extensionId: string;
    worker: PlaywrightWorker;
    /** The address of a page the server serves, by its path. */
    pageUrl: (pagePath: string) => string;
  }>,
  Readonly<{ pageServer: PageServer }>
>({
  pageServer: [
    // Playwright reads a fixture's dependencies from this pattern, and this one
    // has none.
    // oxlint-disable-next-line eslint/no-empty-pattern
    async ({}, provide) => {
      const server = await startPageServer();

      await provide(server);

      await server.close();
    },
    { scope: 'worker' },
  ],

  context: async ({ headless, viewport: windowSize }, provide) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless,
      viewport: windowSize,
      // The theme the store and the README show (spec L12).
      colorScheme: 'dark',
      args: [
        `--disable-extensions-except=${distPath}`,
        `--load-extension=${distPath}`,
      ],
    });

    const worker =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent('serviceworker'));

    workers.set(context, worker);

    await expect.poll(() => context.pages().filter(isSplitView).length).toBe(1);

    // Settled before it is closed, so that it is not cut off mid-write.
    await Promise.all(
      context
        .pages()
        .filter(isSplitView)
        .map(async (tab) => {
          await tab.getByTestId('pane').first().waitFor();

          await tab.close();
        }),
    );

    // Until it stays empty: a write in flight may land after the first clear.
    await expect
      .poll(async () =>
        worker.evaluate(async () => {
          await chrome.storage.local.clear();

          await chrome.storage.session.clear();

          await new Promise((resolve) => {
            setTimeout(resolve, 250);
          });

          const [local, session] = await Promise.all([
            chrome.storage.local.get(null),
            chrome.storage.session.get(null),
          ]);

          return Object.keys(local).length + Object.keys(session).length;
        }),
      )
      .toBe(0);

    await provide(context);

    await context.close();
  },

  worker: async ({ context }, provide) => {
    const worker = workers.get(context);

    if (worker === undefined) {
      throw new Error('The context was not set up by this fixture');
    }

    await provide(worker);
  },

  extensionId: async ({ worker }, provide) => {
    // Read from the worker's address: `chrome-extension://<id>/background.js`.
    const workerUrl = new URL(worker.url());

    await provide(workerUrl.host);
  },

  pageUrl: async ({ pageServer }, provide) => {
    await provide((pagePath) => {
      const url = new URL(pagePath, pageServer.origin);

      return url.href;
    });
  },
});

const distPath = path.resolve(import.meta.dirname, '../dist');

const workers = new WeakMap<BrowserContext, PlaywrightWorker>();

const isSplitView = (tab: Readonly<{ url: () => string }>): boolean =>
  tab.url().includes('/split.html');
