import {
  test as base,
  expect,
  type Locator,
  type Page,
} from '@playwright/test';
import { Arr, Num, Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';

// The in-memory demo of the dev server: no sign-in, the sample data of
// `src/demo/sample-data.mts`, and a fresh copy on every load.
const DEMO = '/mono/task-manager/?storage=memory';

// The sample data's done task, as the 依存先 choices name it.
const SPEC_OPTION = 'タスク: 仕様をまとめる（完了）';

// The graph screen draws the sample data's done task too, as these tests
// measure the whole graph; hiding it, the default, is
// `dag-show-done.spec.mts`'s.
const test = base.extend({
  page: async ({ page }, provide) => {
    await page.addInitScript(() => {
      localStorage.setItem('task-manager-app:dag-show-done', 'true');
    });

    await provide(page);
  },
});

test('lists the tasks and milestones', { tag: '@smoke' }, async ({ page }) => {
  await page.goto(DEMO);

  await expect.soft(page.getByTestId('list-view')).toBeVisible();

  await expect.soft(page.getByTestId('task-row')).toHaveCount(6);

  await expect.soft(page.getByTestId('milestone-row')).toHaveCount(3);
});

test('draws the DAG and opens a node', { tag: '@smoke' }, async ({ page }) => {
  await page.goto(DEMO);

  await expect.soft(page.getByTestId('list-view')).toBeVisible();

  await showDag(page);

  await expect.soft(page.getByTestId('dag-node')).toHaveCount(9);

  await page
    .getByTestId('dag-node')
    .and(page.getByRole('button', { name: /画面を実装する/u }))
    .click();

  const dialog = page.getByTestId('node-dialog');

  await expect.soft(dialog).toBeVisible();

  await expect
    .soft(dialog.getByTestId('title-input'))
    .toHaveValue('画面を実装する');
});

test(
  'writes a task’s due date under its title and draws its priority',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    const task = (title: string): Locator =>
      page
        .getByTestId('dag-node')
        .and(page.getByRole('button', { name: `タスク「${title}」` }));

    const drawn = async (
      title: string,
    ): Promise<
      Readonly<{
        meta: string;
        overdue: boolean;
        badge: string | undefined;
        ring: boolean;
        opacity: string;
      }>
    > =>
      task(title).evaluate((node) => {
        const meta = node.querySelector('.dag-node-meta');

        const body = node.querySelector('.dag-node-body');

        return {
          meta: meta?.textContent ?? '',
          overdue: meta?.classList.contains('overdue') ?? false,
          badge: node.querySelector(':scope .dag-node-priority text')
            ?.textContent,
          ring: node.querySelector('.dag-node-ring') !== null,
          opacity: body === null ? '' : getComputedStyle(body).opacity,
        };
      });

    // The status is left to the colour: the second line is the due date.
    expect.soft(await drawn('画面を実装する')).toStrictEqual({
      // Without the year within this year, and without the time outside it.
      meta: expect.stringMatching(
        /^期限 (?:\d\d\/\d\d \d\d:\d\d|\d{4}\/\d\d\/\d\d)$/u,
      ),
      overdue: false,
      badge: '高',
      ring: false,
      opacity: '1',
    });

    expect.soft(await drawn('API を実装する')).toStrictEqual({
      meta: expect.stringMatching(/^期限切れ /u),
      overdue: true,
      badge: '最高',
      ring: true,
      opacity: '1',
    });

    expect.soft(await drawn('結合テスト')).toMatchObject({
      badge: undefined,
      ring: false,
      opacity: '1',
    });

    expect.soft(await drawn('利用者向けドキュメントを書く')).toMatchObject({
      badge: '低',
      opacity: '0.6',
    });

    // Faint until pointed at.
    await task('利用者向けドキュメントを書く').hover();

    await expect
      .poll(async () => {
        const { opacity } = await drawn('利用者向けドキュメントを書く');

        return opacity;
      })
      .toBe('1');
  },
);

test(
  'saves a dependency typed into a row, without 「依存を追加」',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    const row = page
      .getByTestId('task-row')
      .filter({ hasText: '画面を実装する' });

    await row.click();

    const dialog = page.getByTestId('node-dialog');

    // Two dependencies, and an empty row to fill in.
    const rows = dialog.getByTestId('dependency-row');

    await expect.soft(rows).toHaveCount(3);

    await rows
      .nth(2)
      .getByTestId('dependency-source')
      .selectOption('task:docs');

    await dialog.getByTestId('save').click();

    await expect.soft(dialog).toBeHidden();

    await row.click();

    await expect
      .soft(rows.nth(2).getByTestId('dependency-source'))
      .toHaveValue('task:docs');
  },
);

test(
  'shows why a row would close a cycle, and does not save it',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await page
      .getByTestId('task-row')
      .filter({ hasText: '画面を実装する' })
      .click();

    const dialog = page.getByTestId('node-dialog');

    await dialog.getByTestId('dependency-add').click();

    const added = dialog.getByTestId('dependency-row').last();

    const source = added.getByTestId('dependency-source');

    await expect.soft(source).toBeFocused();

    await source.selectOption({ label: 'タスク: 結合テスト' });

    await expect
      .soft(added.getByTestId('dependency-error'))
      .toContainText('循環する依存');

    await source.blur();

    await dialog.getByTestId('save').click();

    await expect.soft(dialog).toBeVisible();

    await expect.soft(source).toBeFocused();
  },
);

test(
  'offers a done task as a 依存先 only when asked to',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    const dialog = page.getByTestId('node-dialog');

    // 画面設計 already waits for 仕様をまとめる, which is done.
    await page.getByTestId('task-row').filter({ hasText: '画面設計' }).click();

    const kept = dialog.getByTestId('dependency-source').first();

    await expect.soft(kept).toHaveValue('task:spec');

    await expect
      .soft(kept.getByRole('option', { name: SPEC_OPTION }))
      .toHaveCount(1);

    await dialog.getByRole('button', { name: 'キャンセル' }).click();

    await expect.soft(dialog).toBeHidden();

    await page
      .getByTestId('task-row')
      .filter({ hasText: '結合テスト' })
      .click();

    await dialog.getByTestId('dependency-add').click();

    const added = dialog
      .getByTestId('dependency-row')
      .last()
      .getByTestId('dependency-source');

    const spec = added.getByRole('option', { name: SPEC_OPTION });

    await expect.soft(spec).toHaveCount(0);

    const showDone = dialog.getByTestId('dependency-show-done');

    await expect.soft(showDone).not.toBeChecked();

    // By its label, as a reader would: the switch's knob covers the box.
    await dialog.getByText('完了したタスクも選択肢に出す').click();

    await expect.soft(showDone).toBeChecked();

    await expect.soft(spec).toHaveCount(1);
  },
);

test('picks and clears a date', { tag: '@smoke' }, async ({ page }) => {
  await page.goto(DEMO);

  await expect.soft(page.getByTestId('list-view')).toBeVisible();

  await page
    .getByTestId('task-row')
    .filter({ hasText: 'API を実装する' })
    .click();

  const dialog = page.getByTestId('node-dialog');

  const dueDate = dialog.getByLabel('期限');

  await expect.soft(dueDate).toHaveValue(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/u);

  await dueDate.click();

  await dialog.getByRole('button', { name: 'クリア' }).click();

  await expect.soft(dueDate).toHaveValue('');
});

test('moves a task’s progress', { tag: '@smoke' }, async ({ page }) => {
  await page.goto(DEMO);

  await expect.soft(page.getByTestId('list-view')).toBeVisible();

  const row = page
    .getByTestId('task-row')
    .filter({ hasText: '利用者向けドキュメントを書く' });

  await row.click();

  const dialog = page.getByTestId('node-dialog');

  await dialog.getByTestId('progress-select').selectOption('in-progress');

  await expect.soft(dialog.getByTestId('draft-status')).toContainText('作業中');

  await dialog.getByTestId('save').click();

  await expect.soft(dialog).toBeHidden();

  await expect
    .soft(
      page.getByRole('row').filter({ hasText: '利用者向けドキュメントを書く' }),
    )
    .toContainText('作業中');
});

