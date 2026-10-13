/**
 * The DAG as the reader arranged it: which way it grows, and where each node
 * was put — by dragging it, by the arrow keys, or by 「自動整列」, which puts
 * every node where ELK does. One per project, shared by every device
 * (`projects/{projectId}/settings/dagLayout`).
 *
 * A node is drawn where it was put, and where ELK puts it if it never was.
 * Once some node was put somewhere, a node that never was — one added since
 * the last arrangement — is put next to the nodes it is joined to, as ELK
 * has it, and moved clear of every other node (`placeNodes`).
 */

import { Arr, Num } from 'ts-data-forge';
import type { GraphNodeId } from '../domain/index.mjs';
import type {
  DagDirection,
  LaidOutEdge,
  LaidOutNode,
} from './graph-layout.mjs';
import type { Point, Size } from './pan-zoom.mjs';

/** How far an arrow key moves a node, in graph units, and with Shift. */
export const NUDGE_STEP = 8;

export const NUDGE_STEP_LARGE = 40;

/** Before anybody has chosen: as wide screens and narrow ones read best. */
export const defaultDirection = (narrow: boolean): DagDirection =>
  narrow ? 'down' : 'right';

/**
 * How far `placeNodes` keeps a node it moves from every other node: as far
 * as ELK keeps two nodes of a layer apart (`elk.spacing.nodeNode`).
 */
export const PLACEMENT_GAP = 28;

/**
 * `auto`, each node moved to its stored position if it has one. While no
 * position is stored, every node stays where ELK has it; once one is, a
 * node with none is first moved as far as, on average, the nodes `edges`
 * join it to were moved from where ELK has them, so that it keeps its place
 * beside them; then, if it comes within `PLACEMENT_GAP` of another node, to
 * the nearest place that does not, below rather than above on a tie. The
 * nodes are taken in the order of `auto`, each one placed clear of those
 * placed before it.
 */
export const placeNodes = (
  auto: readonly LaidOutNode[],
  edges: readonly LaidOutEdge[],
  positions: ReadonlyMap<GraphNodeId, Point>,
): readonly LaidOutNode[] =>
  positions.size === 0 ? auto : placeEach(auto, edges, positions);

/** `nodes`, each one `positions` has moved there; the rest where they are. */
export const moveNodesTo = (
  nodes: readonly LaidOutNode[],
  positions: ReadonlyMap<GraphNodeId, Point>,
): readonly LaidOutNode[] =>
  nodes.map((node) => {
    const at = positions.get(node.id);

    return at === undefined ? node : { ...node, x: at.x, y: at.y };
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

/** Whether a box the size of `node`, at `at`, comes within `gap` of `other`. */
const isWithin = (
  at: Point,
  node: LaidOutNode,
  other: LaidOutNode,
  gap: number,
): boolean =>
  at.x < other.x + other.width + gap &&
  other.x < at.x + node.width + gap &&
  at.y < other.y + other.height + gap &&
  other.y < at.y + node.height + gap;

/**
 * `node` where it is if no node of `others` comes within `gap` of it, and
 * otherwise at the nearest place none does. The nearest such place is one
 * where the node, along one of its sides, is `gap` from a side of another
 * node, so only those places, and the node's own, are tried. The one past
 * every other node always is clear.
 */
const clearOf = (
  node: LaidOutNode,
  others: readonly LaidOutNode[],
  gap: number,
): LaidOutNode => {
  const clear = (at: Point): boolean =>
    others.every((other) => !isWithin(at, node, other, gap));

  if (clear(node)) {
    return node;
  }

  const xs = Arr.toUnshifted(
    others.flatMap((other) => [
      other.x - node.width - gap,
      other.x + other.width + gap,
    ]),
    node.x,
  );

  const ys = Arr.toUnshifted(
    others.flatMap((other) => [
      other.y - node.height - gap,
      other.y + other.height + gap,
    ]),
    node.y,
  );

  const distance = ({ x, y }: Point): number =>
    (x - node.x) ** 2 + (y - node.y) ** 2;

  const nearest = xs
    .flatMap((x) => ys.map((y) => ({ x, y }) as const))
    .toSorted((a, b) =>
      distance(a) !== distance(b)
        ? distance(a) - distance(b)
        : a.y !== b.y
          ? b.y - a.y
          : b.x - a.x,
    )
    .find(clear);

  return nearest === undefined ? node : { ...node, ...nearest };
};

/** The mean of `shifts`; none for none. */
const averageShift = (shifts: readonly Point[]): Point =>
  Arr.isNonEmpty(shifts)
    ? ({
        x: Num.div(
          shifts.reduce((sum, { x }) => sum + x, 0),
          Arr.length(shifts),
        ),
        y: Num.div(
          shifts.reduce((sum, { y }) => sum + y, 0),
          Arr.length(shifts),
        ),
      } as const)
    : ({ x: 0, y: 0 } as const);

/** Every node `edges` join each node to, either way. */
const neighborsOf = (
  edges: readonly LaidOutEdge[],
): ReadonlyMap<GraphNodeId, readonly GraphNodeId[]> =>
  edges.reduce<ReadonlyMap<GraphNodeId, readonly GraphNodeId[]>>(
    (acc, { from, to }) =>
      new Map([
        ...acc,
        [from, Arr.toPushed(acc.get(from) ?? [], to)],
        [to, Arr.toPushed(acc.get(to) ?? [], from)],
      ]),
    new Map(),
  );

/**
 * `auto`, each node `positions` has moved there, and the rest put clear of
 * the others (`placeNodes`).
 */
const placeEach = (
  auto: readonly LaidOutNode[],
  edges: readonly LaidOutEdge[],
  positions: ReadonlyMap<GraphNodeId, Point>,
): readonly LaidOutNode[] => {
  if (auto.every(({ id }) => positions.has(id))) {
    return moveNodesTo(auto, positions);
  }

  const autoAt = positionsOf(auto);

  const neighbors = neighborsOf(edges);

  const mut_placed = new Map<GraphNodeId, LaidOutNode>(
    moveNodesTo(
      auto.filter(({ id }) => positions.has(id)),
      positions,
    ).map((node) => [node.id, node]),
  );

  for (const node of auto) {
    if (mut_placed.has(node.id)) {
      continue;
    }

    const shift = averageShift(
      (neighbors.get(node.id) ?? []).flatMap((id) => {
        const from = autoAt.get(id);

        const to = mut_placed.get(id);

        return from === undefined || to === undefined
          ? []
          : [{ x: to.x - from.x, y: to.y - from.y }];
      }),
    );

    const anchor = {
      ...node,
      x: node.x + shift.x,
      y: node.y + shift.y,
    } as const;

    mut_placed.set(
      node.id,
      clearOf(anchor, Array.from(mut_placed.values()), PLACEMENT_GAP),
    );
  }

  return auto.map((node) => mut_placed.get(node.id) ?? node);
};
