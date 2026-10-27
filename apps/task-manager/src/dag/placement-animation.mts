/**
 * The geometry of the DAG's placement animation: the nodes move in a short
 * tween to where they are put — from a plain grid, in the order they were
 * made, when the DAG is first shown, and from where they were after
 * 「自動整列」 or a layout saved elsewhere arriving. When it plays is the
 * store's (`dag-layout-store.mts`); this is where each node is at a time.
 */

import { Num } from 'ts-data-forge';
import type { GraphNodeId } from '../domain/index.mjs';
import type { Bounds } from './dag-layout.mjs';
import type { DagDirection, LaidOutNode } from './graph-layout.mjs';
import type { Point } from './pan-zoom.mjs';

/** How long the nodes take to reach their places. */
export const PLACEMENT_ANIMATION_MS = 700;

/**
 * `nodes`, in the order given, in a grid about the shape of `frame` and
 * centred on it: along the rows when the graph grows to the right, down the
 * columns when it grows down.
 */
export const initialGridPositions = (
  nodes: readonly LaidOutNode[],
  direction: DagDirection,
  frame: Bounds,
): ReadonlyMap<GraphNodeId, Point> => {
  const cellWidth = Math.max(0, ...nodes.map(({ width }) => width)) + GRID_GAP;

  const cellHeight =
    Math.max(0, ...nodes.map(({ height }) => height)) + GRID_GAP;

  // As many more columns than rows as the frame has room for.
  const shape = ratio(frame.width * cellHeight, frame.height * cellWidth, 1);

  const columns = Num.clamp(
    Math.round(Math.sqrt(nodes.length * shape)),
    1,
    Math.max(1, nodes.length),
  );

  const rows = Math.max(1, Math.ceil(ratio(nodes.length, columns)));

  const left = frame.x + (frame.width - columns * cellWidth) / 2;

  const upper = frame.y + (frame.height - rows * cellHeight) / 2;

  return new Map(
    nodes.map((node, index) => {
      const column =
        direction === 'right'
          ? index % columns
          : Math.floor(ratio(index, rows));

      const row =
        direction === 'right'
          ? Math.floor(ratio(index, columns))
          : index % rows;

      return [
        node.id,
        {
          x: left + column * cellWidth + (cellWidth - node.width) / 2,
          y: upper + row * cellHeight + (cellHeight - node.height) / 2,
        },
      ] as const;
    }),
  );
};

/** Fast at first and slowing to a stop, from 0 at 0 to 1 at 1. */
export const easeOutCubic = (t: number): number =>
  1 - (1 - Num.clamp(t, 0, 1)) ** 3;

/**
 * Each node of `to` a share `t` of the way there from where it is in
 * `from`; a node not in `from` is already there.
 */
export const interpolatePositions = (
  from: ReadonlyMap<GraphNodeId, Point>,
  to: ReadonlyMap<GraphNodeId, Point>,
  t: number,
): ReadonlyMap<GraphNodeId, Point> =>
  new Map(
    Array.from(to, ([id, end]) => {
      const start = from.get(id) ?? end;

      return [
        id,
        {
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
        },
      ] as const;
    }),
  );

/**
 * The opacity of each node of `to` a share `t` of the way there from what it
 * is in `from`; a node not in `from` is already there. For the nodes a view
 * mode does not show, which fade out of it and into the next.
 */
export const interpolateOpacities = (
  from: ReadonlyMap<GraphNodeId, number>,
  to: ReadonlyMap<GraphNodeId, number>,
  t: number,
): ReadonlyMap<GraphNodeId, number> =>
  new Map(
    Array.from(to, ([id, end]) => {
      const start = from.get(id) ?? end;

      return [id, start + (end - start) * t] as const;
    }),
  );

/** Whether `a` and `b` put the same nodes in the same places. */
export const samePositions = (
  a: ReadonlyMap<GraphNodeId, Point>,
  b: ReadonlyMap<GraphNodeId, Point>,
): boolean =>
  a.size === b.size &&
  Array.from(a).every(([id, { x, y }]) => {
    const other = b.get(id);

    return other?.x === x && other.y === y;
  });

/** Between two cells of the grid. */
const GRID_GAP = 32;

/** `a / b`, or `whenZero` for a zero `b`. */
const ratio = (a: number, b: number, whenZero: number = 0): number =>
  Num.isNonZero(b) ? Num.div(a, b) : whenZero;
