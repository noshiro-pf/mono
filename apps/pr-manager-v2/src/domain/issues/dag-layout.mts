import { Arr, asPositiveInt, asUint32, Num } from 'ts-data-forge';
import type { NonEmptyTuple } from 'ts-type-forge';
import type { DagEdge, DagNode, IssueGraph } from './issue-graph.mjs';

/** Where everything of the DAG goes (spec §11.3), in SVG user units. */
export type DagLayout = Readonly<{
  width: number;
  height: number;
  nodes: readonly Readonly<{ node: DagNode; x: number; y: number }>[];
  edges: readonly Readonly<{ edge: DagEdge; path: string }>[];
  /** Where the caption over the nodes with no edge goes, if there are any. */
  freeCaptionY: number | undefined;
}>;

export const NODE_WIDTH = 200;

export const NODE_HEIGHT = 60;

/**
 * A layered layout read left to right: each connected part apart, the largest
 * first, its nodes in layers by the longest path into them, each layer ordered
 * by barycenter sweeps to cut crossings, then each node moved toward the middle
 * of its neighbors where the order leaves room. The nodes with no edge either
 * way go in a grid under them, `freeColumns` wide when asked (a fit asks for
 * the columns that draw the whole largest), else as wide as the widest part.
 */
export const layoutDag = (
  graph: IssueGraph,
  freeColumns?: number,
): DagLayout => {
  const linked = new Set<string>(
    graph.edges.flatMap(({ from, to }) => [from, to]),
  );

  const parts = partsLaidOut(graph);

  const mut_nodes: { node: DagNode; x: number; y: number }[] = Array.from(
    parts.nodes,
  );

  let mut_top = parts.top;

  let mut_width = parts.width;

  const free = graph.nodes
    .filter(({ id }) => !linked.has(id))
    .toSorted((a, b) => a.number - b.number);

  const freeCaptionY = Arr.isNonEmpty(free) ? mut_top : undefined;

  if (Arr.isNonEmpty(free)) {
    const columns = asPositiveInt(
      Math.max(
        1,
        freeColumns ??
          (mut_width === 0
            ? Math.ceil(Math.sqrt(free.length * 2))
            : Math.floor(
                Num.div(mut_width + GAP_X, asPositiveInt(CELL_WIDTH)),
              )),
      ),
    );

    const top = mut_top + CAPTION_HEIGHT;

    for (const [index, node] of free.entries()) {
      mut_nodes.push({
        node,
        x: Num.rem(index, columns) * CELL_WIDTH,
        y: top + Math.floor(Num.div(index, columns)) * (NODE_HEIGHT + GAP_Y),
      });
    }

    const rows = Math.ceil(Num.div(free.length, columns));

    mut_top = top + rows * (NODE_HEIGHT + GAP_Y);

    mut_width = Math.max(
      mut_width,
      Math.min(columns, free.length) * (NODE_WIDTH + GAP_X) - GAP_X,
    );
  }

  const at = new Map<string, Readonly<{ x: number; y: number }>>(
    mut_nodes.map(({ node, x, y }) => [node.id, { x, y }]),
  );

  return {
    width: mut_width,
    // The parts' top counts a gap after the last part, which the free grid
    // needs and the bottom of the drawing does not.
    height: Math.max(
      0,
      Arr.isNonEmpty(free) ? mut_top - GAP_Y : parts.top - PART_GAP,
    ),
    nodes: mut_nodes,
    edges: Arr.generate(function* () {
      for (const edge of graph.edges) {
        const from = at.get(edge.from);

        const to = at.get(edge.to);

        if (from !== undefined && to !== undefined) {
          yield { edge, path: curve(from, to) };
        }
      }
    }),
    freeCaptionY,
  };
};

/**
 * The columns a free grid takes for the whole graph to draw largest in a box of
 * `boxWidth` by `boxHeight`: the count whose layout's scale to fit is greatest,
 * tried from one up to one per node.
 */
