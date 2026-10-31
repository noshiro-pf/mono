/**
 * Drawing a dependency on the canvas: where on a node's outline the handle an
 * arrow is drawn from appears, and which node an arrow dropped at a point is
 * dropped on. Everything is in content coordinates; `reach` is how far from an
 * outline still counts as on it, which the canvas keeps the same on the screen
 * whatever the zoom. Inside a node that is less, and never more than
 * {@link INSIDE_REACH_SHARE} of its height, so that most of a node is still
 * pressed to move it.
 *
 * A task is taken as its rectangle, its rounded corners square; a milestone as
 * its hexagon, as `dag-milestone-node.tsx` draws it.
 */

import { Arr, Num } from 'ts-data-forge';
import type { GraphNodeId } from '../domain/index.mjs';
import type { LaidOutNode } from './graph-layout.mjs';
import type { Point } from './pan-zoom.mjs';

/** Of a node's height, the most of it inside the outline that is near it. */
export const INSIDE_REACH_SHARE = 1 / 6;

/**
 * The handle for `point`: on the outline of the node it is nearest, at the
 * point of that outline nearest it — or `undefined` when no outline is within
 * `reach`. Of two outlines as near, the node drawn later, which is on top.
 */
export const connectHandleAt = (
  nodes: readonly LaidOutNode[],
  point: Point,
  reach: ConnectReach,
): ConnectHandle | undefined => {
  const near = Arr.generate(function* () {
    for (const node of nodes) {
      const outline = outlineOf(node);

      const onOutline = nearestOnOutline(outline, point);

      const limit = isInside(outline, point)
        ? Math.min(reach.inside, node.height * INSIDE_REACH_SHARE)
        : reach.outside;

      if (onOutline.distance <= limit) {
        yield { id: node.id, ...onOutline };
      }
    }
  });

  if (!Arr.isNonEmpty(near)) {
    return undefined;
  }

  const nearest = near.reduce((best, candidate) =>
    candidate.distance <= best.distance ? candidate : best,
  );

  return { id: nearest.id, at: nearest.at };
};

/**
 * The node an arrow dropped at `point` joins: the one it is inside — the top
 * one, of nodes that overlap — or failing that, the one whose outline is within
 * `reach` of it; `undefined` on the background.
 */
export const dropTargetAt = (
  nodes: readonly LaidOutNode[],
  point: Point,
  reach: ConnectReach,
): GraphNodeId | undefined =>
  nodes.findLast((node) => isInside(outlineOf(node), point))?.id ??
  connectHandleAt(nodes, point, reach)?.id;

/** The corners of `node`'s outline, clockwise from its top left. */
export const outlineOf = (node: LaidOutNode): readonly Point[] => {
  const { x, y, width, height } = node;

  if (node.kind === 'task') {
    return [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
    ] as const;
  }

  const inset = height / 2;

  return [
    { x: x + inset, y },
    { x: x + width - inset, y },
    { x: x + width, y: y + height / 2 },
    { x: x + width - inset, y: y + height },
    { x: x + inset, y: y + height },
    { x, y: y + height / 2 },
  ] as const;
};

/** A node's handle, and where on its outline it is. */
export type ConnectHandle = Readonly<{ id: GraphNodeId; at: Point }>;

/** How far from an outline counts as near it, outside the node and in. */
export type ConnectReach = Readonly<{ outside: number; inside: number }>;

const nearestOnSegment = (
  from: Point,
  to: Point,
  point: Point,
): Readonly<{ at: Point; distance: number }> => {
  const dx = to.x - from.x;

  const dy = to.y - from.y;

  const lengthSquared = dx ** 2 + dy ** 2;

  // How far along the segment, from 0 at `from` to 1 at `to`.
  const t = Num.isNonZero(lengthSquared)
    ? Num.clamp(
        Num.div(
          (point.x - from.x) * dx + (point.y - from.y) * dy,
          lengthSquared,
        ),
        0,
        1,
      )
    : 0;

  const at = { x: from.x + t * dx, y: from.y + t * dy } as const;

  return { at, distance: Math.hypot(point.x - at.x, point.y - at.y) };
};

/** The point of `outline` nearest `point`, and how far that is. */
const nearestOnOutline = (
  outline: readonly Point[],
  point: Point,
): Readonly<{ at: Point; distance: number }> =>
  outline
    .map((corner, index) =>
      nearestOnSegment(
        corner,
        outline[(index + 1) % outline.length] ?? corner,
        point,
      ),
    )
    .reduce(
      (best, candidate) =>
        candidate.distance < best.distance ? candidate : best,
      { at: point, distance: Number.POSITIVE_INFINITY },
    );

/** Whether `point` is inside `polygon`, by the even-odd rule. */
const isInside = (polygon: readonly Point[], point: Point): boolean =>
  polygon.reduce((inside, a, index) => {
    const b = polygon[(index + polygon.length - 1) % polygon.length] ?? a;

    const dy = b.y - a.y;

    const crosses =
      a.y > point.y !== b.y > point.y &&
      Num.isNonZero(dy) &&
      point.x < a.x + Num.div((point.y - a.y) * (b.x - a.x), dy);

    return crosses ? !inside : inside;
  }, false);
