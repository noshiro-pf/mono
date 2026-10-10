import { type GraphNodeId } from '../domain/index.mjs';
import { type ArcEdge } from './arc-edges.mjs';
import {
  ARC_BULGE,
  arcContentBounds,
  arcGeometries,
  MIN_ARC_BULGE,
  type ArcGeometry,
} from './arc-geometry.mjs';
import { cubicPoint } from './edge-geometry.mjs';
import { type LaidOutNode } from './graph-layout.mjs';

const WIDTH = 100;

const HEIGHT = 40;

const STEP = 60;

/** Tasks `task:0`, `task:1`, … down a column at x = 0, `STEP` apart. */
const column = (count: number): readonly LaidOutNode[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `task:${index}` as const,
    kind: 'task' as const,
    x: 0,
    y: index * STEP,
    width: WIDTH,
    height: HEIGHT,
  }));

const edge = (
  from: number,
  to: number,
  options: Readonly<{ derived?: boolean; label?: string }> = {},
): ArcEdge =>
  ({
    id: `${from}-${to}`,
    from: `task:${from}`,
    to: `task:${to}`,
    derived: options.derived ?? false,
    label: options.label ?? '',
    via: [],
    ariaLabel: `${from} → ${to}`,
  }) as const;

const byId = (
  arcs: readonly ArcGeometry[],
  id: string,
): ArcGeometry | undefined => arcs.find((arc) => arc.id === id);

/** Where the arc meets the node `id`: its start or its end. */
const endAt = (arc: ArcGeometry, id: GraphNodeId): number =>
  arc.from === id ? arc.segment.start.y : arc.segment.end.y;

