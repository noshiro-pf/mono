/**
 * Where each node of the issue graph (`issue-graph.mts`) is drawn, and the
 * path of each edge: a layered drawing, read left to right, in which every
 * edge runs from one column to a later one.
 *
 * Written here rather than taken from a layout library, because the graphs
 * are small — thirty issues and what they name — and the page holds a
 * reader's token: what it loads is kept to what it needs (`vite.config.mts`
 * says why). The steps are the usual ones for a layered drawing, each kept
 * simple:
 *
 * 1. **Components.** Each connected part is laid out on its own and the parts
 *    stacked, largest first; the nodes with no edge at all go last, in a grid
 *    under a label, rather than one long column.
 * 2. **Columns.** A node's column is one past the furthest of what it waits
 *    for, then moved as far right as what waits for it allows, so a node
 *    sits next to what it leads to. An edge that would run back on a cycle
 *    is turned round for this alone.
 * 3. **Order within a column.** An edge that spans columns passes through a
 *    placeholder in each it crosses; the order is swept by the mean position
 *    of each node's neighbors, keeping the order with the fewest crossings.
 * 4. **Heights.** Each node is pulled level with its neighbors, as close as
 *    the order and the gaps allow (`levelColumn`).
 * 5. **Paths.** Straight through each placeholder, curved between columns.
 *
 * Nothing here reads a title: a node's box is the same for every node, so
 * the drawing depends on the structure alone.
 */

import { Arr, Num } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { IssueGraph, IssueGraphEdge } from './issue-graph.mjs';

export const NODE_WIDTH = 208;

export const NODE_HEIGHT = 44;

export type LaidOutNode = Readonly<{
  number: number;
  /** The top-left corner. */
  x: number;
  y: number;
}>;

export type LaidOutEdge = IssueGraphEdge &
  Readonly<{
    /** An SVG path, from the edge of one box to the edge of the other. */
    path: string;
  }>;

export type IssueGraphLayout = Readonly<{
  nodes: readonly LaidOutNode[];
  edges: readonly LaidOutEdge[];
  /** Above the nodes with no edge, when there are any. */
  unconnectedLabel: Readonly<{ x: number; y: number }> | undefined;
  width: number;
  height: number;
}>;

export const layoutIssueGraph = (graph: IssueGraph): IssueGraphLayout => {
  // A node that names itself is a cycle the node's colour already says; it
  // has no other end to draw a path to.
  const edges = graph.edges.filter(({ from, to }) => from !== to);

  const numbers = graph.nodes.map(({ number }) => number);

  const groups = connectedGroups(numbers, edges);

  const connected = groups.filter((group) => group.length > 1);

  const unconnected = groups
    .filter((group) => Arr.isFixedLengthArray(1, group))
    .flat();

  const mut_nodes: LaidOutNode[] = [];

  const mut_edges: LaidOutEdge[] = [];

  let mut_top = PADDING;

  let mut_width = 0;

  for (const group of connected) {
    const members = new Set(group);

    const part = layoutComponent(
      group,
      edges.filter(({ from }) => members.has(from)),
      { x: PADDING, y: mut_top },
    );

    mut_nodes.push(...part.nodes);

    mut_edges.push(...part.edges);

    mut_top += part.height + COMPONENT_GAP;

    mut_width = Math.max(mut_width, part.width);
  }

  const columns = Math.min(
    MAX_GRID_COLUMNS,
    Math.max(MIN_GRID_COLUMNS, columnsIn(mut_width)),
  );

  const unconnectedLabel = Arr.isNonEmpty(unconnected)
    ? ({ x: PADDING, y: mut_top + LABEL_HEIGHT - 6 } as const)
    : undefined;

  if (Arr.isNonEmpty(unconnected)) {
    mut_top += LABEL_HEIGHT;

    const sorted = unconnected.toSorted((a, b) => a - b);

    const gridTop = mut_top;

    const cells = sorted.map((number, index) => ({
      number,
      x: PADDING + (index % columns) * COLUMN_PITCH,
      y: gridTop + rowOf(index, columns) * (NODE_HEIGHT + NODE_GAP),
    }));

    mut_nodes.push(...cells);

    mut_top =
      Math.max(...cells.map(({ y }) => y)) + NODE_HEIGHT + COMPONENT_GAP;

    mut_width = Math.max(
      mut_width,
      Math.min(columns, sorted.length) * COLUMN_PITCH - LAYER_GAP,
    );
  }

  return {
    nodes: mut_nodes.toSorted((a, b) => a.number - b.number),
    edges: mut_edges,
    unconnectedLabel,
    width: mut_width + 2 * PADDING,
    height: Math.max(mut_top - COMPONENT_GAP + PADDING, 2 * PADDING),
  };
};

