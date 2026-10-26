import { combine, map, type InitializedObservable } from 'synstate';
import { Arr, fastDeepEqual, Num, Optional } from 'ts-data-forge';
import {
  arcContentBounds,
  arcEdges,
  arcGeometries,
  arcHighlight,
  buildNodeViews,
  dropTarget,
  dropTargetAt,
  edgeGeometries,
  groupFrames,
  groupIdOfKey,
  groupsByMember,
  highlightOf,
  interpolateTransform,
  moveNodesTo,
  nodesBounds,
  nodesInLasso,
  placeEmptyGroups,
  placeNodes,
  resizeNodes,
  routeEdges,
  withCurvesOf,
  withoutNodes,
  type ArcGeometry,
  type Bounds,
  type ConnectDrag,
  type ConnectHandle,
  type ConnectReach,
  type EdgeGeometry,
  type GraphLayout,
  type GroupFrame,
  type HighlightState,
  type LaidOutNode,
  type NodeDrag,
  type NodeView,
  type Point,
  type ViewTransform,
} from '../dag/index.mjs';
import {
  dependencyRefusal,
  GraphNodeIdCodec,
  nodeRefOf,
  type GraphNodeId,
  type GroupId,
} from '../domain/index.mjs';
import {
  clockStore,
  dagHiddenNodes,
  dagLayoutStore,
  dagOutsideNodes,
  dagSelectionStore,
  dagViewModeStore,
  dataStore,
  nodeSizeStore,
} from '../store/index.mjs';
import { isArrangeable } from '../view-model/index.mjs';

/**
 * What the canvas draws (`dag-canvas.tsx`), derived from the stores and the
 * canvas's own state: where every node, frame and edge is, and how each is
 * drawn. Each list the canvas renders with `For` is of records reused from
 * the previous value wherever nothing in them changed, so that a row is
 * updated only when what it draws is different — a drag moves the nodes it
 * moves, and a pan none.
 *
 * Made in the canvas, so that none of it is computed while the graph is not
 * shown.
 */