describe(arcGeometries, () => {
  test('leaves the source’s right side and enters the target’s', () => {
    const nodes = column(3);

    const [arc] = arcGeometries(nodes, [edge(0, 2)]);

    assert.isDefined(arc);

    const { start, end } = arc.segment;

    assert.strictEqual(start.x, WIDTH);

    assert.strictEqual(end.x, WIDTH);

    assert.isAbove(start.y, 0);

    assert.isBelow(start.y, HEIGHT);

    assert.isAbove(end.y, 2 * STEP);

    assert.isBelow(end.y, 2 * STEP + HEIGHT);
  });

  test('leaves and arrives horizontally, bulging to the right', () => {
    for (const [from, to] of [
      [0, 3],
      [3, 0],
    ] as const) {
      const [arc] = arcGeometries(column(4), [edge(from, to)]);

      assert.isDefined(arc);

      const { start, control1, control2, end } = arc.segment;

      // Out to the right of the source, and into the target from the right:
      // the last tangent, `end - control2`, points left.
      assert.strictEqual(control1.y, start.y);

      assert.isAbove(control1.x, start.x);

      assert.strictEqual(control2.y, end.y);

      assert.isAbove(control2.x, end.x);

      assert.isAbove(arc.apex.x, WIDTH);
    }
  });

  test('bulges about half the vertical distance, which is the k chosen', () => {
    assert.closeTo(ARC_BULGE, 2 / 3, 1e-12);

    const [arc] = arcGeometries(column(6), [edge(0, 5)]);

    assert.isDefined(arc);

    const dy = Math.abs(arc.segment.end.y - arc.segment.start.y);

    assert.closeTo(arc.apex.x - WIDTH, dy / 2, 1e-9);

    // The apex is the curve's middle, and its rightmost point.
    assert.deepStrictEqual(arc.apex, cubicPoint(arc.segment, 0.5));

    assert.isAtMost(cubicPoint(arc.segment, 0.3).x, arc.apex.x);

    assert.isAtMost(cubicPoint(arc.segment, 0.7).x, arc.apex.x);
  });

  test('bulges further the further apart the ends are', () => {
    const arcs = arcGeometries(column(6), [edge(0, 1), edge(0, 3), edge(0, 5)]);

    const reach = (id: string): number => byId(arcs, id)?.apex.x ?? 0;

    assert.isBelow(reach('0-1'), reach('0-3'));

    assert.isBelow(reach('0-3'), reach('0-5'));
  });

  test('bulges at least a little between adjacent tasks', () => {
    const [arc] = arcGeometries(column(2), [edge(0, 1)]);

    assert.isDefined(arc);

    assert.isAtLeast(arc.segment.control1.x - WIDTH, MIN_ARC_BULGE);
  });

  test('spreads the ends along the side so that the arcs nest', () => {
    // From the middle node to two above and two below.
    const arcs = arcGeometries(column(5), [
      edge(2, 0),
      edge(2, 1),
      edge(2, 3),
      edge(2, 4),
    ]);

    const order = arcs
      .map((arc) => ({ id: arc.id, y: endAt(arc, 'task:2') }))
      .toSorted((a, b) => a.y - b.y)
      .map(({ id }) => id);

    // Above first, the nearer higher; then below, the farther higher — each
    // longer arc outside the shorter one on the same side.
    assert.deepStrictEqual(order, ['2-1', '2-0', '2-4', '2-3']);

    const ys = arcs.map((arc) => endAt(arc, 'task:2'));

    assert.isTrue(ys.every((y) => 2 * STEP < y && y < 2 * STEP + HEIGHT));

    const unique = new Set(ys);

    assert.strictEqual(unique.size, ys.length);
  });

  test('nests an arc inside a longer one that spans it', () => {
    const arcs = arcGeometries(column(4), [edge(0, 3), edge(0, 2), edge(1, 3)]);

    const outer = byId(arcs, '0-3');

    const inner = byId(arcs, '0-2');

    assert.isDefined(outer);

    assert.isDefined(inner);

    // Both go down from node 0, so the longer, outside, leaves above the
    // shorter one, and its span takes the shorter one's in.
    assert.isBelow(outer.segment.start.y, inner.segment.start.y);

    assert.isAbove(outer.segment.end.y, inner.segment.end.y);

    assert.isAbove(outer.apex.x, inner.apex.x);
  });

  test('draws the longest arcs first, behind the short ones', () => {
    const arcs = arcGeometries(column(6), [edge(0, 1), edge(0, 5), edge(2, 4)]);

    assert.deepStrictEqual(
      arcs.map(({ id }) => id),
      ['0-5', '2-4', '0-1'],
    );

    assert.isTrue(
      arcs.every(
        (arc, index) => index === 0 || (arcs[index - 1]?.span ?? 0) >= arc.span,
      ),
    );
  });

  test('labels the apex, and only a labelled arc', () => {
    const arcs = arcGeometries(column(4), [
      edge(0, 3, { label: 'SS +3日' }),
      edge(1, 2, { derived: true }),
    ]);

    const labelled = byId(arcs, '0-3');

    assert.isDefined(labelled?.labelBox);

    const box = labelled.labelBox;

    assert.closeTo(box.x + box.width / 2, labelled.apex.x, 1e-9);

    assert.closeTo(box.y + box.height / 2, labelled.apex.y, 1e-9);

    const derived = byId(arcs, '1-2');

    assert.strictEqual(derived?.derived, true);

    assert.isUndefined(derived?.labelBox);
  });

  test('keeps the edge’s ends, kind and names', () => {
    const [arc] = arcGeometries(column(2), [edge(1, 0, { derived: true })]);

    assert.strictEqual(arc?.from, 'task:1');

    assert.strictEqual(arc?.to, 'task:0');

    assert.strictEqual(arc?.derived, true);

    assert.strictEqual(arc?.ariaLabel, '1 → 0');

    assert.match(arc?.path ?? '', /^M [\d.]+ [\d.]+ C /u);
  });

  test('drops an edge whose node is not drawn', () => {
    assert.deepStrictEqual(arcGeometries(column(2), [edge(0, 7)]), []);
  });
});

describe(arcContentBounds, () => {
  test('takes in the column and the widest arc and its label', () => {
    const nodes = column(6);

    const arcs = arcGeometries(nodes, [
      edge(0, 1),
      edge(0, 5, { label: 'SS +3日' }),
    ]);

    const wide = byId(arcs, '0-5');

    assert.isDefined(wide?.labelBox);

    const bounds = arcContentBounds(nodes, arcs, 10);

    assert.strictEqual(bounds.x, -10);

    assert.strictEqual(bounds.y, -10);

    assert.strictEqual(bounds.height, 5 * STEP + HEIGHT + 20);

    assert.closeTo(
      bounds.x + bounds.width,
      wide.labelBox.x + wide.labelBox.width + 10,
      1e-9,
    );
  });

  test('is the column alone without arcs', () => {
    assert.deepStrictEqual(arcContentBounds(column(2), [], 0), {
      x: 0,
      y: 0,
      width: WIDTH,
      height: STEP + HEIGHT,
    });
  });
});
