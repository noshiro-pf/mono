import { expect, test, type Locator, type Page } from '@playwright/test';
import type { DeepReadonly } from 'ts-type-forge';

// As `demo.spec.mts`: the in-memory demo, with the sample data of
// `src/demo/sample-data.mts`. Its done task is hidden, so seven edges are
// drawn: 画面設計 and API を実装する → 画面を実装する → 実装完了 → 結合テスト
// → リリース承認, API を実装する → 実装完了, and コードフリーズ → リリース承認.
const DEMO = '/mono/task-manager/?storage=memory';

test(
  'adds a dependency by drawing an arrow from the edge of a node',
  { tag: '@smoke' },
  async ({ page }) => {
    await showDag(page);

    await expect.soft(page.getByTestId('dag-edge')).toHaveCount(7);

    // Near the right edge of 画面設計, its handle shows; in its middle, none.
    const from = await edgePoint(dagNode(page, /画面設計/u));

    const middle = await centreOf(dagNode(page, /画面設計/u));

    await page.mouse.move(middle.x, middle.y);

    await expect.soft(page.getByTestId('dag-connect-handle')).toHaveCount(0);

    await page.mouse.move(from.x, from.y);

    await expect.soft(page.getByTestId('dag-connect-handle')).toHaveCount(1);

    const to = await centreOf(dagNode(page, /利用者向けドキュメント/u));

    await page.mouse.down();

    await page.mouse.move(to.x, to.y, { steps: 10 });

    await expect
      .soft(page.getByTestId('dag-connect'))
      .toHaveAttribute('data-refused', 'false');

    await page.mouse.up();

    // Not a tap: no dialog.
    await expect.soft(page.getByTestId('node-dialog')).toBeHidden();

    await expect.soft(page.getByTestId('dag-edge')).toHaveCount(8);

    expect.soft(await edgeEnds(page)).toContain('task:design -> task:docs');
  },
);

test(
  'refuses an arrow that would close a cycle, and says why',
  { tag: '@smoke' },
  async ({ page }) => {
    await showDag(page);

    // 結合テスト waits for 画面を実装する, through 実装完了.
    const from = await edgePoint(dagNode(page, /結合テスト/u));

    const to = await centreOf(dagNode(page, /画面を実装する/u));

    await page.mouse.move(from.x, from.y);

    await page.mouse.down();

    await page.mouse.move(to.x, to.y, { steps: 10 });

    await expect
      .soft(page.getByTestId('dag-connect'))
      .toHaveAttribute('data-refused', 'true');

    await page.mouse.up();

    await expect.soft(page.getByRole('alert')).toContainText('循環する依存');

    await expect.soft(page.getByTestId('dag-edge')).toHaveCount(7);
  },
);

test(
  'adds nothing for an arrow dropped on the background',
  { tag: '@smoke' },
  async ({ page }) => {
    await showDag(page);

    const node = dagNode(page, /画面設計/u);

    const before = await node.getAttribute('transform');

    const from = await edgePoint(node);

    await page.mouse.move(from.x, from.y);

    await page.mouse.down();

    await page.mouse.move(from.x + 40, from.y - 300, { steps: 10 });

    await page.mouse.up();

    await expect.soft(page.getByTestId('dag-connect')).toHaveCount(0);

    await expect.soft(page.getByTestId('dag-edge')).toHaveCount(7);

    // The node stayed where it was: a drag from the handle draws, not moves.
    await expect.soft(node).toHaveAttribute('transform', before ?? '');

    await expect.soft(page.getByRole('alert')).toHaveCount(0);
  },
);

test(
  'gives up an arrow being drawn on Escape',
  { tag: '@smoke' },
  async ({ page }) => {
    await showDag(page);

    const from = await edgePoint(dagNode(page, /画面設計/u));

    const to = await centreOf(dagNode(page, /利用者向けドキュメント/u));

    await page.mouse.move(from.x, from.y);

    await page.mouse.down();

    await page.mouse.move(to.x, to.y, { steps: 10 });

    await expect.soft(page.getByTestId('dag-connect')).toHaveCount(1);

    // Safari's Escape that cancelled a composition, after it ended, is the
    // input method's and gives up nothing.
    await page
      .getByTestId('dag-canvas')
      .dispatchEvent('keydown', safariImeEscape);

    await expect.soft(page.getByTestId('dag-connect')).toHaveCount(1);

    await page.keyboard.press('Escape');

    await expect.soft(page.getByTestId('dag-connect')).toHaveCount(0);

    // Moving on and lifting over the node draws and adds nothing.
    await page.mouse.move(to.x + 5, to.y + 5, { steps: 3 });

    await expect.soft(page.getByTestId('dag-connect')).toHaveCount(0);

    await page.mouse.up();

    await expect.soft(page.getByTestId('node-dialog')).toBeHidden();

    await expect.soft(page.getByTestId('dag-edge')).toHaveCount(7);

    expect.soft(await edgeEnds(page)).not.toContain('task:design -> task:docs');

    // The next arrow is drawn as before.
    await page.mouse.move(from.x, from.y);

    await page.mouse.down();

    await page.mouse.move(to.x, to.y, { steps: 10 });

    await page.mouse.up();

    await expect.soft(page.getByTestId('dag-edge')).toHaveCount(8);
  },
);