test(
  'keeps the dialog open when a drag from inside it ends outside',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await page
      .getByTestId('task-row')
      .filter({ hasText: '画面を実装する' })
      .click();

    const dialog = page.getByTestId('node-dialog');

    const title = dialog.getByTestId('title-input');

    await title.fill('画面を実装し直す');

    const box = await title.boundingBox();

    // Selecting the title's text, and letting go over the backdrop.
    await page.mouse.move(
      (box?.x ?? 0) + (box?.width ?? 0) - 4,
      (box?.y ?? 0) + (box?.height ?? 0) / 2,
    );

    await page.mouse.down();

    await page.mouse.move(2, 2, { steps: 10 });

    await page.mouse.up();

    await expect.soft(dialog).toBeVisible();

    await expect.soft(title).toHaveValue('画面を実装し直す');

    // A click on the backdrop itself still closes it.
    await page.mouse.click(2, 2);

    await expect.soft(dialog).toBeHidden();
  },
);

/** Where the node is in the graph, from its `translate(x y)`. */
const positionOf = async (
  node: Locator,
): Promise<Readonly<{ x: number; y: number }>> => {
  const transform = (await node.getAttribute('transform')) ?? '';

  const [, x = '', y = ''] =
    /^translate\((?<x>[-\d.]+) (?<y>[-\d.]+)\)$/u.exec(transform) ?? [];

  return {
    x: Result.unwrapOkOr(Num.safeParseFloat(x), Number.NaN),
    y: Result.unwrapOkOr(Num.safeParseFloat(y), Number.NaN),
  };
};

const dagNode = (page: DeepReadonly<Page>, title: RegExp): Locator =>
  page.getByTestId('dag-node').and(page.getByRole('button', { name: title }));

/** Drags `node` by its centre until the centre is at `to`, and drops it. */
const dragNodeTo = async (
  page: DeepReadonly<Page>,
  node: Locator,
  to: Readonly<{ x: number; y: number }>,
): Promise<void> => {
  const box = await node.boundingBox();

  const startX = (box?.x ?? 0) + (box?.width ?? 0) / 2;

  const startY = (box?.y ?? 0) + (box?.height ?? 0) / 2;

  await page.mouse.move(startX, startY);

  await page.mouse.down();

  await page.mouse.move(Num.div(startX + to.x, 2), Num.div(startY + to.y, 2), {
    steps: 5,
  });

  await page.mouse.move(to.x, to.y, { steps: 5 });

  await page.mouse.up();
};

/** The group `node`'s dialog says it is in, or `''` for none. */
const groupOfNode = async (
  page: DeepReadonly<Page>,
  node: Locator,
): Promise<string> => {
  await node.click();

  const select = page.getByTestId('node-dialog').getByTestId('group-select');

  await expect.soft(select).toBeVisible();

  const value = await select.inputValue();

  await page.keyboard.press('Escape');

  await expect.soft(page.getByTestId('node-dialog')).toBeHidden();

  return value;
};

/** Shows the DAG and waits for its nodes to have moved into place. */
const showDag = async (page: DeepReadonly<Page>): Promise<void> => {
  await page.getByTestId('view-dag').click();

  await expect
    .soft(page.getByTestId('dag-canvas'))
    .toHaveAttribute('data-animating', 'false');
};

/** 「自動整列」 growing `direction`, and the nodes moved into place. */
const arrange = async (
  page: DeepReadonly<Page>,
  direction: 'right' | 'down',
): Promise<void> => {
  await page.getByTestId(`dag-direction-${direction}`).click();

  await page.getByTestId('dag-arrange').click();

  await expect
    .soft(page.getByTestId('dag-canvas'))
    .toHaveAttribute('data-animating', 'false');
};

/**
 * Every edge that comes within `margin` of a node other than its own two,
 * by points every 2 units along its path, and the node: none, as drawn.
 * Read from the SVG itself, in the coordinates the nodes and edges share.
 */
const edgesThroughNodes = async (
  page: DeepReadonly<Page>,
  margin: number,
): Promise<readonly string[]> =>
  page.getByTestId('dag-canvas').evaluate((canvas, within) => {
    const boxes = Array.from(
      canvas.querySelectorAll('[data-e2e="dag-node"]'),
      (node) => {
        const shape = node.querySelector('.dag-node-shape');

        const moved =
          node instanceof SVGGraphicsElement
            ? node.transform.baseVal.consolidate()?.matrix
            : undefined;

        const box =
          shape instanceof SVGGraphicsElement ? shape.getBBox() : undefined;

        const x = (moved?.e ?? 0) + (box?.x ?? 0);

        const y = (moved?.f ?? 0) + (box?.y ?? 0);

        return {
          id: node instanceof SVGElement ? node.dataset['nodeId'] : undefined,
          left: x - within,
          upper: y - within,
          right: x + (box?.width ?? 0) + within,
          lower: y + (box?.height ?? 0) + within,
        };
      },
    );

    return Array.from(
      canvas.querySelectorAll('[data-e2e="dag-edge"]'),
      (edge) => {
        const from = edge instanceof SVGElement ? edge.dataset['from'] : '';

        const to = edge instanceof SVGElement ? edge.dataset['to'] : '';

        const path = edge.querySelector('path');

        const pathLength = path?.getTotalLength() ?? 0;

        const points = Array.from(
          { length: Math.floor(pathLength / 2) + 1 },
          (_, index) => path?.getPointAtLength(index * 2),
        );

        return boxes
          .filter(
            ({ id, left, upper, right, lower }) =>
              id !== from &&
              id !== to &&
              points.some(
                (point) =>
                  point !== undefined &&
                  left < point.x &&
                  point.x < right &&
                  upper < point.y &&
                  point.y < lower,
              ),
          )
          .map(({ id }) => [from, to, id].join(' '));
      },
    ).flat();
  }, margin);

/**
 * Every two nodes whose boxes overlap, as drawn: none. Read from the SVG
 * itself, as `edgesThroughNodes` reads it.
 */
const overlappingNodes = async (
  page: DeepReadonly<Page>,
): Promise<readonly string[]> =>
  page.getByTestId('dag-canvas').evaluate((canvas) => {
    const boxes = Array.from(
      canvas.querySelectorAll('[data-e2e="dag-node"]'),
      (node) => {
        const shape = node.querySelector('.dag-node-shape');

        const moved =
          node instanceof SVGGraphicsElement
            ? node.transform.baseVal.consolidate()?.matrix
            : undefined;

        const box =
          shape instanceof SVGGraphicsElement ? shape.getBBox() : undefined;

        const x = (moved?.e ?? 0) + (box?.x ?? 0);

        const y = (moved?.f ?? 0) + (box?.y ?? 0);

        return {
          id: node instanceof SVGElement ? node.dataset['nodeId'] : undefined,
          left: x,
          upper: y,
          right: x + (box?.width ?? 0),
          lower: y + (box?.height ?? 0),
        };
      },
    );

    return boxes.flatMap((a, index) =>
      boxes
        .slice(index + 1)
        .filter(
          (b) =>
            a.left < b.right &&
            b.left < a.right &&
            a.upper < b.lower &&
            b.upper < a.lower,
        )
        .map((b) => [a.id, b.id].join(' ')),
    );
  });

/** Each node's id and `transform`, by id. */
const positionsById = async (
  page: DeepReadonly<Page>,
): Promise<readonly Readonly<{ id: string; transform: string }>[]> =>
  page.getByTestId('dag-node').evaluateAll((nodes) =>
    nodes
      .map((node) => ({
        id: node instanceof SVGElement ? (node.dataset['nodeId'] ?? '') : '',
        transform: node.getAttribute('transform') ?? '',
      }))
      .toSorted((a, b) => a.id.localeCompare(b.id)),
  );

/** Adds a task titled `title` from the header, and waits for the DAG. */
const addTask = async (
  page: DeepReadonly<Page>,
  title: string,
): Promise<void> => {
  await page.getByTestId('add-task').click();

  const dialog = page.getByTestId('node-dialog');

  await dialog.getByTestId('title-input').fill(title);

  await dialog.getByTestId('save').click();

  await expect.soft(dialog).toBeHidden();

  await expect
    .soft(page.getByTestId('dag-canvas'))
    .toHaveAttribute('data-animating', 'false');
};

const routedEdgeCount = async (page: DeepReadonly<Page>): Promise<number> =>
  page
    .getByTestId('dag-edge')
    .evaluateAll(
      (edges) =>
        edges.filter(
          (edge) =>
            edge instanceof SVGElement && edge.dataset['routed'] === 'true',
        ).length,
    );

