import {
  type FocusEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
  type RefObject,
  type WheelEventHandler,
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
import { Arr } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import {
  anchoredTileScroll,
  arcContentBounds,
  arcGeometries,
  arcHighlight,
  clampTileScroll,
  edgeGeometries,
  fitBoundsTransform,
  fitWidthTopTransform,
  highlightOf,
  IDLE_GESTURE,
  interpolateTransform,
  nodesBounds,
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
  type EdgeGeometry,
  type Gesture,
  type GraphLayout,
  type LaidOutNode,
  type NodeDrag,
  type NodeGrab,
  type ViewTransform,
} from '../dag/index.mjs';
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
  dagViewModeSignal,
  dagViewModeStore,
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
import { DagEdge } from './dag-edge.js';
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
 * it reaches the node. `touch-action: none` (`index.css`) keeps the browser
 * from scrolling or zooming the page instead.
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

  const { direction, positions } = dagArrangementSignal.value;

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

  // At the current size, which a layout still being made at it may not be.
  const placed = useMemo(
    () => placeNodes(resizeNodes(layout.nodes, nodeSize), positions),
    [layout.nodes, nodeSize, positions],
  );

  // While they move, the nodes moving, wherever they are going; otherwise
  // the nodes of the mode, where it draws them.
  const shown = useMemo(
    () =>
      animated !== undefined
        ? placeNodes(placed, animated).filter(({ id }) => animated.has(id))
        : mode === 'arc'
          ? arcNodes
          : mode === 'tile'
            ? tileNodes
            : dragged === undefined
              ? placed
              : placed.map((node) =>
                  node.id === dragged.id
                    ? { ...node, x: dragged.position.x, y: dragged.position.y }
                    : node,
                ),
    [placed, dragged, animated, mode, arcNodes, tileNodes],
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
      return withCurvesOf(
        settled,
        edgeGeometries(direction, shown, layout.edges),
        dragged.id,
      );
    }

    const started = performance.now();

    const routed = routeEdges(direction, shown, layout.edges);

    mut_slowDrag.current = performance.now() - started > DRAG_ROUTING_BUDGET_MS;

    return routed;
  }, [arrangeable, animated, dragged, direction, shown, layout.edges, settled]);

  // Read by a press on a node, which should not have to be made again
  // whenever a node moves: the nodes that can be grabbed, none outside the
  // mode the reader arranges.
  const mut_placed = useRef<readonly LaidOutNode[]>(placed);

  useEffect(() => {
    mut_placed.current = arrangeable ? placed : [];
  }, [arrangeable, placed]);

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
          : { kind: 'whole', bounds: nodesBounds(placed, GRAPH_MARGIN) },
    [mode, placed, arcNodes, settledArcs],
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

      mut_gesture.current = pointerDown(
        mut_gesture.current,
        pointerOf(pressed),
        mut_transform.current,
        grabOf(pressed.target, mut_placed.current),
      );

      setDragged(undefined);
    },
    [],
  );

  const onPointerMove = useCallback<PointerEventHandler<SVGSVGElement>>(
    (moved) => {
      const before = mut_gesture.current;

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
    [mode, show, scrollTileTo, topInset],
  );

  const onPointerEnd = useCallback<PointerEventHandler<SVGSVGElement>>(
    (ended) => {
      const { gesture, dropped } = pointerUp(
        mut_gesture.current,
        ended.pointerId,
        mut_transform.current,
      );

      mut_gesture.current = gesture;

      // A cancelled pointer (the system took it over) drops nothing.
      if (dropped !== undefined && ended.type === 'pointerup') {
        dagLayoutStore.moveNode(dropped.id, dropped.position);
      }

      setDragged(undefined);
    },
    [],
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
        data-e2e={'dag-canvas'}
        data-mode={mode}
        data-motion={motion}
        onBlurCapture={onBlurCapture}
        onClickCapture={onClickCapture}
        onFocusCapture={onFocusIn}
        onKeyDown={onKeyDown}
        onPointerCancel={onPointerEnd}
        onPointerDown={onPointerDown}
        onPointerLeave={onPointerLeave}
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
  dag: '依存関係グラフ。ノードを選ぶと詳細を開きます。ノードはドラッグか矢印キーで動かせます。背景のドラッグで移動、ホイールかピンチで拡大縮小できます。',
  arc: 'アークダイアグラム。タスクをタイトル順に縦に並べ、依存を右側の弧で示します。破線はマイルストーンを経由する依存です。タスクを選ぶと詳細を開きます。ドラッグで移動、ホイールかピンチで拡大縮小できます。',
  tile: 'タスクをタイトル順に左上から横に並べ、幅に収まらない分は次の行に折り返します。依存は示しません。タスクを選ぶと詳細を開きます。ホイール、ドラッグ、Page Up・Page Down・Home・End キーで縦にスクロールできます。',
} as const satisfies ReadonlyRecord<DagViewMode, string>;

const BUTTON_ZOOM = 1.25;

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
 * and where that node is; `undefined` on the background.
 */
const grabOf = (
  target: EventTarget | null,
  nodes: readonly LaidOutNode[],
): NodeGrab | undefined => {
  const id = nodeIdOf(target);

  if (id === undefined) {
    return undefined;
  }

  const node = nodes.find((placedNode) => placedNode.id === id);

  return node === undefined
    ? undefined
    : { id, origin: { x: node.x, y: node.y } };
};