export const createDagCanvasScene = ({
  layout,
  transform,
  dragged,
  handle,
  connecting,
  selectedEdge,
  lasso,
  viewFrom,
  pointed,
}: SceneInputs): DagCanvasScene => {
  const { mode } = dagViewModeStore;

  const {
    arrangement,
    membership,
    animatedPositions: animated,
    animatedOpacities: opacities,
    animationProgress: progress,
    arcNodes,
    tileNodes,
  } = dagLayoutStore;

  const arrangeable = mode.pipe(map(isArrangeable));

  const views = combine([dataStore.state, clockStore.now]).pipe(
    map(([state, now]) => buildNodeViews(state, now)),
  );

  const arcEdgeList = combine([dataStore.state, dagHiddenNodes]).pipe(
    map(([state, hidden]) => arcEdges(withoutNodes(state, hidden))),
  );

  const selection = dagSelectionStore.selected.pipe(
    map((ids): ReadonlySet<GraphNodeId> => new Set(ids)),
  );

  // At the current size, which a layout still being made at it may not be.
  const placed = combine([
    layout,
    nodeSizeStore.size,
    arrangement,
    membership,
  ]).pipe(
    map(([laidOut, size, { positions }, members]) =>
      placeNodes(
        resizeNodes(laidOut.nodes, size),
        laidOut.edges,
        positions,
        members,
      ),
    ),
  );

  // Where the empty frames are when nothing moves.
  const emptyAt = combine([membership, layout, placed, arrangement]).pipe(
    map(([members, { groups }, placedNodes, { groupPositions }]) =>
      placeEmptyGroups(members, groups, placedNodes, groupPositions),
    ),
  );

  // The frames as they are when nothing moves, and while a node is dragged.
  const settledFrames = combine([
    arrangeable,
    placed,
    membership,
    emptyAt,
  ]).pipe(
    map(([canArrange, placedNodes, members, empty]): readonly GroupFrame[] =>
      canArrange ? groupFrames(placedNodes, members, empty) : [],
    ),
  );

  const drags = combine([
    dragged,
    settledFrames,
    membership,
    selection,
    placed,
  ]).pipe(
    map(([drag, settled, members, selected, placedNodes]): Drags => {
      const groupDrag = groupDragOf(drag, settled, members);

      const selectionDrag = selectionDragOf(drag, selected, placedNodes);

      return {
        group: groupDrag,
        selection: selectionDrag,
        moving: groupDrag ?? selectionDrag,
      };
    }),
  );

  // Every node some mode draws: those of the DAG, and those 「アーク」 and
  // 「タイル」 draw before ELK has laid them out.
  const anyMode = combine([placed, arcNodes, tileNodes]).pipe(
    map(([placedNodes, arc, tile]) => {
      const known = new Set(placedNodes.map(({ id }) => id));

      return [
        ...placedNodes,
        ...Arr.uniqBy(
          [...arc, ...tile].filter(({ id }) => !known.has(id)),
          ({ id }) => id,
        ),
      ];
    }),
  );

  // While they move, the nodes moving, wherever they are going; otherwise
  // the nodes of the mode, where it draws them.
  const shown = combine([
    anyMode,
    placed,
    dragged,
    drags,
    animated,
    mode,
    arcNodes,
    tileNodes,
  ]).pipe(
    map(([all, placedNodes, drag, { moving }, moved, current, arc, tile]) =>
      moved !== undefined
        ? moveNodesTo(all, moved).filter(({ id }) => moved.has(id))
        : current === 'arc'
          ? arc
          : current === 'tile'
            ? tile
            : drag === undefined
              ? placedNodes
              : placedNodes.map((node) =>
                  node.id === drag.id
                    ? { ...node, x: drag.position.x, y: drag.position.y }
                    : moving?.members.has(node.id) === true
                      ? {
                          ...node,
                          x: node.x + moving.dx,
                          y: node.y + moving.dy,
                        }
                      : node,
                ),
    ),
  );

  // Drawn while the DAG is, and not while the view changes mode: round the
  // nodes moving, or the group dragged, and otherwise as they are.
  const shownFrames = combine([
    arrangeable,
    opacities,
    animated,
    drags,
    settledFrames,
    shown,
    membership,
    emptyAt,
  ]).pipe(
    map(
      ([
        canArrange,
        fading,
        moved,
        { group, selection: selectionDrag },
        settled,
        shownNodes,
        members,
        empty,
      ]): readonly GroupFrame[] => {
        if (!canArrange || fading !== undefined) {
          return [];
        }

        if (moved !== undefined || selectionDrag !== undefined) {
          return groupFrames(shownNodes, members, empty);
        }

        if (group === undefined) {
          return settled;
        }

        const from = empty.get(group.id);

        return groupFrames(
          shownNodes,
          members,
          from === undefined
            ? empty
            : new Map([
                ...empty,
                [group.id, { x: from.x + group.dx, y: from.y + group.dy }],
              ]),
        );
      },
    ),
  );

  // The group a node being dragged would be dropped into, and the one it
  // is in.
  const dropTargets = combine([
    dragged,
    drags,
    shown,
    settledFrames,
    membership,
  ]).pipe(
    map(
      ([drag, { moving }, shownNodes, settled, members]):
        NodeDropTargets | undefined => {
        const node =
          drag === undefined || moving !== undefined
            ? undefined
            : shownNodes.find(({ id }) => id === drag.id);

        return node === undefined
          ? undefined
          : {
              into: dropTarget(settled, node),
              from: groupsByMember(members).get(node.id),
            };
      },
    ),
  );

  // The edges as they are when nothing moves.
  const settledEdges = combine([arrangeable, arrangement, placed, layout]).pipe(
    map(([canArrange, { direction }, placedNodes, laidOut]) =>
      canArrange ? routeEdges(direction, placedNodes, laidOut.edges) : [],
    ),
  );

  const settledArcs = combine([mode, arcNodes, arcEdgeList]).pipe(
    map(([current, arc, arcList]): readonly ArcGeometry[] =>
      current === 'arc' ? arcGeometries(arc, arcList) : [],
    ),
  );

  // Hidden while the view changes mode, and in 「アーク」 while anything
  // moves: the arcs are drawn for the column alone. 「タイル」 has none.
  const edgesHidden = combine([arrangeable, opacities, animated]).pipe(
    map(([canArrange, fading, moved]) =>
      canArrange ? fading !== undefined : moved !== undefined,
    ),
  );

  const highlight = combine([mode, animated, pointed, arcEdgeList]).pipe(
    map(([current, moved, node, arcList]) =>
      current === 'arc' && moved === undefined
        ? arcHighlight(node, arcList)
        : undefined,
    ),
  );

  // Whether routing has been too slow to keep up with this drag.
  let mut_slowDrag = false;

  const edges = combine([
    arrangeable,
    animated,
    dragged,
    drags,
    arrangement,
    shown,
    layout,
    settledEdges,
  ]).pipe(
    map(
      ([
        canArrange,
        moved,
        drag,
        { selection: selectionDrag },
        { direction },
        shownNodes,
        { edges: layoutEdges },
        settled,
      ]): readonly EdgeGeometry[] => {
        if (!canArrange) {
          return [];
        }

        if (moved !== undefined) {
          return edgeGeometries(direction, shownNodes, layoutEdges);
        }

        if (drag === undefined) {
          mut_slowDrag = false;

          return settled;
        }

        if (mut_slowDrag) {
          const curves = edgeGeometries(direction, shownNodes, layoutEdges);

          // A group's nodes, or the selected ones, all move: every edge is a
          // curve.
          return selectionDrag === undefined && GraphNodeIdCodec.is(drag.id)
            ? withCurvesOf(settled, curves, drag.id)
            : curves;
        }

        const started = performance.now();

        const routed = routeEdges(direction, shownNodes, layoutEdges);

        mut_slowDrag = performance.now() - started > DRAG_ROUTING_BUDGET_MS;

        return routed;
      },
    ),
  );

  // While a lasso is drawn, the nodes it closes round so far, which are
  // drawn selected in place of those that are.
  const drawnSelection = combine([lasso, selection, placed]).pipe(
    map(([points, selected, placedNodes]): ReadonlySet<GraphNodeId> =>
      points === undefined
        ? selected
        : new Set(nodesInLasso(placedNodes, points)),
    ),
  );

  // The edge selected, while it is drawn as it was when clicked: not once
  // it is gone or has moved, nor while anything is dragged or moves.
  const shownSelectedEdge = combine([
    selectedEdge,
    edgesHidden,
    animated,
    dragged,
    connecting,
    edges,
  ]).pipe(
    map(
      ([clicked, hidden, moved, drag, arrow, drawnEdges]):
        ShownSelectedEdge | undefined => {
        if (
          clicked === undefined ||
          hidden ||
          moved !== undefined ||
          drag !== undefined ||
          arrow !== undefined
        ) {
          return undefined;
        }

        const edge = drawnEdges.find(({ id }) => id === clicked.id);

        return edge?.path === clicked.path
          ? { edge, at: clicked.at }
          : undefined;
      },
    ),
  );

  // The node the arrow being drawn is over, other than the one it is drawn
  // from, and whether a dependency on that one would be refused.
  const connectTarget = combine([
    connecting,
    placed,
    transform,
    dataStore.state,
  ]).pipe(
    map(([arrow, placedNodes, { scale }, state]): ConnectTarget | undefined => {
      if (arrow === undefined) {
        return undefined;
      }

      const id = dropTargetAt(placedNodes, arrow.to, reachAt(scale));

      const node =
        id === arrow.from
          ? undefined
          : placedNodes.find((placedNode) => placedNode.id === id);

      return node === undefined
        ? undefined
        : {
            node,
            refused:
              dependencyRefusal(
                state,
                nodeRefOf(node.id),
                nodeRefOf(arrow.from),
              ) !== undefined,
          };
    }),
  );

  const drawnTransform = combine([viewFrom, transform, progress]).pipe(
    map(([from, to, t]) =>
      from === undefined || t === undefined
        ? to
        : interpolateTransform(from, to, t),
    ),
  );

  const nodeRecords = createRecordCache(
    (record: DagNodeRecord) => record.node.id,
  );

  const nodes = combine([
    shown,
    views,
    dragged,
    drags,
    arrangeable,
    drawnSelection,
    highlight,
    opacities,
    dagOutsideNodes,
    nodeSizeStore.size,
  ]).pipe(
    map(
      ([
        shownNodes,
        nodeViews,
        drag,
        { selection: selectionDrag },
        canArrange,
        selected,
        highlighted,
        fading,
        outside,
        size,
      ]) =>
        nodeRecords(
          Arr.generate(function* () {
            for (const node of shownNodes) {
              const view = nodeViews.get(node.id);

              if (view !== undefined) {
                yield {
                  node,
                  view,
                  dragging:
                    node.id === drag?.id ||
                    selectionDrag?.members.has(node.id) === true,
                  selected: canArrange && selected.has(node.id),
                  movable: canArrange,
                  highlight: highlightOf(highlighted?.nodes, node.id),
                  outside: outside.has(node.id),
                  opacity: fading?.get(node.id),
                  compact: size === 'compact',
                } satisfies DagNodeRecord;
              }
            }
          }),
        ),
    ),
  );

  const frameRecords = createRecordCache(
    (record: DagFrameRecord) => record.frame.id,
  );

  const frames = combine([
    shownFrames,
    drags,
    dropTargets,
    dataStore.groups,
  ]).pipe(
    map(([shownList, { group }, targets, groups]) => {
      const titles = new Map(groups.map(({ id, title }) => [id, title]));

      return frameRecords(
        shownList.map((frame): DagFrameRecord => ({
          frame,
          title: titles.get(frame.id) ?? '',
          dragging: frame.id === group?.id,
          drop:
            targets === undefined || targets.into === targets.from
              ? undefined
              : frame.id === targets.into
                ? 'into'
                : frame.id === targets.from
                  ? 'leave'
                  : undefined,
        })),
      );
    }),
  );

  const edgeRecords = createRecordCache(
    (record: DagEdgeRecord) => record.edge.id,
  );

  const edgeList = combine([edges, shownSelectedEdge]).pipe(
    map(([drawnEdges, selected]) =>
      edgeRecords(
        drawnEdges.map((edge): DagEdgeRecord => ({
          edge,
          selected: edge.id === selected?.edge.id,
        })),
      ),
    ),
  );

  const arcRecords = createRecordCache((record: DagArcRecord) => record.arc.id);

  const arcs = combine([settledArcs, highlight]).pipe(
    map(([arcList, highlighted]) =>
      arcRecords(
        arcList.map((arc): DagArcRecord => ({
          arc,
          highlight: highlightOf(highlighted?.edges, arc.id),
        })),
      ),
    ),
  );

  const edgeDelete = combine([shownSelectedEdge, drawnTransform, views]).pipe(
    map(([selected, { scale }, nodeViews]): Optional<EdgeDeleteState> =>
      selected === undefined
        ? Optional.none
        : Optional.some({
            at: selected.at,
            scale,
            label: `「${nodeViews.get(selected.edge.to)?.title ?? ''}」の「${nodeViews.get(selected.edge.from)?.title ?? ''}」への依存を削除`,
            from: selected.edge.from,
            to: selected.edge.to,
          }),
    ),
  );

  const connectOverlay = combine([
    arrangeable,
    handle,
    connecting,
    connectTarget,
    drawnTransform,
  ]).pipe(
    map(
      ([
        canArrange,
        handleAt,
        arrow,
        target,
        { scale },
      ]): Optional<ConnectOverlayState> => {
        const anchor = arrow?.anchor ?? handleAt?.at;

        return !canArrange || anchor === undefined
          ? Optional.none
          : Optional.some({ anchor, connecting: arrow, target, scale });
      },
    ),
  );

  // What `fit` shows all of, in the way the mode is read.
  const fitTarget = combine([
    mode,
    placed,
    settledFrames,
    arcNodes,
    settledArcs,
  ]).pipe(
    map(([current, placedNodes, settled, arc, arcList]): FitTarget =>
      current === 'arc'
        ? {
            kind: 'column',
            bounds: arcContentBounds(arc, arcList, GRAPH_MARGIN),
          }
        : current === 'tile'
          ? { kind: 'top' }
          : {
              kind: 'whole',
              bounds: nodesBounds([...placedNodes, ...settled], GRAPH_MARGIN),
            },
    ),
  );

  // The nodes a press can grab: none outside the mode the reader arranges.
  const movableNodes = combine([arrangeable, placed]).pipe(
    map(([canArrange, placedNodes]) => (canArrange ? placedNodes : [])),
  );

  // The nodes a handle can be on: those that can be grabbed, once they are
  // where they are drawn.
  const connectable = combine([arrangeable, animated, placed]).pipe(
    map(([canArrange, moved, placedNodes]) =>
      canArrange && moved === undefined ? placedNodes : [],
    ),
  );

  return {
    arrangeable,
    selection,
    settledFrames,
    movableNodes,
    connectable,
    edges,
    edgesHidden,
    drawnTransform,
    fitTarget,
    nodes,
    frames,
    edgeList,
    arcs,
    edgeDelete,
    connectOverlay,
  };
};

