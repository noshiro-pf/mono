import { chromium } from '@playwright/test';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';
import { Num } from 'ts-data-forge';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Takes the store's screenshots, at the 1280x800 it asks for.
 *
 * It loads the build into a real Chromium — the same way `smoke.mts` does, and
 * with the same need of a headed browser:
 *
 * ```sh
 * xvfb-run -a pnpm run screenshots
 * ```
 *
 * The panes are pointed at pages this script serves itself, because a
 * screenshot of somebody else's site is theirs and not ours to publish, and
 * because a screenshot has to keep working when the sites in it change.
 * **Point `demoUrls` at whatever you actually use before uploading**: a
 * listing is more convincing showing the tool doing its job than showing
 * placeholders doing nothing.
 */
const main = async (): Promise<void> => {
  assertBuildIsPresent();

  const server = await startDemoServer();

  const userDataDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'split-view-shot-'),
  );

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: { width: 1280, height: 800 },
    args: [
      `--disable-extensions-except=${distPath}`,
      `--load-extension=${distPath}`,
      '--no-sandbox',
    ],
  });

  try {
    const [running] = context.serviceWorkers();

    const worker =
      running ??
      (await context.waitForEvent('serviceworker', { timeout: 15_000 }));

    const workerUrl = new URL(worker.url());

    const extensionId = workerUrl.host;

    const page = await context.newPage();

    // The install opens a split view of its own; this one is the one being
    // photographed.
    await page.waitForTimeout(2500);

    await Promise.all(
      context
        .pages()
        .filter((tab) => tab !== page)
        .map(async (tab) => tab.close()),
    );

    await worker.evaluate(async () => {
      await chrome.storage.local.clear();
    });

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(shotsPath, { recursive: true });

    const shoot = async (fileName: string): Promise<void> => {
      const file = path.resolve(shotsPath, fileName);

      await page.screenshot({ path: file });

      console.log(file);
    };

    const boxOf = async (selector: string): Promise<Box> => {
      const box = await page.locator(selector).first().boundingBox();

      if (box === null) {
        throw new Error(`no bounding box for ${selector}`);
      }

      return box;
    };

    await page.goto(`chrome-extension://${extensionId}/split.html?ws=shots`);

    await page.waitForSelector('.pane', { timeout: 10_000 });

    // One at a time, and through a promise chain rather than a loop: filling
    // the four address bars at once got two of the URLs concatenated into one
    // pane and left two empty.
    await demoUrls.reduce(async (previous, url, index) => {
      await previous;

      const address = page.locator('.pane__input').nth(index);

      await address.fill(url);

      await address.press('Enter');
    }, Promise.resolve());

    await page.waitForTimeout(3000);

    await shoot('1-grid.png');

    // Zoomed out, which is the thing a pane can do that a browser window
    // cannot do to a quarter of itself.
    await page
      .locator('.pane >> nth=1 >> .pane__button[title*="Zoom out"]')
      .click();

    await page
      .locator('.pane >> nth=1 >> .pane__button[title*="Zoom out"]')
      .click();

    await page.waitForTimeout(800);

    await shoot('2-zoom.png');

    // Mid-drag, with the drop indicator showing what letting go would do.
    const grip = await boxOf('.pane >> nth=0 >> .pane__grip');

    const target = await boxOf('.pane >> nth=3');

    await page.mouse.move(
      grip.x + Num.div(grip.width, 2),
      grip.y + Num.div(grip.height, 2),
    );

    await page.mouse.down();

    await page.mouse.move(
      target.x + Num.div(target.width, 2),
      target.y + Num.div(target.height, 2),
      { steps: 10 },
    );

    await page.waitForTimeout(400);

    await shoot('3-move.png');

    await page.mouse.up();

    await page.waitForTimeout(600);

    // The list of saved split views, with the popover open.
    await page.locator('.top-bar__button[title*="Add a split view"]').click();

    await page.waitForTimeout(800);

    await page.locator('.workspace-picker__select').selectOption({ index: 0 });

    await page.waitForTimeout(1200);

    await page.locator('.top-bar__button[title*="Rename, reorder"]').click();

    await page.waitForTimeout(400);

    await shoot('4-saved.png');
  } finally {
    await context.close();

    await server.close();
  }
};

/**
 * What the panes are pointed at. Replace these with the sites the listing
 * should show; anything the browser can reach will do.
 */
const demoPort = 5187;

const demoUrls = [
  `http://localhost:${String(demoPort)}/reference`,
  `http://localhost:${String(demoPort)}/pull-request`,
  `http://localhost:${String(demoPort)}/notes`,
  `http://localhost:${String(demoPort)}/log`,
] as const;

type Box = Readonly<{ x: number; y: number; width: number; height: number }>;

const distPath = path.resolve(workspaceRootPath, 'dist');

const shotsPath = path.resolve(workspaceRootPath, 'pack', 'screenshots');

const assertBuildIsPresent = (): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(path.resolve(distPath, 'manifest.json'))) {
    throw new Error(`No build at ${distPath}. Run \`pnpm run build\` first.`);
  }
};

/**
 * Four plain pages, so that the screenshots show the extension rather than
 * somebody else's design, and go on looking the same next year.
 */
const startDemoServer = async (): Promise<
  Readonly<{ close: () => Promise<void> }>
> => {
  const server = http.createServer((request, response) => {
    const route = (request.url ?? '/').replace('/', '');

    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });

    response.end(demoPage(route));
  });

  await new Promise<void>((resolve) => {
    server.listen(demoPort, resolve);
  });

  return {
    close: async (): Promise<void> =>
      new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      }),
  };
};

const demoPage = (route: string): string =>
  [
    '<!doctype html><html lang="en"><head>',
    `<title>${route}</title>`,
    '<style>',
    'body{font:16px/1.7 system-ui,sans-serif;margin:0;padding:24px;color:#1f2126}',
    'h1{font-size:22px;margin:0 0 4px}',
    'p{max-width:60ch;color:#4a5160}',
    '.row{border-top:1px solid #e6e8ec;padding:10px 0;display:flex;gap:12px}',
    '.tag{background:#eef2fb;color:#4f7fd9;border-radius:4px;padding:1px 8px;font-size:13px}',
    '</style></head><body>',
    `<h1>${route}</h1>`,
    '<p>A page served by the screenshot script, so that what the picture shows is the split view rather than anybody else’s site.</p>',
    ...Array.from(
      { length: 6 },
      (_, index) =>
        `<div class="row"><span class="tag">${route}</span><span>Line ${String(index + 1)} of something you might be reading in a pane</span></div>`,
    ),
    '</body></html>',
  ].join('');

await main();
