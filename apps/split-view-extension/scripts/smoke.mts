import { chromium } from '@playwright/test';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';
import { Arr, Num } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Loads the built extension into a real Chromium and checks the three things
 * nothing else can check.
 *
 * - A page that refuses to be framed is framed anyway, which is the
 *   header-stripping rule doing its job.
 * - The content script inside a pane reports its title, and follows a
 *   navigation made inside the frame.
 * - A reload comes back to the same layout, at the same addresses.
 * - The saved list of split views: creating one, switching with `Alt+N` from
 *   the page and from inside a pane, renaming, exporting, deleting, and the
 *   whole list surviving a reload. The tab's title and its numbered favicon
 *   are here too, because nothing outside a browser draws either.
 *
 * It needs a headed browser, because Chromium loads no extensions in the
 * headless shell. On a machine with no display:
 *
 * ```sh
 * xvfb-run -a pnpm run smoke
 * ```
 *
 * Everything lives in one function because Playwright's `Page` and
 * `BrowserContext` cannot be passed as parameters here — the lint rules require
 * a deeply readonly parameter type, and those two are neither.
 */
const main = async (): Promise<void> => {
  assertBuildIsPresent();

  const server = await startPageServer();

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'split-view-'));

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
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

    const mut_errors: string[] = [];

    page.on('pageerror', (error) => {
      mut_errors.push(String(error));
    });

    const appears = async (
      selector: string,
      timeout: number,
    ): Promise<boolean> =>
      page
        .locator(selector)
        .first()
        .waitFor({ timeout })
        .then(() => true)
        .catch(() => false);

    const boxOf = async (selector: string): Promise<Box> => {
      const box = await page.locator(selector).first().boundingBox();

      if (box === null) {
        throw new Error(`no bounding box for ${selector}`);
      }

      return box;
    };

    const workspaceOptionCount = async (): Promise<number> =>
      page.locator('.workspace-picker__select option').count();

    /** Waits for the first pane's address bar to show `fragment`. */
    const settlesTo = async (
      fragment: string,
      timeout: number,
    ): Promise<boolean> => {
      const deadline = Date.now() + timeout;

      const poll = async (): Promise<boolean> => {
        const value = await page.locator('.pane__input').first().inputValue();

        if (value.includes(fragment)) {
          return true;
        }

        if (Date.now() > deadline) {
          return false;
        }

        await page.waitForTimeout(200);

        return poll();
      };

      return poll();
    };

    // Installing opens a split view of its own, which would put a second
    // workspace on the saved list and race this page for it. Both go before
    // anything is asserted: the tab, and whatever it wrote. The page under test
    // is kept — closing the last tab of a persistent context closes the
    // browser.
    await installedTabDelay();

    await Promise.all(
      context
        .pages()
        .filter((tab) => tab !== page)
        .map(async (tab) => tab.close()),
    );

    await worker.evaluate(async () => {
      await chrome.storage.local.clear();
    });

    await page.goto(`chrome-extension://${extensionId}/split.html?ws=smoke`);

    await page.waitForSelector('.pane', { timeout: 10_000 });

    // Only a `build:dev` build carries the build label; a production one
    // leaves it out, along with the rest of the diagnostics.
    const buildLabel =
      (await page.locator('.top-bar__build').count()) === 0
        ? ''
        : await page.locator('.top-bar__build').innerText();

    const paneCount = await page.locator('.pane').count();

    const splitterCount = await page.locator('.splitter').count();

    const address = page.locator('.pane__input').first();

    await address.fill(`localhost:${String(serverPort)}`);

    await address.press('Enter');

    const framed = await appears('.pane iframe', 10_000);

    const bodyShown = await page
      .locator('.pane iframe')
      .first()
      .contentFrame()
      .locator('#hello')
      .waitFor({ timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    // A frame's title reaches the page only through the content script.
    const titleReported = await appears(
      '.pane iframe[title="Refuses Framing"]',
      8000,
    );

    // The click is retried: the pane's toolbar settles asynchronously (the
    // favicon arrives on its own schedule), and a click dispatched while the
    // frame is still moving lands next to the link rather than on it.
    const clickThrough = async (attempt: number): Promise<boolean> => {
      await page
        .locator('.pane iframe')
        .first()
        .contentFrame()
        .locator('#go')
        .click();

      if (await settlesTo('/second', 3000)) {
        return true;
      }

      return attempt >= 3 ? false : clickThrough(attempt + 1);
    };

    const followed = await clickThrough(1);

    // Dragging a divider: the one piece of pointer arithmetic in the page.
    const paneBeforeDrag = await boxOf('.pane');

    const divider = await boxOf('.splitter--row');

    await page.mouse.move(
      divider.x + Num.div(divider.width, 2),
      divider.y + Num.div(divider.height, 2),
    );

    await page.mouse.down();

    await page.mouse.move(
      divider.x - 80,
      divider.y + Num.div(divider.height, 2),
      {
        steps: 8,
      },
    );

    await page.mouse.up();

    await page.waitForTimeout(200);

    const paneAfterDrag = await boxOf('.pane');

    await page
      .locator('.pane')
      .first()
      .getByTitle('Split to the right')
      .click();

    await page.waitForTimeout(300);

    const afterSplit = await page.locator('.pane').count();

    // Long enough for the debounced save to have run.
    await page.waitForTimeout(700);

    await page.reload();

    await page.waitForSelector('.pane', { timeout: 10_000 });

    await page.waitForTimeout(500);

    const restoredPanes = await page.locator('.pane').count();

    const restoredAddress = await page
      .locator('.pane__input')
      .first()
      .inputValue();

    /**
     * Opens the first pane's overflow menu, where the rare actions live.
     *
     * Idempotent: the button toggles, so opening an open menu would close it.
     */
    const openPaneMenu = async (): Promise<void> => {
      if ((await page.locator('.pane__menu-popover').count()) > 0) {
        return;
      }

      await page
        .locator('.pane__button[aria-label="More for this pane"]')
        .first()
        .click();

      await page.waitForTimeout(300);
    };

    // A pane blocked by the site's own service worker, and the way out of it.
    await address.fill(`http://localhost:${String(serverPort)}/sw-home`);

    await address.press('Enter');

    await appears('.pane iframe', 10_000);

    await page.waitForTimeout(2500);

    await address.fill(`http://localhost:${String(serverPort)}/sw-target`);

    await address.press('Enter');

    await page.waitForTimeout(3000);

    const blockedByWorker = !(await appears('#sw-target', 2000));

    await openPaneMenu();

    const offersReset = await appears(
      '.pane__menu-item[title*="own service worker"]',
      3000,
    );

    await page
      .locator('.pane__menu-item[title*="own service worker"]')
      .first()
      .click();

    await page.waitForTimeout(5000);

    const recovered = await page
      .locator('.pane iframe')
      .first()
      .contentFrame()
      .locator('#sw-target')
      .waitFor({ timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    // With the worker gone the site registers it again on the next visit, so
    // the pane can be brought back to the same failure — and then the per-origin
    // setting should clear it without anyone pressing anything.
    await address.fill(`http://localhost:${String(serverPort)}/sw-home`);

    await address.press('Enter');

    await page.waitForTimeout(2500);

    await address.fill(`http://localhost:${String(serverPort)}/sw-target`);

    await address.press('Enter');

    await page.waitForTimeout(3000);

    const blockedAgain = !(await appears('#sw-target', 2000));

    await openPaneMenu();

    await page
      .locator('.pane__menu-item[title*="Always clear service workers"]')
      .first()
      .click();

    const clearedByItself = await page
      .locator('.pane iframe')
      .first()
      .contentFrame()
      .locator('#sw-target')
      .waitFor({ timeout: 12_000 })
      .then(() => true)
      .catch(() => false);

    // --- the saved list of split views ---------------------------------
    const optionsAtStart = await workspaceOptionCount();

    const titleAtStart = await page.title();

    const faviconAtStart =
      (await page.locator('link#split-view-favicon').getAttribute('href')) ??
      '';

    // A second split view, in the same tab.
    await page.locator('.top-bar__button[title*="Add a split view"]').click();

    await page.waitForTimeout(800);

    const optionsAfterCreate = await workspaceOptionCount();

    const titleAfterCreate = await page.title();

    const panesInNewWorkspace = await page.locator('.pane').count();

    // `Alt+1` goes back to the first, which has to come back at the address it
    // was left at — the whole point of the list.
    await page.keyboard.press('Alt+Digit1');

    await page.waitForTimeout(1000);

    const addressAfterSwitch = await page
      .locator('.pane__input')
      .first()
      .inputValue();

    // The same key with the focus inside a pane, which is where it is most of
    // the time: a key event does not cross a frame boundary, so this only works
    // because the content script forwards it. The pane is pointed at the plain
    // page first — the one it is on has a service worker being fought over, and
    // a frame mid-reload is not something to press a key into.
    await address.fill(`http://localhost:${String(serverPort)}/`);

    await address.press('Enter');

    await page
      .locator('.pane iframe')
      .first()
      .contentFrame()
      .locator('#hello')
      .waitFor({ timeout: 10_000 });

    const clickedInsideAPane = await page
      .locator('.pane iframe')
      .first()
      .contentFrame()
      .locator('body')
      .click({ timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    await page.keyboard.press('Alt+Digit2');

    await page.waitForTimeout(1000);

    const titleAfterPaneShortcut = await page.title();

    const switchedFromInsideAPane = titleAfterPaneShortcut.startsWith('2:');

    // Editing the list, in the popover: rename, export, delete.
    await page.locator('.top-bar__button[title*="Rename, reorder"]').click();

    // Deliberately not ASCII: a name is the user's text, whatever the UI's
    // own language is.
    await page.locator('.workspace-popover__input').fill('検証');

    await page.locator('.workspace-popover button[type="submit"]').click();

    await page.waitForTimeout(400);

    const renamedOption = await page
      .locator('.workspace-picker__select option:checked')
      .innerText();

    const renamedTitle = await page.title();

    const exportedText = await Promise.all([
      page.waitForEvent('download', { timeout: 8000 }),
      page.locator('.top-bar__button[title*="Write every saved"]').click(),
    ])
      .then(async ([download]) => {
        const downloadPath = await download.path();

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        return fs.readFileSync(downloadPath, 'utf8');
      })
      .catch(() => '');

    // The popover is still open from the rename — `✎` toggles, so clicking it
    // again would close it.
    await page
      .locator('.top-bar__button[title*="Remove this split view"]')
      .click();

    await page.locator('.workspace-popover__danger').click();

    await page.waitForTimeout(800);

    const optionsAfterRemove = await workspaceOptionCount();

    const addressBeforeReload = await page
      .locator('.pane__input')
      .first()
      .inputValue();

    await page.reload();

    await page.waitForSelector('.workspace-picker__select', {
      timeout: 10_000,
    });

    await page.waitForTimeout(800);

    const optionsAfterReload = await workspaceOptionCount();

    const addressAfterReload = await page
      .locator('.pane__input')
      .first()
      .inputValue();

    // --- zooming one pane -----------------------------------------------
    // One pane, so that the zoom controls are in the toolbar rather than in
    // the overflow menu. The menu is what the service-worker section above
    // went through, at a fifth of the window wide.
    await page.locator('.top-bar__button[title*="One pane"]').click();

    await page.waitForTimeout(500);

    const zoomLabelOf = async (paneIndex: number): Promise<string> =>
      page
        .locator(`.pane >> nth=${String(paneIndex)} >> .pane__zoom`)
        .innerText()
        .catch(() => '100%');

    const frameStyleOf = async (paneIndex: number): Promise<string> =>
      (await page
        .locator(`.pane >> nth=${String(paneIndex)} >> .pane__frame`)
        .getAttribute('style')) ?? '';

    const paneBox = async (index: number): Promise<Box> =>
      boxOf(`.pane >> nth=${String(index)}`);

    /** The frame of the pane pointed at the local server, if it is loaded. */
    const localFrame = (): ReturnType<typeof page.frames>[number] | undefined =>
      page
        .frames()
        .find((frame) =>
          frame.url().startsWith(`http://localhost:${String(serverPort)}`),
        );

    // A marker inside the frame. Zoom is a `transform` on the `iframe`, so it
    // must not reload the page — and the marker is how that is checked rather
    // than assumed.
    const zoomedFrame = localFrame();

    await zoomedFrame?.evaluate(() => {
      Reflect.set(globalThis, 'svZoomMark', 'kept');
    });

    await page
      .locator('.pane >> nth=0 >> .pane__button[title*="Zoom in"]')
      .click();

    await page
      .locator('.pane >> nth=0 >> .pane__button[title*="Zoom in"]')
      .click();

    await page.waitForTimeout(400);

    const zoomAfterButtons = await zoomLabelOf(0);

    const zoomedStyle = await frameStyleOf(0);

    const markAfterZoom = await (zoomedFrame
      ?.evaluate((): unknown => Reflect.get(globalThis, 'svZoomMark'))
      .catch(() => 'the frame was replaced') ?? Promise.resolve('no frame'));

    // Ctrl+wheel over the frame, which only reaches the page because the
    // content script inside it forwards the wheel.
    const zoomedFrameBox = await boxOf('.pane >> nth=0 >> .pane__frame');

    await page.mouse.move(
      zoomedFrameBox.x + Num.div(zoomedFrameBox.width, 2),
      zoomedFrameBox.y + Num.div(zoomedFrameBox.height, 2),
    );

    await page.keyboard.down('Control');

    await page.mouse.wheel(0, -120);

    await page.keyboard.up('Control');

    await page.waitForTimeout(600);

    const zoomAfterWheel = await zoomLabelOf(0);

    // Long enough for the debounced save.
    await page.waitForTimeout(700);

    await page.reload();

    await page.waitForSelector('.pane', { timeout: 10_000 });

    await page.waitForTimeout(800);

    const zoomAfterReload = await zoomLabelOf(0);

    // --- moving a pane --------------------------------------------------
    // A 2x2 grid, so that this section has two opposite corners to swap and
    // does not depend on what the sections above left behind.
    await page.locator('.top-bar__button[title*="Four panes"]').click();

    await page.waitForTimeout(600);

    const dragGripOnto = async (
      paneIndex: number,
      to: Readonly<{ x: number; y: number }>,
    ): Promise<string> => {
      const grip = await boxOf(
        `.pane >> nth=${String(paneIndex)} >> .pane__grip`,
      );

      await page.mouse.move(
        grip.x + Num.div(grip.width, 2),
        grip.y + Num.div(grip.height, 2),
      );

      await page.mouse.down();

      await page.mouse.move(to.x, to.y, { steps: 12 });

      await page.waitForTimeout(200);

      // What the indicator says it will do, read while it is still on screen.
      const label = await page
        .locator('.pane-drop__label')
        .innerText()
        .catch(() => '');

      await page.mouse.up();

      await page.waitForTimeout(400);

      return label;
    };

    const boxBefore0 = await paneBox(0);

    const boxBefore3 = await paneBox(3);

    // The same trick again: a swap must not reload either pane.
    const movedFrame = localFrame();

    await movedFrame?.evaluate(() => {
      Reflect.set(globalThis, 'svMoveMark', 'kept');
    });

    const swapLabel = await dragGripOnto(0, {
      x: boxBefore3.x + Num.div(boxBefore3.width, 2),
      y: boxBefore3.y + Num.div(boxBefore3.height, 2),
    });

    const boxAfter0 = await paneBox(0);

    const boxAfter3 = await paneBox(3);

    const swappedPlaces =
      Math.abs(boxAfter0.x - boxBefore3.x) < 4 &&
      Math.abs(boxAfter0.y - boxBefore3.y) < 4 &&
      Math.abs(boxAfter3.x - boxBefore0.x) < 4;

    const markAfterSwap = await (movedFrame
      ?.evaluate((): unknown => Reflect.get(globalThis, 'svMoveMark'))
      .catch(() => 'the frame was replaced') ?? Promise.resolve('no frame'));

    // And again onto an edge: pane 0 should end up beside pane 3 rather than
    // where it was.
    const boxOf3 = await paneBox(3);

    const moveLabel = await dragGripOnto(0, {
      x: boxOf3.x + boxOf3.width - 8,
      y: boxOf3.y + Num.div(boxOf3.height, 2),
    });

    const panesAfterMove = await page.locator('.pane').count();

    const movedBox0 = await paneBox(0);

    const movedBox3 = await paneBox(3);

    const movedBeside =
      movedBox0.x > movedBox3.x && Math.abs(movedBox0.y - movedBox3.y) < 4;

    // The zoom travelled with the pane, being a property of the pane rather
    // than of the rectangle it sits in. Read from the frame rather than from
    // the toolbar's label: the moved pane is narrow enough that its zoom
    // controls are in the overflow menu.
    const zoomAfterMove = await frameStyleOf(0);

    report([
      check(
        'the toolbar names the build, in a build that has diagnostics',
        buildLabel === '' || /^[a-z]+-[a-z]+-[a-z]+$/u.test(buildLabel),
        buildLabel === '' ? '(production build, no label)' : buildLabel,
      ),
      check('the default layout is four panes', paneCount === 4, paneCount),
      check(
        'a 2x2 grid has three dividers',
        splitterCount === 3,
        splitterCount,
      ),
      check('a pane holds a frame', framed, ''),
      check('a page that refuses framing is framed anyway', bodyShown, ''),
      check('the content script reports the frame title', titleReported, ''),
      check('the address bar follows an in-frame navigation', followed, ''),
      check(
        'dragging a divider narrows the pane beside it',
        paneAfterDrag.width < paneBeforeDrag.width - 50,
        `${String(paneBeforeDrag.width)} -> ${String(paneAfterDrag.width)}`,
      ),
      check('splitting a pane adds one', afterSplit === 5, afterSplit),
      check('a reload restores the layout', restoredPanes === 5, restoredPanes),
      check(
        'a reload restores where the pane had navigated to',
        restoredAddress.includes('/second'),
        restoredAddress,
      ),
      check(
        'a service worker of the framed site blocks the pane',
        blockedByWorker,
        '',
      ),
      check('the pane offers to remove it', offersReset, ''),
      check('removing it gets the pane loading again', recovered, ''),
      check('the site can register its worker again', blockedAgain, ''),
      check(
        'with the origin on the list the pane clears it by itself',
        clearedByItself,
        '',
      ),
      check(
        'the picker lists the split view in the URL',
        optionsAtStart === 1,
        optionsAtStart,
      ),
      check(
        'the tab is titled by the position and the name',
        titleAtStart.startsWith('1: split-view-'),
        titleAtStart,
      ),
      check(
        'the tab gets a numbered favicon of its own',
        faviconAtStart.startsWith('data:image/png'),
        faviconAtStart.slice(0, 22),
      ),
      check(
        'creating one adds it to the list and shows it',
        optionsAfterCreate === 2 && titleAfterCreate.startsWith('2: '),
        `${String(optionsAfterCreate)} / ${titleAfterCreate}`,
      ),
      check(
        'a new split view starts at the default layout',
        panesInNewWorkspace === 4,
        panesInNewWorkspace,
      ),
      check(
        'Alt+1 comes back to where the first was left',
        addressAfterSwitch.includes('/sw-target'),
        addressAfterSwitch,
      ),
      check(
        'the shortcut works with the focus inside a pane',
        clickedInsideAPane && switchedFromInsideAPane,
        titleAfterPaneShortcut,
      ),
      check(
        'renaming reaches the picker and the tab title',
        renamedOption.includes('検証') && renamedTitle === '2: 検証',
        `${renamedOption} / ${renamedTitle}`,
      ),
      check(
        'the export writes a backup of every saved split view',
        exportedText.includes('"kind": "split-view-backup"') &&
          exportedText.includes(`localhost:${String(serverPort)}`),
        exportedText.length,
      ),
      check(
        'deleting one takes it off the list',
        optionsAfterRemove === 1,
        optionsAfterRemove,
      ),
      check(
        'the list and the layout both survive a reload',
        optionsAfterReload === 1 && addressAfterReload === addressBeforeReload,
        `${String(optionsAfterReload)} / ${addressAfterReload}`,
      ),
      check(
        'the zoom buttons step one pane up the ladder',
        zoomAfterButtons === '125%',
        zoomAfterButtons,
      ),
      check(
        'which scales that frame and nothing else',
        zoomedStyle.includes('zoom: 1.25'),
        zoomedStyle,
      ),
      check(
        'without reloading it either',
        markAfterZoom === 'kept',
        String(markAfterZoom),
      ),
      check(
        'Ctrl+wheel inside the pane zooms it too',
        zoomAfterWheel === '150%',
        zoomAfterWheel,
      ),
      check(
        'and the zoom is still there after a reload',
        zoomAfterReload === '150%',
        zoomAfterReload,
      ),
      check(
        'dropping a pane on the middle of another says so',
        swapLabel === 'Swap',
        swapLabel,
      ),
      check(
        'and exchanges the two panes places',
        swappedPlaces,
        `${String(Math.round(boxBefore0.x))} -> ${String(Math.round(boxAfter0.x))}`,
      ),
      check(
        'without reloading either of them',
        markAfterSwap === 'kept',
        String(markAfterSwap),
      ),
      check(
        'dropping on an edge moves the pane to that side instead',
        moveLabel === 'Move here' && movedBeside && panesAfterMove === 4,
        `${moveLabel} / ${String(panesAfterMove)} panes`,
      ),
      check(
        'a moved pane keeps its zoom',
        zoomAfterMove.includes('zoom: 1.5'),
        zoomAfterMove,
      ),
      check(
        'no uncaught errors on the page',
        !Arr.isNonEmpty(mut_errors),
        mut_errors.join(' | '),
      ),
    ]);
  } finally {
    await context.close();

    await server.close();
  }
};

/**
 * Long enough for the tab the install opens to have loaded and saved. There is
 * no event for it: the page is not ours to listen to from here, and closing it
 * before it has written would leave the write to land afterwards.
 */
const installedTabDelay = async (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 2500);
  });

type CheckResult = Readonly<{ label: string; ok: boolean; note: string }>;

type Box = Readonly<{ x: number; y: number; width: number; height: number }>;

const distPath = path.resolve(workspaceRootPath, 'dist');

/** The port the pages under test are served on. */
const serverPort = 5199;

const report = (results: readonly CheckResult[]): void => {
  for (const result of results) {
    console.log(
      `${result.ok ? 'PASS' : 'FAIL'}  ${result.label} ${result.note}`,
    );
  }

  const failed = results.filter((result) => !result.ok);

  if (Arr.isNonEmpty(failed)) {
    throw new Error(
      `Failed: ${failed.map((result) => result.label).join(', ')}`,
    );
  }

  console.log('\nAll checks passed.');
};

const check = (
  label: string,
  ok: boolean,
  note: string | number,
): CheckResult =>
  ({
    label,
    ok,
    note: note === '' ? ('' as const) : (`(${String(note)})` as const),
  }) as const;

const assertBuildIsPresent = (): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(path.resolve(distPath, 'manifest.json'))) {
    throw new Error(`No build at ${distPath}. Run \`pnpm run build\` first.`);
  }
};