/** How a node is drawn (`dag-task-node.tsx`, `dag-milestone-node.tsx`). */
export type DagNodeRecord<V extends NodeView = NodeView> = Readonly<{
  node: LaidOutNode;
  view: V;
  /** Being dragged, and drawn lifted. */
  dragging: boolean;
  /** Selected by the lasso, and drawn outlined. */
  selected: boolean;
  /** Moved by the arrow keys: in the view modes the reader arranges. */
  movable: boolean;
  /** Brought forward or dimmed by the arc diagram's highlight. */
  highlight: HighlightState;
  /**
   * Outside the filter, and drawn faint: there only as what a node in it
   * waits for or is waited for by (`dag/node-filter.mts`).
   */
  outside: boolean;
  /** While it fades out of or into a view mode; `undefined` for opaque. */
  opacity: number | undefined;
  /** 「コンパクト」: smaller, and its title alone. */
  compact: boolean;
}>;

/** How a group's frame is drawn (`dag-group-frame.tsx`). */
export type DagFrameRecord = Readonly<{
  frame: GroupFrame;
  title: string;
  /** Being dragged by its title. */
  dragging: boolean;
  /**
   * While a node is dragged: `into` for the frame it would be dropped into,
   * `leave` for the one it would leave, and `undefined` otherwise.
   */
  drop: 'into' | 'leave' | undefined;
}>;

