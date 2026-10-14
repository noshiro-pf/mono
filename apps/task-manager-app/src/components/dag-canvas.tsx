import type {
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  PointerEventHandler,
  RefObject,
  WheelEventHandler,
} from 'preact';
import { memoNamed } from 'preact-utils';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';
import { Arr, Num } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  anchoredTileScroll,
  arcContentBounds,
  arcGeometries,
  arcHighlight,
  clampTileScroll,
  connectHandleAt,
  contentPointAt,
  dropTarget,
  dropTargetAt,
  edgeGeometries,
  fitBoundsTransform,
  fitWidthTopTransform,
  groupFrames,
  groupIdOfKey,
  groupKey,
  groupsByMember,
  highlightOf,
  IDLE_GESTURE,
  interpolateTransform,
  moveNodesTo,
  nodesBounds,
  placeEmptyGroups,
  placeNodes,
  pointerDown,
  pointerMove,
  pointerUp,
  positionsOf,
  resizeNodes,
  revealTileScroll,
  routeEdges,
  samePositions,
  tileAvailableWidth,
  tileContentHeight,
  tileKeyScroll,
  tileScrollOf,
  tileScrollThumb,
  tileViewTransform,
  wheelScrollPixels,
  wheelZoomFactor,
  withCurvesOf,
  zoomAt,
  type ArcGeometry,
  type Bounds,
  type ConnectDrag,
  type ConnectHandle,
  type ConnectReach,
  type EdgeGeometry,
  type Gesture,
  type Grab,
  type GraphLayout,
  type GroupFrame,
  type LaidOutNode,
  type NodeDrag,
  type ViewTransform,
} from '../dag/index.mjs';
import {
  dependencyRefusal,
  GraphNodeIdCodec,
  GroupIdCodec,
  nodeRefOf,
  type GraphNodeId,
  type GroupId,
} from '../domain/index.mjs';
import {
  animationSettingSignal,
  arcEdgesSignal,
  arcNodesSignal,
  dagAnimatedOpacitiesSignal,
  dagAnimatedPositionsSignal,
  dagAnimationProgressSignal,
  dagArrangementSignal,
  dagFitRequestsSignal,
  dagLayoutStore,
  dagMembershipSignal,
  dagViewModeSignal,
  dagViewModeStore,
  dataStore,
  domainSignal,
  groupsSignal,
  nodeSizeSignal,
  nodeViewsSignal,
  reducedMotionSignal,
  tileNodesSignal,
} from '../store/index.mjs';
import {
  isArrangeable,
  shouldAnimate,
  type DagViewMode,
} from '../view-model/index.mjs';
import { DagArcEdge } from './dag-arc-edge.js';
import {
  DagConnectOverlay,
  type ConnectTarget,
} from './dag-connect-overlay.js';
import { DagEdge } from './dag-edge.js';
import { DagGroupFrame } from './dag-group-frame.js';
import { DagMilestoneNode } from './dag-milestone-node.js';
import { DagTaskNode } from './dag-task-node.js';
import { nodeIdOf, usePointedNode } from './use-pointed-node.mjs';

type Props = Readonly<{
  /** ELK's layout, which places every node not put anywhere by hand. */
  layout: GraphLayout;
  /** The toolbar over the canvas, which 「アーク」 and 「タイル」 start below. */
  toolbarRef: RefObject<HTMLDivElement>;
}>;

/**
 * The graph as SVG: every node where it was put, or where ELK has it, and
 * the edges drawn between them (`dag/edge-routing.mts`). The background can
 * be panned by dragging, the whole zoomed with the wheel or two fingers and
 * fitted to the screen; a node can be dragged to a new place, which is saved
 * when it is dropped. What a pointer does is `dag/gesture.mts`; this
 * forwards the events and draws.
 *
 * A tap on a node opens it, a drag that starts on one moves it: `gesture`
 * says whether the press moved, and a click after a drag is swallowed before
 * it reaches the node.
 *
 * In 「DAG」 the groups are frames under the nodes (`dag/group-frames.mts`).
 * A node dropped with its centre in a frame goes into that group, and one
 * dropped outside every frame into none; while it is dragged, the frames
 * stay as they were when it was picked up, the one it would go into and the
 * one it would leave marked. A frame dragged by its title moves with its
 * nodes, and a tap on the title opens the group. `touch-action: none` (`index.css`) keeps the browser
 * from scrolling or zooming the page instead.
 *
 * In 「DAG」, a mouse or pen near a node's outline — within
 * {@link HANDLE_REACH_PX}, outside the node or just inside — shows a handle
 * there (`dag/connect-handle.mts`), and a drag from it draws an arrow
 * instead of moving the node. Dropped on another node, the arrow makes that node depend
 * on the one it was drawn from (`dataStore.addDependency`), unless that
 * would be refused — a dependency already there, or a cycle — which the
 * node it is over shows before the drop, and a notice says after it. A
 * touch has no pointer to come near with, and so no handle.
 *
 * While the nodes move to their places (`dagLayoutStore.animatedPositions`)
 * the edges are plain curves, and they are routed round the nodes once the
 * nodes are there; a press or a key on the canvas puts them there at once.
 * A dragged node's edges are routed at every move — unless that has taken
 * longer than {@link DRAG_ROUTING_BUDGET_MS}, when the rest of the drag
 * draws them as plain curves and leaves the others as they were, and the
 * drop routes them all.
 *
 * In 「アーク」 the tasks are in a column (`dagLayoutStore.arcNodes`) with
 * arcs beside it (`dag/arc-geometry.mts`), and do not move: a press on one
 * pans as one on the background does, and a tap still opens it. Pointing at
 * a task, or focusing it, brings its arcs and the tasks at their other ends
 * forward and dims the rest (`dag/arc-highlight.mts`). The view fits the
 * width and starts at the top, below the toolbar, and is read by panning.
 *
 * In 「タイル」 the tasks are in rows across the canvas
 * (`dagLayoutStore.tileNodes`), with no edges, at zoom 1, and the view is
 * only scrolled down and up (`dag/tile-scroll.mts`): by the wheel, a drag
 * anywhere — on a task too, which a tap still opens — and Page Up, Page
 * Down, Home and End while a task has the focus, which also scrolls the
 * focused task into view. The canvas reports its width
 * (`dagLayoutStore.setTileWidth`); when it changes, the tasks move to their
 * new rows and the view follows them, keeping the first task of the first
 * row in view where it was. A thin thumb on the right says how far down the
 * view is.
 *
 * Every node is drawn at the reader's node size, 「標準」 or 「コンパクト」
 * (`nodeSizeSignal`) — a layout ELK made at the other size, while the next
 * is computed, at this one — and the edges are routed between those boxes.
 *
 * While the view changes mode, the edges are hidden; the nodes one of the
 * modes does not draw fade (`dagLayoutStore.animatedOpacities`), and the
 * view moves to the new mode's fit at the nodes' pace
 * (`dagLayoutStore.animationProgress`), so that what fades stays in sight.
 * The edges fade in once they are back, when the reader's setting animates.
 */
