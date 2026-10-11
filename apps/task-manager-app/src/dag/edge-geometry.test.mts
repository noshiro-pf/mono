import type { GraphNodeId } from '../domain/index.mjs';
import {
  cubicPoint,
  edgeGeometries,
  MIN_CONTROL_OFFSET,
  type CubicSegment,
  type EdgeGeometry,
} from './edge-geometry.mjs';
import {
  labelSize,
  type LaidOutEdge,
  type LaidOutNode,
} from './graph-layout.mjs';
import type { Point } from './pan-zoom.mjs';

const task = (id: string, x: number, y: number): LaidOutNode =>
  ({
    id: `task:${id}`,
    kind: 'task',
    x,
    y,
    width: 100,
    height: 50,
  }) as const;

const milestone = (id: string, x: number, y: number): LaidOutNode =>
  ({
    id: `milestone:${id}`,
    kind: 'milestone',
    x,
    y,
    width: 120,
    height: 40,
  }) as const;

const edge = (from: GraphNodeId, to: GraphNodeId, label = ''): LaidOutEdge =>
  ({ id: `${to}<${from}`, from, to, label }) as const;

const only = (geometries: readonly EdgeGeometry[]): EdgeGeometry => {
  const [first] = geometries;

  assert.strictEqual(geometries.length, 1);

  assert.isDefined(first);

  return first;
};

const firstSegment = (geometry: EdgeGeometry): CubicSegment =>
  geometry.segments[0];

const lastSegment = (geometry: EdgeGeometry): CubicSegment =>
  geometry.segments[1] ?? geometry.segments[0];

/** The direction the curve leaves its start in, and arrives at its end in. */
const tangents = (
  geometry: EdgeGeometry,
): Readonly<{ leaving: Point; arriving: Point }> => {
  const first = firstSegment(geometry);

  const last = lastSegment(geometry);

  return {
    leaving: {
      x: Math.sign(first.control1.x - first.start.x),
      y: Math.sign(first.control1.y - first.start.y),
    },
    arriving: {
      x: Math.sign(last.end.x - last.control2.x),
      y: Math.sign(last.end.y - last.control2.y),
    },
  };
};

const startOf = (geometry: EdgeGeometry): Point => firstSegment(geometry).start;

const endOf = (geometry: EdgeGeometry): Point => lastSegment(geometry).end;