/** How an edge of the DAG is drawn (`dag-edge.tsx`). */
export type DagEdgeRecord = Readonly<{
  edge: EdgeGeometry;
  /** Clicked, and showing the button that deletes it. */
  selected: boolean;
}>;

/** How an arc of 「アーク」 is drawn (`dag-arc-edge.tsx`). */
export type DagArcRecord = Readonly<{
  arc: ArcGeometry;
  /** Brought forward or dimmed while a task is pointed at or focused. */
  highlight: HighlightState;
}>;

/** The button that deletes the edge selected (`dag-edge-delete.tsx`). */
export type EdgeDeleteState = Readonly<{
  /** Where the edge was clicked, in content coordinates. */
  at: Point;
  /** The view's, for the button to keep its size on the screen. */
  scale: number;
  /** What it deletes, for a screen reader. */
  label: string;
  /** The node depended on. */
  from: GraphNodeId;
  /** The node that waits. */
  to: GraphNodeId;
}>;

/** Drawing a dependency (`dag-connect-overlay.tsx`). */
export type ConnectOverlayState = Readonly<{
  /** The handle under the pointer, or where the arrow being drawn starts. */
  anchor: Point;
  /** The arrow being drawn. */
  connecting: ConnectDrag | undefined;
  /** The node the arrow would be dropped on, and whether that is refused. */
  target: ConnectTarget | undefined;
  /** The view's, for the handle to keep its size on the screen. */
  scale: number;
}>;