/**
 * Drags the node `title` so that its centre lands on the middle of the
 * edge from `from` to `to`.
 */
const dragOntoEdge = async (
  page: DeepReadonly<Page>,
  title: RegExp,
  ends: Readonly<{ from: string; to: string }>,
): Promise<void> => {
  const box = await dagNode(page, title).boundingBox();

  const target = await page
    .getByTestId('dag-edge')
    .evaluateAll((edges, { from, to }) => {
      const path = edges
        .find(
          (edge) =>
            edge instanceof SVGElement &&
            edge.dataset['from'] === from &&
            edge.dataset['to'] === to,
        )
        ?.querySelector('path');

      const middle = path?.getPointAtLength(path.getTotalLength() / 2);

      const toScreen = path?.getScreenCTM();

      return middle === undefined || toScreen === undefined || toScreen === null
        ? { x: 0, y: 0 }
        : {
            x: middle.x * toScreen.a + middle.y * toScreen.c + toScreen.e,
            y: middle.x * toScreen.b + middle.y * toScreen.d + toScreen.f,
          };
    }, ends);

  await page.mouse.move(
    (box?.x ?? 0) + (box?.width ?? 0) / 2,
    (box?.y ?? 0) + (box?.height ?? 0) / 2,
  );

  await page.mouse.down();

  await page.mouse.move(target.x, target.y, { steps: 10 });

  await page.mouse.up();
};

/**
 * Notes, from before the page loads, whether the canvas ever says its
 * nodes are moving — which a check after the fact could miss.
 */
const watchForAnimation = async (page: DeepReadonly<Page>): Promise<void> => {
  await page.addInitScript(() => {
    const observer = new MutationObserver((records) => {
      const touched = [
        ...records.map(({ target }) => target),
        ...records.flatMap(({ addedNodes }) => Array.from(addedNodes)),
      ];

      if (
        touched.some(
          (node) =>
            (node instanceof SVGElement &&
              node.dataset['animating'] === 'true') ||
            (node instanceof Element &&
              node.querySelector('[data-animating="true"]') !== null),
        )
      ) {
        Reflect.set(globalThis, 'sawAnimation', true);
      }
    });

    observer.observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-animating'],
    });
  });
};

const sawAnimation = async (page: DeepReadonly<Page>): Promise<boolean> =>
  page.evaluate(() => Reflect.get(globalThis, 'sawAnimation') === true);

/** Where every node is, in the order they are drawn. */
const allPositions = async (
  page: DeepReadonly<Page>,
): Promise<readonly (string | null)[]> =>
  page
    .getByTestId('dag-node')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('transform')),
    );

test(
  'moves a node by dragging it, and keeps it there',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    const node = dagNode(page, /画面を実装する/u);

    await expect.soft(node).toBeVisible();

    const before = await positionOf(node);

    const box = await node.boundingBox();

    const startX = (box?.x ?? 0) + (box?.width ?? 0) / 2;

    const startY = (box?.y ?? 0) + (box?.height ?? 0) / 2;

    await page.mouse.move(startX, startY);

    await page.mouse.down();

    await page.mouse.move(startX + 60, startY + 40, { steps: 5 });

    await page.mouse.move(startX + 120, startY + 80, { steps: 5 });

    await page.mouse.up();

    // A drag is not a tap: no dialog.
    await expect.soft(page.getByTestId('node-dialog')).toBeHidden();

    const after = await positionOf(node);

    expect.soft(after.x).toBeGreaterThan(before.x + 20);

    expect.soft(after.y).toBeGreaterThan(before.y + 10);

    const moved = (await node.getAttribute('transform')) ?? '';

    await page.getByTestId('view-list').click();

    await showDag(page);

    await expect.soft(node).toHaveAttribute('transform', moved);

    // A tap still opens it.
    await node.click();

    await expect.soft(page.getByTestId('node-dialog')).toBeVisible();
  },
);

test(
  'puts a node into a group by dragging it into the frame, and out again',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    const frame = page.getByTestId('dag-group');

    await expect.soft(frame).toHaveCount(1);

    await expect
      .soft(page.getByTestId('dag-group-header'))
      .toHaveAccessibleName('グループ「実装」');

    const node = dagNode(page, /仕様をまとめる/u);

    expect.soft(await groupOfNode(page, node)).toBe('');

    const into = await frame.boundingBox();

    await dragNodeTo(page, node, {
      x: (into?.x ?? 0) + (into?.width ?? 0) / 2,
      y: (into?.y ?? 0) + (into?.height ?? 0) / 2,
    });

    expect.soft(await groupOfNode(page, node)).toBe('implementation');

    // The frame now goes round it too.
    const grown = await frame.boundingBox();

    const box = await node.boundingBox();

    expect.soft(box?.x ?? 0).toBeGreaterThanOrEqual(grown?.x ?? 0);

    expect
      .soft((box?.x ?? 0) + (box?.width ?? 0))
      .toBeLessThanOrEqual((grown?.x ?? 0) + (grown?.width ?? 0));

    await dragNodeTo(page, node, {
      x: (grown?.x ?? 0) + (grown?.width ?? 0) / 2,
      y: (grown?.y ?? 0) + (grown?.height ?? 0) + 200,
    });

    expect.soft(await groupOfNode(page, node)).toBe('');
  },
);

test(
  'creates a group from the header, and deletes it from its title',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    await page.getByTestId('add-group').click();

    await page.getByTestId('group-title-input').fill('検証');

    await page.getByTestId('save-group').click();

    await expect.soft(page.getByTestId('group-dialog')).toBeHidden();

    const created = page
      .getByTestId('dag-group-header')
      .and(page.getByRole('button', { name: 'グループ「検証」' }));

    await expect.soft(created).toBeVisible();

    await created.click();

    await page.getByTestId('delete-group').click();

    await page.getByTestId('confirm-delete-group').click();

    await expect.soft(created).toHaveCount(0);

    await expect.soft(page.getByTestId('dag-group')).toHaveCount(1);
  },
);

test(
  'arranges the nodes automatically, to the right or down',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    const spec = dagNode(page, /仕様をまとめる/u);

    const design = dagNode(page, /画面設計/u);

    await expect.soft(spec).toBeVisible();

    const initial = (await design.getAttribute('transform')) ?? '';

    await page.getByTestId('dag-direction-down').click();

    await expect
      .soft(page.getByTestId('dag-direction-down'))
      .toHaveAttribute('aria-pressed', 'true');

    // Choosing the direction alone moves nothing.
    await expect.soft(design).toHaveAttribute('transform', initial);

    await page.getByTestId('dag-arrange').click();

    await expect
      .soft(page.getByTestId('dag-canvas'))
      .toHaveAttribute('data-animating', 'false');

    // Down: what waits is below what it waits for.
    await expect
      .poll(async () => {
        const [from, to] = await Promise.all([
          positionOf(spec),
          positionOf(design),
        ]);

        return to.y > from.y;
      })
      .toBe(true);

    const down = (await design.getAttribute('transform')) ?? '';

    await page.getByTestId('dag-direction-right').click();

    await expect.soft(design).toHaveAttribute('transform', down);

    await page.getByTestId('dag-arrange').click();

    await expect
      .soft(page.getByTestId('dag-canvas'))
      .toHaveAttribute('data-animating', 'false');

    // Right: what waits is to the right of what it waits for.
    await expect
      .poll(async () => {
        const [from, to] = await Promise.all([
          positionOf(spec),
          positionOf(design),
        ]);

        return to.x > from.x;
      })
      .toBe(true);

    await expect.soft(design).not.toHaveAttribute('transform', down);
  },
);

test(
  'puts a new task clear of the other nodes, arranged or dragged',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    await arrange(page, 'right');

    // Arranged: laid out again with the new task in it.
    await addTask(page, '新しいタスク 1');

    await expect.soft(page.getByTestId('dag-node')).toHaveCount(10);

    expect.soft(await overlappingNodes(page)).toStrictEqual([]);

    // Dragged: the new task is put clear of the rest, which stay.
    const node = dagNode(page, /画面を実装する/u);

    const box = await node.boundingBox();

    const startX = (box?.x ?? 0) + (box?.width ?? 0) / 2;

    const startY = (box?.y ?? 0) + (box?.height ?? 0) / 2;

    await page.mouse.move(startX, startY);

    await page.mouse.down();

    await page.mouse.move(startX + 40, startY + 120, { steps: 10 });

    await page.mouse.up();

    const before = await positionsById(page);

    await addTask(page, '新しいタスク 2');

    await expect.soft(page.getByTestId('dag-node')).toHaveCount(11);

    expect.soft(await overlappingNodes(page)).toStrictEqual([]);

    const after = await positionsById(page);

    expect
      .soft(after.filter(({ id }) => before.some((known) => known.id === id)))
      .toStrictEqual(before);
  },
);

