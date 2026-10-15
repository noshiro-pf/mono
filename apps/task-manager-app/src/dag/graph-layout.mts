/**
 * The dependency graph laid out by ELK's layered algorithm: what goes in
 * (`layoutInput`, then `toElkGraph`) and what comes back (`fromElkGraph`) —
 * the position of every node, and the box of every group. ELK lays out the
 * nodes alone, an empty group as a box of its own, and the groups are made
 * room for afterwards (`clearOfFrames`). Edges are drawn by
 * `edge-routing.mts` from wherever the nodes end up, so ELK's routes are not
 * read; the edges and their labels go in so that it leaves room for them.
 *
 * Nodes have a fixed size per kind and per the reader's node size
 * (`nodeBoxSize`), and their titles are cut to fit (`truncate.mts`), so the
 * layout depends on the structure alone — the nodes, the edges and their
 * labels, the groups and who is in them — and on the node size, and not on
 * the titles: `layoutKey` changes only when one of those does, which is when
 * the layout has to be computed again.
 */

import { Arr } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { DeepReadonly, StrictPick } from 'ts-type-forge';
import type {
  DependencyGraph,
  DependencyGraphEdge,
  GraphNodeId,
  GroupId,
  NodeRef,
} from '../domain/index.mjs';
import { formatLag, type NodeSize } from '../view-model/index.mjs';
import { PLACEMENT_GAP, type Bounds } from './dag-layout.mjs';
import type { ElkExtendedEdge, ElkNode } from './elk.mjs';
import { EMPTY_GROUP_SIZE, frameAround } from './group-frames.mjs';
import type { Point, Size } from './pan-zoom.mjs';
import { textWidthUnits } from './truncate.mjs';

/** 「標準」: a title, and a line of status and priority under it. */
export const TASK_NODE_SIZE = { width: 184, height: 56 } as const;

export const MILESTONE_NODE_SIZE = { width: 168, height: 44 } as const;

/** 「コンパクト」: the title alone, on one line. */
export const COMPACT_TASK_NODE_SIZE = { width: 148, height: 32 } as const;

export const COMPACT_MILESTONE_NODE_SIZE = { width: 140, height: 32 } as const;

export const dagDirections = ['right', 'down'] as const;

export const DagDirectionCodec = t.enumType(dagDirections);

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

/**
 * What ELK is given: the nodes of `graph` at `nodeSize`, its edges, and the
 * `groups` of them, in the order they are listed. A member that is not a
 * node of `graph` is left out.
 */
export const layoutInput = (
  graph: DependencyGraph,
  direction: DagDirection,
  nodeSize: NodeSize,
  groups: readonly LayoutGroup[] = [],
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
    groups: membersAmong(groups, new Set(graph.nodes.map(({ id }) => id))),
  }) as const;

/** Equal for two inputs exactly when they lay out the same. */
export const layoutKey = (input: LayoutInput): string => JSON.stringify(input);

