import { test as base, chromium, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { splitViewExtensionId } from 'split-view-link';

/**
 * Playwright's `test`, with a browser that has the built extension loaded —
 * and, with `splitViewInstalled`, Split View's own build beside it.
 *
 * Split View is the real one, from `apps/split-view-extension/dist`, because
 * what these tests check of it is its half of the pane bridge: no script of
 * this extension can reach a page in a pane of Split View, so the merge-queued
 * button there is drawn and worked by Split View on this extension's behalf.
 * `pnpm run check:e2e` builds it first (`configs/playwright.config.mts`); in CI
 * the job's `ws:build` has. Installing it opens a split view in a tab, which is
 * closed before a test starts.
 *
 * An extension needs a persistent context of its own, and Chromium itself
 * rather than the headless shell, which loads none: `channel: 'chromium'`.
 *
 * Of the context options, the launch takes `headless` and `viewport`, the only
 * ones the shared config sets; any other set there would have to be passed on
 * here too.
 *
 * A fixture's last parameter is named `provide`, not Playwright's `use`, which
 * reads as a hook to a reader used to React.
 */
export const test = base.extend<Readonly<{ splitViewInstalled: boolean }>>({
  splitViewInstalled: [false, { option: true }],

  context: async (
    { headless, viewport: viewportSize, splitViewInstalled },
    provide,
  ) => {
    if (
      splitViewInstalled &&
      !fs.existsSync(path.resolve(splitViewDistPath, 'manifest.json'))
    ) {
      throw new Error(
        `${splitViewDistPath} is missing: build Split View first (pnpm --dir ../split-view-extension run build).`,
      );
    }

    const extensions = splitViewInstalled
      ? [distPath, splitViewDistPath]
      : [distPath];

    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless,
      viewport: viewportSize,
      args: [
        `--disable-extensions-except=${extensions.join(',')}`,
        `--load-extension=${extensions.join(',')}`,
      ],
    });

    // The worker answers the content script's first question, so it is waited
    // for before any page is opened.
    if (!context.serviceWorkers().some(isOwnWorker)) {
      await context.waitForEvent('serviceworker', { predicate: isOwnWorker });
    }

    if (splitViewInstalled) {
      // The split view Split View opens on install, settled and then closed.
      await expect.poll(() => context.pages().some(isSplitView)).toBe(true);

      await Promise.all(
        context
          .pages()
          .filter(isSplitView)
          .map(async (tab) => {
            await tab.getByTestId('pane').first().waitFor();

            await tab.close();
          }),
      );
    }

    await provide(context);

    await context.close();
  },
});

const distPath = path.resolve(import.meta.dirname, '../dist');

const splitViewDistPath = path.resolve(
  import.meta.dirname,
  '../../split-view-extension/dist',
);

/** This extension's worker: Split View's is a `background.js` too. */
const isOwnWorker = (worker: Readonly<{ url: () => string }>): boolean =>
  worker.url().endsWith('/background.js') &&
  !worker.url().includes(splitViewExtensionId);

const isSplitView = (tab: Readonly<{ url: () => string }>): boolean =>
  tab.url().includes('/split.html');
