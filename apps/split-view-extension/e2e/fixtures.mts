import {
  test as base,
  type BrowserContext,
  chromium,
  expect,
} from '@playwright/test';
import * as path from 'node:path';

/**
 * Playwright's `test`, with a browser that has the built extension loaded.
 *
 * An extension needs a persistent context of its own, and Chromium itself
 * rather than the headless shell, which loads none: `channel: 'chromium'`.
 * Installing the extension opens a split view in a tab, which would put a
 * second split view on the saved list; that tab is closed and the storage it
 * wrote cleared before a test starts.
 *
 * Of the context options, the launch takes `headless` and `viewport`, the only
 * ones the shared config sets; any other set there would have to be passed on
 * here too.
 *
 * A fixture's last parameter is named `provide`, not Playwright's `use`, which
 * the React hook rules would take for `React.use`.
 */
export const test = base.extend<
  Readonly<{
    extensionId: string;
    /** The address of a page the e2e server serves, by its path. */
    pageUrl: (pagePath: string) => string;
  }>
>({
  context: async ({ headless, viewport: viewportSize }, provide) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless,
      viewport: viewportSize,
      args: [
        `--disable-extensions-except=${distPath}`,
        `--load-extension=${distPath}`,
      ],
    });

    const worker =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent('serviceworker'));

    // Read now: an idle worker is stopped later, and leaves the list.
    const workerUrl = new URL(worker.url());

    extensionIds.set(context, workerUrl.host);

    await expect.poll(() => context.pages().filter(isSplitView).length).toBe(1);

    // Settled before it is closed, so that it is not cut off half way through
    // writing the list it starts.
    await Promise.all(
      context
        .pages()
        .filter(isSplitView)
        .map(async (tab) => {
          await tab.getByTestId('pane').first().waitFor();

          await tab.close();
        }),
    );

    // Cleared until it stays empty: a write the closed tab or the worker had in
    // flight may still land after the first clear.
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

  extensionId: async ({ context }, provide) => {
    const id = extensionIds.get(context);

    if (id === undefined) {
      throw new Error('The context was not set up by this fixture');
    }

    await provide(id);
  },

  pageUrl: async ({ baseURL }, provide) => {
    if (baseURL === undefined) {
      throw new Error('No baseURL: the e2e server is not configured');
    }

    await provide((pagePath) => {
      const url = new URL(pagePath, baseURL);

      return url.href;
    });
  },
});

const distPath = path.resolve(import.meta.dirname, '../dist');

/** The extension's id in each context, read from its worker at launch. */
const extensionIds = new WeakMap<BrowserContext, string>();

const isSplitView = (tab: Readonly<{ url: () => string }>): boolean =>
  tab.url().includes('/split.html');
