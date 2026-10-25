import {
  combine,
  createState,
  map,
  onScopeDispose,
  skipIfNoChange,
  type InitializedObservable,
} from 'synstate';
import { constant, For, If, MatchOptional, view, type JSX } from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  actualSizeTopTransform,
  anchoredTileScroll,
  cancelConnect,
  clampTileScroll,
  connectHandleAt,
  contentPointAt,
  dropTarget,
  dropTargetAt,
  fitBelowTransform,
  groupIdOfKey,
  groupKey,
  IDLE_GESTURE,
  lassoPathData,
  nodesInLasso,
  pointerDown,
  pointerMove,
  pointerUp,
  positionsOf,
  revealTileScroll,
  samePositions,
  tileAvailableWidth,
  tileContentHeight,
  tileKeyScroll,
  tileScrollOf,
  tileScrollThumb,
  tileViewTransform,
  wheelScrollPixels,
  wheelZoomFactor,
  zoomAt,
  type ConnectDrag,
  type ConnectHandle,
  type Gesture,
  type Grab,
  type GraphLayout,
  type GroupFrame,
  type LaidOutNode,
  type LassoShape,
  type MilestoneNodeView,
  type NodeDrag,
  type Point,
  type TaskNodeView,
  type ViewTransform,
} from '../dag/index.mjs';
import {
  GraphNodeIdCodec,
  GroupIdCodec,
  nodeRefOf,
  type GraphNodeId,
  type GroupId,
} from '../domain/index.mjs';
import {
  animationSettingStore,
  dagLayoutStore,
  dagSelectionStore,
  dagViewModeStore,
  dataStore,
  reducedMotionStore,
} from '../store/index.mjs';
import { shouldAnimate, type DagViewMode } from '../view-model/index.mjs';
import { DagArcEdge } from './dag-arc-edge.js';
import {
  createDagCanvasScene,
  reachAt,
  type DagNodeRecord,
  type SelectedEdge,
} from './dag-canvas-scene.mjs';
import { DagConnectOverlay } from './dag-connect-overlay.js';
import { DagEdgeDelete } from './dag-edge-delete.js';
import { DagEdge } from './dag-edge.js';
import { DagGroupFrame } from './dag-group-frame.js';
import { DagMilestoneNode } from './dag-milestone-node.js';
import { nodeIdOf } from './dag-node-handlers.mjs';
import { DagTaskNode } from './dag-task-node.js';
import {
  createAfterUpdate,
  listenInScope,
  subscribeInScope,
} from './scope-effects.mjs';

type Props = Readonly<{
  /** ELK's layout, which places every node not put anywhere by hand. */
  layout: InitializedObservable<GraphLayout>;
  /** The toolbar over the canvas, which every mode is fitted below. */
  toolbar: () => HTMLDivElement | undefined;
}>;