export const bestFreeColumns = (
  graph: IssueGraph,
  boxWidth: number,
  boxHeight: number,
): number | undefined => {
  const linked = new Set<string>(
    graph.edges.flatMap(({ from, to }) => [from, to]),
  );

  const freeCount = graph.nodes.filter(({ id }) => !linked.has(id)).length;

  if (freeCount === 0 || boxWidth <= 0 || boxHeight <= 0) {
    return undefined;
  }

  // The connected parts are laid out once, the same layout `layoutDag` then
  // reuses: the grid under them is arithmetic, so trying every column count
  // costs no layout at all.
  const parts = partsLaidOut(graph);

  const partsTop = parts.top;

  const scaleOf = (columns: number): number => {
    const rows = Math.ceil(Num.div(freeCount, asPositiveInt(columns)));

    const width = Math.max(
      parts.width,
      Math.min(columns, freeCount) * CELL_WIDTH - GAP_X,
    );

    const height =
      partsTop + CAPTION_HEIGHT + rows * (NODE_HEIGHT + GAP_Y) - GAP_Y;

    return Math.min(
      Num.div(boxWidth, asPositiveInt(Math.max(Math.ceil(width), 1))),
      Num.div(boxHeight, asPositiveInt(Math.max(Math.ceil(height), 1))),
    );
  };

  const tried = Arr.seq(asUint32(Math.min(freeCount, 24))).map((i) => ({
    columns: i + 1,
    scale: scaleOf(i + 1),
  }));

  return tried.reduce((best, next) => (next.scale > best.scale ? next : best), {
    columns: 1,
    scale: 0,
  }).columns;
};

const GAP_X = 72;

const CELL_WIDTH = NODE_WIDTH + GAP_X;

const GAP_Y = 20;

const PART_GAP = 40;

const CAPTION_HEIGHT = 28;

const SWEEPS = 4;

/** The parts the edges connect, each its nodes; nodes with no edge left out. */
const componentsOf = (graph: IssueGraph): readonly (readonly DagNode[])[] => {
  const mut_neighbors = new Map<string, readonly string[]>();

  for (const { from, to } of graph.edges) {
    mut_neighbors.set(from, Arr.toPushed(mut_neighbors.get(from) ?? [], to));

    mut_neighbors.set(to, Arr.toPushed(mut_neighbors.get(to) ?? [], from));
  }

  const byId = new Map<string, DagNode>(graph.nodes.map((n) => [n.id, n]));

  const mut_seen = new Set<string>();

  const mut_parts: DagNode[][] = [];

  for (const node of graph.nodes) {
    if (mut_seen.has(node.id) || !mut_neighbors.has(node.id)) {
      continue;
    }

    const mut_part: DagNode[] = [];

    const mut_stack = [node.id];

    mut_seen.add(node.id);

    while (Arr.isNonEmpty(mut_stack)) {
      const id = mut_stack.pop() ?? '';

      const found = byId.get(id);

      if (found !== undefined) {
        mut_part.push(found);
      }

      for (const next of mut_neighbors.get(id) ?? []) {
        if (mut_seen.has(next)) {
          continue;
        }

        mut_seen.add(next);

        mut_stack.push(next);
      }
    }

    mut_parts.push(mut_part);
  }

  return mut_parts;
};

const adjacency = (
  edges: readonly DagEdge[],
  by: 'from' | 'to',
): ReadonlyMap<string, readonly string[]> => {
  const mut_map = new Map<string, readonly string[]>();

  for (const edge of edges) {
    const key = edge[by];

    const other = by === 'to' ? edge.from : edge.to;

    mut_map.set(key, Arr.toPushed(mut_map.get(key) ?? [], other));
  }

  return mut_map;
};

/**
 * Each node's layer: the longest path into it, an edge closing a cycle left out
 * so a cycle still lays out.
 */
const layersOf = (
  part: readonly DagNode[],
  edges: readonly DagEdge[],
): ReadonlyMap<string, number> => {
  const predecessors = adjacency(edges, 'to');

  const mut_layer = new Map<string, number>();

  const mut_visiting = new Set<string>();

  const layerOf = (id: string): number => {
    const known = mut_layer.get(id);

    if (known !== undefined) {
      return known;
    }

    if (mut_visiting.has(id)) {
      return -1;
    }

    mut_visiting.add(id);

    const value =
      Math.max(-1, ...(predecessors.get(id) ?? []).map(layerOf)) + 1;

    mut_visiting.delete(id);

    mut_layer.set(id, value);

    return value;
  };

  for (const { id } of part.toSorted((a, b) => a.number - b.number)) {
    layerOf(id);
  }

  return mut_layer;
};

const mean = (values: NonEmptyTuple<number>): number =>
  Num.div(Arr.sum(values), asPositiveInt(values.length));