/** The node an arrow is about to be dropped on, and whether it is refused. */
export type ConnectTarget = Readonly<{ node: LaidOutNode; refused: boolean }>;

/** What `fit` shows: all of it, the arc diagram's column, or the top. */
export type FitTarget = Readonly<
  { kind: 'whole' | 'column'; bounds: Bounds } | { kind: 'top' }
>;

/**
 * The edge clicked: its id, its path then — for it to stop being selected
 * once it is drawn anywhere else — and where it was clicked, in content
 * coordinates.
 */
export type SelectedEdge = Readonly<{ id: string; path: string; at: Point }>;

export type DagCanvasScene = Readonly<{
  arrangeable: InitializedObservable<boolean>;
  selection: InitializedObservable<ReadonlySet<GraphNodeId>>;
  /** The frames as they are when nothing moves, which a drop is read in. */
  settledFrames: InitializedObservable<readonly GroupFrame[]>;
  movableNodes: InitializedObservable<readonly LaidOutNode[]>;
  connectable: InitializedObservable<readonly LaidOutNode[]>;
  /** The edges drawn, which a click finds the one it was on among. */
  edges: InitializedObservable<readonly EdgeGeometry[]>;
  edgesHidden: InitializedObservable<boolean>;
  /** Where the view is drawn: following the nodes while they move. */
  drawnTransform: InitializedObservable<ViewTransform>;
  fitTarget: InitializedObservable<FitTarget>;
  nodes: InitializedObservable<readonly DagNodeRecord[]>;
  frames: InitializedObservable<readonly DagFrameRecord[]>;
  edgeList: InitializedObservable<readonly DagEdgeRecord[]>;
  arcs: InitializedObservable<readonly DagArcRecord[]>;
  edgeDelete: InitializedObservable<Optional<EdgeDeleteState>>;
  connectOverlay: InitializedObservable<Optional<ConnectOverlayState>>;
}>;