/**
 * The graph as SVG: every node where it was put, or where ELK has it, and
 * the edges drawn between them (`dag/edge-routing.mts`). The background can
 * be panned by dragging, the whole zoomed with the wheel or two fingers and
 * fitted to the screen; a node can be dragged to a new place, which is saved
 * when it is dropped. What a pointer does is `dag/gesture.mts`, and what is
 * drawn where is `dag-canvas-scene.mts`; this forwards the events and draws.
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
 * nodes, and a tap on the title opens the group. `touch-action: none`
 * (`index.css`) keeps the browser from scrolling or zooming the page
 * instead.
 *
 * In 「DAG」, a mouse or pen near a node's outline — outside the node or just
 * inside (`reachAt`) — shows a handle there (`dag/connect-handle.mts`), and a
 * drag from it draws an arrow instead of moving the node. Dropped on another
 * node, the arrow makes that node depend on the one it was drawn from
 * (`dataStore.addDependency`), unless that would be refused — a dependency
 * already there, or a cycle — which the node it is over shows before the
 * drop, and a notice says after it. Escape gives the arrow up before it is
 * dropped, wherever the focus is. A touch has no pointer to come near with,
 * and so no handle.
 *
 * In 「DAG」, an edge pointed at is drawn in the focus colour, and a click on
 * it selects it and shows a button there (`dag-edge-delete.tsx`) that
 * deletes the dependency it stands for (`dataStore.removeDependency`); the
 * button has the focus, so Delete or Backspace deletes it too, and Escape, a
 * click anywhere else or anything that moves the edge leaves it as it is.
 *
 * In 「DAG」, a drag on the background with Shift held — or with
 * 「なげなわ」 on, which a touch needs — draws a lasso (`dag/lasso.mts`)
 * instead of panning; with 「矩形選択」 on, it drags out a rectangle from
 * where it went down, with Shift held or not. Either tool turns the other
 * off. The nodes the lasso or the rectangle closes round are selected
 * (`dagSelectionStore`) in place of what was; a tap on the background, or
 * Escape, selects none. A drag that starts on a selected node moves every
 * selected node with it, each staying in its group, whose frame follows
 * it; 「一括編集」 (`dag-selection-bar.tsx`) is what moves them to another.
 *
 * While the nodes move to their places (`dagLayoutStore.animatedPositions`)
 * the edges are plain curves, and they are routed round the nodes once the
 * nodes are there; a press or a key on the canvas puts them there at once.
 * A dragged node's edges are routed at every move — unless that has taken
 * too long, when the rest of the drag draws them as plain curves and leaves
 * the others as they were, and the drop routes them all.
 *
 * In 「アーク」 the tasks and the milestones are in a column
 * (`dagLayoutStore.arcNodes`) with arcs beside it (`dag/arc-geometry.mts`),
 * and do not move: a press on one pans as one on the background does, and a
 * tap still opens it. Pointing at a node, or focusing it, brings its arcs
 * and the nodes at their other ends forward and dims the rest
 * (`dag/arc-highlight.mts`). The view shows the whole column, between the
 * toolbar and the buttons at the bottom, however small that makes it; the
 * button there, 「等倍表示」, puts it at its natural size from the top, below
 * the toolbar, to be read by panning, and then reads 「全体表示」 to go back.
 * Changing mode shows the whole column again.
 *
 * In 「タイル」 the tasks are in rows across the canvas
 * (`dagLayoutStore.tileNodes`), with no edges, at zoom 1, and the view is
 * only scrolled down and up (`dag/tile-scroll.mts`): by the wheel, a drag
 * anywhere — on a task too, which a tap still opens — and Page Up, Page
 * Down, Home and End, with the focus on a task, on the canvas, which takes
 * it in this mode, or nowhere; a task given the focus is scrolled into view.
 * The canvas reports its width (`dagLayoutStore.setTileWidth`); when it
 * changes, the tasks move to their new rows and the view follows them,
 * keeping the first task of the first row in view where it was. A thin
 * thumb on the right says how far down the view is.
 *
 * Every node is drawn at the reader's node size, 「標準」 or 「コンパクト」
 * (`nodeSizeStore`) — a layout ELK made at the other size, while the next is
 * computed, at this one — and the edges are routed between those boxes.
 *
 * While the view changes mode, the edges are hidden; the nodes one of the
 * modes does not draw fade (`dagLayoutStore.animatedOpacities`), and the
 * view moves to the new mode's fit at the nodes' pace
 * (`dagLayoutStore.animationProgress`), so that what fades stays in sight.
 * The edges fade in once they are back, when the reader's setting animates.
 */
