import type {
  BrowserContext,
  FrameLocator,
  Locator,
  Page,
} from '@playwright/test';
import { Num, Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';

/**
 * Opens the split view `e2e` in `page` and sizes the window so that the stage
 * is `stageSize` whatever height the top bar's font gives it here.
 */
export const openSplitView = async (
  page: DeepReadonly<Page>,
  extensionId: string,
  query: string = '?ws=e2e',
): Promise<void> => {
  await page.goto(`chrome-extension://${extensionId}/split.html${query}`);

  await panes(page).first().waitFor();

  const stageY = await stageTop(page);

  await page.setViewportSize({
    width: stageSize.width,
    height: Math.round(stageY) + stageSize.height,
  });
};

/** The stage the panes are laid out on, in CSS pixels; dividers are 6px. */
export const stageSize = { width: 1280, height: 686 } as const;

export const panes = (page: DeepReadonly<Page>): Locator =>
  page.getByTestId('pane');

export const dividers = (page: DeepReadonly<Page>): Locator =>
  page.getByRole('separator');

export const preset = (page: DeepReadonly<Page>, label: string): Locator =>
  page.getByRole('button', { name: label, exact: true });

export const picker = (page: DeepReadonly<Page>): Locator =>
  page.getByRole('combobox', { name: 'The split view shown here' });

export const addressBar = (pane: Locator): Locator =>
  pane.getByRole('textbox', { name: 'Address' });

/** A button of a pane's toolbar or menu, by its whole name. */
export const paneButton = (pane: Locator, label: string): Locator =>
  pane.getByRole('button', { name: label, exact: true });

export const zoomButton = (pane: Locator): Locator =>
  pane.getByRole('button', { name: /^Zoom \d+%\. Back to 100%$/u });

export const frameOf = (pane: Locator): FrameLocator =>
  pane.getByTestId('pane-frame').contentFrame();

/**
 * How many times the page server has served the page in the pane, which is how
 * a test sees a reload. The server outlives a test, so a test compares counts
 * rather than expecting one.
 */
export const visitCount = async (pane: Locator): Promise<number> => {
  const text = await frameOf(pane)
    .getByText(/^visit \d+$/u)
    .innerText();

  return Result.unwrapOkOr(
    Num.safeParseFloat(text.slice('visit '.length)),
    Number.NaN,
  );
};

/** Types into a pane's address bar and goes there. */
export const go = async (pane: Locator, address: string): Promise<void> => {
  await addressBar(pane).fill(address);

  await addressBar(pane).press('Enter');
};

/** Adds a split view from the top bar; the tab it opens, once laid out. */
export const addSplitView = async (
  page: DeepReadonly<Page>,
  context: DeepReadonly<BrowserContext>,
): Promise<Page> => {
  const [added] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('button', { name: 'Add a split view', exact: true }).click(),
  ]);

  await panes(added).nth(3).waitFor();

  return added;
};

/** Drags a divider from its middle to `x`, along its row. */
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

/** Each pane's `[x, y, width, height]` on the stage, in document order. */
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

/** Each divider's orientation and `[x, y, width, height]` on the stage. */
export const dividerBoxes = async (
  page: DeepReadonly<Page>,
): Promise<readonly (readonly (number | string | null)[])[]> =>
  dividers(page).evaluateAll(
    (elements, stageY) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();

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

const stageTop = async (page: DeepReadonly<Page>): Promise<number> => {
  const box = await page.getByTestId('stage').boundingBox();

  if (box === null) {
    throw new Error('The stage is not laid out');
  }

  return box.y;
};