test(
  'runs no edge through a node, arranged either way or dragged',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    // The sample data has the case that went wrong: 「API を実装する」 before
    // 「画面を実装する」, and 「実装完了」 after both.
    await arrange(page, 'down');

    expect.soft(await edgesThroughNodes(page, 11)).toStrictEqual([]);

    await arrange(page, 'right');

    expect.soft(await edgesThroughNodes(page, 11)).toStrictEqual([]);

    // Dropped across a long edge, which then goes round it.
    await dragOntoEdge(page, /利用者向けドキュメント/u, {
      from: 'task:api',
      to: 'milestone:review',
    });

    await expect.poll(async () => routedEdgeCount(page)).toBeGreaterThan(0);

    expect.soft(await edgesThroughNodes(page, 1)).toStrictEqual([]);
  },
);

test(
  'moves the nodes into place when the DAG is first shown, once',
  { tag: '@smoke' },
  async ({ page }) => {
    await watchForAnimation(page);

    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    expect.soft(await sawAnimation(page)).toBe(true);

    const placed = await allPositions(page);

    // Not again on coming back, and every node where it was left.
    await page.evaluate(() => Reflect.set(globalThis, 'sawAnimation', false));

    await page.getByTestId('view-list').click();

    await showDag(page);

    expect.soft(await allPositions(page)).toStrictEqual(placed);

    expect.soft(await sawAnimation(page)).toBe(false);
  },
);

test(
  'puts the nodes in place at once for a reader who asks for less motion',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await watchForAnimation(page);

    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    await expect.soft(page.getByTestId('dag-node')).toHaveCount(9);

    await arrange(page, 'down');

    expect.soft(await sawAnimation(page)).toBe(false);
  },
);

/** Opens 「表示設定」, and waits for the focus to be in it. */
const openSettings = async (page: DeepReadonly<Page>): Promise<void> => {
  await page.getByTestId('dag-settings').click();

  await expect.soft(page.getByTestId('dag-settings-panel')).toBeVisible();
};

/** Closes 「表示設定」 with Escape. */
const closeSettings = async (page: DeepReadonly<Page>): Promise<void> => {
  await page.keyboard.press('Escape');

  await expect.soft(page.getByTestId('dag-settings-panel')).toBeHidden();
};

/** The animation `setting`, chosen in 「表示設定」. */
const chooseAnimation = async (
  page: DeepReadonly<Page>,
  setting: 'auto' | 'on' | 'off',
): Promise<void> => {
  await openSettings(page);

  await page.getByTestId('dag-animation').selectOption(setting);

  await closeSettings(page);
};

/** The node size `size`, chosen in 「表示設定」, and the nodes settled. */
const chooseNodeSize = async (
  page: DeepReadonly<Page>,
  size: 'standard' | 'compact',
): Promise<void> => {
  await openSettings(page);

  await page.getByTestId(`dag-node-size-${size}`).click();

  await expect
    .soft(page.getByTestId(`dag-node-size-${size}`))
    .toHaveAttribute('aria-pressed', 'true');

  await closeSettings(page);

  await expect
    .soft(page.getByTestId('dag-canvas'))
    .toHaveAttribute('data-animating', 'false');
};

test(
  'never moves the nodes with the animation 「オフ」, and keeps the setting',
  { tag: '@smoke' },
  async ({ page }) => {
    await watchForAnimation(page);

    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    await chooseAnimation(page, 'off');

    await page.evaluate(() => Reflect.set(globalThis, 'sawAnimation', false));

    await arrange(page, 'down');

    expect.soft(await sawAnimation(page)).toBe(false);

    // Kept on this device: not even the first showing moves on a new visit.
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    await expect.soft(page.getByTestId('dag-node')).toHaveCount(9);

    await openSettings(page);

    await expect.soft(page.getByTestId('dag-animation')).toHaveValue('off');

    expect.soft(await sawAnimation(page)).toBe(false);
  },
);

test(
  'moves the nodes with the animation 「オン」 for a reader who asks for less motion',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await watchForAnimation(page);

    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    await expect.soft(page.getByTestId('dag-node')).toHaveCount(9);

    expect.soft(await sawAnimation(page)).toBe(false);

    await chooseAnimation(page, 'on');

    await arrange(page, 'down');

    expect.soft(await sawAnimation(page)).toBe(true);
  },
);

/** Switches the DAG screen to `mode`, and waits for the nodes to settle. */
const showMode = async (
  page: DeepReadonly<Page>,
  mode: 'dag' | 'arc' | 'tile',
): Promise<void> => {
  await page.getByTestId(`dag-mode-${mode}`).click();

  await expect
    .soft(page.getByTestId(`dag-mode-${mode}`))
    .toHaveAttribute('aria-pressed', 'true');

  await expect
    .soft(page.getByTestId('dag-canvas'))
    .toHaveAttribute('data-animating', 'false');
};

test(
  'keeps the screen and the graph’s mode in the URL through a reload',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    // The list, the default, writes nothing.
    expect.soft(searchOf(page)).toBe('?storage=memory');

    await showDag(page);

    await showMode(page, 'arc');

    expect.soft(searchOf(page)).toBe('?storage=memory&view=dag&mode=arc');

    await page.reload();

    await expect.soft(page.getByTestId('dag-canvas')).toBeVisible();

    await expect
      .soft(page.getByTestId('dag-mode-arc'))
      .toHaveAttribute('aria-pressed', 'true');

    // Back on the list, the URL says nothing again.
    await page.getByTestId('view-list').click();

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    expect.soft(searchOf(page)).toBe('?storage=memory');

    // A link to the graph in another mode wins over the one kept.
    await page.goto(`${DEMO}&view=dag&mode=tile`);

    await expect
      .soft(page.getByTestId('dag-mode-tile'))
      .toHaveAttribute('aria-pressed', 'true');

    // What it does not know is the list, and taken out of the URL.
    await page.goto(`${DEMO}&view=board&mode=dag`);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    expect.soft(searchOf(page)).toBe('?storage=memory');
  },
);

/** The page's URL's query, `?` and all. */
const searchOf = (page: DeepReadonly<Page>): string => {
  const url = new URL(page.url());

  return url.search;
};

/** How many of `locator` have `data-highlight` set to each value. */
const highlightCounts = async (
  locator: Locator,
): Promise<ReadonlyMap<string, number>> => {
  const values = await locator.evaluateAll((elements) =>
    elements.map((element) =>
      element instanceof SVGElement ? (element.dataset['highlight'] ?? '') : '',
    ),
  );

  return new Map(
    Array.from(
      Map.groupBy(values, (value) => value),
      ([value, group]) => [value, group.length],
    ),
  );
};