export const DagCanvas = memoNamed<Props>('DagCanvas', (props) => {
  const { layout, toolbarRef } = props;

  const views = nodeViewsSignal.value;

  const { direction, positions, groupPositions } = dagArrangementSignal.value;

  const membership = dagMembershipSignal.value;

  const groups = groupsSignal.value;

  const fitRequests = dagFitRequestsSignal.value;

  const animated = dagAnimatedPositionsSignal.value;

  const opacities = dagAnimatedOpacitiesSignal.value;

  const progress = dagAnimationProgressSignal.value;

  const mode = dagViewModeSignal.value;

  const arrangeable = isArrangeable(mode);

  const arcNodes = arcNodesSignal.value;

  const tileNodes = tileNodesSignal.value;

  const arcEdges = arcEdgesSignal.value;

  const nodeSize = nodeSizeSignal.value;

  const compact = nodeSize === 'compact';

  const motion = shouldAnimate(
    animationSettingSignal.value,
    reducedMotionSignal.value,
  );

  const {
    pointed,
    onPointerOver,
    onPointerLeave,
    onFocusCapture,
    onBlurCapture,
  } = usePointedNode();

  const wrapper = useRef<HTMLElement>(null);

  const controlsRef = useRef<HTMLDivElement>(null);

  const mut_gesture = useRef<Gesture>(IDLE_GESTURE);

  const [transform, setTransform] = useState<ViewTransform>(INITIAL);

  const mut_transform = useRef<ViewTransform>(INITIAL);

  const [dragged, setDragged] = useState<NodeDrag | undefined>(undefined);

  // The handle under a mouse or pen, which a press draws an arrow from.
  const [handle, setHandle] = useState<ConnectHandle | undefined>(undefined);

  const mut_handle = useRef<ConnectHandle | undefined>(undefined);

  const showHandle = useCallback((next: ConnectHandle | undefined) => {
    const current = mut_handle.current;

    if (
      current?.id === next?.id &&
      current?.at.x === next?.at.x &&
      current?.at.y === next?.at.y
    ) {
      return;
    }

    mut_handle.current = next;

    setHandle(next);
  }, []);

  const [connecting, setConnecting] = useState<ConnectDrag | undefined>(
    undefined,
  );

  // At the current size, which a layout still being made at it may not be.
  const placed = useMemo(
    () =>
      placeNodes(
        resizeNodes(layout.nodes, nodeSize),
        layout.edges,
        positions,
        membership,
      ),
    [layout.nodes, layout.edges, nodeSize, positions, membership],
  );

  // Where the empty frames are when nothing moves.
  const emptyAt = useMemo(
    () => placeEmptyGroups(membership, layout.groups, placed, groupPositions),
    [membership, layout.groups, placed, groupPositions],
  );

  // The frames as they are when nothing moves, and while a node is dragged.
  const settledFrames = useMemo(
    (): readonly GroupFrame[] =>
      arrangeable ? groupFrames(placed, membership, emptyAt) : [],
    [arrangeable, placed, membership, emptyAt],
  );

  // How far the group being dragged by its title has moved, and its nodes.
  const groupDrag = useMemo((): GroupDrag | undefined => {
    const id = dragged === undefined ? undefined : groupIdOfKey(dragged.id);

    const from = settledFrames.find((frame) => frame.id === id);

    return dragged === undefined || from === undefined
      ? undefined
      : {
          id: from.id,
          dx: dragged.position.x - from.x,
          dy: dragged.position.y - from.y,
          members: new Set(
            membership.find((group) => group.id === from.id)?.members,
          ),
        };
  }, [dragged, settledFrames, membership]);

  // While they move, the nodes moving, wherever they are going; otherwise
  // the nodes of the mode, where it draws them.
  const shown = useMemo(
    () =>
      animated !== undefined
        ? moveNodesTo(placed, animated).filter(({ id }) => animated.has(id))
        : mode === 'arc'
          ? arcNodes
          : mode === 'tile'
            ? tileNodes
            : dragged === undefined
              ? placed
              : placed.map((node) =>
                  node.id === dragged.id
                    ? { ...node, x: dragged.position.x, y: dragged.position.y }
                    : groupDrag?.members.has(node.id) === true
                      ? {
                          ...node,
                          x: node.x + groupDrag.dx,
                          y: node.y + groupDrag.dy,
                        }
                      : node,
                ),
    [placed, dragged, groupDrag, animated, mode, arcNodes, tileNodes],
  );

  // Drawn while the DAG is, and not while the view changes mode: round the
  // nodes moving, or the group dragged, and otherwise as they are.
  const shownFrames = useMemo((): readonly GroupFrame[] => {
    if (!arrangeable || opacities !== undefined) {
      return [];
    }

    if (animated !== undefined) {
      return groupFrames(shown, membership, emptyAt);
    }

    if (groupDrag === undefined) {
      return settledFrames;
    }

    const from = emptyAt.get(groupDrag.id);

    return groupFrames(
      shown,
      membership,
      from === undefined
        ? emptyAt
        : new Map([
            ...emptyAt,
            [
              groupDrag.id,
              { x: from.x + groupDrag.dx, y: from.y + groupDrag.dy },
            ],
          ]),
    );
  }, [
    arrangeable,
    opacities,
    animated,
    groupDrag,
    settledFrames,
    shown,
    membership,
    emptyAt,
  ]);

  // The group a node being dragged would be dropped into, and the one it
  // is in.
  const dropTargets = useMemo((): NodeDropTargets | undefined => {
    const node =
      dragged === undefined || groupDrag !== undefined
        ? undefined
        : shown.find(({ id }) => id === dragged.id);

    if (node === undefined) {
      return undefined;
    }

    return {
      into: dropTarget(settledFrames, node),
      from: groupsByMember(membership).get(node.id),
    };
  }, [dragged, groupDrag, shown, settledFrames, membership]);

  const titles = useMemo(
    () => new Map(groups.map(({ id, title }) => [id, title])),
    [groups],
  );

  // The edges as they are when nothing moves.
  const settled = useMemo(
    () => (arrangeable ? routeEdges(direction, placed, layout.edges) : []),
    [arrangeable, direction, placed, layout.edges],
  );

  const settledArcs = useMemo(
    (): readonly ArcGeometry[] =>
      mode === 'arc' ? arcGeometries(arcNodes, arcEdges) : [],
    [mode, arcNodes, arcEdges],
  );

  // Hidden while the view changes mode, and in 「アーク」 while anything
  // moves: the arcs are drawn for the column alone. 「タイル」 has none.
  const edgesHidden = arrangeable
    ? opacities !== undefined
    : animated !== undefined;

  const highlight = useMemo(
    () =>
      mode === 'arc' && animated === undefined
        ? arcHighlight(pointed, arcEdges)
        : undefined,
    [mode, animated, pointed, arcEdges],
  );

  // Whether routing has been too slow to keep up with this drag.
  const mut_slowDrag = useRef(false);

  const edges = useMemo((): readonly EdgeGeometry[] => {
    if (!arrangeable) {
      return [];
    }

    if (animated !== undefined) {
      return edgeGeometries(direction, shown, layout.edges);
    }

    if (dragged === undefined) {
      mut_slowDrag.current = false;

      return settled;
    }

    if (mut_slowDrag.current) {
      const curves = edgeGeometries(direction, shown, layout.edges);

      // A group's nodes all move: every edge is a curve.
      return GraphNodeIdCodec.is(dragged.id)
        ? withCurvesOf(settled, curves, dragged.id)
        : curves;
    }

    const started = performance.now();

    const routed = routeEdges(direction, shown, layout.edges);

    mut_slowDrag.current = performance.now() - started > DRAG_ROUTING_BUDGET_MS;

    return routed;
  }, [arrangeable, animated, dragged, direction, shown, layout.edges, settled]);

  // Read by a press on a node, which should not have to be made again
  // whenever a node moves: the nodes that can be grabbed, none outside the
  // mode the reader arranges, and the frames, which are read at the drop.
  const mut_placed = useRef<readonly LaidOutNode[]>(placed);

  const mut_frames = useRef<readonly GroupFrame[]>(settledFrames);

  useEffect(() => {
    mut_placed.current = arrangeable ? placed : [];

    mut_frames.current = settledFrames;
  }, [arrangeable, placed, settledFrames]);

  // The nodes a handle can be on: those that can be grabbed, once they are
  // where they are drawn.
  const mut_connectable = useRef<readonly LaidOutNode[]>([]);

  useEffect(() => {
    mut_connectable.current =
      arrangeable && animated === undefined ? placed : [];

    if (!arrangeable || animated !== undefined) {
      showHandle(undefined);
    }
  }, [arrangeable, animated, placed, showHandle]);

  const domain = domainSignal.value;

  // The node the arrow being drawn is over, other than the one it is drawn
  // from, and whether a dependency on that one would be refused.
  const connectTarget = useMemo((): ConnectTarget | undefined => {
    if (connecting === undefined) {
      return undefined;
    }

    const id = dropTargetAt(placed, connecting.to, reachAt(transform.scale));

    const node =
      id === connecting.from
        ? undefined
        : placed.find((placedNode) => placedNode.id === id);

    return node === undefined
      ? undefined
      : {
          node,
          refused:
            dependencyRefusal(
              domain,
              nodeRefOf(node.id),
              nodeRefOf(connecting.from),
            ) !== undefined,
        };
  }, [connecting, placed, transform.scale, domain]);

  // What `fit` shows all of, in the way the mode is read.
  const fitTarget = useMemo(
    (): FitTarget =>
      mode === 'arc'
        ? {
            kind: 'width',
            bounds: arcContentBounds(arcNodes, settledArcs, GRAPH_MARGIN),
          }
        : mode === 'tile'
          ? { kind: 'top' }
          : {
              kind: 'whole',
              bounds: nodesBounds([...placed, ...settledFrames], GRAPH_MARGIN),
            },
    [mode, placed, settledFrames, arcNodes, settledArcs],
  );

  const mut_fitTarget = useRef<FitTarget>(fitTarget);

  useEffect(() => {
    mut_fitTarget.current = fitTarget;
  }, [fitTarget]);

  const show = useCallback((next: ViewTransform) => {
    mut_transform.current = next;

    setTransform(next);
  }, []);

  // Below the toolbar: where 「アーク」 and 「タイル」 start.
  const topInset = useCallback((): number => {
    const bar = toolbarRef.current;

    return (
      (bar === null ? 0 : bar.offsetTop + bar.offsetHeight) + TOOLBAR_CLEARANCE
    );
  }, [toolbarRef]);

  // Where the rows of 「タイル」 are seen: from below the toolbar to above
  // the buttons at the bottom, so the last row is never under them.
  const measureTile = useCallback((): TileFrame | undefined => {
    const element = wrapper.current;

    if (element === null) {
      return undefined;
    }

    const rowsTop = topInset();

    const controls = controlsRef.current;

    const rowsBottom =
      (controls === null ? element.clientHeight : controls.offsetTop) -
      TOOLBAR_CLEARANCE;

    return { topInset: rowsTop, viewport: Math.max(0, rowsBottom - rowsTop) };
  }, [topInset]);

  // For the scroll indicator, which is drawn from it.
  const [tileFrame, setTileFrame] = useState<TileFrame | undefined>(undefined);

  const remeasureTile = useCallback((): TileFrame | undefined => {
    const frame = measureTile();

    setTileFrame((previous) =>
      previous?.topInset === frame?.topInset &&
      previous?.viewport === frame?.viewport
        ? previous
        : frame,
    );

    return frame;
  }, [measureTile]);

  /** 「タイル」 scrolled to `offset`, or as near as it goes. */
  const scrollTileTo = useCallback(
    (offset: number) => {
      const frame = measureTile();

      if (frame === undefined) {
        return;
      }

      const content = tileContentHeight(
        dagLayoutStore.tileNodes.getSnapshot().value,
      );

      show(
        tileViewTransform(
          clampTileScroll(offset, content, frame.viewport),
          frame.topInset,
        ),
      );
    },
    [measureTile, show],
  );

  /** How far 「タイル」 is scrolled. */
  const tileOffset = useCallback(
    (): number => tileScrollOf(mut_transform.current, topInset()),
    [topInset],
  );

  const fit = useCallback(() => {
    const element = wrapper.current;

    if (element === null) {
      return;
    }

    const view = {
      width: element.clientWidth,
      height: element.clientHeight,
    } as const;

    const target = mut_fitTarget.current;

    switch (target.kind) {
      case 'whole':
        show(fitBoundsTransform(target.bounds, view, FIT_PADDING));

        break;

      case 'width':
        show(
          fitWidthTopTransform(target.bounds, view, {
            padding: FIT_PADDING,
            topInset: topInset(),
            minScale: ARC_MIN_SCALE,
          }),
        );

        break;

      case 'top':
        remeasureTile();

        scrollTileTo(0);

        break;
    }
  }, [show, topInset, remeasureTile, scrollTileTo]);

  // Where the view was when the mode changed, for it to follow the nodes
  // from there to the fit of the new mode at their pace; `undefined` when
  // it is where it is going.
  const [viewFrom, setViewFrom] = useState<ViewTransform | undefined>(
    undefined,
  );

  const mut_fittedMode = useRef(mode);

  const mut_fittedRequests = useRef(fitRequests);

  // Show all of it when it is first drawn, when nodes come or go, after
  // 「自動整列」, when the node size changes and when the mode changes — not
  // when a node is moved. Following the nodes, if they move, for a change
  // of mode and whatever the store asks a fit for.
  const structureKey = layout.nodes.map(({ id }) => id).join(' ');

  useEffect(() => {
    const from = mut_transform.current;

    const asked =
      mut_fittedMode.current !== mode ||
      mut_fittedRequests.current !== fitRequests;

    mut_fittedMode.current = mode;

    mut_fittedRequests.current = fitRequests;

    fit();

    setViewFrom(
      asked &&
        dagLayoutStore.animationProgress.getSnapshot().value !== undefined
        ? from
        : undefined,
    );
  }, [fit, structureKey, fitRequests, mode]);

  // Put there at once with the nodes: at the end, or when they are stopped.
  useEffect(() => {
    if (progress === undefined) {
      setViewFrom(undefined);
    }
  }, [progress]);

  const drawnTransform =
    viewFrom === undefined || progress === undefined
      ? transform
      : interpolateTransform(viewFrom, transform, progress);

  // Where a view that starts to follow the nodes now starts from.
  const mut_drawnTransform = useRef(drawnTransform);

  useEffect(() => {
    mut_drawnTransform.current = drawnTransform;
  }, [drawnTransform]);

  // The width of 「タイル」's rows follows the canvas's; in 「タイル」 the
  // view follows the tasks to their new rows, the first of the first row in
  // view staying where it was. Before the first paint, so the rows are
  // there to be drawn from the start.
  useLayoutEffect(() => {
    const element = wrapper.current;

    if (element === null) {
      return undefined;
    }

    const onResize = (): void => {
      const before = dagLayoutStore.tileNodes.getSnapshot().value;

      const offset = tileOffset();

      const from = mut_drawnTransform.current;

      dagLayoutStore.setTileWidth(tileAvailableWidth(element.clientWidth));

      if (dagViewModeStore.mode.getSnapshot().value !== 'tile') {
        return;
      }

      const after = dagLayoutStore.tileNodes.getSnapshot().value;

      remeasureTile();

      scrollTileTo(
        anchoredTileScroll(
          before.map(({ id }) => id),
          positionsOf(before),
          positionsOf(after),
          offset,
          before[0]?.height ?? 0,
        ),
      );

      // Moving with the tasks, as when the mode changes.
      if (
        Arr.isNonEmpty(before) &&
        !samePositions(positionsOf(before), positionsOf(after)) &&
        dagLayoutStore.animationProgress.getSnapshot().value !== undefined
      ) {
        setViewFrom(from);
      }
    };

    onResize();

    const observer = new ResizeObserver(onResize);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [tileOffset, remeasureTile, scrollTileTo]);

  const zoomBy = useCallback(
    (factor: number) => {
      const element = wrapper.current;

      if (element === null) {
        return;
      }

      show(
        zoomAt(
          mut_transform.current,
          factor,
          element.clientWidth / 2,
          element.clientHeight / 2,
        ),
      );
    },
    [show],
  );

  const zoomIn = useCallback(() => {
    zoomBy(BUTTON_ZOOM);
  }, [zoomBy]);

  const zoomOut = useCallback(() => {
    zoomBy(1 / BUTTON_ZOOM);
  }, [zoomBy]);

  const onPointerDown = useCallback<PointerEventHandler<SVGSVGElement>>(
    (pressed) => {
      // Every node where it is going, before one of them is grabbed.
      dagLayoutStore.finishAnimation();

      const pressedHandle = mut_handle.current;

      const grab: Grab | undefined =
        pressedHandle !== undefined &&
        pressed.pointerType !== 'touch' &&
        !Arr.isNonEmpty(mut_gesture.current.pointers)
          ? ({
              kind: 'connect',
              from: pressedHandle.id,
              anchor: pressedHandle.at,
            } as const)
          : grabOf(pressed.target, mut_placed.current, mut_frames.current);

      if (grab?.kind !== 'connect') {
        showHandle(undefined);
      }

      mut_gesture.current = pointerDown(
        mut_gesture.current,
        pointerOf(pressed),
        mut_transform.current,
        grab,
      );

      setDragged(undefined);

      setConnecting(undefined);
    },
    [showHandle],
  );

  const onPointerMove = useCallback<PointerEventHandler<SVGSVGElement>>(
    (moved) => {
      const before = mut_gesture.current;

      // Nothing pressed: a mouse or pen hovering, which may be near an
      // outline.
      if (!Arr.isNonEmpty(before.pointers)) {
        showHandle(
          moved.pointerType === 'touch'
            ? undefined
            : connectHandleAt(
                mut_connectable.current,
                contentPointAt(mut_transform.current, pointerOf(moved)),
                reachAt(mut_transform.current.scale),
              ),
        );

        return;
      }

      const next = pointerMove(before, pointerOf(moved));

      mut_gesture.current = next.gesture;

      // Once it is a drag, the pointer belongs to the canvas even when it
      // leaves it — not before, so that a tap still clicks the node.
      if (!before.dragging && next.gesture.dragging) {
        moved.currentTarget.setPointerCapture(moved.pointerId);
      }

      if (next.gesture.nodeDrag !== before.nodeDrag) {
        setDragged(next.gesture.nodeDrag);
      }

      if (next.gesture.connectDrag !== before.connectDrag) {
        setConnecting(next.gesture.connectDrag);
      }

      if (next.transform === undefined) {
        return;
      }

      if (mode !== 'tile') {
        show(next.transform);

        return;
      }

      // Down and up alone, and no pinch.
      if (!Arr.isMinLengthArray(2, next.gesture.pointers)) {
        scrollTileTo(tileScrollOf(next.transform, topInset()));
      }
    },
    [mode, show, scrollTileTo, topInset, showHandle],
  );

  const onPointerEnd = useCallback<PointerEventHandler<SVGSVGElement>>(
    (ended) => {
      const { gesture, dropped, connected } = pointerUp(
        mut_gesture.current,
        ended.pointerId,
        mut_transform.current,
      );

      mut_gesture.current = gesture;

      // A cancelled pointer (the system took it over) drops nothing.
      if (dropped !== undefined && ended.type === 'pointerup') {
        dropDragged(dropped, mut_placed.current, mut_frames.current);
      }

      const target =
        connected === undefined || ended.type !== 'pointerup'
          ? undefined
          : dropTargetAt(
              mut_placed.current,
              connected.to,
              reachAt(mut_transform.current.scale),
            );

      // Dropped back on the node it was drawn from: nothing.
      if (
        connected !== undefined &&
        target !== undefined &&
        target !== connected.from
      ) {
        dataStore.addDependency(nodeRefOf(target), nodeRefOf(connected.from));
      }

      setDragged(undefined);

      setConnecting(undefined);

      // Shown again by the next move, where the pointer is then.
      showHandle(undefined);
    },
    [showHandle],
  );

  const onPointerLeaveCanvas = useCallback<PointerEventHandler<SVGSVGElement>>(
    (left) => {
      onPointerLeave(left);

      showHandle(undefined);
    },
    [onPointerLeave, showHandle],
  );

  const onClickCapture = useCallback<MouseEventHandler<SVGSVGElement>>(
    (clicked) => {
      if (!mut_gesture.current.dragging) {
        return;
      }

      clicked.stopPropagation();

      clicked.preventDefault();
    },
    [],
  );

  const onWheel = useCallback<WheelEventHandler<SVGSVGElement>>(
    (wheeled) => {
      wheeled.preventDefault();

      // A pinch on a trackpad comes as a wheel with Ctrl, and zooms
      // nothing in 「タイル」.
      if (mode === 'tile' && wheeled.ctrlKey) {
        return;
      }

      if (mode === 'tile') {
        scrollTileTo(
          tileOffset() +
            wheelScrollPixels(
              wheeled.deltaY,
              wheeled.deltaMode,
              measureTile()?.viewport ?? 0,
            ),
        );

        return;
      }

      const bounds = wheeled.currentTarget.getBoundingClientRect();

      show(
        zoomAt(
          mut_transform.current,
          wheelZoomFactor(wheeled.deltaY, wheeled.deltaMode),
          wheeled.clientX - bounds.left,
          wheeled.clientY - bounds.top,
        ),
      );
    },
    [mode, show, scrollTileTo, tileOffset, measureTile],
  );

  // The canvas itself takes no keys; the nodes do. This puts the nodes
  // where they are going, keeps a key pressed on a node from scrolling the
  // page behind the dialog it opens, and in 「タイル」 scrolls the rows.
  const onKeyDown = useCallback<KeyboardEventHandler<SVGSVGElement>>(
    (pressed) => {
      dagLayoutStore.finishAnimation();

      if (pressed.key === ' ') {
        pressed.preventDefault();
      }

      const frame = mode === 'tile' ? measureTile() : undefined;

      const target =
        frame === undefined
          ? undefined
          : tileKeyScroll(
              pressed.key,
              tileOffset(),
              frame.viewport,
              tileContentHeight(dagLayoutStore.tileNodes.getSnapshot().value),
            );

      if (target === undefined) {
        return;
      }

      pressed.preventDefault();

      scrollTileTo(target);
    },
    [mode, measureTile, tileOffset, scrollTileTo],
  );

  // In 「タイル」, a task given the focus — by Tab — is scrolled into view.
  const onFocusIn = useCallback<FocusEventHandler<SVGSVGElement>>(
    (focusedIn) => {
      onFocusCapture(focusedIn);

      if (mode !== 'tile') {
        return;
      }

      const id = nodeIdOf(focusedIn.target);

      const node = dagLayoutStore.tileNodes
        .getSnapshot()
        .value.find((tile) => tile.id === id);

      const frame = measureTile();

      if (node === undefined || frame === undefined) {
        return;
      }

      scrollTileTo(
        revealTileScroll(
          tileOffset(),
          node.y,
          node.y + node.height,
          frame.viewport,
        ),
      );
    },
    [mode, onFocusCapture, measureTile, scrollTileTo, tileOffset],
  );

  const thumb =
    mode === 'tile' && animated === undefined && tileFrame !== undefined
      ? tileScrollThumb(
          tileScrollOf(transform, tileFrame.topInset),
          tileFrame.viewport,
          tileContentHeight(tileNodes),
          tileFrame.viewport,
        )
      : undefined;

  // In 「タイル」, the rows are cut off at the toolbar's bottom edge as they
  // scroll up, as a scrolled box would cut them, rather than showing
  // through it.
  const clipTop =
    mode === 'tile' && tileFrame !== undefined
      ? tileFrame.topInset - TOOLBAR_CLEARANCE
      : undefined;

  const thumbTop =
    thumb === undefined || tileFrame === undefined
      ? undefined
      : tileFrame.topInset + thumb.top;

  const thumbHeight = thumb?.height;

  const thumbStyle = useMemo(
    () =>
      thumbTop === undefined || thumbHeight === undefined
        ? undefined
        : ({ top: `${thumbTop}px`, height: `${thumbHeight}px` } as const),
    [thumbTop, thumbHeight],
  );

  return (
    <figure ref={wrapper} className={'dag-canvas'}>
      <figcaption className={'visually-hidden'}>{captions[mode]}</figcaption>
      <svg
        className={'dag-svg'}
        data-animating={animated !== undefined}
        data-connect={handle !== undefined || connecting !== undefined}
        data-e2e={'dag-canvas'}
        data-mode={mode}
        data-motion={motion}
        onBlurCapture={onBlurCapture}
        onClickCapture={onClickCapture}
        onFocusCapture={onFocusIn}
        onKeyDown={onKeyDown}
        onPointerCancel={onPointerEnd}
        onPointerDown={onPointerDown}
        onPointerLeave={onPointerLeaveCanvas}
        onPointerMove={onPointerMove}
        onPointerOver={onPointerOver}
        onPointerUp={onPointerEnd}
        onWheel={onWheel}
      >
        <defs>
          <marker
            id={'dag-arrow'}
            markerHeight={8}
            markerWidth={8}
            orient={'auto-start-reverse'}
            refX={9}
            refY={5}
            viewBox={'0 0 10 10'}
          >
            <path className={'dag-arrow'} d={'M 0 0 L 10 5 L 0 10 z'} />
          </marker>
          <marker
            id={'dag-arrow-highlight'}
            markerHeight={8}
            markerWidth={8}
            orient={'auto-start-reverse'}
            refX={9}
            refY={5}
            viewBox={'0 0 10 10'}
          >
            <path
              className={'dag-arrow-highlight'}
              d={'M 0 0 L 10 5 L 0 10 z'}
            />
          </marker>
          <marker
            id={'dag-arrow-connect'}
            markerHeight={8}
            markerWidth={8}
            orient={'auto-start-reverse'}
            refX={9}
            refY={5}
            viewBox={'0 0 10 10'}
          >
            <path className={'dag-arrow-connect'} d={'M 0 0 L 10 5 L 0 10 z'} />
          </marker>
          <marker
            id={'dag-arrow-refused'}
            markerHeight={8}
            markerWidth={8}
            orient={'auto-start-reverse'}
            refX={9}
            refY={5}
            viewBox={'0 0 10 10'}
          >
            <path className={'dag-arrow-refused'} d={'M 0 0 L 10 5 L 0 10 z'} />
          </marker>
          {clipTop === undefined ? undefined : (
            <clipPath id={'dag-tile-clip'}>
              <rect height={'100%'} width={'100%'} x={0} y={clipTop} />
            </clipPath>
          )}
        </defs>
        <g clipPath={clipTop === undefined ? undefined : 'url(#dag-tile-clip)'}>
          <g
            transform={`translate(${drawnTransform.x} ${drawnTransform.y}) scale(${drawnTransform.scale})`}
          >
            {shownFrames.map((frame) => (
              <DagGroupFrame
                key={frame.id}
                dragging={frame.id === groupDrag?.id}
                drop={
                  dropTargets === undefined ||
                  dropTargets.into === dropTargets.from
                    ? undefined
                    : frame.id === dropTargets.into
                      ? 'into'
                      : frame.id === dropTargets.from
                        ? 'leave'
                        : undefined
                }
                frame={frame}
                title={titles.get(frame.id) ?? ''}
              />
            ))}
            {edgesHidden ? undefined : (
              // Mounted afresh when they come back, which fades them in.
              <g className={'dag-edges'}>
                {edges.map((edge) => (
                  <DagEdge key={edge.id} edge={edge} />
                ))}
                {settledArcs.map((arc) => (
                  <DagArcEdge
                    key={arc.id}
                    arc={arc}
                    highlight={highlightOf(highlight?.edges, arc.id)}
                  />
                ))}
              </g>
            )}
            {shown.map((node) => {
              const view = views.get(node.id);

              const isDragged = node.id === dragged?.id;

              const nodeHighlight = highlightOf(highlight?.nodes, node.id);

              const opacity = opacities?.get(node.id);

              return view === undefined ? undefined : view.kind === 'task' ? (
                <DagTaskNode
                  key={node.id}
                  compact={compact}
                  dragging={isDragged}
                  highlight={nodeHighlight}
                  movable={arrangeable}
                  node={node}
                  opacity={opacity}
                  view={view}
                />
              ) : (
                <DagMilestoneNode
                  key={node.id}
                  compact={compact}
                  dragging={isDragged}
                  highlight={nodeHighlight}
                  movable={arrangeable}
                  node={node}
                  opacity={opacity}
                  view={view}
                />
              );
            })}
            {arrangeable ? (
              <DagConnectOverlay
                connecting={connecting}
                handle={connecting === undefined ? handle : undefined}
                scale={drawnTransform.scale}
                target={connectTarget}
              />
            ) : undefined}
          </g>
        </g>
      </svg>
      {thumbStyle === undefined ? undefined : (
        <div
          aria-hidden={'true'}
          className={'dag-scroll-thumb'}
          data-e2e={'dag-scroll-thumb'}
          style={thumbStyle}
        />
      )}
      <div ref={controlsRef} className={'dag-controls'}>
        {mode === 'tile' ? undefined : (
          <>
            <button
              aria-label={'拡大'}
              className={'bp6-button'}
              data-e2e={'dag-zoom-in'}
              type={'button'}
              onClick={zoomIn}
            >
              {'＋'}
            </button>
            <button
              aria-label={'縮小'}
              className={'bp6-button'}
              data-e2e={'dag-zoom-out'}
              type={'button'}
              onClick={zoomOut}
            >
              {'－'}
            </button>
          </>
        )}
        <button
          className={'bp6-button'}
          data-e2e={'dag-fit'}
          type={'button'}
          onClick={fit}
        >
          {'全体表示'}
        </button>
      </div>
    </figure>
  );
});

const INITIAL: ViewTransform = { x: 0, y: 0, scale: 1 } as const;

/** Clear around the nodes, as ELK leaves (`elk.padding`). */
const GRAPH_MARGIN = 24;

const FIT_PADDING = 16;

/**
 * The least scale 「アーク」 is fitted at: a long column is panned down
 * rather than shrunk out of reading.
 */
const ARC_MIN_SCALE = 0.5;

/** Between the toolbar and the top of 「アーク」 fitted below it. */
const TOOLBAR_CLEARANCE = 8;

/** The group dragged by its title: how far, and the nodes moving with it. */
type GroupDrag = Readonly<{
  id: GroupId;
  dx: number;
  dy: number;
  members: ReadonlySet<GraphNodeId>;
}>;

/**
 * The group a node being dragged would go into if dropped now, and the one
 * it is in; `undefined` for none.
 */
type NodeDropTargets = Readonly<{
  into: GroupId | undefined;
  from: GroupId | undefined;
}>;

/** What `fit` shows: all of it, its width from the top, or the top. */
type FitTarget = Readonly<
  { kind: 'whole' | 'width'; bounds: Bounds } | { kind: 'top' }
>;

/**
 * Where 「タイル」 is seen: the top of its rows when not scrolled, and how
 * high the part of the canvas they are seen in is.
 */
type TileFrame = Readonly<{ topInset: number; viewport: number }>;

/** What the canvas shows, for a screen reader. */
const captions = {
  dag: '依存関係グラフ。ノードを選ぶと詳細を開きます。ノードはドラッグか矢印キーで動かせます。ノードの縁の丸からほかのノードへドラッグすると、ドロップしたノードがそのノードに依存します。背景のドラッグで移動、ホイールかピンチで拡大縮小できます。',
  arc: 'アークダイアグラム。タスクをタイトル順に縦に並べ、依存を右側の弧で示します。破線はマイルストーンを経由する依存です。タスクを選ぶと詳細を開きます。ドラッグで移動、ホイールかピンチで拡大縮小できます。',
  tile: 'タスクをタイトル順に左上から横に並べ、幅に収まらない分は次の行に折り返します。依存は示しません。タスクを選ぶと詳細を開きます。ホイール、ドラッグ、Page Up・Page Down・Home・End キーで縦にスクロールできます。',
} as const satisfies ReadonlyRecord<DagViewMode, string>;

const BUTTON_ZOOM = 1.25;

/**
 * How near a node's outline, on the screen, a mouse or pen shows its handle
 * — outside the node, where an arrow dropped still joins it, and inside it,
 * where the rest is for moving it.
 */
const HANDLE_REACH_PX = { outside: 10, inside: 5 } as const;

/** {@link HANDLE_REACH_PX} in content coordinates, at the zoom `scale`. */
const reachAt = (scale: number): ConnectReach =>
  Num.isNonZero(scale)
    ? ({
        outside: Num.div(HANDLE_REACH_PX.outside, scale),
        inside: Num.div(HANDLE_REACH_PX.inside, scale),
      } as const)
    : HANDLE_REACH_PX;

/**
 * How long routing the edges for one move of a drag may take before the
 * rest of the drag stops doing it: most of a frame.
 */
const DRAG_ROUTING_BUDGET_MS = 10;

/** The pointer, in the canvas's own coordinates. */
const pointerOf = (
  source: Readonly<{
    pointerId: number;
    clientX: number;
    clientY: number;
    currentTarget: Readonly<{ getBoundingClientRect: () => DOMRect }>;
  }>,
): Readonly<{ id: number; x: number; y: number }> => {
  const bounds = source.currentTarget.getBoundingClientRect();

  return {
    id: source.pointerId,
    x: source.clientX - bounds.left,
    y: source.clientY - bounds.top,
  };
};

/**
 * The node under a press, by the `data-node-id` of the element it landed in,
 * and where that node is, or the group whose title it landed on, by its
 * `data-group-id`, and where its frame is; `undefined` on the background,
 * inside a frame included.
 */
const grabOf = (
  target: EventTarget | null,
  nodes: readonly LaidOutNode[],
  drawnFrames: readonly GroupFrame[],
): Grab | undefined => {
  const id = nodeIdOf(target);

  if (id === undefined) {
    const group = groupIdOf(target);

    const frame = drawnFrames.find((candidate) => candidate.id === group);

    return frame === undefined
      ? undefined
      : {
          kind: 'node',
          id: groupKey(frame.id),
          origin: { x: frame.x, y: frame.y },
        };
  }

  const node = nodes.find((placedNode) => placedNode.id === id);

  return node === undefined
    ? undefined
    : { kind: 'node', id, origin: { x: node.x, y: node.y } };
};

/** The group whose title `target` is part of, by its `data-group-id`. */
const groupIdOf = (target: EventTarget | null): GroupId | undefined => {
  const element =
    target instanceof Element ? target.closest('[data-group-id]') : null;

  const id =
    element instanceof SVGElement ? element.dataset['groupId'] : undefined;

  return id !== undefined && GroupIdCodec.is(id) ? id : undefined;
};

/**
 * What a drag ends with: a frame dragged by its title moves there with its
 * nodes; a node is put there, in the group of the frame it was dropped in,
 * of those it was picked up among, or in none.
 */
const dropDragged = (
  dropped: NodeDrag,
  nodes: readonly LaidOutNode[],
  drawnFrames: readonly GroupFrame[],
): void => {
  const group = groupIdOfKey(dropped.id);

  if (group !== undefined) {
    dagLayoutStore.moveGroup(group, dropped.position);

    return;
  }

  const node = nodes.find(({ id }) => id === dropped.id);

  if (node === undefined || !GraphNodeIdCodec.is(dropped.id)) {
    return;
  }

  dagLayoutStore.dropNode(
    dropped.id,
    dropped.position,
    dropTarget(drawnFrames, { ...node, ...dropped.position }),
  );
};
