import { edgeGeometries } from './edge-geometry.mjs';
import { LABEL_CLEARANCE, placeLabels } from './edge-labels.mjs';
import {
  TASK_NODE_SIZE,
  type LaidOutEdge,
  type LaidOutNode,
} from './graph-layout.mjs';
import type { Point, Size } from './pan-zoom.mjs';

const task = (id: string, x: number, y: number): LaidOutNode =>
  ({ id: `task:${id}`, kind: 'task', x, y, ...TASK_NODE_SIZE }) as const;

const edge = (from: string, to: string, label: string): LaidOutEdge =>
  ({
    id: `task:${to}<task:${from}`,
    from: `task:${from}`,
    to: `task:${to}`,
    label,
  }) as const;

const overlaps = (a: Point & Size, b: Point & Size): boolean =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

describe(placeLabels, () => {
  // A long edge, level, its middle at 500.
  const a = task('a', 0, 0);

  const b = task('b', 820, 0);

  const middleY = TASK_NODE_SIZE.height / 2;

  test('leaves a label in the middle where it covers nothing', () => {
    const geometries = edgeGeometries('right', [a, b], [edge('a', 'b', 'SS')]);

    assert.strictEqual(placeLabels(geometries, [a, b])[0], geometries[0]);
  });

  test('moves a label off a node over the middle of its edge, along the edge', () => {
    // Its lower edge just over the middle of the edge.
    const over = task('c', 440, middleY - TASK_NODE_SIZE.height + 4);

    const nodes = [a, b, over] as const;

    const [placed] = placeLabels(
      edgeGeometries('right', nodes, [edge('a', 'b', 'SS +3日')]),
      nodes,
    );

    const labelBox = placed?.labelBox;

    assert.isDefined(labelBox);

    assert.deepStrictEqual(
      nodes.filter((node) => overlaps(labelBox, node)).map(({ id }) => id),
      [],
    );

    // Still on the edge.
    assert.closeTo(labelBox.y + labelBox.height / 2, middleY, 0.5);
  });

  test('keeps two labels apart', () => {
    // Two edges one over the other, so close that the labels in their
    // middles would overlap.
    const c = task('c', 0, 10);

    const d = task('d', 820, 10);

    const nodes = [a, b, c, d] as const;

    const placed = placeLabels(
      edgeGeometries('right', nodes, [
        edge('a', 'b', 'SS +3日'),
        edge('c', 'd', 'FF +1日'),
      ]),
      nodes,
    );

    const [first, second] = placed.map(({ labelBox }) => labelBox);

    assert.isDefined(first);

    assert.isDefined(second);

    assert.isFalse(
      overlaps({ ...first, width: first.width + LABEL_CLEARANCE }, second),
    );
  });
});
