import type { GraphNodeId } from '../domain/index.mjs';
import { COMPACT_TASK_NODE_SIZE, TASK_NODE_SIZE } from './graph-layout.mjs';
import {
  TILE_MARGIN,
  TILE_NODE_GAP,
  tileAvailableWidth,
  tileColumns,
  tileContentHeight,
  tileDiagramNodes,
  tileLayout,
} from './tile-layout.mjs';

const size = { width: 100, height: 40 } as const;

describe(tileColumns, () => {
  test('is as many columns as fit the width, a gap between each two', () => {
    // Three columns need 3 * 100 + 2 * 10 = 320.
    assert.strictEqual(tileColumns(100, 10, 320), 3);

    assert.strictEqual(tileColumns(100, 10, 429), 3);

    assert.strictEqual(tileColumns(100, 10, 430), 4);

    assert.strictEqual(tileColumns(100, 10, 319), 2);
  });

  test('is one column at least, however narrow', () => {
    assert.strictEqual(tileColumns(100, 10, 99), 1);

    assert.strictEqual(tileColumns(100, 10, 0), 1);

    assert.strictEqual(tileColumns(100, 10, -50), 1);
  });
});

describe(tileLayout, () => {
  test('fills the rows from the top left, in the order given, and wraps', () => {
    assert.deepStrictEqual(
      tileLayout(
        ['task:e', 'task:a', 'task:d', 'task:b', 'task:c'],
        size,
        10,
        320,
      ),
      new Map([
        ['task:e', { x: 0, y: 0 }],
        ['task:a', { x: 110, y: 0 }],
        ['task:d', { x: 220, y: 0 }],
        ['task:b', { x: 0, y: 50 }],
        ['task:c', { x: 110, y: 50 }],
      ]),
    );
  });

  test('is one column for a width narrower than a node', () => {
    assert.deepStrictEqual(
      tileLayout(['task:a', 'task:b', 'task:c'], size, 10, 60),
      new Map([
        ['task:a', { x: 0, y: 0 }],
        ['task:b', { x: 0, y: 50 }],
        ['task:c', { x: 0, y: 100 }],
      ]),
    );
  });

  test('is one row for a width that fits them all', () => {
    const laidOut = tileLayout(['task:a', 'task:b'], size, 10, 1000);

    assert.deepStrictEqual(
      Array.from(laidOut.values(), ({ y }) => y),
      [0, 0],
    );
  });

  test('is empty for no nodes', () => {
    assert.strictEqual(tileLayout([], size, 10, 320).size, 0);
  });
});

describe(tileAvailableWidth, () => {
  test('is the canvas less a margin on each side', () => {
    assert.strictEqual(tileAvailableWidth(400), 400 - 2 * TILE_MARGIN);
  });
});

describe(tileDiagramNodes, () => {
  // The tasks in the order the diagrams share (`diagram-order.mts`).
  const ids: readonly GraphNodeId[] = [
    'task:t2',
    'task:t3',
    'task:t1',
  ] as const;

  const twoColumns = 2 * TASK_NODE_SIZE.width + TILE_NODE_GAP;

  test('is the tasks, task-sized, row by row', () => {
    const nodes = tileDiagramNodes(ids, twoColumns, 'standard');

    assert.deepStrictEqual(
      nodes.map(({ id, kind, x, y, width, height }) => ({
        id,
        kind,
        x,
        y,
        width,
        height,
      })),
      [
        { id: 'task:t2', kind: 'task', x: 0, y: 0, ...TASK_NODE_SIZE },
        {
          id: 'task:t3',
          kind: 'task',
          x: TASK_NODE_SIZE.width + TILE_NODE_GAP,
          y: 0,
          ...TASK_NODE_SIZE,
        },
        {
          id: 'task:t1',
          kind: 'task',
          x: 0,
          y: TASK_NODE_SIZE.height + TILE_NODE_GAP,
          ...TASK_NODE_SIZE,
        },
      ],
    );
  });

  test('follows the order it is given', () => {
    assert.deepStrictEqual(
      tileDiagramNodes(ids.toReversed(), twoColumns, 'standard').map(
        ({ id }) => id,
      ),
      ['task:t1', 'task:t3', 'task:t2'],
    );
  });

  test('fits more compact nodes to a row, closer together', () => {
    // Two standard nodes, and room for a third compact one.
    const available = Math.max(
      twoColumns,
      3 * COMPACT_TASK_NODE_SIZE.width + 2 * TILE_NODE_GAP,
    );

    assert.isBelow(available, 3 * TASK_NODE_SIZE.width + 2 * TILE_NODE_GAP);

    const standard = tileDiagramNodes(ids, available, 'standard');

    const compact = tileDiagramNodes(ids, available, 'compact');

    const standardRows = new Set(standard.map(({ y }) => y));

    assert.strictEqual(standardRows.size, 2);

    assert.deepStrictEqual(
      compact.map(({ id, x, y, width, height }) => ({
        id,
        x,
        y,
        width,
        height,
      })),
      [
        { id: 'task:t2', x: 0, y: 0, ...COMPACT_TASK_NODE_SIZE },
        {
          id: 'task:t3',
          x: COMPACT_TASK_NODE_SIZE.width + TILE_NODE_GAP,
          y: 0,
          ...COMPACT_TASK_NODE_SIZE,
        },
        {
          id: 'task:t1',
          x: 2 * (COMPACT_TASK_NODE_SIZE.width + TILE_NODE_GAP),
          y: 0,
          ...COMPACT_TASK_NODE_SIZE,
        },
      ],
    );
  });

  test('steps down by the compact height between rows', () => {
    const nodes = tileDiagramNodes(
      ids,
      COMPACT_TASK_NODE_SIZE.width,
      'compact',
    );

    assert.deepStrictEqual(
      nodes.map(({ y }) => y),
      [0, 1, 2].map(
        (row) => row * (COMPACT_TASK_NODE_SIZE.height + TILE_NODE_GAP),
      ),
    );
  });

  test('is nothing while the width is not known', () => {
    assert.deepStrictEqual(tileDiagramNodes(ids, undefined, 'standard'), []);
  });
});

describe(tileContentHeight, () => {
  test('is from the top of the first row to the bottom of the last', () => {
    assert.strictEqual(
      tileContentHeight([
        { id: 'task:a', kind: 'task', x: 0, y: 0, ...size },
        { id: 'task:b', kind: 'task', x: 110, y: 0, ...size },
        { id: 'task:c', kind: 'task', x: 0, y: 50, ...size },
      ]),
      90,
    );
  });

  test('is zero for no nodes', () => {
    assert.strictEqual(tileContentHeight([]), 0);
  });
});