test(
  'draws the tasks and the milestones as an arc diagram, and keeps the mode',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    const dagPositions = await allPositions(page);

    await showMode(page, 'arc');

    // Every node, and nothing to arrange.
    const nodes = page.getByTestId('dag-node');

    await expect.soft(nodes).toHaveCount(9);

    await expect.soft(page.getByTestId('dag-arrange')).toHaveCount(0);

    await expect.soft(page.getByTestId('dag-direction-right')).toHaveCount(0);

    await expect.soft(page.getByTestId('dag-settings')).toBeVisible();

    // One column, top to bottom.
    const drawn = await nodes.evaluateAll((elements) =>
      elements.map((element) => {
        const moved =
          element instanceof SVGGraphicsElement
            ? element.transform.baseVal.consolidate()?.matrix
            : undefined;

        return {
          title: element.querySelector('title')?.textContent ?? '',
          isTask:
            element instanceof SVGElement &&
            element.dataset['nodeId']?.startsWith('task:') === true,
          x: moved?.e ?? Number.NaN,
          y: moved?.f ?? Number.NaN,
        };
      }),
    );

    const column = drawn.toSorted((a, b) => a.y - b.y);

    const tasks = column.filter(({ isTask }) => isTask);

    const milestones = column.filter(({ isTask }) => !isTask);

    // The tasks lined up, the narrower milestones' right sides with theirs.
    const taskXs = new Set(tasks.map(({ x }) => x));

    const milestoneXs = new Set(milestones.map(({ x }) => x));

    expect.soft(taskXs.size).toBe(1);

    expect.soft(milestoneXs.size).toBe(1);

    expect.soft(milestones[0]?.x).toBeGreaterThan(tasks[0]?.x ?? 0);

    // The tasks by title, as the page's own collator sorts.
    const titles = tasks.map(({ title }) => title);

    const sorted = await page.evaluate((unsorted) => {
      const collator = new Intl.Collator('ja');

      return unsorted.toSorted(collator.compare);
    }, titles);

    expect.soft(titles).toStrictEqual(sorted);

    // 「実装完了」 just above 結合テスト, which waits for it; 「リリース承認」,
    // which no node waits for, just below 結合テスト, which it waits for,
    // and 「コードフリーズ」, which only it waits for, just above it.
    const order = column.map(({ title }) => title);

    const testAt = order.indexOf('結合テスト');

    expect
      .soft(order.slice(testAt - 1, testAt + 3))
      .toStrictEqual([
        '実装完了',
        '結合テスト',
        'コードフリーズ',
        'リリース承認',
      ]);

    // Every dependency, as the DAG draws it.
    const arcs = page.getByTestId('dag-arc');

    await expect.soft(arcs).toHaveCount(10);

    await expect
      .soft(page.getByRole('img', { name: '実装完了 → 結合テスト' }))
      .toHaveCount(1);

    await expect
      .soft(
        page.getByRole('img', {
          name: 'API を実装する → 画面を実装する（開始後・+3日）',
        }),
      )
      .toHaveCount(1);

    // Pointing at a task brings its three arcs and the three nodes at their
    // other ends forward, and dims the rest.
    const ui = dagNode(page, /画面を実装する/u);

    await ui.hover();

    await expect.soft(ui).toHaveAttribute('data-highlight', 'on');

    await expect
      .poll(async () => highlightCounts(arcs))
      .toStrictEqual(
        new Map([
          ['on', 3],
          ['dim', 7],
        ]),
      );

    expect.soft(await highlightCounts(nodes)).toStrictEqual(
      new Map([
        ['on', 4],
        ['dim', 5],
      ]),
    );

    // Leaving restores it.
    await page.mouse.move(5, 300);

    await expect
      .poll(async () => highlightCounts(arcs))
      .toStrictEqual(new Map([['none', 10]]));

    // So does the keyboard focus.
    await dagNode(page, /利用者向けドキュメント/u).focus();

    await expect
      .poll(async () => highlightCounts(arcs))
      .toStrictEqual(
        new Map([
          ['on', 1],
          ['dim', 9],
        ]),
      );

    await dagNode(page, /利用者向けドキュメント/u).blur();

    // A drag on a task moves the view, not the task.
    const before = await positionOf(ui);

    const box = await ui.boundingBox();

    const startX = (box?.x ?? 0) + (box?.width ?? 0) / 2;

    const startY = (box?.y ?? 0) + (box?.height ?? 0) / 2;

    await page.mouse.move(startX, startY);

    await page.mouse.down();

    await page.mouse.move(startX + 60, startY + 40, { steps: 5 });

    await page.mouse.up();

    expect.soft(await positionOf(ui)).toStrictEqual(before);

    await expect.soft(page.getByTestId('node-dialog')).toBeHidden();

    // A tap opens it.
    await ui.click();

    await expect.soft(page.getByTestId('node-dialog')).toBeVisible();

    await expect
      .soft(page.getByTestId('node-dialog').getByTestId('title-input'))
      .toHaveValue('画面を実装する');

    // Kept on this device: a new visit, without the URL's view.
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    await expect
      .soft(page.getByTestId('dag-mode-arc'))
      .toHaveAttribute('aria-pressed', 'true');

    await expect.soft(nodes).toHaveCount(9);

    // Back to the DAG, every node where it was.
    await showMode(page, 'dag');

    await expect.soft(nodes).toHaveCount(9);

    expect.soft(await allPositions(page)).toStrictEqual(dagPositions);
  },
);

test(
  '「全体表示」 shows the whole arc diagram, not only its top',
  { tag: '@smoke' },
  async ({ page }) => {
    // Too low for the column at the scale 「アーク」 is first shown at.
    await page.setViewportSize({ width: 1000, height: 360 });

    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    await showMode(page, 'arc');

    const canvasBox = await page.getByTestId('dag-canvas').boundingBox();

    const toolbarBox = await page.getByTestId('dag-toolbar').boundingBox();

    // Whether each task is all in sight, between the toolbar and the bottom.
    const inView = async (): Promise<readonly boolean[]> => {
      const nodes = await page.getByTestId('dag-node').all();

      return Promise.all(
        nodes.map(async (node) => {
          const box = await node.boundingBox();

          return (
            box !== null &&
            canvasBox !== null &&
            toolbarBox !== null &&
            box.y >= toolbarBox.y + toolbarBox.height &&
            box.y + box.height <= canvasBox.y + canvasBox.height
          );
        }),
      );
    };

    // The top of the column, the rest to be panned down to.
    const before = await inView();

    expect.soft(before.includes(false)).toBe(true);

    await page.getByTestId('dag-fit').click();

    await expect
      .poll(async () => {
        const after = await inView();

        return after.every((seen) => seen);
      })
      .toBe(true);
  },
);

/**
 * What 「タイル」 draws, read from the page: each task's title and place,
 * and the geometry the rows follow — the canvas's width, the left margin
 * (where the view puts the rows), the width of a node and the gap between
 * two — so that the columns expected can be worked out from it.
 */
const tileLayoutOnPage = async (
  page: DeepReadonly<Page>,
): Promise<
  Readonly<{
    tiles: readonly Readonly<{ title: string; x: number; y: number }>[];
    canvasWidth: number;
    margin: number;
    nodeWidth: number;
    nodeHeight: number;
    rowsTop: number;
  }>
> =>
  page.getByTestId('dag-canvas').evaluate((canvas) => {
    const content = canvas.querySelector(':scope > g > g');

    const view =
      content instanceof SVGGraphicsElement
        ? content.transform.baseVal.consolidate()?.matrix
        : undefined;

    const shape = canvas.querySelector(
      ':scope [data-e2e="dag-node"] .dag-node-shape',
    );

    const box =
      shape instanceof SVGGraphicsElement ? shape.getBBox() : undefined;

    return {
      tiles: Array.from(
        canvas.querySelectorAll('[data-e2e="dag-node"]'),
        (node) => {
          const moved =
            node instanceof SVGGraphicsElement
              ? node.transform.baseVal.consolidate()?.matrix
              : undefined;

          return {
            title: node.querySelector('title')?.textContent ?? '',
            x: moved?.e ?? Number.NaN,
            y: moved?.f ?? Number.NaN,
          };
        },
      ),
      canvasWidth: canvas.clientWidth,
      margin: view?.e ?? Number.NaN,
      nodeWidth: box?.width ?? Number.NaN,
      nodeHeight: box?.height ?? Number.NaN,
      rowsTop: view?.f ?? Number.NaN,
    };
  });

/**
 * The rows and columns 「タイル」 draws — and the columns its geometry says
 * there should be: as many nodes as fit the canvas less the margins, a gap
 * between each two, and one at least. The gap is read from the layout:
 * across a row if there are two columns, down a column if not.
 */
const tileGrid = async (
  page: DeepReadonly<Page>,
): Promise<
  Readonly<{
    columns: number;
    rows: number;
    expectedColumns: number;
    rowMajorTitles: readonly string[];
  }>
> => {
  const { tiles, canvasWidth, margin, nodeWidth, nodeHeight } =
    await tileLayoutOnPage(page);

  const xs = Arr.uniq(tiles.map(({ x }) => x)).toSorted((a, b) => a - b);

  const ys = Arr.uniq(tiles.map(({ y }) => y)).toSorted((a, b) => a - b);

  const [x0 = 0, x1] = xs;

  const [y0 = 0, y1 = 0] = ys;

  const gap = x1 === undefined ? y1 - y0 - nodeHeight : x1 - x0 - nodeWidth;

  return {
    columns: xs.length,
    rows: ys.length,
    expectedColumns: Math.max(
      1,
      Math.floor(ratio(canvasWidth - 2 * margin + gap, nodeWidth + gap)),
    ),
    rowMajorTitles: tiles
      .toSorted((a, b) => (a.y !== b.y ? a.y - b.y : a.x - b.x))
      .map(({ title }) => title),
  };
};