const layoutPart = (
  part: readonly DagNode[],
  edges: readonly DagEdge[],
): Readonly<{
  nodes: readonly Readonly<{ node: DagNode; x: number; y: number }>[];
  width: number;
  height: number;
}> => {
  const ids = new Set<string>(part.map(({ id }) => id));

  const inside = edges.filter(({ from, to }) => ids.has(from) && ids.has(to));

  const layer = layersOf(part, inside);

  const depth = Math.max(...part.map(({ id }) => layer.get(id) ?? 0));

  // Each layer's nodes, first by number, then by barycenter sweeps.
  const mut_layers: DagNode[][] = Arr.seq(asUint32(depth + 1)).map((l) =>
    part
      .filter(({ id }) => layer.get(id) === l)
      .toSorted((a, b) => a.number - b.number),
  );

  const predecessors = adjacency(inside, 'to');

  const successors = adjacency(inside, 'from');

  for (const sweep of Arr.seq(SWEEPS)) {
    const down = sweep % 2 === 0;

    const order = down
      ? Arr.tail(Arr.seq(asUint32(mut_layers.length)))
      : Arr.butLast(Arr.seq(asUint32(mut_layers.length))).toReversed();

    for (const l of order) {
      const neighborLayer = mut_layers[down ? l - 1 : l + 1] ?? [];

      const position = new Map<string, number>(
        neighborLayer.map(({ id }, i) => [id, i]),
      );

      const current = mut_layers[l] ?? [];

      const keyed = current.map((node, i) => {
        const near = ((down ? predecessors : successors).get(node.id) ?? [])
          .map((id) => position.get(id))
          .filter((p) => p !== undefined);

        return {
          node,
          key: Arr.isNonEmpty(near) ? mean(near) : i,
        };
      });

      mut_layers[l] = keyed
        .toSorted((a, b) => a.key - b.key)
        .map(({ node }) => node);
    }
  }

  // Slots in order, then each node pulled toward its neighbors' middle.
  const step = NODE_HEIGHT + GAP_Y;

  const mut_y = new Map<string, number>(
    mut_layers.flatMap((nodes) =>
      nodes.map(({ id }, i) => [id, i * step] as const),
    ),
  );

  // Forward, back, forward: the last pass leaves each layer where the one
  // before it settled.
  for (const pass of Arr.seq(3)) {
    for (const nodes of pass % 2 === 0 ? mut_layers : mut_layers.toReversed()) {
      let mut_floor = Number.NEGATIVE_INFINITY;

      const wanted = nodes.map(({ id }) => {
        const near = [
          ...(predecessors.get(id) ?? []),
          ...(successors.get(id) ?? []),
        ]
          .map((n) => mut_y.get(n))
          .filter((v) => v !== undefined);

        return Arr.isNonEmpty(near) ? mean(near) : (mut_y.get(id) ?? 0);
      });

      for (const [i, { id }] of nodes.entries()) {
        const at = Math.max(wanted[i] ?? 0, mut_floor);

        mut_y.set(id, at);

        mut_floor = at + step;
      }
    }
  }

  const top = Math.min(...Array.from(mut_y.values()));

  const placed = part.map((node) => ({
    node,
    x: (layer.get(node.id) ?? 0) * (NODE_WIDTH + GAP_X),
    y: (mut_y.get(node.id) ?? 0) - top,
  }));

  return {
    nodes: placed,
    width: (depth + 1) * (NODE_WIDTH + GAP_X) - GAP_X,
    height: Math.max(...placed.map((p) => p.y)) + NODE_HEIGHT,
  };
};

/** From the right of `from` to the left of `to`, curved. */
const curve = (
  from: Readonly<{ x: number; y: number }>,
  to: Readonly<{ x: number; y: number }>,
): string => {
  const x1 = from.x + NODE_WIDTH;

  const y1 = from.y + NODE_HEIGHT / 2;

  const x2 = to.x;

  const y2 = to.y + NODE_HEIGHT / 2;

  const bend = Math.max(40, Math.abs(x2 - x1) / 2);

  return `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`;
};

/**
 * The connected parts laid out one under another, the largest first, and where
 * the next thing would go (`top`): worked out once per graph, as a fit asks for
 * it twice, to choose the columns and to draw.
 */
const partsLaidOut = (graph: IssueGraph): PartsLayout => {
  const kept = partsByGraph.get(graph);

  if (kept !== undefined) {
    return kept;
  }

  const mut_nodes: { node: DagNode; x: number; y: number }[] = [];

  let mut_top = 0;

  let mut_width = 0;

  for (const part of componentsOf(graph).toSorted(
    (a, b) => b.length - a.length,
  )) {
    const placed = layoutPart(part, graph.edges);

    for (const p of placed.nodes) {
      mut_nodes.push({ ...p, y: p.y + mut_top });
    }

    mut_top += placed.height + PART_GAP;

    mut_width = Math.max(mut_width, placed.width);
  }

  const laidOut = { nodes: mut_nodes, top: mut_top, width: mut_width } as const;

  partsByGraph.set(graph, laidOut);

  return laidOut;
};

type PartsLayout = Readonly<{
  nodes: readonly Readonly<{ node: DagNode; x: number; y: number }>[];
  top: number;
  width: number;
}>;

const partsByGraph = new WeakMap<IssueGraph, PartsLayout>();
