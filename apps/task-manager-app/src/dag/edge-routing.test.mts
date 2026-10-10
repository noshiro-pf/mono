import { asPositiveInt, Num } from 'ts-data-forge';
import type { GraphNodeId } from '../domain/index.mjs';
import {
  cubicPoint,
  edgeGeometries,
  type CubicSegment,
  type EdgeGeometry,
} from './edge-geometry.mjs';
import { OBSTACLE_MARGIN, routeEdges, withCurvesOf } from './edge-routing.mjs';
import { layoutWithElk } from './elk.mjs';
import {
  fromElkGraph,
  MILESTONE_NODE_SIZE,
  TASK_NODE_SIZE,
  toElkGraph,
  type DagDirection,
  type LaidOutEdge,
  type LaidOutNode,
  type LayoutInput,
} from './graph-layout.mjs';
import type { Point } from './pan-zoom.mjs';

const task = (id: string, x: number, y: number): LaidOutNode =>
  ({ id: `task:${id}`, kind: 'task', x, y, ...TASK_NODE_SIZE }) as const;

const milestone = (id: string, x: number, y: number): LaidOutNode =>
  ({
    id: `milestone:${id}`,
    kind: 'milestone',
    x,
    y,
    ...MILESTONE_NODE_SIZE,
  }) as const;

const edge = (from: GraphNodeId, to: GraphNodeId, label = ''): LaidOutEdge =>
  ({ id: `${to}<${from}`, from, to, label }) as const;

/** Points along every segment, no more than about a pixel apart. */
const samples = (segments: readonly CubicSegment[]): readonly Point[] =>
  segments.flatMap((segment) => {
    const { start, control1, control2, end } = segment;

    const reach =
      Math.hypot(control1.x - start.x, control1.y - start.y) +
      Math.hypot(control2.x - control1.x, control2.y - control1.y) +
      Math.hypot(end.x - control2.x, end.y - control2.y);

    const count = Math.max(2, Math.ceil(reach));

    return Array.from({ length: count + 1 }, (_, index) =>
      cubicPoint(segment, Num.div(index, asPositiveInt(count))),
    );
  });

const inside = (point: Point, node: LaidOutNode, margin: number): boolean =>
  node.x - margin < point.x &&
  point.x < node.x + node.width + margin &&
  node.y - margin < point.y &&
  point.y < node.y + node.height + margin;

/** The nodes, other than its own two, that a sample of `geometry` is in. */
const nodesRunThrough = (
  geometry: EdgeGeometry,
  nodes: readonly LaidOutNode[],
): readonly GraphNodeId[] => {
  const points = samples(geometry.segments);

  return nodes
    .filter(
      (node) =>
        node.id !== geometry.from &&
        node.id !== geometry.to &&
        points.some((point) => inside(point, node, OBSTACLE_MARGIN)),
    )
    .map(({ id }) => id);
};

const assertClear = (
  geometries: readonly EdgeGeometry[],
  nodes: readonly LaidOutNode[],
  context: string,
): void => {
  for (const geometry of geometries) {
    const edgeName = `${context}: ${geometry.id}` as const;

    assert.deepStrictEqual(
      { edgeName, through: nodesRunThrough(geometry, nodes) },
      { edgeName, through: [] },
    );
  }
};

/** The unit direction of `to - from` on each axis: -1, 0 or 1. */
const signs = (from: Point, to: Point): Point =>
  ({
    x: Math.sign(Math.round((to.x - from.x) * 1e6)),
    y: Math.sign(Math.round((to.y - from.y) * 1e6)),
  }) as const;

/** Every curve leaves and arrives along the direction of growth. */
const assertPerpendicularEnds = (
  geometries: readonly EdgeGeometry[],
  direction: DagDirection,
  context: string,
): void => {
  const along =
    direction === 'right'
      ? ({ x: 1, y: 0 } as const)
      : ({ x: 0, y: 1 } as const);

  for (const geometry of geometries) {
    const first = geometry.segments[0];

    const last = geometry.segments.at(-1) ?? first;

    const edgeName = `${context}: ${geometry.id}` as const;

    assert.deepStrictEqual(
      {
        edgeName,
        ends: [
          signs(first.start, first.control1),
          signs(last.control2, last.end),
        ],
      },
      { edgeName, ends: [along, along] },
    );
  }
};