/** How many rows `count` nodes take, `columns` to a row. */
const rowsOf = (count: number, columns: number): number =>
  Math.ceil(ratio(count, columns));

/** `a / b`, or `NaN` — which fails any comparison — for a zero `b`. */
const ratio = (a: number, b: number): number =>
  Num.isNonZero(b) ? Num.div(a, b) : Number.NaN;

/** Where the view has scrolled the rows to: the top of the first row. */
const tileTop = async (page: DeepReadonly<Page>): Promise<number> => {
  const { rowsTop } = await tileLayoutOnPage(page);

  return rowsTop;
};

const tileColumnsOnPage = async (page: DeepReadonly<Page>): Promise<number> => {
  const { columns } = await tileGrid(page);

  return columns;
};

const tileMargin = async (page: DeepReadonly<Page>): Promise<number> => {
  const { margin } = await tileLayoutOnPage(page);

  return margin;
};

test(
  'draws the tasks alone in rows across the screen, scrolled down, and keeps the mode',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    await showMode(page, 'tile');

    // The tasks alone, no edges, nothing to arrange and no zoom.
    const nodes = page.getByTestId('dag-node');

    await expect.soft(nodes).toHaveCount(6);

    expect
      .soft(
        await nodes.evaluateAll((elements) =>
          elements.every(
            (element) =>
              element instanceof SVGElement &&
              element.dataset['nodeId']?.startsWith('task:') === true,
          ),
        ),
      )
      .toBe(true);

    await expect.soft(page.getByTestId('dag-edge')).toHaveCount(0);

    await expect.soft(page.getByTestId('dag-arc')).toHaveCount(0);

    await expect.soft(page.getByTestId('dag-arrange')).toHaveCount(0);

    await expect.soft(page.getByTestId('dag-zoom-in')).toHaveCount(0);

    await expect.soft(page.getByTestId('dag-settings')).toBeVisible();

    // Row by row, by title as the page's own collator sorts, as many to a
    // row as the width has room for.
    const wide = await tileGrid(page);

    const sorted = await page.evaluate((unsorted) => {
      const collator = new Intl.Collator('ja');

      return unsorted.toSorted(collator.compare);
    }, wide.rowMajorTitles);

    expect.soft(wide.rowMajorTitles).toStrictEqual(sorted);

    expect.soft(wide.columns).toBe(Math.min(wide.expectedColumns, 6));

    expect.soft(wide.rows).toBe(rowsOf(6, wide.expectedColumns));

    // A phone, short enough for the rows to be scrolled: fewer to a row,
    // in the same order.
    await page.setViewportSize({ width: 390, height: 500 });

    await expect
      .poll(async () => tileColumnsOnPage(page))
      .toBeLessThan(wide.columns);

    await expect
      .soft(page.getByTestId('dag-canvas'))
      .toHaveAttribute('data-animating', 'false');

    const narrow = await tileGrid(page);

    expect.soft(narrow.columns).toBe(Math.min(narrow.expectedColumns, 6));

    expect.soft(narrow.rows).toBe(rowsOf(6, narrow.expectedColumns));

    expect.soft(narrow.rowMajorTitles).toStrictEqual(sorted);

    // The wheel scrolls down and up, no further than the first row at the
    // top and the last row in view at the bottom.
    const canvas = page.getByTestId('dag-canvas');

    const canvasBox = await canvas.boundingBox();

    await page.mouse.move(
      (canvasBox?.x ?? 0) + (canvasBox?.width ?? 0) - 40,
      (canvasBox?.y ?? 0) + (canvasBox?.height ?? 0) / 2,
    );

    const atTop = await tileTop(page);

    await page.mouse.wheel(0, 50);

    await expect.poll(async () => tileTop(page)).toBe(atTop - 50);

    await expect.soft(page.getByTestId('dag-scroll-thumb')).toBeVisible();

    await page.mouse.wheel(0, 10_000);

    await expect.poll(async () => tileTop(page)).toBeLessThan(atTop - 50);

    const bottom = await tileTop(page);

    const last = nodes.filter({ hasText: narrow.rowMajorTitles.at(-1) ?? '' });

    const lastBox = await last.boundingBox();

    expect
      .soft((lastBox?.y ?? 0) + (lastBox?.height ?? 0))
      .toBeLessThanOrEqual((canvasBox?.y ?? 0) + (canvasBox?.height ?? 0));

    // Not past the bottom: back up from there by 50 is 50 above it.
    await page.mouse.wheel(0, 500);

    await page.mouse.wheel(0, -50);

    await expect.poll(async () => tileTop(page)).toBe(bottom + 50);

    // Not sideways.
    const margin = await tileMargin(page);

    await page.mouse.wheel(300, 0);

    await page.mouse.wheel(0, -10);

    await expect.poll(async () => tileTop(page)).toBe(bottom + 60);

    expect.soft(await tileMargin(page)).toBe(margin);

    await page.mouse.wheel(0, -10_000);

    await expect.poll(async () => tileTop(page)).toBe(atTop);

    // 全体表示 goes back to the top.
    await page.mouse.wheel(0, 80);

    await expect.poll(async () => tileTop(page)).toBe(atTop - 80);

    await page.getByTestId('dag-fit').click();

    expect.soft(await tileTop(page)).toBe(atTop);

    // A tap opens a task.
    await dagNode(page, /画面を実装する/u).click();

    await expect
      .soft(page.getByTestId('node-dialog').getByTestId('title-input'))
      .toHaveValue('画面を実装する');

    // Kept on this device: a new visit, without the URL's view.
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    await expect
      .soft(page.getByTestId('dag-mode-tile'))
      .toHaveAttribute('aria-pressed', 'true');

    await expect.soft(nodes).toHaveCount(6);

    // Back to the arcs, and to the DAG.
    await showMode(page, 'arc');

    await expect.soft(nodes).toHaveCount(9);

    await expect.soft(page.getByTestId('dag-arc')).toHaveCount(10);

    await showMode(page, 'dag');

    await expect.soft(nodes).toHaveCount(9);

    await expect.soft(page.getByTestId('dag-edge')).not.toHaveCount(0);
  },
);

/** The heights of the nodes' shapes, in graph units, without repeats. */
const nodeHeights = async (
  page: DeepReadonly<Page>,
): Promise<readonly number[]> => {
  // Each read in the page, and the repeats dropped here, where `Arr` is.
  const heights = await page.getByTestId('dag-node').evaluateAll((nodes) =>
    nodes.map((node) => {
      const shape = node.querySelector('.dag-node-shape');

      return shape instanceof SVGGraphicsElement
        ? Math.round(shape.getBBox().height)
        : Number.NaN;
    }),
  );

  return Arr.uniq(heights).toSorted((a, b) => a - b);
};

/** The tops of the toolbar's controls, without repeats: one for one row. */
const toolbarRows = async (page: DeepReadonly<Page>): Promise<number> =>
  page.getByTestId('dag-toolbar').evaluate((bar) => {
    const tops = new Set(
      Array.from(bar.children, (child) =>
        Math.round(child.getBoundingClientRect().top),
      ),
    );

    return tops.size;
  });

/** Where the nodes are, top to bottom, from their `translate(x y)`. */
const nodeTops = async (page: DeepReadonly<Page>): Promise<readonly number[]> =>
  page
    .getByTestId('dag-node')
    .evaluateAll((nodes) =>
      nodes
        .map((node) =>
          node instanceof SVGGraphicsElement
            ? (node.transform.baseVal.consolidate()?.matrix.f ?? Number.NaN)
            : Number.NaN,
        )
        .toSorted((a, b) => a - b),
    );

