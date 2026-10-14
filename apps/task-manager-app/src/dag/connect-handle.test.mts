import {
  connectHandleAt,
  dropTargetAt,
  outlineOf,
  type ConnectReach,
} from './connect-handle.mjs';
import type { LaidOutNode } from './graph-layout.mjs';

// A task 100 × 40 at (0, 0), and a milestone 120 × 40 at (200, 0).
const task: LaidOutNode = {
  id: 'task:a',
  kind: 'task',
  x: 0,
  y: 0,
  width: 100,
  height: 40,
} as const;

const milestone: LaidOutNode = {
  id: 'milestone:m',
  kind: 'milestone',
  x: 200,
  y: 0,
  width: 120,
  height: 40,
} as const;

const nodes = [task, milestone] as const;

const reach: ConnectReach = { outside: 8, inside: 5 } as const;

describe(outlineOf, () => {
  test('is the rectangle of a task', () => {
    assert.deepStrictEqual(outlineOf(task), [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 40 },
      { x: 0, y: 40 },
    ]);
  });

  test('is the hexagon of a milestone', () => {
    assert.deepStrictEqual(outlineOf(milestone), [
      { x: 220, y: 0 },
      { x: 300, y: 0 },
      { x: 320, y: 20 },
      { x: 300, y: 40 },
      { x: 220, y: 40 },
      { x: 200, y: 20 },
    ]);
  });
});

describe(connectHandleAt, () => {
  test('is on the nearest edge, just outside the node', () => {
    assert.deepStrictEqual(connectHandleAt(nodes, { x: 30, y: -5 }, reach), {
      id: 'task:a',
      at: { x: 30, y: 0 },
    });
  });

  test('is on the nearest edge, just inside the node', () => {
    assert.deepStrictEqual(connectHandleAt(nodes, { x: 96, y: 25 }, reach), {
      id: 'task:a',
      at: { x: 100, y: 25 },
    });
  });

  test('reaches less far inside the node than out', () => {
    assert.isUndefined(connectHandleAt(nodes, { x: 93, y: 25 }, reach));

    assert.isDefined(connectHandleAt(nodes, { x: 107, y: 25 }, reach));
  });

  test('reaches no more than a sixth of the height inside a short node', () => {
    const short: LaidOutNode = { ...task, height: 24 } as const;

    // A sixth of 24 is 4, less than the 5 inside the reach.
    assert.isDefined(connectHandleAt([short], { x: 50, y: 4 }, reach));

    assert.isUndefined(connectHandleAt([short], { x: 50, y: 4.5 }, reach));
  });

  test('follows the slanted edges of a milestone', () => {
    const handle = connectHandleAt(nodes, { x: 205, y: 5 }, reach);

    assert.strictEqual(handle?.id, 'milestone:m');

    // On the edge from (200, 20) to (220, 0): x + y = 220 there.
    assert.closeTo((handle?.at.x ?? 0) + (handle?.at.y ?? 0), 220, 1e-9);
  });

  test('is undefined in the middle of a node, and far from every node', () => {
    assert.isUndefined(connectHandleAt(nodes, { x: 50, y: 20 }, reach));

    assert.isUndefined(connectHandleAt(nodes, { x: 150, y: 20 }, reach));
  });

  test('takes the nearer of two nodes', () => {
    const beside: LaidOutNode = { ...task, id: 'task:b', x: 110 } as const;

    assert.strictEqual(
      connectHandleAt([task, beside], { x: 103, y: 20 }, reach)?.id,
      'task:a',
    );

    assert.strictEqual(
      connectHandleAt([task, beside], { x: 107, y: 20 }, reach)?.id,
      'task:b',
    );
  });
});

describe(dropTargetAt, () => {
  test('is the node the point is inside', () => {
    assert.strictEqual(dropTargetAt(nodes, { x: 50, y: 20 }, reach), 'task:a');

    assert.strictEqual(
      dropTargetAt(nodes, { x: 260, y: 20 }, reach),
      'milestone:m',
    );
  });

  test('is not a milestone in a corner its slanted edges cut off', () => {
    assert.isUndefined(dropTargetAt(nodes, { x: 202, y: 2 }, reach));
  });

  test('takes a point just outside an edge as on the node', () => {
    assert.strictEqual(dropTargetAt(nodes, { x: 50, y: 45 }, reach), 'task:a');
  });

  test('is the top node where two overlap', () => {
    const over: LaidOutNode = { ...task, id: 'task:b', x: 50 } as const;

    assert.strictEqual(
      dropTargetAt([task, over], { x: 70, y: 20 }, reach),
      'task:b',
    );
  });

  test('is undefined on the background', () => {
    assert.isUndefined(dropTargetAt(nodes, { x: 150, y: 20 }, reach));
  });
});
