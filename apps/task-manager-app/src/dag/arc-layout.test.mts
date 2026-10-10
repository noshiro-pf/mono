import { type GraphNodeId } from '../domain/index.mjs';
import { ARC_NODE_GAP, arcDiagramNodes, arcLayout } from './arc-layout.mjs';
import { COMPACT_TASK_NODE_SIZE, TASK_NODE_SIZE } from './graph-layout.mjs';

describe(arcLayout, () => {
  test('puts the nodes one below another at x = 0, in the order given', () => {
    assert.deepStrictEqual(
      arcLayout(['task:b', 'task:a', 'task:c'], { width: 100, height: 40 }, 10),
      new Map([
        ['task:b', { x: 0, y: 0 }],
        ['task:a', { x: 0, y: 50 }],
        ['task:c', { x: 0, y: 100 }],
      ]),
    );
  });

  test('is empty for no nodes', () => {
    assert.strictEqual(arcLayout([], { width: 100, height: 40 }, 10).size, 0);
  });
});

describe(arcDiagramNodes, () => {
  // The tasks in the order the diagrams share (`diagram-order.mts`).
  const ids: readonly GraphNodeId[] = [
    'task:t2',
    'task:t3',
    'task:t1',
  ] as const;

  test('is the tasks, in a column of task-sized nodes', () => {
    const nodes = arcDiagramNodes(ids, 'standard');

    assert.deepStrictEqual(
      nodes.map(({ id }) => id),
      ['task:t2', 'task:t3', 'task:t1'],
    );

    assert.isTrue(
      nodes.every(
        ({ kind, x, width, height }) =>
          kind === 'task' &&
          x === 0 &&
          width === TASK_NODE_SIZE.width &&
          height === TASK_NODE_SIZE.height,
      ),
    );

    const ys = nodes.map(({ y }) => y);

    assert.deepStrictEqual(
      ys,
      ys.toSorted((a, b) => a - b),
    );

    assert.isAbove(ys[1] ?? 0, (ys[0] ?? 0) + TASK_NODE_SIZE.height);
  });

  test('spaces compact nodes by their own height', () => {
    const nodes = arcDiagramNodes(ids, 'compact');

    assert.deepStrictEqual(
      nodes.map(({ id, x, y, width, height }) => ({ id, x, y, width, height })),
      [
        { id: 'task:t2', x: 0, y: 0, ...COMPACT_TASK_NODE_SIZE },
        {
          id: 'task:t3',
          x: 0,
          y: COMPACT_TASK_NODE_SIZE.height + ARC_NODE_GAP,
          ...COMPACT_TASK_NODE_SIZE,
        },
        {
          id: 'task:t1',
          x: 0,
          y: 2 * (COMPACT_TASK_NODE_SIZE.height + ARC_NODE_GAP),
          ...COMPACT_TASK_NODE_SIZE,
        },
      ],
    );
  });

  test('follows the order it is given', () => {
    assert.deepStrictEqual(
      arcDiagramNodes(ids.toReversed(), 'standard').map(({ id }) => id),
      ['task:t1', 'task:t3', 'task:t2'],
    );
  });
});
