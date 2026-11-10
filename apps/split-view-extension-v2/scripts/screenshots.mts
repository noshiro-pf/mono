import { chromium, selectors, type Locator } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as util from 'node:util';
import { Num } from 'ts-data-forge';
import { startPageServer } from './page-server.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Takes the store's screenshots at the 1280x800 it asks for, into
 * `pack/screenshots/` and, for the README, a tracked copy in
 * `docs/screenshots/`.
 *
 * The build is loaded into Chromium in its new headless mode, which loads
 * extensions, so no display is needed. The panes show `/demo/<name>` pages from
 * the page server, on port 0 (spec D3): a screenshot of somebody else's site is
 * theirs to publish, and a picture has to stay the same when sites change.
 *
 * `--light` takes them in the light theme (spec L12), into
 * `pack/screenshots-light/` only: the store and the README show the dark one.
 */
const main = async (): Promise<void> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(path.resolve(distPath, 'manifest.json'))) {
    throw new Error(`No build at ${distPath}. Run \`pnpm run build\` first.`);
  }

  // What the e2e suite finds elements by, too.
  selectors.setTestIdAttribute('data-e2e');

  const server = await startPageServer();

  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 800 },
    colorScheme: light ? 'light' : 'dark',
    args: [
      `--disable-extensions-except=${distPath}`,
      `--load-extension=${distPath}`,
    ],
  });

  try {
    const worker =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent('serviceworker'));

    const workerUrl = new URL(worker.url());

    // The install opens a split view of its own (spec T3); the one in the
    // pictures is opened here, on an empty list.
    const installed = await context.waitForEvent('page');

    await installed.close();

    await worker.evaluate(async () => {
      await chrome.storage.local.clear();
    });

    const page = await context.newPage();

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(shotsPath, { recursive: true });

    if (readmeShotsPath !== undefined) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.mkdirSync(readmeShotsPath, { recursive: true });
    }

    const shoot = async (fileName: string): Promise<void> => {
      const file = path.resolve(shotsPath, fileName);

      await page.screenshot({ path: file });

      if (readmeShotsPath !== undefined) {
        fs.copyFileSync(file, path.resolve(readmeShotsPath, fileName));
      }

      console.log(file);
    };

    await page.goto(
      `chrome-extension://${workerUrl.host}/split.html?ws=shots&name=Research`,
    );

    const panes = page.getByTestId('pane');

    await panes.first().waitFor();

    // One pane after another: each address bar is its own form.
    for (const [index, name] of demoPages.entries()) {
      const address = panes
        .nth(index)
        .getByRole('textbox', { name: 'Address' });

      // eslint-disable-next-line no-await-in-loop -- one pane at a time
      await address.fill(`${server.origin}/demo/${name}`);

      // eslint-disable-next-line no-await-in-loop -- one pane at a time
      await address.press('Enter');

      // eslint-disable-next-line no-await-in-loop -- one pane at a time
      await panes
        .nth(index)
        .getByTestId('pane-frame')
        .contentFrame()
        .getByRole('heading', { name })
        .waitFor();
    }

    await shoot('1-grid.png');

    // Zoomed out, which a pane can do and a quarter of a window cannot.
    const zoomOut = panes.nth(1).getByRole('button', { name: 'Zoom out' });

    await zoomOut.click();

    await zoomOut.click();

    await page.waitForTimeout(500);

    await shoot('2-zoom.png');

    // Mid-drag, with the drop indicator showing what letting go would do.
    const grip = await centreOf(
      panes.first().getByRole('button', { name: 'Move this pane' }),
    );

    const target = await centreOf(panes.nth(3));

    await page.mouse.move(grip.x, grip.y);

    await page.mouse.down();

    await page.mouse.move(target.x, target.y, { steps: 10 });

    await shoot('3-move.png');

    await page.mouse.up();

    // A second split view on the list, and this one's editor open.
    const [added] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: 'Add a split view' }).click(),
    ]);

    await added.close();

    await page.bringToFront();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    await page.getByTestId('view-editor').waitFor();

    await shoot('4-views.png');
  } finally {
    await context.close();

    await server.close();
  }
};

const demoPages = ['reference', 'pull-request', 'notes', 'log'] as const;

const distPath = path.resolve(workspaceRootPath, 'dist');

// Strict: anything else, a misspelt `--light` included, would quietly take the
// dark set over the tracked copies.
const light =
  util.parseArgs({ options: { light: { type: 'boolean' } }, strict: true })
    .values.light === true;

const shotsPath = path.resolve(
  workspaceRootPath,
  'pack',
  light ? 'screenshots-light' : 'screenshots',
);

/**
 * Tracked, unlike `pack/`, because the README embeds them; the dark set only,
 * which is what the README shows.
 */
const readmeShotsPath = light
  ? undefined
  : path.resolve(workspaceRootPath, 'docs', 'screenshots');

const centreOf = async (
  locator: Locator,
): Promise<Readonly<{ x: number; y: number }>> => {
  const box = await locator.boundingBox();

  if (box === null) {
    throw new Error('Not laid out');
  }

  return {
    x: box.x + Num.div(box.width, 2),
    y: box.y + Num.div(box.height, 2),
  };
};

await main();