/**
 * Serves two pages that refuse to be framed as firmly as a real site does.
 *
 * The first links to the second, so that clicking inside a pane is a navigation
 * the page cannot see except through the content script.
 */
const startPageServer = async (): Promise<
  Readonly<{ close: () => Promise<void> }>
> => {
  const firstPage = [
    '<!doctype html><html lang="en"><head><title>Refuses Framing</title></head>',
    '<body><h1 id="hello">framed anyway</h1>',
    '<a href="/second" id="go">second</a></body></html>',
  ].join('');

  const secondPage = [
    '<!doctype html><html lang="en"><head><title>Second Page</title></head>',
    '<body><h1 id="second">second</h1></body></html>',
  ].join('');

  // A site with a service worker that answers `/sw-target` from its own cache:
  // the response never reaches the network layer, so no rule can strip the
  // framing headers off it. This is what a signed-in GitHub does to its issues
  // pages, and what `Clear SW` in a pane's toolbar exists for.
  const serviceWorkerHome = [
    '<!doctype html><html lang="en"><head><title>SW Home</title></head><body>',
    '<h1 id="sw-home">sw home</h1>',
    "<script>navigator.serviceWorker.register('/sw.js')</script>",
    '</body></html>',
  ].join('');

  const serviceWorkerScript = [
    "self.addEventListener('install', (e) => e.waitUntil((async () => {",
    "  const cache = await caches.open('v1');",
    "  await cache.add('/sw-target');",
    '  await self.skipWaiting();',
    '})()));',
    "self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));",
    "self.addEventListener('fetch', (e) => {",
    "  if (new URL(e.request.url).pathname === '/sw-target') {",
    "    e.respondWith(caches.match('/sw-target'));",
    '  }',
    '});',
  ].join('\n');

  const serviceWorkerTarget = [
    '<!doctype html><html lang="en"><head><title>SW Target</title></head>',
    '<body><h1 id="sw-target">sw target</h1></body></html>',
  ].join('');

  const server = http.createServer(
    (
      request: Readonly<{ url?: string }>,
      response: Readonly<{
        writeHead: (
          statusCode: number,
          headers: ReadonlyRecord<string, string>,
        ) => unknown;
        end: (body: string) => unknown;
      }>,
    ) => {
      const route = (request.url ?? '/').split('?', 1)[0];

      if (route === '/sw.js') {
        response.writeHead(200, {
          'content-type': 'text/javascript; charset=utf-8',
          'cache-control': 'no-store',
        });

        response.end(serviceWorkerScript);

        return;
      }

      if (route === '/sw-home') {
        response.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
        });

        response.end(serviceWorkerHome);

        return;
      }

      response.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'x-frame-options': 'DENY',
        'content-security-policy': "frame-ancestors 'none'",
      });

      if (route === '/sw-target') {
        response.end(serviceWorkerTarget);

        return;
      }

      response.end(route === '/second' ? secondPage : firstPage);
    },
  );

  await new Promise<void>((resolve) => {
    server.listen(serverPort, resolve);
  });

  return {
    close: async (): Promise<void> => {
      await new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    },
  };
};

await main();