describe(edgeGeometries, () => {
  describe('growing to the right', () => {
    test('leaves the right side and enters the left side, horizontally', () => {
      const geometry = only(
        edgeGeometries(
          'right',
          [task('a', 0, 0), task('b', 300, 0)],
          [edge('task:a', 'task:b')],
        ),
      );

      assert.deepStrictEqual(geometry.segments, [
        {
          start: { x: 100, y: 25 },
          control1: { x: 200, y: 25 },
          control2: { x: 200, y: 25 },
          end: { x: 300, y: 25 },
        },
      ]);

      assert.strictEqual(geometry.path, 'M 100 25 C 200 25 200 25 300 25');
    });

    test('keeps the ends horizontal however the target is placed', () => {
      for (const [x, y] of [
        [300, 200],
        [300, -200],
        [-300, 200],
        [-300, 10],
        [-300, -10],
        [0, 300],
        [20, 0],
      ] as const) {
        const geometry = only(
          edgeGeometries(
            'right',
            [task('a', 0, 0), task('b', x, y)],
            [edge('task:a', 'task:b')],
          ),
        );

        assert.deepStrictEqual(tangents(geometry), {
          leaving: { x: 1, y: 0 },
          arriving: { x: 1, y: 0 },
        });

        assert.strictEqual(startOf(geometry).x, 100);

        assert.strictEqual(endOf(geometry).x, x);
      }
    });

    test('bends the controls out at least the minimum, and half the gap', () => {
      const near = firstSegment(
        only(
          edgeGeometries(
            'right',
            [task('a', 0, 0), task('b', 120, 0)],
            [edge('task:a', 'task:b')],
          ),
        ),
      );

      assert.strictEqual(near.control1.x - near.start.x, MIN_CONTROL_OFFSET);

      const far = firstSegment(
        only(
          edgeGeometries(
            'right',
            [task('a', 0, 0), task('b', 500, 0)],
            [edge('task:a', 'task:b')],
          ),
        ),
      );

      assert.strictEqual(far.control1.x - far.start.x, 200);
    });

    test('goes round both nodes to a target behind the source in line with it', () => {
      const geometry = only(
        edgeGeometries(
          'right',
          [task('a', 300, 0), task('b', 0, 10)],
          [edge('task:a', 'task:b')],
        ),
      );

      assert.strictEqual(geometry.segments.length, 2);

      const [out, back] = geometry.segments;

      assert.isDefined(back);

      // Below both nodes (the target is lower), half-way across.
      assert.isAbove(out.end.y, 60);

      assert.strictEqual(out.end.x, 200);

      // Smooth at the turn: both halves run right to left through it.
      assert.isBelow(out.end.x - out.control2.x, 0);

      assert.isBelow(back.control1.x - back.start.x, 0);

      assert.strictEqual(out.end.y, back.control1.y);
    });
  });

  describe('growing down', () => {
    test('leaves the bottom and enters the top, vertically', () => {
      const geometry = only(
        edgeGeometries(
          'down',
          [task('a', 0, 0), task('b', 0, 200)],
          [edge('task:a', 'task:b')],
        ),
      );

      assert.deepStrictEqual(geometry.segments, [
        {
          start: { x: 50, y: 50 },
          control1: { x: 50, y: 125 },
          control2: { x: 50, y: 125 },
          end: { x: 50, y: 200 },
        },
      ]);
    });

    test('keeps the ends vertical however the target is placed', () => {
      for (const [x, y] of [
        [200, 300],
        [-200, 300],
        [200, -300],
        [10, -300],
        [300, 0],
      ] as const) {
        const geometry = only(
          edgeGeometries(
            'down',
            [task('a', 0, 0), task('b', x, y)],
            [edge('task:a', 'task:b')],
          ),
        );

        assert.deepStrictEqual(tangents(geometry), {
          leaving: { x: 0, y: 1 },
          arriving: { x: 0, y: 1 },
        });

        assert.strictEqual(startOf(geometry).y, 50);

        assert.strictEqual(endOf(geometry).y, y);
      }
    });
  });

  describe('several edges on one side', () => {
    test('spreads them along it, in the order of their other ends', () => {
      const geometries = edgeGeometries(
        'right',
        [
          task('low', 0, 200),
          task('high', 0, -200),
          task('mid', 0, 0),
          task('c', 300, 0),
        ],
        [
          edge('task:low', 'task:c'),
          edge('task:high', 'task:c'),
          edge('task:mid', 'task:c'),
        ],
      );

      const ends = new Map(
        geometries.map((geometry) => [geometry.from, endOf(geometry)]),
      );

      assert.deepStrictEqual(
        [ends.get('task:high'), ends.get('task:mid'), ends.get('task:low')],
        [
          { x: 300, y: 12.5 },
          { x: 300, y: 25 },
          { x: 300, y: 37.5 },
        ],
      );
    });

    test('spreads the edges leaving a node too', () => {
      const geometries = edgeGeometries(
        'down',
        [task('a', 0, 0), task('right', 200, 200), task('left', -200, 200)],
        [edge('task:a', 'task:right'), edge('task:a', 'task:left')],
      );

      const starts = new Map(
        geometries.map((geometry) => [geometry.to, startOf(geometry)]),
      );

      assert.deepStrictEqual(starts.get('task:left'), {
        x: 100 / 3,
        y: 50,
      });

      assert.deepStrictEqual(starts.get('task:right'), {
        x: 200 / 3,
        y: 50,
      });
    });
  });

  describe('a milestone', () => {
    test('is entered at the point of its hexagon from the side', () => {
      const geometry = only(
        edgeGeometries(
          'right',
          [task('a', 0, 0), milestone('m', 300, 5)],
          [edge('task:a', 'milestone:m')],
        ),
      );

      assert.deepStrictEqual(endOf(geometry), { x: 300, y: 25 });
    });

    test('is entered on its slanted sides by several edges', () => {
      const geometries = edgeGeometries(
        'right',
        [task('a', 0, -100), task('b', 0, 100), milestone('m', 300, 0)],
        [edge('task:a', 'milestone:m'), edge('task:b', 'milestone:m')],
      );

      // The left point is at (300, 20); the sides slant at 45 degrees.
      assert.deepStrictEqual(
        geometries.map(endOf).map(({ x, y }) => [x, y]),
        [
          [300 + 20 / 3, 40 / 3],
          [300 + 20 / 3, 80 / 3],
        ],
      );
    });

    test('is entered on its flat top, between the slants, going down', () => {
      const geometries = edgeGeometries(
        'down',
        [task('a', -200, -200), task('b', 200, -200), milestone('m', 0, 0)],
        [edge('task:a', 'milestone:m'), edge('task:b', 'milestone:m')],
      );

      // The top runs from x = 20 to x = 100.
      assert.deepStrictEqual(
        geometries.map(endOf).map(({ x, y }) => [x, y]),
        [
          [20 + 80 / 3, 0],
          [20 + 160 / 3, 0],
        ],
      );
    });
  });

  describe('labels', () => {
    test('sit on the middle of the curve, sized to their text', () => {
      const geometry = only(
        edgeGeometries(
          'down',
          [task('a', 0, 0), task('b', 200, 300)],
          [edge('task:a', 'task:b', 'SS +3日')],
        ),
      );

      const middle = cubicPoint(firstSegment(geometry), 0.5);

      const size = labelSize('SS +3日');

      assert.deepStrictEqual(geometry.labelBox, {
        x: middle.x - size.width / 2,
        y: middle.y - size.height / 2,
        ...size,
      });
    });

    test('sit on the turn of a curve that goes round', () => {
      const geometry = only(
        edgeGeometries(
          'right',
          [task('a', 300, 0), task('b', 0, 0)],
          [edge('task:a', 'task:b', 'SS')],
        ),
      );

      const turn = firstSegment(geometry).end;

      const size = labelSize('SS');

      assert.deepStrictEqual(geometry.labelBox, {
        x: turn.x - size.width / 2,
        y: turn.y - size.height / 2,
        ...size,
      });
    });

    test('are left out when there is no text', () => {
      const geometry = only(
        edgeGeometries(
          'right',
          [task('a', 0, 0), task('b', 300, 0)],
          [edge('task:a', 'task:b')],
        ),
      );

      assert.isUndefined(geometry.labelBox);
    });
  });

  test('leaves out an edge whose node is not placed', () => {
    assert.deepStrictEqual(
      edgeGeometries('right', [task('a', 0, 0)], [edge('task:a', 'task:b')]),
      [],
    );
  });
});

describe(cubicPoint, () => {
  const segment: CubicSegment = {
    start: { x: 0, y: 0 },
    control1: { x: 0, y: 100 },
    control2: { x: 100, y: 100 },
    end: { x: 100, y: 0 },
  } as const;

  test('is the start at 0 and the end at 1', () => {
    assert.deepStrictEqual(cubicPoint(segment, 0), segment.start);

    assert.deepStrictEqual(cubicPoint(segment, 1), segment.end);
  });

  test('is the Bézier point in between', () => {
    assert.deepStrictEqual(cubicPoint(segment, 0.5), { x: 50, y: 75 });
  });
});