test(
  'deletes a dependency from the button on an edge clicked',
  { tag: '@smoke' },
  async ({ page }) => {
    await showDag(page);

    const edge = dagEdge(page, 'milestone:freeze', 'milestone:release');

    await expect.soft(page.getByTestId('dag-edge-delete')).toHaveCount(0);

    await clickEdge(page, edge);

    await expect.soft(edge).toHaveAttribute('data-selected', 'true');

    // Escape leaves it as it is.
    await page.keyboard.press('Escape');

    await expect.soft(edge).toHaveAttribute('data-selected', 'false');

    await expect.soft(page.getByTestId('dag-edge-delete')).toHaveCount(0);

    await expect.soft(page.getByTestId('dag-edge')).toHaveCount(7);

    await clickEdge(page, edge);

    await page.getByTestId('dag-edge-delete').click();

    await expect.soft(page.getByTestId('dag-edge')).toHaveCount(6);

    expect
      .soft(await edgeEnds(page))
      .not.toContain('milestone:freeze -> milestone:release');

    await expect.soft(page.getByTestId('node-dialog')).toBeHidden();
  },
);

test(
  'deletes the edge selected with the Delete key',
  { tag: '@smoke' },
  async ({ page }) => {
    await showDag(page);

    await clickEdge(
      page,
      dagEdge(page, 'milestone:freeze', 'milestone:release'),
    );

    await expect.soft(page.getByTestId('dag-edge-delete')).toBeFocused();

    await page.keyboard.press('Delete');

    await expect.soft(page.getByTestId('dag-edge')).toHaveCount(6);
  },
);

const showDag = async (page: DeepReadonly<Page>): Promise<void> => {
  await page.goto(DEMO);

  await expect
    .soft(page.getByTestId('dag-canvas'))
    .toHaveAttribute('data-animating', 'false');
};

/** Every edge drawn, as `from -> to`. */
const edgeEnds = async (page: DeepReadonly<Page>): Promise<readonly string[]> =>
  page
    .getByTestId('dag-edge')
    .evaluateAll((edges) =>
      edges.map((edge) =>
        edge instanceof SVGElement
          ? `${edge.dataset['from']} -> ${edge.dataset['to']}`
          : '',
      ),
    );

const dagEdge = (page: DeepReadonly<Page>, from: string, to: string): Locator =>
  page.locator(`[data-e2e="dag-edge"][data-from="${from}"][data-to="${to}"]`);

/** A click on the middle of an edge's line, not of its bounding box. */
const clickEdge = async (
  page: DeepReadonly<Page>,
  edge: Locator,
): Promise<void> => {
  const point = await edge.getByTestId('dag-edge-hit').evaluate((path) => {
    if (!(path instanceof SVGPathElement)) {
      return { x: 0, y: 0 };
    }

    const middle = path.getPointAtLength(path.getTotalLength() / 2);

    const matrix = path.getScreenCTM();

    const on = matrix === null ? middle : middle.matrixTransform(matrix);

    return { x: on.x, y: on.y };
  });

  await page.mouse.click(point.x, point.y);
};

const dagNode = (page: DeepReadonly<Page>, title: RegExp): Locator =>
  page.getByTestId('dag-node').and(page.getByRole('button', { name: title }));

/** The box of a node's shape: not of the priority badge standing above it. */
const shapeBox = async (
  node: Locator,
): Promise<Readonly<{ x: number; y: number; width: number; height: number }>> =>
  node.evaluate((element) => {
    const shape = element.querySelector('.dag-node-shape');

    const box = shape?.getBoundingClientRect();

    return {
      x: box?.x ?? 0,
      y: box?.y ?? 0,
      width: box?.width ?? 0,
      height: box?.height ?? 0,
    };
  });

const centreOf = async (
  node: Locator,
): Promise<Readonly<{ x: number; y: number }>> => {
  const box = await shapeBox(node);

  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

/** Just inside the middle of a node's right edge, where its handle shows. */
const edgePoint = async (
  node: Locator,
): Promise<Readonly<{ x: number; y: number }>> => {
  const box = await shapeBox(node);

  return { x: box.x + box.width - 2, y: box.y + box.height / 2 };
};

/**
 * The key down Safari sends for the Escape that cancelled a composition, after
 * `compositionend`: key code 229 on a key that is not composing. As
 * `safariImeKeyDown.Escape` in `demo.spec.mts`.
 */
const safariImeEscape = { key: 'Escape', keyCode: 229, bubbles: true } as const;
