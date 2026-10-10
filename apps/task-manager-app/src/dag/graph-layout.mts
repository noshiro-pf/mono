/**
 * The dependency graph laid out by ELK's layered algorithm: what goes in
 * (`layoutInput`, then `toElkGraph`) and what comes back (`fromElkGraph`) —
 * the position of every node. Edges are drawn by `edge-routing.mts` from
 * wherever the nodes end up, so ELK's routes are not read; the edges and
 * their labels go in so that it leaves room for them.
 *
 * Nodes have a fixed size per kind and per the reader's node size
 * (`nodeBoxSize`), and their titles are cut to fit (`truncate.mts`), so the
 * layout depends on the structure alone — the nodes, the edges and their
 * labels — and on the node size, and not on the titles: `layoutKey` changes
 * only when one of those does, which is when the layout has to be computed
 * again.
 */

import { type DeepReadonly, type StrictPick } from 'ts-type-forge';
import {
  type DependencyGraph,
  type DependencyGraphEdge,
  type GraphNodeId,
  type NodeRef,
} from '../domain/index.mjs';
import { formatLag, type NodeSize } from '../view-model/index.mjs';
import { type ElkExtendedEdge, type ElkNode } from './elk.mjs';
import { type Size } from './pan-zoom.mjs';
import { textWidthUnits } from './truncate.mjs';

/** 「標準」: a title, and a line of status and priority under it. */
export const TASK_NODE_SIZE = { width: 184, height: 56 } as const;

export const MILESTONE_NODE_SIZE = { width: 168, height: 44 } as const;

/** 「コンパクト」: the title alone, on one line. */
export const COMPACT_TASK_NODE_SIZE = { width: 148, height: 32 } as const;

export const COMPACT_MILESTONE_NODE_SIZE = { width: 140, height: 32 } as const;

export const dagDirections = ['right', 'down'] as const;

/** `SS` for a start-to-start dependency, then the lag if there is one. */
export const edgeLabel = ({
  type,
  lagMs,
}: StrictPick<DependencyGraphEdge, 'type' | 'lagMs'>): string =>
  [type === 'start-to-start' ? 'SS' : '', formatLag(lagMs)]
    .filter((part) => part !== '')
    .join(' ');

/** The size of an edge's label: its text, with a little room around it. */
export const labelSize = (text: string): Size =>
  ({
    width: textWidthUnits(text) * LABEL_UNIT_WIDTH + LABEL_PADDING,
    height: LABEL_HEIGHT,
  }) as const;

/** The box of a node of `kind` drawn at `nodeSize`. */
export const nodeBoxSize = (kind: NodeRef['kind'], nodeSize: NodeSize): Size =>
  nodeSize === 'compact'
    ? kind === 'task'
      ? COMPACT_TASK_NODE_SIZE
      : COMPACT_MILESTONE_NODE_SIZE
    : kind === 'task'
      ? TASK_NODE_SIZE
      : MILESTONE_NODE_SIZE;

/**
 * `nodes` where they are, each with the box of its kind at `nodeSize`: a
 * layout made at another size, drawn at this one until it is made again.
 */
export const resizeNodes = (
  nodes: readonly LaidOutNode[],
  nodeSize: NodeSize,
): readonly LaidOutNode[] =>
  nodes.map((node) => {
    const { width, height } = nodeBoxSize(node.kind, nodeSize);

    return node.width === width && node.height === height
      ? node
      : { ...node, width, height };
  });

export const layoutInput = (
  graph: DependencyGraph,
  direction: DagDirection,
  nodeSize: NodeSize,
): LayoutInput =>
  ({
    direction,
    nodes: graph.nodes.map(({ id, ref }) => ({
      id,
      kind: ref.kind,
      ...nodeBoxSize(ref.kind, nodeSize),
    })),
    edges: graph.edges.map((edge) => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      label: edgeLabel(edge),
    })),
  }) as const;

/** Equal for two inputs exactly when they lay out the same. */
export const layoutKey = (input: LayoutInput): string => JSON.stringify(input);

export const toElkGraph = (input: LayoutInput): ElkNode =>
  ({
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction':
        input.direction === 'right' ? ('RIGHT' as const) : ('DOWN' as const),
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.spacing.nodeNode': '28',
      'elk.layered.spacing.nodeNodeBetweenLayers': '56',
      // An edge that skips a layer passes between two of its nodes, where
      // it is routed (`edge-routing.mts`) more than 20 from each: room for
      // it, and for two side by side.
      'elk.spacing.edgeNode': '24',
      'elk.spacing.edgeEdge': '16',
      'elk.layered.spacing.edgeNodeBetweenLayers': '24',
      'elk.layered.spacing.edgeEdgeBetweenLayers': '16',
      'elk.spacing.edgeLabel': '4',
      'elk.edgeLabels.inline': 'false',
      // Fewer crossings for more time, which stays well under a second at a
      // hundred nodes: 30 crossed a sixth fewer edges there than the
      // default 7, and 100 no fewer again.
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.thoroughness': '30',
      // The same graph comes out the same, and close to the order the
      // nodes and edges were made in, unless that crosses more edges.
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      // Shorter, straighter edges than BRANDES_KOEPF: on the sample data
      // and on three tasks one of which skips another's layer, no edge
      // needs routing round a node, and at a hundred nodes the edges are
      // 10–20 % shorter for as many crossings.
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.padding': '[top=24,left=24,bottom=24,right=24]',
    },
    children: input.nodes.map(({ id, width, height }) => ({
      id,
      width,
      height,
    })),
    edges: input.edges.map(({ id, from, to, label }): ElkExtendedEdge => ({
      id,
      sources: [from],
      targets: [to],
      labels: label === '' ? [] : [{ text: label, ...labelSize(label) }],
    })),
  }) as const;

/**
 * The positions ELK chose, in the order of `input`. A node ELK did not place
 * (which it does not do) is at the origin rather than dropped.
 */
export const fromElkGraph = (
  input: LayoutInput,
  laidOut: DeepReadonly<ElkNode>,
): GraphLayout => {
  const placed = new Map(
    (laidOut.children ?? []).map((node) => [node.id, node]),
  );

  return {
    nodes: input.nodes.map((node) => {
      const at = placed.get(node.id);

      return { ...node, x: at?.x ?? 0, y: at?.y ?? 0 };
    }),
    edges: input.edges,
  };
};

/**
 * Which way the graph grows from what is depended on to what waits for it:
 * to the right on a wide screen, down on a narrow one, unless the reader has
 * chosen (`dag-layout.mts`).
 */
export type DagDirection = (typeof dagDirections)[number];

export type LayoutInput = DeepReadonly<{
  direction: DagDirection;
  nodes: ({ id: GraphNodeId; kind: NodeRef['kind'] } & Size)[];
  edges: LaidOutEdge[];
}>;

export type GraphLayout = DeepReadonly<{
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
}>;

/** A node's box, its top-left corner at `(x, y)`. */
export type LaidOutNode = DeepReadonly<
  { id: GraphNodeId; kind: NodeRef['kind']; x: number; y: number } & Size
>;

export type LaidOutEdge = DeepReadonly<{
  id: string;
  from: GraphNodeId;
  to: GraphNodeId;
  /** Empty for none. */
  label: string;
}>;

const LABEL_HEIGHT = 18;

const LABEL_UNIT_WIDTH = 6.5;

const LABEL_PADDING = 8;
