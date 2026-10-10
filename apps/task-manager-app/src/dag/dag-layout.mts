/**
 * The DAG as the reader arranged it: which way it grows, and where each node
 * was put — by dragging it, by the arrow keys, or by 「自動整列」, which puts
 * every node where ELK does. One per project, shared by every device
 * (`projects/{projectId}/settings/dagLayout`).
 *
 * A node is drawn where it was put, and where ELK puts it if it never was:
 * a node added since the last arrangement takes its place in the automatic
 * layout, even if another node is already there.
 */

import { Arr, Num } from 'ts-data-forge';
import { type GraphNodeId } from '../domain/index.mjs';
import { type DagDirection, type LaidOutNode } from './graph-layout.mjs';
import { type Point, type Size } from './pan-zoom.mjs';

/** How far an arrow key moves a node, in graph units, and with Shift. */
export const NUDGE_STEP = 8;

export const NUDGE_STEP_LARGE = 40;

/** Before anybody has chosen: as wide screens and narrow ones read best. */
export const defaultDirection = (narrow: boolean): DagDirection =>
  narrow ? 'down' : 'right';

/** `auto`, each node moved to its stored position if it has one. */
export const placeNodes = (
  auto: readonly LaidOutNode[],
  positions: ReadonlyMap<GraphNodeId, Point>,
): readonly LaidOutNode[] =>
  auto.map((node) => {
    const stored = positions.get(node.id);

    return stored === undefined ? node : { ...node, x: stored.x, y: stored.y };
  });

/** Where each of `nodes` is: what saving the arrangement writes. */
export const positionsOf = (
  nodes: readonly LaidOutNode[],
): ReadonlyMap<GraphNodeId, Point> =>
  new Map(nodes.map(({ id, x, y }) => [id, { x, y }]));

/**
 * Where a node that was at `nodeAt` when the pointer went down at `from` is,
 * with the pointer at `to`: moved as far as the pointer on the screen, which
 * is less in the graph the more it is zoomed in. Whole units, so that what is
 * stored stays short.
 */
export const dragPosition = (
  nodeAt: Point,
  from: Point,
  to: Point,
  scale: number,
): Point =>
  Num.isNonZero(scale)
    ? ({
        x: Math.round(nodeAt.x + Num.div(to.x - from.x, scale)),
        y: Math.round(nodeAt.y + Num.div(to.y - from.y, scale)),
      } as const)
    : nodeAt;

/** How far the arrow key `key` moves a node, or `undefined` for other keys. */
export const arrowKeyDelta = (
  key: string,
  shift: boolean,
): Point | undefined => {
  const step = shift ? NUDGE_STEP_LARGE : NUDGE_STEP;

  switch (key) {
    case 'ArrowLeft':
      return { x: -step, y: 0 };

    case 'ArrowRight':
      return { x: step, y: 0 };

    case 'ArrowUp':
      return { x: 0, y: -step };

    case 'ArrowDown':
      return { x: 0, y: step };

    default:
      return undefined;
  }
};

/** The box around every node, `margin` wider on each side; empty for none. */
export const nodesBounds = (
  nodes: readonly LaidOutNode[],
  margin: number,
): Bounds => {
  if (!Arr.isNonEmpty(nodes)) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const minX = Math.min(...nodes.map(({ x }) => x));

  const minY = Math.min(...nodes.map(({ y }) => y));

  const maxX = Math.max(...nodes.map(({ x, width }) => x + width));

  const maxY = Math.max(...nodes.map(({ y, height }) => y + height));

  return {
    x: minX - margin,
    y: minY - margin,
    width: maxX - minX + 2 * margin,
    height: maxY - minY + 2 * margin,
  };
};

export type DagLayout = Readonly<{
  direction: DagDirection;
  /** The top-left corner of each node put somewhere, in graph units. */
  positions: ReadonlyMap<GraphNodeId, Point>;
}>;

export type Bounds = Point & Size;