/** Between one column and the next, room for the curves. */
const LAYER_GAP = 64;

const COLUMN_PITCH = NODE_WIDTH + LAYER_GAP;

/** Between two nodes of a column. */
const NODE_GAP = 14;

/** What a placeholder takes in its column: a path, and room beside it. */
const PLACEHOLDER_HEIGHT = 6;

const COMPONENT_GAP = 32;

const PADDING = 16;

const LABEL_HEIGHT = 24;

const MIN_GRID_COLUMNS = 3;

const MAX_GRID_COLUMNS = 5;

const ORDER_SWEEPS = 12;

const LEVEL_SWEEPS = 8;

/** How many columns of nodes `width` holds. */
const columnsIn = (width: number): number =>
  rowOf(width + LAYER_GAP, COLUMN_PITCH);

/** Which row of a grid `columns` wide the `index`th cell is in. */
const rowOf = (index: number, columns: number): number =>
  Num.isNonZero(columns) ? Math.floor(Num.div(index, columns)) : index;

/**
 * The connected parts of the graph, edges read both ways: largest first,
 * then by lowest number; each lowest number first.
 */
export const connectedGroups = (
  numbers: readonly number[],
  edges: readonly IssueGraphEdge[],
): readonly (readonly number[])[] => {
  const mut_parent = new Map(numbers.map((number) => [number, number]));

  const root = (number: number): number => {
    let mut_at = number;

    while (mut_parent.get(mut_at) !== mut_at) {
      mut_at = mut_parent.get(mut_at) ?? mut_at;
    }

    return mut_at;
  };

  for (const { from, to } of edges) {
    if (mut_parent.has(from) && mut_parent.has(to)) {
      mut_parent.set(root(from), root(to));
    }
  }

  const mut_groups = new Map<number, readonly number[]>();

  for (const number of numbers.toSorted((a, b) => a - b)) {
    const key = root(number);

    mut_groups.set(key, Arr.toPushed(mut_groups.get(key) ?? [], number));
  }

  return Array.from(mut_groups.values()).toSorted((a, b) =>
    b.length === a.length ? (a[0] ?? 0) - (b[0] ?? 0) : b.length - a.length,
  );
};

/**
 * Each node's column: what it waits for is in an earlier one, and what waits
 * for it in a later one. An edge that runs back along a cycle — found by a
 * walk from the lowest numbers — is read the other way round.
 */
export const assignColumns = (
  numbers: readonly number[],
  edges: readonly Readonly<{ from: number; to: number }>[],
): ReadonlyMap<number, number> => {
  const forward = withoutBackEdges(numbers, edges);

  const successors = adjacency(numbers, forward, 'to');

  const predecessors = adjacency(numbers, forward, 'from');

  const order = topologicalOrder(numbers, successors, predecessors);

  const mut_column = new Map<number, number>();

  for (const number of order) {
    const before = (predecessors.get(number) ?? []).map(
      (predecessor) => (mut_column.get(predecessor) ?? 0) + 1,
    );

    mut_column.set(number, Math.max(0, ...before));
  }

  // As far right as what follows allows, so that a node that only leads to
  // something late is drawn beside it rather than at the far left.
  for (const number of order.toReversed()) {
    const after = (successors.get(number) ?? []).map(
      (successor) => (mut_column.get(successor) ?? 0) - 1,
    );

    if (Arr.isNonEmpty(after)) {
      mut_column.set(number, Math.min(...after));
    }
  }

  return mut_column;
};

/** How many pairs of edges between two neighboring columns cross. */
export const countCrossings = (
  pairs: readonly Readonly<{ from: number; to: number }>[],
): number =>
  pairs.reduce(
    (sum, a, index) =>
      sum +
      pairs
        .slice(index + 1)
        .filter((b) => (a.from - b.from) * (a.to - b.to) < 0).length,
    0,
  );

/**
 * The heights of one column's nodes, top edges, in the order they are in:
 * each as near as can be to where it is `wanted`, no two closer than their
 * heights and `gap`. A least-squares fit under those constraints, which is
 * an isotonic regression once each node's position is measured from where it
 * would be with every gap closed — the pool-adjacent-violators algorithm, in
 * which a run of nodes that wants to overlap moves as one, to its mean.
 */
