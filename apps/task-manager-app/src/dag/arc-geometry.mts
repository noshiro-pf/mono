/**
 * The arcs of the arc diagram as curves: from the right side of the task
 * depended on to the right side of the task that waits, bulging to the
 * right, as in a classic arc diagram with its nodes in a column.
 *
 * Each arc is one cubic Bézier curve whose control points lie level with its
 * ends, {@link ARC_BULGE} times the vertical distance to their right: it
 * leaves and arrives horizontally — at right angles to the side — so the
 * arrowhead, which follows the last tangent, points straight into the
 * target, and it approximates a semicircle on the line between its ends.
 *
 * Every arc at a node meets its right side at its own point, spread along
 * it in an order that nests the arcs on each side rather than crossing them
 * (`compareSlots`). Arcs whose spans overlap without one taking in the other
 * still cross, as they must. The longest come first, so that drawn in order
 * the short ones stay on top and visible.
 */

import { Num } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import type { GraphNodeId } from '../domain/index.mjs';
import type { ArcEdge } from './arc-edges.mjs';
import { nodesBounds, type Bounds } from './dag-layout.mjs';
import {
  centredBox,
  cubicPoint,
  pathOf,
  type CubicSegment,
} from './edge-geometry.mjs';
import { labelSize, type LaidOutNode } from './graph-layout.mjs';
import type { Point, Size } from './pan-zoom.mjs';

/**
 * How far right the control points are, as a share of the vertical distance
 * between the ends. A cubic whose control points are `h` out from ends level
 * with them reaches `3h / 4` at its middle; `2 / 3` makes that half the
 * distance — the radius of the semicircle on it, which this is the usual
 * one-curve approximation of.
 */
export const ARC_BULGE = 2 / 3;

/** The least `h`, so that an arc between adjacent tasks still reads as one. */
export const MIN_ARC_BULGE = 24;

/**
 * Every arc of `edges` both of whose tasks are among `nodes`, the longest
 * first.
 */
export const arcGeometries = (
  nodes: readonly LaidOutNode[],
  edges: readonly ArcEdge[],
): readonly ArcGeometry[] => {
  const byId = new Map(nodes.map((node) => [node.id, node]));

  const placed = edges.flatMap((edge) => {
    const from = byId.get(edge.from);

    const to = byId.get(edge.to);

    return from === undefined || to === undefined ? [] : [{ edge, from, to }];
  });

  const ends = placed.flatMap(({ edge, from, to }) => [
    { edgeId: edge.id, node: from, other: to },
    { edgeId: edge.id, node: to, other: from },
  ]);

  const slots = new Map(
    Array.from(Map.groupBy(ends, ({ node }) => node.id).values()).flatMap(
      (group) =>
        group
          .toSorted(compareSlots)
          .map(
            ({ edgeId, node }, index) =>
              [
                slotKey(edgeId, node.id),
                rightSidePoint(node, index, group.length),
              ] as const,
          ),
    ),
  );

  return placed
    .map(({ edge, from, to }): ArcGeometry => {
      const start = slots.get(slotKey(edge.id, from.id)) ?? centreRight(from);

      const end = slots.get(slotKey(edge.id, to.id)) ?? centreRight(to);

      const span = Math.abs(end.y - start.y);

      const bulge = Math.max(MIN_ARC_BULGE, ARC_BULGE * span);

      const segment: CubicSegment = {
        start,
        control1: { x: start.x + bulge, y: start.y },
        control2: { x: end.x + bulge, y: end.y },
        end,
      } as const;

      const apex = cubicPoint(segment, 0.5);

      return {
        id: edge.id,
        from: edge.from,
        to: edge.to,
        derived: edge.derived,
        label: edge.label,
        ariaLabel: edge.ariaLabel,
        segment,
        path: pathOf([segment]),
        apex,
        labelBox:
          edge.label === ''
            ? undefined
            : centredBox(apex, labelSize(edge.label)),
        span,
      };
    })
    .toSorted((a, b) =>
      a.span !== b.span
        ? b.span - a.span
        : a.id < b.id
          ? -1
          : a.id > b.id
            ? 1
            : 0,
    );
};

/**
 * The box around the column and the arcs beside it, labels included,
 * `margin` wider on each side.
 */
export const arcContentBounds = (
  nodes: readonly LaidOutNode[],
  arcs: readonly ArcGeometry[],
  margin: number,
): Bounds => {
  const column = nodesBounds(nodes, 0);

  const right = Math.max(
    column.x + column.width,
    ...arcs.map(({ apex, labelBox }) =>
      labelBox === undefined
        ? apex.x
        : Math.max(apex.x, labelBox.x + labelBox.width),
    ),
  );

  return {
    x: column.x - margin,
    y: column.y - margin,
    width: right - column.x + 2 * margin,
    height: column.height + 2 * margin,
  };
};

export type ArcGeometry = DeepReadonly<{
  id: string;
  from: GraphNodeId;
  to: GraphNodeId;
  derived: boolean;
  label: string;
  ariaLabel: string;
  /** From the source's right side to the target's. */
  segment: CubicSegment;
  /** `segment` as the `d` of an SVG path. */
  path: string;
  /** The middle of the curve, and its point furthest right. */
  apex: Point;
  /** Centred on the apex; `undefined` for no label. */
  labelBox: (Point & Size) | undefined;
  /** The vertical distance between the ends. */
  span: number;
}>;

type SlotEnd = Readonly<{
  edgeId: string;
  node: LaidOutNode;
  other: LaidOutNode;
}>;

const slotKey = (edgeId: string, node: GraphNodeId): string =>
  `${edgeId} ${node}` as const;

/**
 * Down a node's right side: the arcs to nodes above it, nearest first, then
 * the arcs to nodes below it, farthest first. On each side a longer arc then
 * meets the node nearer the middle than a shorter one, which keeps it
 * outside the shorter. That is the order of `1 / dy`, where `dy` is how far
 * below the node the other end is; ties — two arcs to one node — go by id.
 */
const compareSlots = (a: SlotEnd, b: SlotEnd): number => {
  const byOther = inverse(offsetOf(a)) - inverse(offsetOf(b));

  return byOther !== 0
    ? byOther
    : a.edgeId < b.edgeId
      ? -1
      : a.edgeId > b.edgeId
        ? 1
        : 0;
};

const offsetOf = ({ node, other }: SlotEnd): number =>
  other.y + other.height / 2 - (node.y + node.height / 2);

/** `1 / x`, and `0` — between the negatives and the positives — for `0`. */
const inverse = (x: number): number => (Num.isNonZero(x) ? Num.div(1, x) : 0);

/** The `index`th of `count` points evenly spread down `node`'s right side. */
const rightSidePoint = (
  node: LaidOutNode,
  index: number,
  count: number,
): Point => {
  const places = count + 1;

  return {
    x: node.x + node.width,
    y:
      node.y +
      (Num.isNonZero(places)
        ? Num.div(node.height * (index + 1), places)
        : node.height / 2),
  };
};

const centreRight = (node: LaidOutNode): Point => rightSidePoint(node, 0, 1);
