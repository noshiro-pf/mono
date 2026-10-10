import { expect, test, type Locator, type Page } from '@playwright/test';
import { Arr, Num, Result } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';

// The in-memory demo of the dev server: no sign-in, the sample data of
// `src/demo/sample-data.mts`, and a fresh copy on every load.
const DEMO = '/mono/task-manager/?storage=memory';

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

    // Kept on this device: not even the first showing moves after a reload.
    await page.reload();

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

/** How many of the arcs are derived through milestones, and how many not. */
const arcKinds = async (
  page: DeepReadonly<Page>,
): Promise<Readonly<{ direct: number; derived: number }>> => {
  const derived = await page
    .getByTestId('dag-arc')
    .evaluateAll((arcs) =>
      arcs.map(
        (arc) => arc instanceof SVGElement && arc.dataset['derived'] === 'true',
      ),
    );

  return {
    direct: derived.filter((each) => !each).length,
    derived: derived.filter((each) => each).length,
  };
};

test(
  'draws the tasks alone as an arc diagram, and keeps the mode',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto(DEMO);

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    const dagPositions = await allPositions(page);

    await showMode(page, 'arc');

    // The tasks alone, and nothing to arrange.
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

    await expect.soft(page.getByTestId('dag-arrange')).toHaveCount(0);

    await expect.soft(page.getByTestId('dag-direction-right')).toHaveCount(0);

    await expect.soft(page.getByTestId('dag-settings')).toBeVisible();

    // One column, top to bottom by title, as the page's own collator sorts.
    const column = await nodes.evaluateAll((elements) =>
      elements.map((element) => {
        const moved =
          element instanceof SVGGraphicsElement
            ? element.transform.baseVal.consolidate()?.matrix
            : undefined;

        return {
          title: element.querySelector('title')?.textContent ?? '',
          x: moved?.e ?? Number.NaN,
          y: moved?.f ?? Number.NaN,
        };
      }),
    );

    const columns = new Set(column.map(({ x }) => x));

    expect.soft(columns.size).toBe(1);

    const titles = column.map(({ title }) => title);

    const sorted = await page.evaluate((unsorted) => {
      const collator = new Intl.Collator('ja');

      return unsorted.toSorted(collator.compare);
    }, titles);

    expect
      .soft(column.toSorted((a, b) => a.y - b.y).map(({ title }) => title))
      .toStrictEqual(sorted);

    // Five dependencies between tasks, and two through 「実装完了」.
    const arcs = page.getByTestId('dag-arc');

    await expect.soft(arcs).toHaveCount(7);

    expect.soft(await arcKinds(page)).toStrictEqual({ direct: 5, derived: 2 });

    await expect
      .soft(
        page.getByRole('img', {
          name: 'API を実装する → 結合テスト（マイルストーン 実装完了 経由）',
        }),
      )
      .toHaveCount(1);

    await expect
      .soft(
        page.getByRole('img', {
          name: 'API を実装する → 画面を実装する（開始後・+3日）',
        }),
      )
      .toHaveCount(1);

    // Pointing at a task brings its three arcs and the three tasks at their
    // other ends forward, and dims the rest.
    const ui = dagNode(page, /画面を実装する/u);

    await ui.hover();

    await expect.soft(ui).toHaveAttribute('data-highlight', 'on');

    await expect
      .poll(async () => highlightCounts(arcs))
      .toStrictEqual(
        new Map([
          ['on', 3],
          ['dim', 4],
        ]),
      );

    expect.soft(await highlightCounts(nodes)).toStrictEqual(
      new Map([
        ['on', 4],
        ['dim', 2],
      ]),
    );

    // Leaving restores it.
    await page.mouse.move(5, 300);

    await expect
      .poll(async () => highlightCounts(arcs))
      .toStrictEqual(new Map([['none', 7]]));

    // So does the keyboard focus.
    await dagNode(page, /利用者向けドキュメント/u).focus();

    await expect
      .poll(async () => highlightCounts(arcs))
      .toStrictEqual(
        new Map([
          ['on', 1],
          ['dim', 6],
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

    // Kept on this device.
    await page.reload();

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    await expect
      .soft(page.getByTestId('dag-mode-arc'))
      .toHaveAttribute('aria-pressed', 'true');

    await expect.soft(nodes).toHaveCount(6);

    // Back to the DAG, every node where it was.
    await showMode(page, 'dag');

    await expect.soft(nodes).toHaveCount(9);

    expect.soft(await allPositions(page)).toStrictEqual(dagPositions);
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

    // Kept on this device.
    await page.reload();

    await expect.soft(page.getByTestId('list-view')).toBeVisible();

    await showDag(page);

    await expect
      .soft(page.getByTestId('dag-mode-tile'))
      .toHaveAttribute('aria-pressed', 'true');

    await expect.soft(nodes).toHaveCount(6);

    // Back to the arcs, and to the DAG.
    await showMode(page, 'arc');

    await expect.soft(nodes).toHaveCount(6);

    await expect.soft(page.getByTestId('dag-arc')).toHaveCount(7);

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
          lines: node.querySelectorAll('text').length,
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

    await expect.soft(page.getByTestId('dag-arc')).toHaveCount(7);

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

    // Kept on this device.
    await page.reload();

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
 * The titles of the nodes drawn, row by row and left to right: down the
 * column in 「アーク」, along the rows in 「タイル」.
 */
const drawnOrder = async (
  page: DeepReadonly<Page>,
): Promise<readonly string[]> =>
  page.getByTestId('dag-node').evaluateAll((nodes) =>
    nodes
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

    // Kept on this device.
    await page.reload();

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