export const levelColumn = (
  items: readonly Readonly<{
    wanted: number;
    height: number;
    weight: number;
  }>[],
  gap: number,
): readonly number[] => {
  // Where each would be with every gap closed, measured from the first.
  const offsets = Arr.scan(
    items,
    (offset, { height }) => offset + height + gap,
    0,
  );

  const blocks = items.reduce<readonly Block[]>(
    (pooled, item, index) =>
      poolBack(
        Arr.toPushed(pooled, {
          value: item.wanted - (offsets[index] ?? 0),
          weight: item.weight,
          size: 1,
        }),
      ),
    [],
  );

  const levelled = blocks.flatMap(({ value, size }) =>
    Array.from({ length: size }, () => value),
  );

  return levelled.map((value, index) => value + (offsets[index] ?? 0));
};

/** A run of a column's nodes that moves as one, and where it wants to be. */
type Block = Readonly<{ value: number; weight: number; size: number }>;

/**
 * `blocks` with the last merged into the one before it for as long as it
 * wants to be above it, each merge putting the two at their weighted mean.
 */
const poolBack = (blocks: readonly Block[]): readonly Block[] => {
  const last = blocks.at(-1);

  const previous = blocks.at(-2);

  if (
    last === undefined ||
    previous === undefined ||
    previous.value <= last.value
  ) {
    return blocks;
  }

  const weight = previous.weight + last.weight;

  return poolBack(
    Arr.toPushed(Arr.skipLast(blocks, 2), {
      value: Num.isNonZero(weight)
        ? Num.div(
            previous.value * previous.weight + last.value * last.weight,
            weight,
          )
        : previous.value,
      weight,
      size: previous.size + last.size,
    }),
  );
};

/** A node of the layered drawing: a real one, or a placeholder on an edge. */
type Slot = Readonly<{ id: string; column: number; height: number }>;

type ComponentLayout = Readonly<{
  nodes: readonly LaidOutNode[];
  edges: readonly LaidOutEdge[];
  width: number;
  height: number;
}>;

const layoutComponent = (
  numbers: readonly number[],
  edges: readonly IssueGraphEdge[],
  /** Where its top-left corner goes. */
  at: Readonly<{ x: number; y: number }>,
): ComponentLayout => {
  const columnOf = assignColumns(numbers, edges);

  const mut_slots = new Map<string, Slot>(
    numbers.map((number) => [
      nodeId(number),
      {
        id: nodeId(number),
        column: columnOf.get(number) ?? 0,
        height: NODE_HEIGHT,
      },
    ]),
  );

  // Each edge as the chain of slots it passes through, left to right.
  const chains = edges.map((edge, index) => {
    const fromColumn = columnOf.get(edge.from) ?? 0;

    const toColumn = columnOf.get(edge.to) ?? 0;

    const [leftEnd, rightEnd] =
      fromColumn <= toColumn
        ? ([edge.from, edge.to] as const)
        : ([edge.to, edge.from] as const);

    const leftColumn = Math.min(fromColumn, toColumn);

    const rightColumn = Math.max(fromColumn, toColumn);

    const placeholders = range(leftColumn + 1, rightColumn).map((column) => {
      const slot = {
        id: `edge-${index}-${column}`,
        column,
        height: PLACEHOLDER_HEIGHT,
      } as const;

      mut_slots.set(slot.id, slot);

      return slot.id;
    });

    return {
      edge,
      reversed: fromColumn > toColumn,
      ids: [nodeId(leftEnd), ...placeholders, nodeId(rightEnd)],
    } as const;
  });

  const links = chains.flatMap(({ ids }) =>
    Arr.tail(ids).map((id, index) => ({ from: ids[index] ?? id, to: id })),
  );

  const order = orderColumns(Array.from(mut_slots.values()), links);

  const heights = levelHeights(order, mut_slots, links);

  const topOf = (id: string): number => at.y + (heights.get(id) ?? 0);

  const centre = (id: string): number =>
    topOf(id) + (mut_slots.get(id)?.height ?? 0) / 2;

  const left = (id: string): number =>
    at.x + (mut_slots.get(id)?.column ?? 0) * COLUMN_PITCH;

  const nodes = numbers.map((number) => ({
    number,
    x: left(nodeId(number)),
    y: topOf(nodeId(number)),
  }));

  const laidOutEdges = chains.map(({ edge, reversed, ids }) => {
    const points = ids.flatMap((id, index) =>
      index === 0
        ? [{ x: left(id) + NODE_WIDTH, y: centre(id) }]
        : index === ids.length - 1
          ? [{ x: left(id), y: centre(id) }]
          : [
              { x: left(id), y: centre(id) },
              { x: left(id) + NODE_WIDTH, y: centre(id) },
            ],
    );

    return {
      ...edge,
      path: smoothPath(reversed ? points.toReversed() : points),
    };
  });

  const columns = Math.max(0, ...Array.from(columnOf.values())) + 1;

  return {
    nodes,
    edges: laidOutEdges,
    width: columns * COLUMN_PITCH - LAYER_GAP,
    height: Math.max(
      0,
      ...Array.from(
        mut_slots.values(),
        (slot) => (heights.get(slot.id) ?? 0) + slot.height,
      ),
    ),
  };
};