test(
  'opens 「表示設定」 as a popover, and closes it with Escape, its button and a click outside',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    const button = page.getByTestId('dag-settings');

    const panel = page.getByTestId('dag-settings-panel');

    await expect.soft(button).toHaveAttribute('aria-haspopup', 'dialog');

    await expect.soft(button).toHaveAttribute('aria-expanded', 'false');

    await expect.soft(panel).toBeHidden();

    // Below the button, at the right end of the toolbar.
    await openSettings(page);

    await expect.soft(button).toHaveAttribute('aria-expanded', 'true');

    await expect.soft(panel).toHaveAttribute('data-placement', 'popover');

    const buttonBox = await button.boundingBox();

    const panelBox = await panel.boundingBox();

    expect
      .soft(panelBox?.y ?? 0)
      .toBeGreaterThanOrEqual((buttonBox?.y ?? 0) + (buttonBox?.height ?? 0));

    expect
      .soft(Math.round((panelBox?.x ?? 0) + (panelBox?.width ?? 0)))
      .toBe(Math.round((buttonBox?.x ?? 0) + (buttonBox?.width ?? 0)));

    // The focus goes into it, and back to the button.
    expect
      .soft(
        await panel.evaluate((dialog) =>
          dialog.contains(document.activeElement),
        ),
      )
      .toBe(true);

    await closeSettings(page);

    await expect.soft(button).toBeFocused();

    await expect.soft(button).toHaveAttribute('aria-expanded', 'false');

    await openSettings(page);

    await page.getByTestId('dag-settings-close').click();

    await expect.soft(panel).toBeHidden();

    await expect.soft(button).toBeFocused();

    // A click outside closes it, and reaches nothing behind it.
    await openSettings(page);

    await page.mouse.click(400, 700);

    await expect.soft(panel).toBeHidden();

    await expect.soft(page.getByTestId('node-dialog')).toBeHidden();

    // The settings are there for every mode.
    await showMode(page, 'tile');

    await openSettings(page);

    await expect.soft(page.getByTestId('dag-node-size-standard')).toBeVisible();

    await expect.soft(page.getByTestId('dag-animation')).toBeVisible();

    await closeSettings(page);

    await expect.soft(button).toBeFocused();
  },
);

test(
  'opens 「表示設定」 as a sheet on a phone, and keeps the toolbar on one row',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    expect.soft(await toolbarRows(page)).toBe(1);

    await showMode(page, 'arc');

    expect.soft(await toolbarRows(page)).toBe(1);

    await showMode(page, 'tile');

    expect.soft(await toolbarRows(page)).toBe(1);

    await openSettings(page);

    const panel = page.getByTestId('dag-settings-panel');

    await expect.soft(panel).toHaveAttribute('data-placement', 'sheet');

    const box = await panel.boundingBox();

    expect.soft(Math.round(box?.width ?? 0)).toBe(390);

    expect.soft(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBe(844);

    await closeSettings(page);

    await expect.soft(page.getByTestId('dag-settings')).toBeFocused();
  },
);

test(
  'draws compact nodes in every mode, and keeps the size',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    // Standard: tasks 56 high, milestones 44.
    expect.soft(await nodeHeights(page)).toStrictEqual([44, 56]);

    await showMode(page, 'tile');

    const standardTiles = await tileGrid(page);

    await showMode(page, 'dag');

    // A node put somewhere by hand stays where it was put.
    const moved = dagNode(page, /画面を実装する/u);

    const box = await moved.boundingBox();

    const startX = (box?.x ?? 0) + (box?.width ?? 0) / 2;

    const startY = (box?.y ?? 0) + (box?.height ?? 0) / 2;

    await page.mouse.move(startX, startY);

    await page.mouse.down();

    await page.mouse.move(startX + 40, startY + 60, { steps: 5 });

    await page.mouse.up();

    const put = await positionOf(moved);

    await chooseNodeSize(page, 'compact');

    // Compact: every node 32 high, laid out again around the one put.
    await expect.poll(async () => nodeHeights(page)).toStrictEqual([32]);

    await expect
      .soft(page.getByTestId('dag-canvas'))
      .toHaveAttribute('data-animating', 'false');

    expect.soft(await positionOf(moved)).toStrictEqual(put);

    // The full title, status and priority are still there to read.
    await expect
      .soft(moved)
      .toHaveAttribute(
        'aria-label',
        /^タスク「画面を実装する」 状態: .+ 優先度: .+/u,
      );

    expect
      .soft(
        await moved.evaluate((node) => ({
          tooltip: node.querySelector('title')?.textContent,
          // The lines of text, not the priority's pill.
          lines: node.querySelectorAll('text:not(.dag-node-priority text)')
            .length,
        })),
      )
      .toStrictEqual({
        tooltip: expect.stringMatching(/^画面を実装する\n.+・優先度 .+$/u),
        lines: 1,
      });

    // アーク: a closer column, 32 high and 16 apart.
    await showMode(page, 'arc');

    expect.soft(await nodeHeights(page)).toStrictEqual([32]);

    const ys = await nodeTops(page);

    expect
      .soft(Arr.tail(ys).map((y, index) => y - (ys[index] ?? 0)))
      .toStrictEqual(Arr.tail(ys).map(() => 48));

    await expect.soft(page.getByTestId('dag-arc')).toHaveCount(10);

    // タイル: narrower, so more to a row.
    await showMode(page, 'tile');

    expect.soft(await nodeHeights(page)).toStrictEqual([32]);

    const compactTiles = await tileGrid(page);

    expect
      .soft(compactTiles.expectedColumns)
      .toBeGreaterThan(standardTiles.expectedColumns);

    expect
      .soft(compactTiles.columns)
      .toBe(Math.min(compactTiles.expectedColumns, 6));

    // On a phone, two to a row where a standard node has one.
    await page.setViewportSize({ width: 390, height: 844 });

    await expect.poll(async () => tileColumnsOnPage(page)).toBe(2);

    await page.setViewportSize({ width: 1280, height: 720 });

    // Kept on this device: a new visit, without the URL's view.
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    expect.soft(await nodeHeights(page)).toStrictEqual([32]);

    await openSettings(page);

    await expect
      .soft(page.getByTestId('dag-node-size-compact'))
      .toHaveAttribute('aria-pressed', 'true');

    await closeSettings(page);

    // And back.
    await showMode(page, 'dag');

    await chooseNodeSize(page, 'standard');

    await expect.poll(async () => nodeHeights(page)).toStrictEqual([44, 56]);
  },
);

/** The priority of each task of the sample data, by title. */
const SAMPLE_PRIORITIES: readonly (readonly [string, number])[] = [
  ['仕様をまとめる', 1],
  ['画面設計', 2],
  ['API を実装する', 1],
  ['画面を実装する', 2],
  ['利用者向けドキュメントを書く', 4],
  ['結合テスト', 3],
] as const;

/**
 * The sample tasks' titles by priority, descending, then by title as the
 * page's own collator sorts — or by title alone.
 */
const expectedOrder = async (
  page: DeepReadonly<Page>,
  byPriority: boolean,
): Promise<readonly string[]> =>
  page.evaluate(
    ({ entries, priorityFirst }) => {
      const collator = new Intl.Collator('ja');

      return entries
        .toSorted(([titleA, priorityA], [titleB, priorityB]) => {
          const priorityOrder = priorityFirst ? priorityB - priorityA : 0;

          return priorityOrder !== 0
            ? priorityOrder
            : collator.compare(titleA, titleB);
        })
        .map(([title]) => title);
    },
    { entries: SAMPLE_PRIORITIES, priorityFirst: byPriority },
  );

/**
 * The titles of the tasks drawn, row by row and left to right: down the
 * column in 「アーク」, the milestones there left out, along the rows in
 * 「タイル」.
 */
const drawnOrder = async (
  page: DeepReadonly<Page>,
): Promise<readonly string[]> =>
  page.getByTestId('dag-node').evaluateAll((nodes) =>
    nodes
      .filter(
        (node) =>
          node instanceof SVGElement &&
          node.dataset['nodeId']?.startsWith('task:') === true,
      )
      .map((node) => {
        const moved =
          node instanceof SVGGraphicsElement
            ? node.transform.baseVal.consolidate()?.matrix
            : undefined;

        return {
          title:
            node.querySelector('title')?.textContent.split('\n', 1)[0] ?? '',
          x: moved?.e ?? Number.NaN,
          y: moved?.f ?? Number.NaN,
        };
      })
      .toSorted((a, b) => (a.y !== b.y ? a.y - b.y : a.x - b.x))
      .map(({ title }) => title),
  );

/** The keys a sort editor lists, as it labels them. */
const editorKeys = async (editor: Locator): Promise<readonly string[]> =>
  editor
    .getByRole('listitem')
    .evaluateAll((rows) =>
      rows.map(
        (row) => row.querySelector('.sort-key-label')?.textContent ?? '',
      ),
    );

