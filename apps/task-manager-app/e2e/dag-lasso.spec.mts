import { expect, test, type Locator, type Page } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';

// As `demo.spec.mts`: the in-memory demo, with the sample data of
// `src/demo/sample-data.mts`. 画面設計 (レビュー中, labels UI and 設計, in no
// group) and API を実装する (作業中, label 実装, in the group 実装) both
// wait for 仕様をまとめる alone, and so sit side by side.
const DEMO = '/mono/task-manager/?storage=memory';

test(
  'selects nodes with a lasso, moves them together and edits them at once',
  { tag: '@smoke' },
  async ({ page }) => {
    await showDag(page);

    const design = dagNode(page, /画面設計/u);

    const api = dagNode(page, /API を実装する/u);

    await shiftLasso(page, [await centreOf(design), await centreOf(api)]);

    await expect
      .soft(page.getByTestId('dag-selection-count'))
      .toHaveText('2 件を選択中');

    await expect.soft(design).toHaveAttribute('data-selected', 'true');

    await expect.soft(api).toHaveAttribute('data-selected', 'true');

    await expect
      .soft(dagNode(page, /画面を実装する/u))
      .toHaveAttribute('data-selected', 'false');

    // Dragging one moves both as far.
    const designBefore = await centreOf(design);

    const apiBefore = await centreOf(api);

    await page.mouse.move(designBefore.x, designBefore.y);

    await page.mouse.down();

    await page.mouse.move(designBefore.x + 30, designBefore.y + 150, {
      steps: 10,
    });

    await page.mouse.up();

    const designAfter = await centreOf(design);

    const apiAfter = await centreOf(api);

    expect.soft(designAfter.y - designBefore.y).toBeCloseTo(150, 0);

    expect.soft(apiAfter.y - apiBefore.y).toBeCloseTo(150, 0);

    expect.soft(apiAfter.x - apiBefore.x).toBeCloseTo(30, 0);

    // Not a tap: no dialog, and still selected.
    await expect.soft(page.getByTestId('node-dialog')).toBeHidden();

    await expect
      .soft(page.getByTestId('dag-selection-count'))
      .toHaveText('2 件を選択中');

    await page.getByTestId('dag-bulk-edit').click();

    const dialog = page.getByTestId('bulk-edit-dialog');

    await expect.soft(dialog).toBeVisible();

    await dialog
      .getByTestId('bulk-progress-select')
      .selectOption({ label: '作業中' });

    await dialog.getByTestId('bulk-add-labels').fill('e2e');

    // By its label, as a reader would: the indicator covers the box.
    await dialog.getByText('UI', { exact: true }).click();

    await expect
      .soft(dialog.getByRole('checkbox', { name: 'UI' }))
      .toBeChecked();

    await dialog
      .getByTestId('bulk-group-select')
      .selectOption({ label: 'なし' });

    await dialog.getByTestId('bulk-save').click();

    await expect.soft(dialog).toBeHidden();

    await expect.soft(design).toHaveClass(/status-in-progress/u);

    await design.click();

    const nodeDialog = page.getByTestId('node-dialog');

    await expect
      .soft(nodeDialog.getByLabel('ラベル（カンマ区切り）'))
      .toHaveValue('設計, e2e');

    await nodeDialog.getByRole('button', { name: 'キャンセル' }).click();

    await api.click();

    await expect
      .soft(nodeDialog.getByLabel('ラベル（カンマ区切り）'))
      .toHaveValue('実装, e2e');

    await expect.soft(nodeDialog.getByTestId('group-select')).toHaveValue('');

    await nodeDialog.getByRole('button', { name: 'キャンセル' }).click();

    await expect.soft(nodeDialog).toBeHidden();
  },
);

test(
  'draws a lasso by a plain drag with なげなわ on, and a tap on the background selects none',
  { tag: '@smoke' },
  async ({ page }) => {
    await showDag(page);

    const tool = page.getByTestId('dag-lasso-tool');

    await tool.click();

    await expect.soft(tool).toHaveAttribute('aria-pressed', 'true');

    const design = dagNode(page, /画面設計/u);

    const before = await centreOf(design);

    await lasso(page, [before]);

    await expect
      .soft(page.getByTestId('dag-selection-count'))
      .toHaveText('1 件を選択中');

    // The view did not pan.
    expect.soft(await centreOf(design)).toStrictEqual(before);

    // A tap on the background, well away from every node.
    const canvas = await page.getByTestId('dag-canvas').boundingBox();

    await page.mouse.click(
      (canvas?.x ?? 0) + 4,
      (canvas?.y ?? 0) + (canvas?.height ?? 0) / 2,
    );

    await expect.soft(page.getByTestId('dag-selection-bar')).toHaveCount(0);

    await expect.soft(design).toHaveAttribute('data-selected', 'false');
  },
);

const showDag = async (page: DeepReadonly<Page>): Promise<void> => {
  await page.goto(DEMO);

  await expect.soft(page.getByTestId('list-view')).toBeVisible();

  await page.getByTestId('view-dag').click();

  await expect
    .soft(page.getByTestId('dag-canvas'))
    .toHaveAttribute('data-animating', 'false');
};

/** Draws a lasso with Shift held round the points given. */
const shiftLasso = async (
  page: DeepReadonly<Page>,
  around: readonly Readonly<{ x: number; y: number }>[],
): Promise<void> => {
  await page.keyboard.down('Shift');

  await lasso(page, around);

  await page.keyboard.up('Shift');
};

/**
 * Draws a loop round the box of the points given, 12px clear of them. It
 * starts below the box and 80px left of it, on the background, and closes
 * back there.
 */
const lasso = async (
  page: DeepReadonly<Page>,
  around: readonly Readonly<{ x: number; y: number }>[],
): Promise<void> => {
  const xs = around.map(({ x }) => x);

  const ys = around.map(({ y }) => y);

  const minX = Math.min(...xs) - 12;

  const maxX = Math.max(...xs) + 12;

  const minY = Math.min(...ys) - 12;

  const maxY = Math.max(...ys) + 12;

  const startX = minX - 80;

  const startY = maxY + 40;

  await page.mouse.move(startX, startY);

  await page.mouse.down();

  await page.mouse.move(startX, minY, { steps: 8 });

  await page.mouse.move(maxX, minY, { steps: 8 });

  await page.mouse.move(maxX, maxY, { steps: 8 });

  await page.mouse.move(startX, startY, { steps: 8 });

  await page.mouse.up();
};

const dagNode = (page: DeepReadonly<Page>, title: RegExp): Locator =>
  page.getByTestId('dag-node').and(page.getByRole('button', { name: title }));

/** The centre of a node's shape: not of the priority badge above it. */
const centreOf = async (
  node: Locator,
): Promise<Readonly<{ x: number; y: number }>> =>
  node.evaluate((element) => {
    const box = element
      .querySelector('.dag-node-shape')
      ?.getBoundingClientRect();

    return {
      x: (box?.x ?? 0) + (box?.width ?? 0) / 2,
      y: (box?.y ?? 0) + (box?.height ?? 0) / 2,
    };
  });