const nodeId = (number: number): string => `#${number}` as const;

/**
 * The slots of each column, top to bottom: swept left to right by where what
 * leads into each slot is, then right to left by where what it leads to is,
 * keeping the order that crosses the fewest edges.
 */
const orderColumns = (
  slots: readonly Slot[],
  links: readonly Readonly<{ from: string; to: string }>[],
): readonly (readonly string[])[] => {
  const columnCount = Math.max(0, ...slots.map(({ column }) => column)) + 1;

  const into = groupBy(links, 'to', 'from');

  const outOf = groupBy(links, 'from', 'to');

  // The order slots were made in, which is lowest number first and then
  // each edge's placeholders: a start that keeps related slots close.
  const initial = range(0, columnCount).map((column) =>
    slots.filter((slot) => slot.column === column).map(({ id }) => id),
  );

  const crossingsOf = (order: readonly (readonly string[])[]): number => {
    const position = positions(order);

    return Arr.tail(order).reduce(
      (sum, column) =>
        sum +
        countCrossings(
          column.flatMap((id) =>
            (into.get(id) ?? []).map((from) => ({
              from: position.get(from) ?? 0,
              to: position.get(id) ?? 0,
            })),
          ),
        ),
      0,
    );
  };

  let mut_best = initial;

  let mut_bestCrossings = crossingsOf(initial);

  let mut_order = initial;

  for (const sweep of range(0, ORDER_SWEEPS)) {
    const downward = sweep % 2 === 0;

    const columnsInSweep = downward
      ? range(1, columnCount)
      : range(0, columnCount - 1).toReversed();

    for (const column of columnsInSweep) {
      const position = positions(mut_order);

      const neighbors = downward ? into : outOf;

      const current = mut_order[column] ?? [];

      const sorted = current
        .map((id, index) => {
          const around = (neighbors.get(id) ?? []).map(
            (other) => position.get(other) ?? 0,
          );

          return {
            id,
            key: mean(around) ?? index,
          };
        })
        .toSorted((a, b) => a.key - b.key)
        .map(({ id }) => id);

      mut_order = mut_order.map((ids, at) => (at === column ? sorted : ids));
    }

    const crossings = crossingsOf(mut_order);

    if (crossings >= mut_bestCrossings) {
      continue;
    }

    mut_best = mut_order;

    mut_bestCrossings = crossings;
  }

  return mut_best;
};

/**
 * The top of every slot, each column levelled with its neighbors in turn,
 * left to right and back. A placeholder weighs more than a node, so that a
 * long edge is drawn straight and the nodes move to it.
 */
const levelHeights = (
  order: readonly (readonly string[])[],
  slots: ReadonlyMap<string, Slot>,
  links: readonly Readonly<{ from: string; to: string }>[],
): ReadonlyMap<string, number> => {
  // Neighbors both ways: a node is levelled with what leads into it and
  // with what it leads to.
  const neighbors = groupBy(
    links.flatMap(({ from, to }) => [
      { from, to },
      { from: to, to: from },
    ]),
    'from',
    'to',
  );

  const heightOf = (id: string): number => slots.get(id)?.height ?? 0;

  const mut_top = new Map<string, number>();

  // Packed from the top, to start from.
  for (const column of order) {
    let mut_at = 0;

    for (const id of column) {
      mut_top.set(id, mut_at);

      mut_at += heightOf(id) + NODE_GAP;
    }
  }

  const centreOf = (id: string): number =>
    (mut_top.get(id) ?? 0) + heightOf(id) / 2;

  for (const sweep of range(0, LEVEL_SWEEPS)) {
    const columns = sweep % 2 === 0 ? order : order.toReversed();

    for (const column of columns) {
      const levelled = levelColumn(
        column.map((id) => {
          const around = (neighbors.get(id) ?? []).map(centreOf);

          const wantedCentre = mean(around) ?? centreOf(id);

          return {
            wanted: wantedCentre - heightOf(id) / 2,
            height: heightOf(id),
            weight: heightOf(id) === PLACEHOLDER_HEIGHT ? 4 : 1,
          };
        }),
        NODE_GAP,
      );

      for (const [index, id] of column.entries()) {
        mut_top.set(id, levelled[index] ?? 0);
      }
    }
  }

  const minimum = Math.min(0, ...mut_top.values());

  return new Map(
    Array.from(mut_top, ([id, at]) => [id, Math.round(at - minimum)]),
  );
};