/** Whether the path is one piece: each segment starts where the last ended. */
const assertContinuous = (geometry: EdgeGeometry): void => {
  for (const [index, next] of geometry.segments.entries()) {
    const previous = geometry.segments[index - 1] ?? next;

    assert.deepStrictEqual(
      { id: geometry.id, start: next.start },
      { id: geometry.id, start: index === 0 ? next.start : previous.end },
    );
  }
};

/**
 * For the tests that route many edges: room for a slow machine, not a bound
 * on how fast routing is.
 */
const HEAVY_TEST_TIMEOUT_MS = 30_000;

/** A deterministic stream of numbers in [0, 1) (mulberry32). */
const seeded = (seed: number): (() => number) => {
  let mut_state = seed >>> 0;

  return () => {
    mut_state = (mut_state + 0x6d_2b_79_f5) >>> 0;

    let mut_t = mut_state;

    mut_t = Math.imul(mut_t ^ (mut_t >>> 15), mut_t | 1);

    mut_t ^= mut_t + Math.imul(mut_t ^ (mut_t >>> 7), mut_t | 61);

    return ((mut_t ^ (mut_t >>> 14)) >>> 0) / 4_294_967_296;
  };
};

/**
 * Nodes scattered over a grid of cells, at most one to a cell and at least
 * 48 apart, with edges between them in every direction — forwards,
 * backwards, across — as a hand-made arrangement can have.
 */
const scattered = (
  seed: number,
  count: number,
  edgeChance: number,
): Readonly<{
  nodes: readonly LaidOutNode[];
  edges: readonly LaidOutEdge[];
}> => {
  const random = seeded(seed);

  const columns = Math.ceil(Math.sqrt(count * 2));

  const cells = Array.from({ length: columns ** 2 }, (_, cell) => ({
    cell,
    key: random(),
  }))
    .toSorted((a, b) => a.key - b.key)
    .slice(0, count)
    .map(({ cell }) => cell);

  const nodes = cells.map((cell, index) => {
    const x = (cell % columns) * 260 + Math.floor(random() * 28);

    const y =
      Math.floor(Num.div(cell, asPositiveInt(columns))) * 130 +
      Math.floor(random() * 20);

    return random() < 0.25
      ? milestone(`n${index}`, x, y)
      : task(`n${index}`, x, y);
  });

  const edges = nodes.flatMap((from, i) =>
    nodes
      .filter((_, j) => j > i && random() < edgeChance)
      .map((to) =>
        random() < 0.5 ? edge(from.id, to.id) : edge(to.id, from.id),
      ),
  );

  return { nodes, edges };
};

/**
 * `count` nodes and `edgeCount` edges, each from a node to one up to a dozen
 * after it, for ELK to lay out.
 */
const layeredGraph = (
  seed: number,
  count: number,
  edgeCount: number,
): LayoutInput => {
  const random = seeded(seed);

  const nodes = Array.from({ length: count }, (_, index) =>
    random() < 0.2
      ? ({
          id: `milestone:${index}`,
          kind: 'milestone',
          ...MILESTONE_NODE_SIZE,
        } as const)
      : ({ id: `task:${index}`, kind: 'task', ...TASK_NODE_SIZE } as const),
  );

  const pairs = Array.from({ length: edgeCount * 4 }, () => {
    const from = Math.floor(random() * count);

    return [from, from + 1 + Math.floor(random() ** 2 * 12)] as const;
  });

  // Each pair once.
  const unique = new Map(
    pairs
      .filter(([, to]) => to < count)
      .map((pair) => [`${pair[0]} ${pair[1]}`, pair] as const),
  );

  const edges = Array.from(unique.values())
    .slice(0, edgeCount)
    .flatMap(([fromIndex, toIndex]) => {
      const from = nodes[fromIndex];

      const to = nodes[toIndex];

      return from === undefined || to === undefined
        ? []
        : [edge(from.id, to.id, random() < 0.2 ? 'SS +1日' : '')];
    });

  return { direction: 'right', nodes, edges };
};

/** Three tasks: A before B, and C after both. */
const repro = (direction: DagDirection): LayoutInput =>
  ({
    direction,
    nodes: ['a', 'b', 'c'].map(
      (id) => ({ id: `task:${id}`, kind: 'task', ...TASK_NODE_SIZE }) as const,
    ),
    edges: [
      edge('task:a', 'task:b'),
      edge('task:a', 'task:c'),
      edge('task:b', 'task:c'),
    ],
  }) as const;

