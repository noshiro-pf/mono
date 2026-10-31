/**
 * The lasso: a loop drawn on the canvas round the nodes to select. A node is in
 * it when its centre is, so that a loop drawn loosely round a node takes it,
 * and one that only clips its corner does not. Everything is in content
 * coordinates; the loop is closed from its last point back to its first.
 * A rectangle (`rectangleLoop`) is a loop of its four corners, and selects the
 * same way.
 */

import { Arr, Num } from 'ts-data-forge';
import type { GraphNodeId } from '../domain/index.mjs';
import type { LaidOutNode } from './graph-layout.mjs';
import type { Point } from './pan-zoom.mjs';

/** The nodes, of `nodes` and in their order, whose centre `loop` encloses. */
export const nodesInLasso = (
  nodes: readonly LaidOutNode[],
  loop: readonly Point[],
): readonly GraphNodeId[] =>
  loop.length < 3
    ? ([] as const)
    : nodes
        .filter((node) =>
          encloses(loop, {
            x: node.x + node.width / 2,
            y: node.y + node.height / 2,
          }),
        )
        .map(({ id }) => id);

/** The loop round the rectangle with `a` and `b` at opposite corners. */
export const rectangleLoop = (a: Point, b: Point): readonly Point[] =>
  [
    { x: a.x, y: a.y },
    { x: b.x, y: a.y },
    { x: b.x, y: b.y },
    { x: a.x, y: b.y },
  ] as const;

/** The SVG path of `loop`, closed; empty for no points. */
export const lassoPathData = (loop: readonly Point[]): string =>
  Arr.isEmpty(loop)
    ? ''
    : (`${loop.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')} Z` as const);

/**
 * Whether `point` is inside `polygon`, by the even-odd rule: a ray from it to
 * the right crosses the outline an odd number of times.
 */
const encloses = (polygon: readonly Point[], point: Point): boolean =>
  polygon.reduce((inside, a, index) => {
    const b = polygon[(index + 1) % polygon.length] ?? a;

    const dy = b.y - a.y;

    const crosses =
      a.y > point.y !== b.y > point.y &&
      Num.isNonZero(dy) &&
      point.x < a.x + Num.div((point.y - a.y) * (b.x - a.x), dy);

    return crosses ? !inside : inside;
  }, false);
