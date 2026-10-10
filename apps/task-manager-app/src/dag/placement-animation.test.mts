import { type GraphNodeId } from '../domain/index.mjs';
import { type LaidOutNode } from './graph-layout.mjs';
import { type Point } from './pan-zoom.mjs';
import {
  easeOutCubic,
  initialGridPositions,
  interpolateOpacities,
  interpolatePositions,
  samePositions,
} from './placement-animation.mjs';

const task = (id: string): LaidOutNode =>
  ({
    id: `task:${id}`,
    kind: 'task',
    x: 0,
    y: 0,
    width: 100,
    height: 40,
  }) as const;

const positions = (
  entries: readonly (readonly [GraphNodeId, Point])[],
): ReadonlyMap<GraphNodeId, Point> => new Map(entries);

describe(initialGridPositions, () => {
  // As wide, in cells of 100 by 40 and the gap, as it is tall.
  const frame = { x: 0, y: 0, width: 1320, height: 720 } as const;

  test('fills rows in order, to the right', () => {
    const grid = initialGridPositions(
      ['a', 'b', 'c', 'd'].map(task),
      'right',
      frame,
    );

    const at = (id: string): Point | undefined => grid.get(`task:${id}`);

    // Two by two: a b / c d.
    assert.strictEqual(at('a')?.y, at('b')?.y);

    assert.isBelow(at('a')?.x ?? Number.NaN, at('b')?.x ?? Number.NaN);

    assert.strictEqual(at('a')?.x, at('c')?.x);

    assert.isBelow(at('a')?.y ?? Number.NaN, at('c')?.y ?? Number.NaN);
  });

  test('fills columns in order, going down', () => {
    const grid = initialGridPositions(
      ['a', 'b', 'c', 'd'].map(task),
      'down',
      frame,
    );

    const at = (id: string): Point | undefined => grid.get(`task:${id}`);

    // a c / b d.
    assert.strictEqual(at('a')?.x, at('b')?.x);

    assert.isBelow(at('a')?.y ?? Number.NaN, at('b')?.y ?? Number.NaN);

    assert.isBelow(at('a')?.x ?? Number.NaN, at('c')?.x ?? Number.NaN);
  });

  test('keeps the nodes apart and centres the grid on the frame', () => {
    const nodes = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(task);

    const grid = Array.from(
      initialGridPositions(nodes, 'right', frame).values(),
    );

    for (const [i, a] of grid.entries()) {
      for (const b of grid.slice(i + 1)) {
        // No two overlap.
        assert.isTrue(Math.abs(a.x - b.x) >= 100 || Math.abs(a.y - b.y) >= 40);
      }
    }

    const left = Math.min(...grid.map(({ x }) => x));

    const right = Math.max(...grid.map(({ x }) => x + 100));

    const upper = Math.min(...grid.map(({ y }) => y));

    const bottom = Math.max(...grid.map(({ y }) => y + 40));

    assert.closeTo((left + right) / 2, 660, 1e-9);

    assert.closeTo((upper + bottom) / 2, 360, 1e-9);
  });

  test('is wide in a wide frame and tall in a tall one', () => {
    const nodes = Array.from({ length: 12 }, (_, index) => task(String(index)));

    const extent = (grid: ReadonlyMap<GraphNodeId, Point>): Point => {
      const points = Array.from(grid.values());

      return {
        x:
          Math.max(...points.map(({ x }) => x)) -
          Math.min(...points.map(({ x }) => x)),
        y:
          Math.max(...points.map(({ y }) => y)) -
          Math.min(...points.map(({ y }) => y)),
      };
    };

    const wide = extent(
      initialGridPositions(nodes, 'right', { ...frame, height: 200 }),
    );

    assert.isAbove(wide.x, wide.y);

    const tall = extent(
      initialGridPositions(nodes, 'down', { ...frame, width: 200 }),
    );

    assert.isAbove(tall.y, tall.x);
  });

  test('places nothing for no nodes', () => {
    assert.strictEqual(initialGridPositions([], 'right', frame).size, 0);
  });
});

describe(easeOutCubic, () => {
  test('runs from 0 to 1, fast then slow', () => {
    assert.strictEqual(easeOutCubic(0), 0);

    assert.strictEqual(easeOutCubic(1), 1);

    assert.isAbove(easeOutCubic(0.5), 0.5);

    assert.isBelow(easeOutCubic(0.25), easeOutCubic(0.5));
  });

  test('stays within 0 and 1 outside them', () => {
    assert.strictEqual(easeOutCubic(-1), 0);

    assert.strictEqual(easeOutCubic(2), 1);
  });
});

describe(interpolatePositions, () => {
  const from = positions([
    ['task:a', { x: 0, y: 0 }],
    ['task:b', { x: 100, y: 100 }],
  ]);

  const to = positions([
    ['task:a', { x: 100, y: 200 }],
    ['task:b', { x: 100, y: 100 }],
    ['task:c', { x: 50, y: 50 }],
  ]);

  test('is `from` at 0 and `to` at 1', () => {
    assert.deepStrictEqual(
      interpolatePositions(from, to, 0).get('task:a'),
      from.get('task:a'),
    );

    assert.deepStrictEqual(interpolatePositions(from, to, 1), to);
  });

  test('moves each node in a straight line', () => {
    assert.deepStrictEqual(interpolatePositions(from, to, 0.25).get('task:a'), {
      x: 25,
      y: 50,
    });
  });

  test('puts a node with nowhere to come from where it goes', () => {
    assert.deepStrictEqual(interpolatePositions(from, to, 0.5).get('task:c'), {
      x: 50,
      y: 50,
    });
  });
});

describe(interpolateOpacities, () => {
  const from = new Map<GraphNodeId, number>([
    ['milestone:a', 1],
    ['milestone:b', 0],
  ]);

  const to = new Map<GraphNodeId, number>([
    ['milestone:a', 0],
    ['milestone:b', 1],
    ['milestone:c', 0.5],
  ]);

  test('is `from` at 0 and `to` at 1', () => {
    assert.deepStrictEqual(
      interpolateOpacities(from, to, 0),
      new Map([
        ['milestone:a', 1],
        ['milestone:b', 0],
        ['milestone:c', 0.5],
      ]),
    );

    assert.deepStrictEqual(interpolateOpacities(from, to, 1), to);
  });

  test('fades each node linearly, one with nothing to come from staying put', () => {
    assert.deepStrictEqual(
      interpolateOpacities(from, to, 0.25),
      new Map([
        ['milestone:a', 0.75],
        ['milestone:b', 0.25],
        ['milestone:c', 0.5],
      ]),
    );
  });
});

describe(samePositions, () => {
  test('compares the positions, not the maps', () => {
    const a = positions([['task:a', { x: 1, y: 2 }]]);

    assert.isTrue(samePositions(a, positions([['task:a', { x: 1, y: 2 }]])));

    assert.isFalse(samePositions(a, positions([['task:a', { x: 1, y: 3 }]])));

    assert.isFalse(samePositions(a, positions([])));

    assert.isFalse(
      samePositions(
        a,
        positions([
          ['task:a', { x: 1, y: 2 }],
          ['task:b', { x: 0, y: 0 }],
        ]),
      ),
    );
  });
});