export const toElkGraph = (input: LayoutInput): ElkNode => {
  const groupOf = new Map(
    input.groups.flatMap(({ id, members }) =>
      members.map((member) => [member, id] as const),
    ),
  );

  const membersOf = new Map(
    input.groups.map(({ id, members }) => [id, members] as const),
  );

  const nodeBoxes = new Map(input.nodes.map((node) => [node.id, node]));

  // Each group's members one after another, where its first one is: in the
  // order of the model, which ELK keeps where it costs no crossing, they
  // tend to come out side by side, which keeps the frames small.
  const ordered = input.nodes.flatMap(({ id }): readonly GraphNodeId[] => {
    const group = groupOf.get(id);

    if (group === undefined) {
      return [id];
    }

    const members = membersOf.get(group) ?? [];

    return members[0] === id ? members : [];
  });

  return {
    id: 'root',
    layoutOptions: {
      ...spacingOptions,
      'elk.algorithm': 'layered',
      'elk.direction':
        input.direction === 'right' ? ('RIGHT' as const) : ('DOWN' as const),
      'elk.edgeRouting': 'ORTHOGONAL',
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
    children: [
      ...ordered.flatMap((id) => {
        const box = nodeBoxes.get(id);

        return box === undefined ? [] : [elkBox(box)];
      }),
      ...input.groups
        .filter(({ members }) => Arr.isEmpty(members))
        .map(({ id }) => elkBox({ id: elkGroupId(id), ...EMPTY_GROUP_SIZE })),
    ],
    edges: input.edges.map(({ id, from, to, label }): ElkExtendedEdge => ({
      id,
      sources: [from],
      targets: [to],
      labels: label === '' ? [] : [{ text: label, ...labelSize(label) }],
    })),
  } as const;
};

/**
 * The positions ELK chose, in the order of `input`, then moved apart across
 * the layers until nothing is inside a frame but its members
 * (`clearOfFrames`). A node or a group ELK did not place (which it does not
 * do) is at the origin rather than dropped.
 */
export const fromElkGraph = (
  input: LayoutInput,
  laidOut: DeepReadonly<ElkNode>,
): GraphLayout => {
  const placed = new Map(
    (laidOut.children ?? []).map((child) => [child.id, child] as const),
  );

  return clearOfFrames(input.direction, {
    nodes: input.nodes.map((node) => {
      const at = placed.get(node.id);

      return { ...node, x: at?.x ?? 0, y: at?.y ?? 0 };
    }),
    edges: input.edges,
    groups: input.groups.map((group) => {
      const at = placed.get(elkGroupId(group.id));

      return { ...group, x: at?.x ?? 0, y: at?.y ?? 0, ...EMPTY_GROUP_SIZE };
    }),
  });
};

/**
 * `layout` with its nodes and groups moved across the layers — down when
 * the graph grows to the right, to the right when it grows down — so that
 * no frame of a group (`frameAround`) comes within `PLACEMENT_GAP` of a
 * node or a frame it does not hold, and each group's box is its frame. Two
 * nodes, or a node and an empty group, are kept as far apart as they were.
 *
 * A frame and the nodes in it move as one, and so does each node in no
 * group. Taken from the top (from the left), each moves just past those
 * before it in its way, so nothing moves along the layers and no edge turns
 * back, and what ELK put clear of the rest stays where it is.
 *
 * ELK is not given the groups to lay out (`elk.hierarchyHandling`), since
 * it then lays the inside of each group out first: one that a dependency
 * leaves and comes back into is in its own way, and ELK turns that edge
 * back.
 */
export const clearOfFrames = (
  direction: DagDirection,
  layout: GraphLayout,
): GraphLayout => {
  const nodesById = new Map(layout.nodes.map((node) => [node.id, node]));

  const grouped = new Set(layout.groups.flatMap(({ members }) => members));

  const blocks: readonly Block[] = [
    ...layout.groups.map((group): Block => {
      const members = group.members.flatMap((member) => {
        const node = nodesById.get(member);

        return node === undefined ? [] : [node];
      });

      const frame = frameAround(members);

      return {
        key: elkGroupId(group.id),
        nodes: members.map(({ id }) => id),
        bounds: frame ?? group,
        frame: frame !== undefined,
      };
    }),
    ...layout.nodes
      .filter(({ id }) => !grouped.has(id))
      .map((node): Block => ({
        key: node.id,
        nodes: [node.id],
        bounds: node,
        frame: false,
      })),
  ] as const;

  const across = direction === 'right' ? 'y' : 'x';

  const along = direction === 'right' ? 'x' : 'y';

  const acrossSize = direction === 'right' ? 'height' : 'width';

  const alongSize = direction === 'right' ? 'width' : 'height';

  const mut_moved: (Block & Readonly<{ at: number }>)[] = [];

  const mut_shifts = new Map<string, number>();

  for (const block of blocks.toSorted((a, b) =>
    a.bounds[across] !== b.bounds[across]
      ? a.bounds[across] - b.bounds[across]
      : a.bounds[along] - b.bounds[along],
  )) {
    const { bounds } = block;

    const start = Math.max(
      bounds[across],
      ...mut_moved
        .filter(
          (other) =>
            other.bounds[along] < bounds[along] + bounds[alongSize] &&
            bounds[along] < other.bounds[along] + other.bounds[alongSize],
        )
        .map((other) => {
          const end = other.bounds[across] + other.bounds[acrossSize];

          // Two nodes no closer than ELK put them, which is less apart
          // than `PLACEMENT_GAP` between the parts of a graph that no
          // edge joins.
          const gap =
            block.frame || other.frame
              ? PLACEMENT_GAP
              : Math.min(PLACEMENT_GAP, bounds[across] - end);

          return other.at + other.bounds[acrossSize] + gap;
        }),
    );

    mut_moved.push({ ...block, at: start });

    mut_shifts.set(block.key, start - bounds[across]);

    for (const id of block.nodes) {
      mut_shifts.set(id, start - bounds[across]);
    }
  }

  const moved = <P extends Point>(at: P, key: string): P => {
    const shift = mut_shifts.get(key) ?? 0;

    return shift === 0 ? at : { ...at, [across]: at[across] + shift };
  };

  const nodes = layout.nodes.map((node) => moved(node, node.id));

  const movedById = new Map(nodes.map((node) => [node.id, node]));

  return {
    nodes,
    edges: layout.edges,
    groups: layout.groups.map((group) => {
      const frame = frameAround(
        group.members.flatMap((member) => {
          const node = movedById.get(member);

          return node === undefined ? [] : [node];
        }),
      );

      return frame === undefined
        ? moved(group, elkGroupId(group.id))
        : { ...group, ...frame };
    }),
  };
};

/**
 * Which way the graph grows from what is depended on to what waits for it:
 * to the right on a wide screen, down on a narrow one, unless the reader has
 * chosen (`dag-layout.mts`).
 */
export type DagDirection = t.TypeOf<typeof DagDirectionCodec>;

export type LayoutInput = DeepReadonly<{
  direction: DagDirection;
  nodes: ({ id: GraphNodeId; kind: NodeRef['kind'] } & Size)[];
  edges: LaidOutEdge[];
  groups: LayoutGroup[];
}>;

export type GraphLayout = DeepReadonly<{
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
  groups: LaidOutGroup[];
}>;

/** A group, and the nodes in it, in the order of the nodes. */
export type LayoutGroup = DeepReadonly<{
  id: GroupId;
  members: GraphNodeId[];
}>;

/**
 * A group, and its box, its top-left corner at `(x, y)`: its frame round its
 * members, or for none, the box ELK gave it.
 */
export type LaidOutGroup = LayoutGroup & DeepReadonly<Point & Size>;

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

/** How far apart ELK keeps what it lays out. */
const spacingOptions = {
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
} as const;

/** The id of a group among ELK's nodes, apart from every node's. */
const elkGroupId = (id: GroupId): string => `group:${id}` as const;

/**
 * What `clearOfFrames` moves as one: a group's frame round its members, a
 * group with none, or a node in none.
 */
type Block = Readonly<{
  key: string;
  nodes: readonly GraphNodeId[];
  bounds: Bounds;
  frame: boolean;
}>;

/** What ELK is given of a node: its id and its size. */
const elkBox = ({
  id,
  width,
  height,
}: Readonly<{ id: string }> & Size): ElkNode =>
  ({ id, width, height }) as const;

/**
 * `groups`, each with only the members `nodes` has, and a node only in the
 * first group that has it.
 */
const membersAmong = (
  groups: readonly LayoutGroup[],
  nodes: ReadonlySet<GraphNodeId>,
): readonly LayoutGroup[] => {
  const mut_taken = new Set<GraphNodeId>();

  return groups.map(({ id, members }) => ({
    id,
    members: members.filter((member) => {
      if (!nodes.has(member) || mut_taken.has(member)) {
        return false;
      }

      mut_taken.add(member);

      return true;
    }),
  }));
};

const LABEL_HEIGHT = 18;

const LABEL_UNIT_WIDTH = 6.5;

const LABEL_PADDING = 8;