/** {@link HANDLE_REACH_PX} in content coordinates, at the zoom `scale`. */
export const reachAt = (scale: number): ConnectReach =>
  Num.isNonZero(scale)
    ? ({
        outside: Num.div(HANDLE_REACH_PX.outside, scale),
        inside: Num.div(HANDLE_REACH_PX.inside, scale),
      } as const)
    : HANDLE_REACH_PX;

/** Clear around the nodes, as ELK leaves (`elk.padding`). */
const GRAPH_MARGIN = 24;

/**
 * How near a node's outline, on the screen, a mouse or pen shows its handle
 * — outside the node, where an arrow dropped still joins it, and inside it,
 * where the rest is for moving it.
 */
const HANDLE_REACH_PX = { outside: 10, inside: 5 } as const;

/**
 * How long routing the edges for one move of a drag may take before the
 * rest of the drag stops doing it: most of a frame.
 */
const DRAG_ROUTING_BUDGET_MS = 10;

type SceneInputs = Readonly<{
  /** ELK's layout, which places every node not put anywhere by hand. */
  layout: InitializedObservable<GraphLayout>;
  /** The view, where it is going. */
  transform: InitializedObservable<ViewTransform>;
  dragged: InitializedObservable<NodeDrag | undefined>;
  /** The handle under a mouse or pen, which a press draws an arrow from. */
  handle: InitializedObservable<ConnectHandle | undefined>;
  connecting: InitializedObservable<ConnectDrag | undefined>;
  selectedEdge: InitializedObservable<SelectedEdge | undefined>;
  /** The lasso being drawn, in content coordinates. */
  lasso: InitializedObservable<readonly Point[] | undefined>;
  /**
   * Where the view was when the mode changed, for it to follow the nodes
   * from there; `undefined` when it is where it is going.
   */
  viewFrom: InitializedObservable<ViewTransform | undefined>;
  /** The node pointed at or focused, for the arc diagram's highlight. */
  pointed: InitializedObservable<GraphNodeId | undefined>;
}>;