export const DagCanvas = ({ layout, toolbar }: Props): JSX.Element => {
  const { mode } = dagViewModeStore;

  const { animatedPositions: animated, tileNodes } = dagLayoutStore;

  const [transform$, setTransform, { getSnapshot: getTransform }] =
    createState<ViewTransform>(INITIAL);

  const [dragged$, setDragged] = createState<NodeDrag | undefined>(undefined);

  const [handle$, setHandle, { getSnapshot: getHandle }] = createState<
    ConnectHandle | undefined
  >(undefined, { equals: sameHandle });

  const [connecting$, setConnecting, { getSnapshot: getConnecting }] =
    createState<ConnectDrag | undefined>(undefined);

  const [selectedEdge$, setSelectedEdge, { getSnapshot: getSelectedEdge }] =
    createState<SelectedEdge | undefined>(undefined);

  // 「なげなわ」 or 「矩形選択」: whether a drag on the background draws a
  // lasso — freehand, as one with Shift does, or a rectangle — rather than
  // panning.
  const [
    lassoTool$,
    ,
    { updateState: updateLassoTool, getSnapshot: getLassoTool },
  ] = createState<LassoShape | undefined>(undefined);

  const [lasso$, setLasso] = createState<readonly Point[] | undefined>(
    undefined,
  );

  // For the scroll indicator, which is drawn from it.
  const [tileFrame$, setTileFrame] = createState<TileFrame | undefined>(
    undefined,
    { equals: sameTileFrame },
  );

  const [viewFrom$, setViewFrom] = createState<ViewTransform | undefined>(
    undefined,
  );

  // How 「アーク」 is fitted: the whole column, as it is first shown, or at
  // its natural size from the top, to be panned down.
  const [
    arcZoom$,
    setArcZoom,
    { updateState: updateArcZoom, getSnapshot: getArcZoom },
  ] = createState<ArcZoom>('whole');

  // The node of the canvas the reader is pointing at — under the pointer,
  // or failing that, the one with the keyboard focus — for the arc
  // diagram's highlight. A touch points at a node for as long as the finger
  // is on it.
  const [hovered$, setHovered] = createState<GraphNodeId | undefined>(
    undefined,
  );

  const [focused$, setFocused] = createState<GraphNodeId | undefined>(
    undefined,
  );

  const scene = createDagCanvasScene({
    layout,
    transform: transform$,
    dragged: dragged$,
    handle: handle$,
    connecting: connecting$,
    selectedEdge: selectedEdge$,
    lasso: lasso$,
    viewFrom: viewFrom$,
    pointed: combine([hovered$, focused$]).pipe(
      map(([hovered, focused]) => hovered ?? focused),
    ),
  });

  const afterUpdate = createAfterUpdate();

  const mut_elements: {
    wrapper: HTMLElement | undefined;
    controls: HTMLDivElement | undefined;
  } = { wrapper: undefined, controls: undefined };

  let mut_gesture: Gesture = IDLE_GESTURE;

  // Below the toolbar: where every mode is fitted from.
  const topInset = (): number => {
    const bar = toolbar();

    return (
      (bar === undefined ? 0 : bar.offsetTop + bar.offsetHeight) +
      TOOLBAR_CLEARANCE
    );
  };

  // From above the buttons at the bottom to the bottom of the canvas: what
  // a fit keeps clear of, so that nothing is fitted under them.
  const bottomInset = (): number => {
    const element = mut_elements.wrapper;

    const controls = mut_elements.controls;

    return element === undefined || controls === undefined
      ? 0
      : element.clientHeight - controls.offsetTop + TOOLBAR_CLEARANCE;
  };

  // Where the rows of 「タイル」 are seen: from below the toolbar to above
  // the buttons at the bottom, so the last row is never under them.
  const measureTile = (): TileFrame | undefined => {
    const element = mut_elements.wrapper;

    if (element === undefined) {
      return undefined;
    }

    const rowsTop = topInset();

    const rowsBottom = element.clientHeight - bottomInset();

    return { topInset: rowsTop, viewport: Math.max(0, rowsBottom - rowsTop) };
  };

  const remeasureTile = (): void => {
    setTileFrame(measureTile());
  };

  /** 「タイル」 scrolled to `offset`, or as near as it goes. */
  const scrollTileTo = (offset: number): void => {
    const frame = measureTile();

    if (frame === undefined) {
      return;
    }

    const content = tileContentHeight(tileNodes.getSnapshot().value);

    setTransform(
      tileViewTransform(
        clampTileScroll(offset, content, frame.viewport),
        frame.topInset,
      ),
    );
  };

  /** How far 「タイル」 is scrolled. */
  const tileOffset = (): number => tileScrollOf(getTransform(), topInset());

  const fit = (): void => {
    const element = mut_elements.wrapper;

    if (element === undefined) {
      return;
    }

    const size = {
      width: element.clientWidth,
      height: element.clientHeight,
    } as const;

    const target = scene.fitTarget.getSnapshot().value;

    switch (target.kind) {
      case 'whole':
        setTransform(
          fitBelowTransform(target.bounds, size, {
            padding: FIT_PADDING,
            topInset: topInset(),
            bottomInset: bottomInset(),
          }),
        );

        break;

      case 'column':
        setTransform(
          getArcZoom() === 'whole'
            ? fitBelowTransform(target.bounds, size, {
                padding: FIT_PADDING,
                topInset: topInset(),
                bottomInset: bottomInset(),
              })
            : actualSizeTopTransform(target.bounds, size, {
                padding: FIT_PADDING,
                topInset: topInset(),
              }),
        );

        break;

      case 'top':
        remeasureTile();

        scrollTileTo(0);

        break;
    }
  };

  // The button under the canvas: 「全体表示」, or in 「アーク」 the other
  // of the whole column and its natural size.
  const pressFit = (): void => {
    if (mode.getSnapshot().value === 'arc') {
      updateArcZoom(otherArcZoom);
    }

    fit();
  };

  const zoomBy = (factor: number): void => {
    const element = mut_elements.wrapper;

    if (element === undefined) {
      return;
    }

    setTransform(
      zoomAt(
        getTransform(),
        factor,
        element.clientWidth / 2,
        element.clientHeight / 2,
      ),
    );
  };

  /**
   * In 「タイル」, the rows scrolled as `key` says (`tileKeyScroll`); whether
   * it said anything.
   */
  const scrollTileByKey = (key: string): boolean => {
    const frame =
      mode.getSnapshot().value === 'tile' ? measureTile() : undefined;

    const target =
      frame === undefined
        ? undefined
        : tileKeyScroll(
            key,
            tileOffset(),
            frame.viewport,
            tileContentHeight(tileNodes.getSnapshot().value),
          );

    if (target === undefined) {
      return false;
    }

    scrollTileTo(target);

    return true;
  };

  // The width of 「タイル」's rows follows the canvas's; in 「タイル」 the
  // view follows the tasks to their new rows, the first of the first row in
  // view staying where it was.
  const onResize = (): void => {
    const element = mut_elements.wrapper;

    if (element === undefined) {
      return;
    }

    const before = tileNodes.getSnapshot().value;

    const offset = tileOffset();

    const from = scene.drawnTransform.getSnapshot().value;

    dagLayoutStore.setTileWidth(tileAvailableWidth(element.clientWidth));

    if (mode.getSnapshot().value !== 'tile') {
      return;
    }

    const after = tileNodes.getSnapshot().value;

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

  const observer = new ResizeObserver(onResize);

  // Measured once it is in the document, before the first paint, so the
  // rows are there to be drawn from the start.
  afterUpdate(() => {
    const element = mut_elements.wrapper;

    if (element === undefined) {
      return;
    }

    onResize();

    observer.observe(element);
  });

  onScopeDispose(() => {
    observer.disconnect();
  });

  // Show all of it when it is first drawn, when nodes come or go, after
  // 「自動整列」, when the node size changes and when the mode changes — not
  // when a node is moved. Following the nodes, if they move, for a change
  // of mode and whatever the store asks a fit for.
  const mut_fitted: {
    mode: DagViewMode;
    requests: number;
    queued: boolean;
  } = {
    mode: mode.getSnapshot().value,
    requests: dagLayoutStore.fitRequests.getSnapshot().value,
    queued: false,
  };

  const structureKey = layout
    .pipe(map(({ nodes }) => nodes.map(({ id }) => id).join(' ')))
    .pipe(skipIfNoChange());

  subscribeInScope(
    combine([structureKey, dagLayoutStore.fitRequests, mode]),
    () => {
      if (mut_fitted.queued) {
        return;
      }

      mut_fitted.queued = true;

      afterUpdate(() => {
        mut_fitted.queued = false;

        const from = getTransform();

        const currentMode = mode.getSnapshot().value;

        const requests = dagLayoutStore.fitRequests.getSnapshot().value;

        const asked =
          mut_fitted.mode !== currentMode || mut_fitted.requests !== requests;

        if (mut_fitted.mode !== currentMode) {
          setArcZoom('whole');
        }

        mut_fitted.mode = currentMode;

        mut_fitted.requests = requests;

        fit();

        setViewFrom(
          asked &&
            dagLayoutStore.animationProgress.getSnapshot().value !== undefined
            ? from
            : undefined,
        );
      });
    },
  );

  // Put there at once with the nodes: at the end, or when they are stopped.
  subscribeInScope(dagLayoutStore.animationProgress, (progress) => {
    if (progress !== undefined) {
      return;
    }

    afterUpdate(() => {
      if (dagLayoutStore.animationProgress.getSnapshot().value === undefined) {
        setViewFrom(undefined);
      }
    });
  });

  // No handle outside the mode the reader arranges, nor while the nodes
  // move to their places: it would be on a node that is not there.
  subscribeInScope(scene.connectable, (nodes) => {
    if (Arr.isNonEmpty(nodes)) {
      return;
    }

    afterUpdate(() => {
      setHandle(undefined);
    });
  });

  // Escape while an arrow is drawn gives it up. Listened for on the window,
  // since the focus need not be on the canvas then.
  listenInScope(globalThis, 'keydown', (pressed) => {
    if (
      !(pressed instanceof KeyboardEvent) ||
      pressed.key !== 'Escape' ||
      getConnecting() === undefined
    ) {
      return;
    }

    pressed.preventDefault();

    mut_gesture = cancelConnect(mut_gesture);

    setConnecting(undefined);

    setHandle(undefined);
  });

  // A key with the focus nowhere — on the page itself, as it is when the
  // page opens — scrolls 「タイル」 as one on the canvas does.
  listenInScope(document, 'keydown', (pressed) => {
    if (
      !(pressed instanceof KeyboardEvent) ||
      pressed.defaultPrevented ||
      pressed.target !== document.body ||
      !scrollTileByKey(pressed.key)
    ) {
      return;
    }

    pressed.preventDefault();
  });

  const onPointerDown = (pressed: SvgPointerEvent): void => {
    // Every node where it is going, before one of them is grabbed.
    dagLayoutStore.finishAnimation();

    const pressedHandle = getHandle();

    const movableNodes = scene.movableNodes.getSnapshot().value;

    const first = !Arr.isNonEmpty(mut_gesture.pointers);

    const grab: Grab | undefined =
      first && pressedHandle !== undefined && pressed.pointerType !== 'touch'
        ? ({
            kind: 'connect',
            from: pressedHandle.id,
            anchor: pressedHandle.at,
          } as const)
        : (grabOf(
            pressed.target,
            movableNodes,
            scene.settledFrames.getSnapshot().value,
          ) ??
          // The background, in the mode the reader arranges.
          (first &&
          Arr.isNonEmpty(movableNodes) &&
          (pressed.shiftKey || getLassoTool() !== undefined)
            ? ({
                kind: 'lasso',
                shape: getLassoTool() ?? 'freehand',
              } as const)
            : undefined));

    if (grab?.kind !== 'connect') {
      setHandle(undefined);
    }

    mut_gesture = pointerDown(
      mut_gesture,
      pointerOf(pressed),
      getTransform(),
      grab,
    );

    setDragged(undefined);

    setConnecting(undefined);

    setLasso(undefined);
  };

  const onPointerMove = (moved: SvgPointerEvent): void => {
    const before = mut_gesture;

    // Nothing pressed: a mouse or pen hovering, which may be near an
    // outline.
    if (!Arr.isNonEmpty(before.pointers)) {
      setHandle(
        moved.pointerType === 'touch'
          ? undefined
          : connectHandleAt(
              scene.connectable.getSnapshot().value,
              contentPointAt(getTransform(), pointerOf(moved)),
              reachAt(getTransform().scale),
            ),
      );

      return;
    }

    const next = pointerMove(before, pointerOf(moved));

    mut_gesture = next.gesture;

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

    if (next.gesture.lasso !== before.lasso) {
      setLasso(next.gesture.lasso);
    }

    if (next.transform === undefined) {
      return;
    }

    if (mode.getSnapshot().value !== 'tile') {
      setTransform(next.transform);

      return;
    }

    // Down and up alone, and no pinch.
    if (!Arr.isMinLengthArray(2, next.gesture.pointers)) {
      scrollTileTo(tileScrollOf(next.transform, topInset()));
    }
  };

  const onPointerEnd = (ended: SvgPointerEvent): void => {
    const before = mut_gesture;

    const { gesture, dropped, connected, lassoed } = pointerUp(
      before,
      ended.pointerId,
      getTransform(),
    );

    mut_gesture = gesture;

    const movableNodes = scene.movableNodes.getSnapshot().value;

    // A cancelled pointer (the system took it over) drops nothing.
    if (dropped !== undefined && ended.type === 'pointerup') {
      dropDragged(
        dropped,
        movableNodes,
        scene.settledFrames.getSnapshot().value,
        scene.selection.getSnapshot().value,
      );
    }

    if (lassoed !== undefined && ended.type === 'pointerup') {
      dagSelectionStore.select(nodesInLasso(movableNodes, lassoed));
    }

    // A tap on the background selects none.
    if (
      ended.type === 'pointerup' &&
      !before.dragging &&
      (before.start?.grab === undefined ||
        before.start.grab.kind === 'lasso') &&
      Arr.isFixedLengthArray(1, before.pointers) &&
      before.pointers.some(({ id }) => id === ended.pointerId)
    ) {
      dagSelectionStore.clear();
    }

    const target =
      connected === undefined || ended.type !== 'pointerup'
        ? undefined
        : dropTargetAt(
            movableNodes,
            connected.to,
            reachAt(getTransform().scale),
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

    setLasso(undefined);

    // Shown again by the next move, where the pointer is then.
    setHandle(undefined);
  };

  // A click that was not a drag, which the capture below lets through: on
  // an edge, it selects it; anywhere else, it leaves none selected.
  const onClick = (clicked: MouseEvent & SvgTarget): void => {
    const element =
      clicked.target instanceof Element
        ? clicked.target.closest('[data-edge-id]')
        : null;

    const id =
      element instanceof SVGElement ? element.dataset['edgeId'] : undefined;

    const edge =
      id === undefined
        ? undefined
        : scene.edges
            .getSnapshot()
            .value.find((candidate) => candidate.id === id);

    if (edge === undefined || edge.implied) {
      setSelectedEdge(undefined);

      return;
    }

    const bounds = clicked.currentTarget.getBoundingClientRect();

    setSelectedEdge({
      id: edge.id,
      path: edge.path,
      at: contentPointAt(scene.drawnTransform.getSnapshot().value, {
        x: clicked.clientX - bounds.left,
        y: clicked.clientY - bounds.top,
      }),
    });
  };

  const onWheel = (wheeled: WheelEvent & SvgTarget): void => {
    wheeled.preventDefault();

    const tile = mode.getSnapshot().value === 'tile';

    // A pinch on a trackpad comes as a wheel with Ctrl, and zooms nothing
    // in 「タイル」.
    if (tile && wheeled.ctrlKey) {
      return;
    }

    if (tile) {
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

    setTransform(
      zoomAt(
        getTransform(),
        wheelZoomFactor(wheeled.deltaY, wheeled.deltaMode),
        wheeled.clientX - bounds.left,
        wheeled.clientY - bounds.top,
      ),
    );
  };

  // The keys of the nodes, and in 「タイル」 those of the canvas, which
  // takes the focus there. This puts the nodes where they are going, keeps a
  // key pressed on a node from scrolling the page behind the dialog it
  // opens, and in 「タイル」 scrolls the rows.
  const onKeyDown = (pressed: KeyboardEvent): void => {
    dagLayoutStore.finishAnimation();

    switch (pressed.key) {
      case ' ':
        pressed.preventDefault();

        break;

      // Unless it gives up an arrow being drawn, which is all it does then.
      case 'Escape':
        if (mut_gesture.start?.grab?.kind !== 'connect') {
          dagSelectionStore.clear();
        }

        break;

      default:
        break;
    }

    if (scrollTileByKey(pressed.key)) {
      pressed.preventDefault();
    }
  };

  // Focus is followed as it bubbles up from the node. Written once the
  // update under way has finished: a focused node that goes is blurred while
  // the update that removes it propagates.
  const onFocusIn = (focusedIn: FocusEvent): void => {
    const id = nodeIdOf(focusedIn.target);

    afterUpdate(() => {
      setFocused(id);
    });

    // In 「タイル」, a task given the focus — by Tab — is scrolled into view.
    if (mode.getSnapshot().value !== 'tile') {
      return;
    }

    const node = tileNodes.getSnapshot().value.find((tile) => tile.id === id);

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
  };

  const deleteSelectedEdge = (): void => {
    const state = scene.edgeDelete.getSnapshot().value;

    setSelectedEdge(undefined);

    if (Optional.isNone(state)) {
      return;
    }

    dataStore.removeDependency(
      nodeRefOf(state.value.to),
      nodeRefOf(state.value.from),
    );
  };

  // The button is blurred as it goes too, while that update propagates.
  const dismissSelectedEdge = (): void => {
    afterUpdate(() => {
      if (getSelectedEdge() !== undefined) {
        setSelectedEdge(undefined);
      }
    });
  };

  const tileFrameShown = combine([mode, tileFrame$]).pipe(
    map(([current, frame]) => (current === 'tile' ? frame : undefined)),
  );

  // In 「タイル」, the rows are cut off at the toolbar's bottom edge as they
  // scroll up, as a scrolled box would cut them, rather than showing
  // through it.
  const clipTop = tileFrameShown.pipe(
    map((frame) =>
      frame === undefined ? undefined : frame.topInset - TOOLBAR_CLEARANCE,
    ),
  );

  const thumb = combine([tileFrameShown, animated, transform$, tileNodes]).pipe(
    map(([frame, moved, current, tiles]) => {
      if (frame === undefined || moved !== undefined) {
        return undefined;
      }

      const at = tileScrollThumb(
        tileScrollOf(current, frame.topInset),
        frame.viewport,
        tileContentHeight(tiles),
        frame.viewport,
      );

      return at === undefined
        ? undefined
        : ({ top: frame.topInset + at.top, height: at.height } as const);
    }),
  );

  const { arrangeable } = scene;

  return (
    <figure
      ref={(element) => {
        mut_elements.wrapper = element;
      }}
      class={constant('dag-canvas')}
    >
      <figcaption class={constant('visually-hidden')}>
        {view(mode, (current) => captions[current])}
      </figcaption>
      <svg
        ref={(svg) => {
          // A click after a drag is swallowed here, before it reaches the
          // node or the edge it ends on.
          listenInScope(
            svg,
            'click',
            (clicked) => {
              if (!mut_gesture.dragging) {
                return;
              }

              clicked.stopPropagation();

              clicked.preventDefault();
            },
            { capture: true },
          );
        }}
        aria-label={view(mode, (current) =>
          current === 'tile' ? captions.tile : undefined,
        )}
        class={constant('dag-svg')}
        data-animating={view(animated, (moved) => String(moved !== undefined))}
        data-connect={view(combine([handle$, connecting$]), ([handle, arrow]) =>
          String(handle !== undefined || arrow !== undefined),
        )}
        data-e2e={constant('dag-canvas')}
        data-lasso={view(
          combine([arrangeable, lassoTool$]),
          ([canArrange, tool]) => String(canArrange && tool !== undefined),
        )}
        data-mode={view(mode, (current) => current)}
        data-motion={view(
          combine([animationSettingStore.setting, reducedMotionStore.matches]),
          ([setting, reduced]) => String(shouldAnimate(setting, reduced)),
        )}
        // In 「タイル」, focusable — by Tab, or by a press on it — as a
        // scrolled box is, so that its keys work with no task focused.
        tabindex={view(mode, (current) => (current === 'tile' ? 0 : undefined))}
        onClick={onClick}
        onFocusIn={onFocusIn}
        onFocusOut={() => {
          afterUpdate(() => {
            setFocused(undefined);
          });
        }}
        onKeyDown={onKeyDown}
        onPointerCancel={onPointerEnd}
        onPointerDown={onPointerDown}
        onPointerLeave={() => {
          setHovered(undefined);

          setHandle(undefined);
        }}
        onPointerMove={onPointerMove}
        onPointerOver={(over) => {
          setHovered(nodeIdOf(over.target));
        }}
        onPointerUp={onPointerEnd}
        onWheel={onWheel}
      >
        <defs>
          {arrowMarker('dag-arrow')}
          {arrowMarker('dag-arrow-highlight')}
          {arrowMarker('dag-arrow-connect')}
          {arrowMarker('dag-arrow-refused')}
          <If
            cond={view(clipTop, (top) => top !== undefined)}
            then={
              <clipPath id={constant('dag-tile-clip')}>
                <rect
                  height={constant('100%')}
                  width={constant('100%')}
                  x={constant(0)}
                  y={view(clipTop, (top) => top ?? 0)}
                />
              </clipPath>
            }
          />
        </defs>
        <g
          clip-path={view(clipTop, (top) =>
            top === undefined ? undefined : 'url(#dag-tile-clip)',
          )}
        >
          <g
            transform={view(
              scene.drawnTransform,
              ({ x, y, scale }) => `translate(${x} ${y}) scale(${scale})`,
            )}
          >
            <For items={scene.frames} key={({ frame }) => frame.id}>
              {(record) => <DagGroupFrame record={record} />}
            </For>
            <If
              cond={view(scene.edgesHidden, (hidden) => !hidden)}
              then={
                // Mounted afresh when they come back, which fades them in.
                <g class={constant('dag-edges')}>
                  <For items={scene.edgeList} key={({ edge }) => edge.id}>
                    {(record) => <DagEdge record={record} />}
                  </For>
                  <For items={scene.arcs} key={({ arc }) => arc.id}>
                    {(record) => <DagArcEdge record={record} />}
                  </For>
                </g>
              }
            />
            <For items={scene.nodes} key={({ node }) => node.id}>
              {(record) => (
                <MatchOptional
                  value={view(record, taskRecordOf)}
                  some={(task) => <DagTaskNode record={task} />}
                  none={
                    <MatchOptional
                      value={view(record, milestoneRecordOf)}
                      some={(milestone) => (
                        <DagMilestoneNode record={milestone} />
                      )}
                    />
                  }
                />
              )}
            </For>
            <MatchOptional
              value={scene.edgeDelete}
              some={(button) => (
                <DagEdgeDelete
                  button={button}
                  onDelete={deleteSelectedEdge}
                  onDismiss={dismissSelectedEdge}
                />
              )}
            />
            <If
              cond={view(lasso$, (points) => points !== undefined)}
              then={
                <path
                  class={constant('dag-lasso')}
                  d={view(lasso$, (points) => lassoPathData(points ?? []))}
                  data-e2e={constant('dag-lasso')}
                />
              }
            />
            <MatchOptional
              value={scene.connectOverlay}
              some={(overlay) => <DagConnectOverlay overlay={overlay} />}
            />
          </g>
        </g>
      </svg>
      <If
        cond={view(thumb, (at) => at !== undefined)}
        then={
          <div
            aria-hidden={constant('true')}
            class={constant('dag-scroll-thumb')}
            data-e2e={constant('dag-scroll-thumb')}
            style={{
              top: view(thumb, (at) => `${at?.top ?? 0}px`),
              height: view(thumb, (at) => `${at?.height ?? 0}px`),
            }}
          />
        }
      />
      <div
        ref={(element) => {
          mut_elements.controls = element;
        }}
        class={constant('dag-controls')}
      >
        <If
          cond={arrangeable}
          then={
            <>
              <button
                aria-pressed={view(lassoTool$, (tool) =>
                  String(tool === 'freehand'),
                )}
                class={{
                  'bp6-button': constant(true),
                  'bp6-active': view(lassoTool$, (tool) => tool === 'freehand'),
                }}
                data-e2e={constant('dag-lasso-tool')}
                title={constant(
                  '背景のドラッグで囲んだノードを選びます（Shift を押しながらのドラッグでも選べます）',
                )}
                type={constant('button')}
                onClick={() => {
                  updateLassoTool((tool) =>
                    tool === 'freehand' ? undefined : 'freehand',
                  );
                }}
              >
                {constant('なげなわ')}
              </button>
              <button
                aria-pressed={view(lassoTool$, (tool) =>
                  String(tool === 'rectangle'),
                )}
                class={{
                  'bp6-button': constant(true),
                  'bp6-active': view(
                    lassoTool$,
                    (tool) => tool === 'rectangle',
                  ),
                }}
                data-e2e={constant('dag-rectangle-tool')}
                title={constant(
                  '背景のドラッグで描いた矩形に入るノードを選びます',
                )}
                type={constant('button')}
                onClick={() => {
                  updateLassoTool((tool) =>
                    tool === 'rectangle' ? undefined : 'rectangle',
                  );
                }}
              >
                {constant('矩形選択')}
              </button>
            </>
          }
        />
        <If
          cond={view(mode, (current) => current !== 'tile')}
          then={
            <>
              <button
                aria-label={constant('拡大')}
                class={constant('bp6-button')}
                data-e2e={constant('dag-zoom-in')}
                type={constant('button')}
                onClick={() => {
                  zoomBy(BUTTON_ZOOM);
                }}
              >
                {constant('＋')}
              </button>
              <button
                aria-label={constant('縮小')}
                class={constant('bp6-button')}
                data-e2e={constant('dag-zoom-out')}
                type={constant('button')}
                onClick={() => {
                  zoomBy(1 / BUTTON_ZOOM);
                }}
              >
                {constant('－')}
              </button>
            </>
          }
        />
        <button
          class={constant('bp6-button')}
          data-e2e={constant('dag-fit')}
          type={constant('button')}
          onClick={pressFit}
        >
          {view(combine([mode, arcZoom$]), ([current, zoom]) =>
            current === 'arc' && zoom === 'whole' ? '等倍表示' : '全体表示',
          )}
        </button>
      </div>
    </figure>
  );
};

const INITIAL: ViewTransform = { x: 0, y: 0, scale: 1 } as const;

const FIT_PADDING = 16;

type ArcZoom = 'whole' | 'actual';

const otherArcZoom = (zoom: ArcZoom): ArcZoom =>
  zoom === 'whole' ? 'actual' : 'whole';

/** Between the toolbar, or the buttons at the bottom, and what is fitted. */
const TOOLBAR_CLEARANCE = 8;

const BUTTON_ZOOM = 1.25;

/**
 * Where 「タイル」 is seen: the top of its rows when not scrolled, and how
 * high the part of the canvas they are seen in is.
 */
type TileFrame = Readonly<{ topInset: number; viewport: number }>;

type SvgTarget = Readonly<{ currentTarget: SVGSVGElement }>;

type SvgPointerEvent = PointerEvent & SvgTarget;

/** What the canvas shows, for a screen reader. */
const captions = {
  dag: '依存関係グラフ。ノードを選ぶと詳細を開きます。ノードはドラッグか矢印キーで動かせます。ノードの縁の丸からほかのノードへドラッグすると、ドロップしたノードがそのノードに依存します。依存の矢印を選ぶと、削除ボタンか Delete キーで削除できます。背景のドラッグで移動、ホイールかピンチで拡大縮小できます。Shift を押しながら、または「なげなわ」をオンにして背景をドラッグすると、囲んだノードを選び、まとめて動かしたり一括編集したりできます。',
  arc: 'アークダイアグラム。タスクをタイトル順に縦に並べ、マイルストーンをそれを待つタスクの上に入れて、依存を右側の弧で示します。ノードを選ぶと詳細を開きます。ドラッグで移動、ホイールかピンチで拡大縮小できます。',
  tile: 'タスクをタイトル順に左上から横に並べ、幅に収まらない分は次の行に折り返します。依存は示しません。タスクを選ぶと詳細を開きます。ホイール、ドラッグ、Page Up・Page Down・Home・End キーで縦にスクロールできます。',
} as const satisfies ReadonlyRecord<DagViewMode, string>;

/** An arrowhead the edges end in, drawn in the colour of `id`'s class. */
const arrowMarker = (id: string): JSX.Element => (
  <marker
    id={constant(id)}
    markerHeight={constant(8)}
    markerWidth={constant(8)}
    orient={constant('auto-start-reverse')}
    refX={constant(9)}
    refY={constant(5)}
    viewBox={constant('0 0 10 10')}
  >
    <path class={constant(id)} d={constant('M 0 0 L 10 5 L 0 10 z')} />
  </marker>
);

/**
 * A row of the nodes as a task's, or as a milestone's. A node's id is the
 * one or the other for good, so a row stays what it starts as.
 */
const taskRecordOf = ({
  view: nodeView,
  ...rest
}: DagNodeRecord): Optional<DagNodeRecord<TaskNodeView>> =>
  nodeView.kind === 'task'
    ? Optional.some({ ...rest, view: nodeView })
    : Optional.none;

const milestoneRecordOf = ({
  view: nodeView,
  ...rest
}: DagNodeRecord): Optional<DagNodeRecord<MilestoneNodeView>> =>
  nodeView.kind === 'milestone'
    ? Optional.some({ ...rest, view: nodeView })
    : Optional.none;

/** The same handle, where a new object for it would draw nothing new. */
const sameHandle = (
  a: ConnectHandle | undefined,
  b: ConnectHandle | undefined,
): boolean => a?.id === b?.id && a?.at.x === b?.at.x && a?.at.y === b?.at.y;

const sameTileFrame = (
  a: TileFrame | undefined,
  b: TileFrame | undefined,
): boolean => a?.topInset === b?.topInset && a?.viewport === b?.viewport;

/** The pointer, in the canvas's own coordinates. */
const pointerOf = (
  source: SvgPointerEvent,
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
 * nodes; a node `selected` with others moves as far with them, each in its
 * group; any other node is put there, in the group of the frame it was
 * dropped in, of those it was picked up among, or in none.
 */
const dropDragged = (
  dropped: NodeDrag,
  nodes: readonly LaidOutNode[],
  drawnFrames: readonly GroupFrame[],
  selected: ReadonlySet<GraphNodeId>,
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

  if (selected.has(dropped.id) && selected.size > 1) {
    dagLayoutStore.moveNodes(Array.from(selected), {
      x: dropped.position.x - node.x,
      y: dropped.position.y - node.y,
    });

    return;
  }

  dagLayoutStore.dropNode(
    dropped.id,
    dropped.position,
    dropTarget(drawnFrames, { ...node, ...dropped.position }),
  );
};
