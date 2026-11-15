import { test as base, chromium } from '@playwright/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { splitViewPagePath, splitViewPresencePath } from 'split-view-link';
import { hasKey, isRecord, isString } from 'ts-data-forge';

/**
 * Playwright's `test`, with a browser that has the built extension loaded —
 * and, with `splitViewInstalled`, a stand-in for Split View beside it.
 *
 * An extension needs a persistent context of its own, and Chromium itself
 * rather than the headless shell, which loads none: `channel: 'chromium'`.
 *
 * The stand-in is what this extension needs of Split View and no more: the id
 * an unpacked build of it has, which comes of the `key` in its manifest; the
 * file it lists for every extension to fetch, which is how this one tells it is
 * installed; and a `split.html`, which is what the "Split view" button opens.
 * Split View itself would open a split view of its own on install and keep
 * state between tests, and would have to be built first.
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
    const extensions = splitViewInstalled
      ? [distPath, makeSplitViewStandIn()]
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

    await provide(context);

    await context.close();
  },
});

const distPath = path.resolve(import.meta.dirname, '../dist');

const isOwnWorker = (worker: Readonly<{ url: () => string }>): boolean =>
  worker.url().endsWith('/background.js');

/**
 * Writes the stand-in for Split View into a new temporary directory and returns
 * it. The `key` is read from Split View's own manifest, so that the
 * stand-in has the id the real one has.
 */
const makeSplitViewStandIn = (): string => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'github-view-defaults-e2e-split-view-'),
  );

  const splitViewManifest: unknown = JSON.parse(
    fs.readFileSync(
      path.resolve(
        import.meta.dirname,
        '../../split-view-extension/public/manifest.json',
      ),
      'utf8',
    ),
  );

  if (
    !isRecord(splitViewManifest) ||
    !hasKey(splitViewManifest, 'key') ||
    !isString(splitViewManifest.key)
  ) {
    throw new Error("Split View's manifest has no key");
  }

  const manifest = {
    manifest_version: 3,
    name: 'Split View (stand-in)',
    version: '0.0.0',
    key: splitViewManifest.key,
    web_accessible_resources: [
      { resources: [splitViewPresencePath], extension_ids: ['*'] },
    ],
  } as const;

  const files = [
    ['manifest.json', JSON.stringify(manifest)],
    [
      splitViewPresencePath,
      fs.readFileSync(
        path.resolve(import.meta.dirname, '../public/icons/16.png'),
      ),
    ],
    [
      splitViewPagePath,
      '<!doctype html><title>Split View stand-in</title><p>split view</p>',
    ],
  ] as const;

  for (const [relativePath, content] of files) {
    const filePath = path.join(directory, relativePath);

    // The paths are this file's own, under the directory made just above.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(filePath, content);
  }

  return directory;
};