/**
 * Through the points in order: straight where two share a height and follow
 * each other in one column, an S-curve leaving and entering level otherwise.
 */
const smoothPath = (
  points: readonly Readonly<{ x: number; y: number }>[],
): string => {
  const [first, ...rest] = points;

  if (first === undefined) {
    return '';
  }

  const segments = rest.map((point, index) => {
    const previous = points[index] ?? first;

    const half = (point.x - previous.x) / 2;

    return previous.y === point.y
      ? `L ${point.x} ${point.y}`
      : `C ${previous.x + half} ${previous.y} ${point.x - half} ${point.y} ${point.x} ${point.y}`;
  });

  return Arr.toUnshifted(`M ${first.x} ${first.y}`)(segments).join(' ');
};

/** `[start, end)`, as plain numbers. */
const range = (start: number, end: number): readonly number[] =>
  Array.from({ length: Math.max(0, end - start) }, (_, index) => start + index);

const mean = (values: readonly number[]): number | undefined => {
  const count = values.length;

  return Num.isNonZero(count) ? Num.div(Arr.sum(values), count) : undefined;
};

const positions = (
  order: readonly (readonly string[])[],
): ReadonlyMap<string, number> =>
  new Map(order.flatMap((column) => column.map((id, index) => [id, index])));

const groupBy = <K extends string, V extends string>(
  links: readonly ReadonlyRecord<K | V, string>[],
  key: K,
  value: V,
): ReadonlyMap<string, readonly string[]> => {
  const mut_grouped = new Map<string, readonly string[]>();

  for (const link of links) {
    mut_grouped.set(
      link[key],
      Arr.toPushed(mut_grouped.get(link[key]) ?? [], link[value]),
    );
  }

  return mut_grouped;
};

/** The edges, less those a walk from the lowest numbers finds running back. */
const withoutBackEdges = (
  numbers: readonly number[],
  edges: readonly Readonly<{ from: number; to: number }>[],
): readonly Readonly<{ from: number; to: number }>[] => {
  const successors = adjacency(numbers, edges, 'to');

  const mut_onPath = new Set<number>();

  const mut_done = new Set<number>();

  const mut_back = new Set<string>();

  const visit = (number: number): void => {
    mut_onPath.add(number);

    for (const next of successors.get(number) ?? []) {
      if (mut_onPath.has(next)) {
        mut_back.add(`${number}>${next}`);
      } else if (!mut_done.has(next)) {
        visit(next);
      }
    }

    mut_onPath.delete(number);

    mut_done.add(number);
  };

  for (const number of numbers.toSorted((a, b) => a - b)) {
    if (!mut_done.has(number)) {
      visit(number);
    }
  }

  return edges.map((edge) =>
    mut_back.has(`${edge.from}>${edge.to}`)
      ? { from: edge.to, to: edge.from }
      : edge,
  );
};

const adjacency = (
  numbers: readonly number[],
  edges: readonly Readonly<{ from: number; to: number }>[],
  toward: 'from' | 'to',
): ReadonlyMap<number, readonly number[]> => {
  const mut_adjacent = new Map<number, readonly number[]>(
    numbers.map((number) => [number, []]),
  );

  for (const edge of edges) {
    const [at, other] =
      toward === 'to'
        ? ([edge.from, edge.to] as const)
        : ([edge.to, edge.from] as const);

    mut_adjacent.set(at, Arr.toPushed(mut_adjacent.get(at) ?? [], other));
  }

  return mut_adjacent;
};

/** Kahn's algorithm, lowest number first among those ready. */
const topologicalOrder = (
  numbers: readonly number[],
  successors: ReadonlyMap<number, readonly number[]>,
  predecessors: ReadonlyMap<number, readonly number[]>,
): readonly number[] => {
  const mut_waiting = new Map(
    numbers.map((number) => [number, predecessors.get(number)?.length ?? 0]),
  );

  let mut_ready: readonly number[] = numbers
    .filter((number) => mut_waiting.get(number) === 0)
    .toSorted((a, b) => a - b);

  const mut_order: number[] = [];

  while (Arr.isNonEmpty(mut_ready)) {
    const [next, ...rest] = mut_ready;

    mut_order.push(next);

    const freed = (successors.get(next) ?? []).filter((successor) => {
      const waiting = (mut_waiting.get(successor) ?? 0) - 1;

      mut_waiting.set(successor, waiting);

      return waiting === 0;
    });

    mut_ready = [...rest, ...freed].toSorted((a, b) => a - b);
  }

  return mut_order;
};