describe(routeEdges, () => {
  describe('A → B, A → C, B → C', () => {
    test.each(['right', 'down'] as const)(
      'runs no edge through B, laid out by ELK (%s)',
      async (direction) => {
        const input = repro(direction);

        const { nodes, edges } = fromElkGraph(
          input,
          await layoutWithElk(toElkGraph(input)),
        );

        const geometries = routeEdges(direction, nodes, edges);

        assert.strictEqual(geometries.length, 3);

        assertClear(geometries, nodes, direction);

        assertPerpendicularEnds(geometries, direction, direction);
      },
    );

    test('goes round B when the three are in a line', () => {
      const nodes = [
        task('a', 0, 0),
        task('b', 260, 0),
        task('c', 520, 0),
      ] as const;

      const edges = [
        edge('task:a', 'task:b'),
        edge('task:a', 'task:c'),
        edge('task:b', 'task:c'),
      ] as const;

      // The curve alone would go straight through B.
      assert.deepStrictEqual(
        edgeGeometries('right', nodes, edges).map((geometry) =>
          nodesRunThrough(geometry, nodes),
        ),
        [[], ['task:b'], []],
      );

      const geometries = routeEdges('right', nodes, edges);

      assertClear(geometries, nodes, 'in a line');

      assertPerpendicularEnds(geometries, 'right', 'in a line');

      assert.deepStrictEqual(
        geometries.map(({ routed }) => routed),
        [false, true, false],
      );

      const [, around] = geometries;

      assert.isDefined(around);

      assertContinuous(around);

      // From A's right side to C's left side.
      assert.strictEqual(around.segments[0].start.x, 184);

      assert.strictEqual(around.segments.at(-1)?.end.x, 520);
    });
  });

  test('keeps the curve of every edge that runs through no node', () => {
    const nodes = [
      task('a', 0, 0),
      task('b', 260, -100),
      milestone('m', 260, 100),
      task('c', 520, 0),
    ] as const;

    const edges = [
      edge('task:a', 'task:b', 'SS'),
      edge('task:a', 'milestone:m'),
      edge('task:b', 'task:c'),
      edge('milestone:m', 'task:c', '+1日'),
    ] as const;

    assert.deepStrictEqual(
      routeEdges('right', nodes, edges),
      edgeGeometries('right', nodes, edges),
    );
  });

  test('keeps the curves that need no routing beside one that does', () => {
    const nodes = [
      task('a', 0, 0),
      task('b', 260, 0),
      task('c', 520, 0),
    ] as const;

    const edges = [
      edge('task:a', 'task:b'),
      edge('task:a', 'task:c', 'SS'),
      edge('task:b', 'task:c'),
    ] as const;

    const simple = edgeGeometries('right', nodes, edges);

    const routed = routeEdges('right', nodes, edges);

    assert.deepStrictEqual(routed[0], simple[0]);

    assert.deepStrictEqual(routed[2], simple[2]);

    // The label of the routed one sits on its path.
    const labelBox = routed[1]?.labelBox;

    assert.isDefined(labelBox);

    const centre = {
      x: labelBox.x + labelBox.width / 2,
      y: labelBox.y + labelBox.height / 2,
    } as const;

    const nearest = Math.min(
      ...samples(routed[1]?.segments ?? []).map((point) =>
        Math.hypot(point.x - centre.x, point.y - centre.y),
      ),
    );

    assert.isBelow(nearest, 2);
  });

  test('routes round nodes in the way, growing down', () => {
    const nodes = [
      task('a', 0, 0),
      milestone('m', 8, 130),
      task('b', 0, 260),
      task('c', 0, 390),
    ] as const;

    const edges = [
      edge('task:a', 'milestone:m'),
      edge('task:a', 'task:c'),
      edge('milestone:m', 'task:b'),
      edge('task:b', 'task:c'),
    ] as const;

    const geometries = routeEdges('down', nodes, edges);

    assert.isTrue(geometries.some(({ routed }) => routed));

    assertClear(geometries, nodes, 'down');

    assertPerpendicularEnds(geometries, 'down', 'down');

    for (const geometry of geometries) {
      assertContinuous(geometry);
    }
  });

  test('squeezes between nodes put too close for the usual margin', () => {
    // 20 apart: no room for the usual lanes, room for narrower ones.
    const nodes = [
      task('a', 0, 0),
      task('b', 204, 0),
      task('c', 408, 0),
    ] as const;

    const edges = [
      edge('task:a', 'task:b'),
      edge('task:a', 'task:c'),
      edge('task:b', 'task:c'),
    ] as const;

    const geometries = routeEdges('right', nodes, edges);

    const [, around] = geometries;

    assert.isDefined(around);

    assert.isTrue(around.routed);

    // Clear of B itself, if not by the whole margin.
    assert.isFalse(
      samples(around.segments).some((point) =>
        nodes.some(
          (node) =>
            node.id === 'task:b' &&
            node.x < point.x &&
            point.x < node.x + node.width &&
            node.y < point.y &&
            point.y < node.y + node.height,
        ),
      ),
    );

    assertPerpendicularEnds(geometries, 'right', 'squeezed');

    assertContinuous(around);
  });

  // Two hundred and forty routings, which on a busy machine can outlast
  // Vitest's default timeout.
  test(
    'clears every node in many arrangements, in both directions',
    {
      timeout: HEAVY_TEST_TIMEOUT_MS,
    },
    () => {
      for (const seed of Array.from({ length: 120 }, (_, index) => index + 1)) {
        const { nodes, edges } = scattered(seed, 6 + (seed % 9), 0.3);

        for (const direction of ['right', 'down'] as const) {
          const context = `seed ${seed} ${direction}` as const;

          const geometries = routeEdges(direction, nodes, edges);

          assert.deepStrictEqual(
            { context, count: geometries.length },
            { context, count: edges.length },
          );

          assertClear(geometries, nodes, context);

          assertPerpendicularEnds(geometries, direction, context);

          for (const geometry of geometries) {
            assertContinuous(geometry);
          }
        }
      }
    },
  );

  test('is deterministic, whatever the order of the edges', () => {
    const { nodes, edges } = scattered(7, 14, 0.3);

    const first = routeEdges('right', nodes, edges);

    assert.deepStrictEqual(routeEdges('right', nodes, edges), first);

    const reordered = routeEdges('right', nodes, edges.toReversed());

    assert.deepStrictEqual(reordered.toReversed(), first);
  });

  // How fast it is (about 10 ms a call on a desktop) is not asserted: a
  // wall-clock bound fails on a busy machine and says nothing about the code.
  // `dag-canvas.tsx` falls back when a drag frame is slow instead.
  test('routes a hundred nodes and 150 edges laid out by ELK', async () => {
    const input = layeredGraph(1, 100, 150);

    const { nodes, edges } = fromElkGraph(
      input,
      await layoutWithElk(toElkGraph(input)),
    );

    const geometries = routeEdges('right', nodes, edges);

    assertClear(geometries, nodes, 'laid out');

    // Some edges skip layers past nodes.
    assert.isAbove(geometries.filter(({ routed }) => routed).length, 10);
  });

  test(
    'routes 150 edges crossing a hundred scattered nodes',
    {
      timeout: HEAVY_TEST_TIMEOUT_MS,
    },
    () => {
      const { nodes, edges } = scattered(42, 100, 0.031);

      assert.isAbove(edges.length, 120);

      assertClear(routeEdges('right', nodes, edges), nodes, 'scattered');
    },
  );
});

describe(withCurvesOf, () => {
  test('swaps in the curves of the edges of one node only', () => {
    const nodes = [
      task('a', 0, 0),
      task('b', 260, 0),
      task('c', 520, 0),
    ] as const;

    const edges = [
      edge('task:a', 'task:b'),
      edge('task:a', 'task:c'),
      edge('task:b', 'task:c'),
    ] as const;

    const settled = routeEdges('right', nodes, edges);

    const moved = nodes.map((node) =>
      node.id === 'task:c' ? { ...node, y: 300 } : node,
    );

    const curves = edgeGeometries('right', moved, edges);

    assert.deepStrictEqual<readonly (EdgeGeometry | undefined)[]>(
      withCurvesOf(settled, curves, 'task:c'),
      [settled[0], curves[1], curves[2]],
    );
  });
});