/** Nodes moving with the one dragged: how far, and which. */
type MovingNodes = Readonly<{
  dx: number;
  dy: number;
  members: ReadonlySet<GraphNodeId>;
}>;

/** The group dragged by its title: how far, and the nodes moving with it. */
type GroupDrag = MovingNodes & Readonly<{ id: GroupId }>;

/**
 * The nodes moving with the one dragged: the group dragged by its title, or
 * the nodes selected when one of them is dragged with another selected.
 */
type Drags = Readonly<{
  group: GroupDrag | undefined;
  selection: MovingNodes | undefined;
  moving: MovingNodes | undefined;
}>;

/**
 * The group a node being dragged would go into if dropped now, and the one
 * it is in; `undefined` for none.
 */
type NodeDropTargets = Readonly<{
  into: GroupId | undefined;
  from: GroupId | undefined;
}>;

type ShownSelectedEdge = Readonly<{ edge: EdgeGeometry; at: Point }>;

/** How far the group being dragged by its title has moved, and its nodes. */
const groupDragOf = (
  drag: NodeDrag | undefined,
  frames: readonly GroupFrame[],
  members: readonly Readonly<{
    id: GroupId;
    members: readonly GraphNodeId[];
  }>[],
): GroupDrag | undefined => {
  const id = drag === undefined ? undefined : groupIdOfKey(drag.id);

  const from = frames.find((frame) => frame.id === id);

  return drag === undefined || from === undefined
    ? undefined
    : {
        id: from.id,
        dx: drag.position.x - from.x,
        dy: drag.position.y - from.y,
        members: new Set(
          members.find((group) => group.id === from.id)?.members,
        ),
      };
};

/**
 * How far the nodes selected have moved, while one of them is dragged with
 * another selected.
 */
const selectionDragOf = (
  drag: NodeDrag | undefined,
  selected: ReadonlySet<GraphNodeId>,
  placedNodes: readonly LaidOutNode[],
): MovingNodes | undefined => {
  const id = drag?.id;

  const from =
    id === undefined ||
    !GraphNodeIdCodec.is(id) ||
    !selected.has(id) ||
    selected.size < 2
      ? undefined
      : placedNodes.find((node) => node.id === id);

  return drag === undefined || from === undefined
    ? undefined
    : {
        dx: drag.position.x - from.x,
        dy: drag.position.y - from.y,
        members: selected,
      };
};

/**
 * Makes the function that hands back, for each record, the one it handed
 * back last time under the same key when the two are equal, so that `For`
 * updates the rows whose records changed and no other.
 */
const createRecordCache = <R, K>(
  keyOf: (record: R) => K,
): ((records: readonly R[]) => readonly R[]) => {
  let mut_previous: ReadonlyMap<K, R> = new Map();

  return (records) => {
    const kept = records.map((record) => {
      const previous = mut_previous.get(keyOf(record));

      return previous !== undefined && fastDeepEqual(previous, record)
        ? previous
        : record;
    });

    mut_previous = new Map(kept.map((record) => [keyOf(record), record]));

    return kept;
  };
};
