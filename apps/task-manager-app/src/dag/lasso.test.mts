import type { LaidOutNode } from './graph-layout.mjs';
import { lassoPathData, nodesInLasso } from './lasso.mjs';

// Tasks 100 × 40 at (0, 0) and (200, 0), and a milestone at (0, 100).
const nodes: readonly LaidOutNode[] = [
  { id: 'task:a', kind: 'task', x: 0, y: 0, width: 100, height: 40 },
  { id: 'task:b', kind: 'task', x: 200, y: 0, width: 100, height: 40 },
  {
    id: 'milestone:m',
    kind: 'milestone',
    x: 0,
    y: 100,
    width: 100,
    height: 40,
  },
] as const;

describe(nodesInLasso, () => {
  test('takes the nodes whose centre is inside the closed loop', () => {
    // Round `a` and `m`, not `b`.
    const loop = [
      { x: -10, y: -10 },
      { x: 120, y: -10 },
      { x: 120, y: 150 },
      { x: -10, y: 150 },
    ] as const;

    assert.deepStrictEqual(nodesInLasso(nodes, loop), [
      'task:a',
      'milestone:m',
    ]);
  });

  test('takes a node whose centre is inside, though its corners are not', () => {
    const loop = [
      { x: 40, y: 10 },
      { x: 60, y: 10 },
      { x: 60, y: 30 },
      { x: 40, y: 30 },
    ] as const;

    assert.deepStrictEqual(nodesInLasso(nodes, loop), ['task:a']);
  });

  test('leaves out a node only partly inside, its centre outside', () => {
    const loop = [
      { x: -10, y: -10 },
      { x: 40, y: -10 },
      { x: 40, y: 50 },
      { x: -10, y: 50 },
    ] as const;

    assert.deepStrictEqual(nodesInLasso(nodes, loop), []);
  });

  test('follows a loop that is not convex', () => {
    // Round both tasks, but with a notch cut down from the top over `b`'s
    // centre.
    const loop = [
      { x: -10, y: -10 },
      { x: 180, y: -10 },
      { x: 180, y: 30 },
      { x: 310, y: 30 },
      { x: 310, y: 50 },
      { x: -10, y: 50 },
    ] as const;

    assert.deepStrictEqual(nodesInLasso(nodes, loop), ['task:a']);
  });

  test('takes nothing with fewer than three points, which enclose nothing', () => {
    assert.deepStrictEqual(
      nodesInLasso(nodes, [
        { x: 0, y: 0 },
        { x: 300, y: 300 },
      ]),
      [],
    );
  });
});

describe(lassoPathData, () => {
  test('draws the loop closed', () => {
    assert.strictEqual(
      lassoPathData([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 5 },
      ]),
      'M 0 0 L 10 0 L 10 5 Z',
    );
  });

  test('draws nothing for no points', () => {
    assert.strictEqual(lassoPathData([]), '');
  });
});
