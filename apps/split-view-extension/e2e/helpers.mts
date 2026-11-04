import type {
  BrowserContext,
  FrameLocator,
  Locator,
  Page,
} from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';

/**
 * Opens the split view `e2e` in `page`, and waits for its panes.
 *
 * The window is then sized so that the stage under the top bar is `stageSize`,
 * whatever height the top bar's font gives it on this machine, so that every
 * position a test expects is the same everywhere.
 */
export const openSplitView = async (
  page: DeepReadonly<Page>,
  extensionId: string,
): Promise<void> => {
  await page.goto(`chrome-extension://${extensionId}/split.html?ws=e2e`);

  await panes(page).first().waitFor();

  const stageY = await stageTop(page);

  await page.setViewportSize({
    width: stageSize.width,
    height: Math.round(stageY) + stageSize.height,
  });
};

/** The size of the stage the panes are laid out on, in CSS pixels. */
export const stageSize = { width: 1280, height: 686 } as const;

export const panes = (page: DeepReadonly<Page>): Locator =>
  page.getByTestId('pane');

export const splitters = (page: DeepReadonly<Page>): Locator =>
  page.getByRole('separator');

export const preset = (page: DeepReadonly<Page>, title: string): Locator =>
  page.getByRole('button', { name: title, exact: true });

export const addressBar = (pane: Locator): Locator =>
  pane.getByRole('textbox', { name: 'Address' });

/**
 * Adds a split view from the top bar, and returns the tab it opens in once its
 * four panes are there.
 */
export const addSplitView = async (
  page: DeepReadonly<Page>,
  context: DeepReadonly<BrowserContext>,
): Promise<Page> => {
  const [added] = await Promise.all([
    context.waitForEvent('page'),
    page
      .getByRole('button', {
        name: 'Add a split view and open it in a new tab',
      })
      .click(),
  ]);

  await panes(added).nth(3).waitFor();

  return added;
};

/**
 * Drags the divider `divider` from its middle to `x`, keeping to its row.
 */
export const dragDividerTo = async (
  page: DeepReadonly<Page>,
  divider: Locator,
  x: number,
): Promise<void> => {
  const box = await divider.boundingBox();

  if (box === null) {
    throw new Error('The divider is not laid out');
  }

  const y = box.y + box.height / 2;

  await page.mouse.move(box.x + box.width / 2, y);

  await page.mouse.down();

  await page.mouse.move(x, y, { steps: 8 });

  await page.mouse.up();
};

/** The pane's zoom percentage, which goes back to 100% when pressed. */
export const zoomButton = (pane: Locator): Locator =>
  pane.getByRole('button', { name: /^Zoom \d+%\. Back to 100%$/u });

/** A button of the pane's toolbar, by its whole name. */
export const paneButton = (pane: Locator, label: string): Locator =>
  pane.getByRole('button', { name: label, exact: true });

/** The page shown in `pane`. */
export const frameOf = (pane: Locator): FrameLocator =>
  pane.getByTestId('pane-frame').contentFrame();

/** Types `address` into the pane's own address bar and goes there. */
export const go = async (pane: Locator, address: string): Promise<void> => {
  await addressBar(pane).fill(address);

  await addressBar(pane).press('Enter');
};

/**
 * Where each pane is on the page, `[x, y, width, height]` rounded to pixels, in
 * document order.
 */
export const paneBoxes = async (
  page: DeepReadonly<Page>,
): Promise<readonly (readonly number[])[]> =>
  panes(page).evaluateAll(
    (elements, stageY) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();

        return [rect.x, rect.y - stageY, rect.width, rect.height].map(
          Math.round,
        );
      }),
    await stageTop(page),
  );

/**
 * Each divider as its orientation and `[x, y, width, height]` on the stage, in
 * document order.
 */
export const splitterBoxes = async (
  page: DeepReadonly<Page>,
): Promise<readonly (readonly (number | string | null)[])[]> =>
  splitters(page).evaluateAll(
    (elements, stageY) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();

        // Written out: this runs in the page, where ts-data-forge is not.
        return [
          element.getAttribute('aria-orientation'),
          Math.round(rect.x),
          Math.round(rect.y - stageY),
          Math.round(rect.width),
          Math.round(rect.height),
        ];
      }),
    await stageTop(page),
  );

/** Where the stage starts, below the top bar. */
const stageTop = async (page: DeepReadonly<Page>): Promise<number> => {
  const box = await page.getByTestId('stage').boundingBox();

  if (box === null) {
    throw new Error('The stage is not laid out');
  }

  return box.y;
};