test(
  'orders アーク and タイル as 「並び順」 says, and keeps the order',
  { tag: '@smoke' },
  async ({ page }) => {
    await watchForAnimation(page);

    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    // Not in 「DAG」, where the reader places the nodes.
    await openSettings(page);

    await expect.soft(page.getByTestId('diagram-sort-editor')).toHaveCount(0);

    await closeSettings(page);

    await showMode(page, 'tile');

    const byTitle = await expectedOrder(page, false);

    expect.soft(await drawnOrder(page)).toStrictEqual(byTitle);

    // 優先度, descending, ahead of タイトル.
    await openSettings(page);

    const editor = page.getByTestId('diagram-sort-editor');

    await expect.soft(editor).toBeVisible();

    expect.soft(await editorKeys(editor)).toStrictEqual(['1. タイトル']);

    await page.evaluate(() => Reflect.set(globalThis, 'sawAnimation', false));

    await editor.getByLabel('キーを追加').selectOption('priority');

    await editor
      .getByRole('button', { name: '優先度の順序を切り替え（現在: 昇順）' })
      .click();

    await editor.getByRole('button', { name: '優先度を上へ' }).click();

    expect
      .soft(await editorKeys(editor))
      .toStrictEqual(['1. 優先度', '2. タイトル']);

    await expect
      .soft(
        editor.getByRole('button', {
          name: '優先度の順序を切り替え（現在: 降順）',
        }),
      )
      .toBeVisible();

    // An added key is not offered again.
    await expect
      .soft(editor.getByLabel('キーを追加').getByRole('option'))
      .toHaveText([
        '＋キーを追加…',
        '期限',
        '状態',
        '依存の深さ',
        '作成日時',
        '更新日時',
        '見積',
      ]);

    await closeSettings(page);

    await expect
      .soft(page.getByTestId('dag-canvas'))
      .toHaveAttribute('data-animating', 'false');

    const byPriority = await expectedOrder(page, true);

    expect.soft(byPriority).not.toStrictEqual(byTitle);

    expect.soft(await drawnOrder(page)).toStrictEqual(byPriority);

    // The tasks moved there.
    expect.soft(await sawAnimation(page)).toBe(true);

    // Kept on this device: a new visit, without the URL's view.
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    expect.soft(await drawnOrder(page)).toStrictEqual(byPriority);

    // The column of 「アーク」 follows the same order.
    await showMode(page, 'arc');

    expect.soft(await drawnOrder(page)).toStrictEqual(byPriority);

    await openSettings(page);

    expect
      .soft(await editorKeys(editor))
      .toStrictEqual(['1. 優先度', '2. タイトル']);

    // Moved down: by title, which no two tasks share.
    await editor.getByRole('button', { name: '優先度を下へ' }).click();

    expect
      .soft(await editorKeys(editor))
      .toStrictEqual(['1. タイトル', '2. 優先度']);

    await closeSettings(page);

    await expect
      .soft(page.getByTestId('dag-canvas'))
      .toHaveAttribute('data-animating', 'false');

    expect.soft(await drawnOrder(page)).toStrictEqual(byTitle);

    // タイトル removed: by priority, descending, first.
    await openSettings(page);

    await editor.getByRole('button', { name: 'タイトルを外す' }).click();

    expect.soft(await editorKeys(editor)).toStrictEqual(['1. 優先度']);

    await closeSettings(page);

    await expect
      .soft(page.getByTestId('dag-canvas'))
      .toHaveAttribute('data-animating', 'false');

    const priorities = new Map(SAMPLE_PRIORITIES);

    const drawnByPriority = await drawnOrder(page);

    const drawnPriorities = drawnByPriority.map(
      (title) => priorities.get(title) ?? Number.NaN,
    );

    expect
      .soft(drawnPriorities)
      .toStrictEqual(drawnPriorities.toSorted((a, b) => b - a));

    // No keys at all: by title, as the editor says.
    await openSettings(page);

    await editor.getByRole('button', { name: '優先度を外す' }).click();

    await expect
      .soft(editor)
      .toContainText('キーがありません。タイトルの昇順で並べます。');

    await expect.soft(editor.getByRole('list')).toHaveCount(0);

    await closeSettings(page);

    await expect
      .soft(page.getByTestId('dag-canvas'))
      .toHaveAttribute('data-animating', 'false');

    expect.soft(await drawnOrder(page)).toStrictEqual(byTitle);
  },
);

test(
  'sorts the list with its own keys, apart from the diagrams’ order',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await page.getByText('並べ替え', { exact: true }).click();

    const editor = page.getByTestId('list-sort-editor');

    await expect.soft(editor).toBeVisible();

    expect
      .soft(await editorKeys(editor))
      .toStrictEqual(['1. 状態', '2. 優先度', '3. 期限']);

    // Down to タイトル alone, descending.
    await editor.getByRole('button', { name: '状態を外す' }).click();

    await editor.getByRole('button', { name: '優先度を外す' }).click();

    await editor.getByRole('button', { name: '期限を外す' }).click();

    await expect.soft(editor).toContainText('並べ替えのキーはありません。');

    await editor.getByLabel('キーを追加').selectOption('title');

    await editor
      .getByRole('button', { name: 'タイトルの順序を切り替え（現在: 昇順）' })
      .click();

    const rows = page.getByTestId('task-row');

    const byTitle = await expectedOrder(page, false);

    await expect.soft(rows).toHaveText(byTitle.toReversed());

    // 優先度 added and moved ahead: by priority, then by title, descending.
    await editor.getByLabel('キーを追加').selectOption('priority');

    await editor.getByRole('button', { name: '優先度を上へ' }).click();

    expect
      .soft(await editorKeys(editor))
      .toStrictEqual(['1. 優先度', '2. タイトル']);

    const byPriority = await page.evaluate(
      ({ entries }) => {
        const collator = new Intl.Collator('ja');

        return entries
          .toSorted(([titleA, priorityA], [titleB, priorityB]) =>
            priorityA !== priorityB
              ? priorityA - priorityB
              : collator.compare(titleB, titleA),
          )
          .map(([title]) => title);
      },
      { entries: SAMPLE_PRIORITIES },
    );

    await expect.soft(rows).toHaveText(byPriority);

    // Kept on this device, and the diagrams keep their own order.
    await page.reload();

    await expect.soft(rows).toHaveText(byPriority);

    await showDag(page);

    await showMode(page, 'tile');

    expect.soft(await drawnOrder(page)).toStrictEqual(byTitle);
  },
);

test.describe('on a touch screen', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test(
    'edits 「並び順」 in the sheet with full-size tap targets',
    { tag: '@smoke' },
    async ({ page }) => {
      await page.goto(DEMO);

      await expect.soft(page.getByTestId('list-view')).toBeVisible();

      await showDag(page);

      await showMode(page, 'tile');

      await openSettings(page);

      const panel = page.getByTestId('dag-settings-panel');

      await expect.soft(panel).toHaveAttribute('data-placement', 'sheet');

      const editor = page.getByTestId('diagram-sort-editor');

      await editor.getByLabel('キーを追加').selectOption('estimate');

      await editor.getByRole('button', { name: '見積を上へ' }).tap();

      await editor
        .getByRole('button', { name: '見積の順序を切り替え（現在: 昇順）' })
        .tap();

      expect
        .soft(await editorKeys(editor))
        .toStrictEqual(['1. 見積', '2. タイトル']);

      // Every control 44px or more each way, and nothing wider than the
      // sheet.
      const sizes = await editor.getByRole('button').evaluateAll((buttons) =>
        buttons.map((button) => {
          const box = button.getBoundingClientRect();

          return Math.min(box.width, box.height);
        }),
      );

      expect.soft(sizes).toHaveLength(8);

      expect.soft(Math.min(...sizes)).toBeGreaterThanOrEqual(44);

      expect
        .soft(
          await editor.evaluate(
            (element) => element.scrollWidth <= element.clientWidth,
          ),
        )
        .toBe(true);

      await closeSettings(page);

      await expect
        .soft(page.getByTestId('dag-canvas'))
        .toHaveAttribute('data-animating', 'false');

      // By estimate, descending: 画面を実装する (16h) first.
      const [first] = await drawnOrder(page);

      expect.soft(first).toBe('画面を実装する');
    },
  );
});
