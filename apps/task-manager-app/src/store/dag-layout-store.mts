/**
 * The DAG's layout: the automatic one, computed by ELK, and the arrangement
 * — the direction and where the reader put each node — drawn over it.
 *
 * ELK runs asynchronously, and only when the DAG is shown and its structure
 * or direction has changed since the last run (`layoutKey`). A progress
 * change, a renamed task, a tick of the clock or a node moved by hand lays
 * nothing out again. While a new layout is being computed the previous one
 * stays on screen; a result that has been overtaken by a newer request is
 * dropped.
 *
 * Every change to the arrangement is saved with every node where it is
 * shown — put by hand, or by ELK if it never was — so that what is on the
 * screen is what is stored, and a node never moves because ELK, laying out
 * a changed graph or a new direction, would put it elsewhere. Until the
 * reader changes something nothing is written, and the direction follows the
 * screen. A drag is saved when it is dropped; the arrow keys, after a pause.
 *
 * The nodes move to their places in a short animation, which is never
 * saved: from a grid, in the order they were made, the first time the DAG
 * is shown with something in it; from where they were, after 「自動整列」 or
 * when a layout saved elsewhere arrives while the DAG is shown — not for a
 * drag, the arrow keys or a change of direction alone. While it plays,
 * `animatedPositions` says where each node is drawn; a press on the canvas
 * ends it (`finishAnimation`). Whether it plays at all is the reader's
 * animation setting: 「自動」 leaves it out for a reader who asks the system
 * for less motion, 「オン」 and 「オフ」 decide regardless. Whatever the
 * setting, it stops with every node in its place as soon as its frames come
 * too slowly (`dag/frame-budget.mts`): a device that cannot keep up is
 * better served by the end state at once.
 *
 * The view mode (`view-model/dag-view-mode.mts`) says where the nodes are
 * drawn: in 「DAG」 as above; in 「アーク」 the tasks alone, in a column in
 * the order `diagramSort` gives (`arcNodes`); in 「タイル」 the tasks alone,
 * in that order, in rows as wide as the canvas (`tileNodes`), which the
 * canvas reports (`setTileWidth`) — a new width moves them to their new
 * rows in the same animation. The order is worked out again whenever the
 * order chosen, the data or the time (`stateTime`, for an order by status)
 * changes; in 「アーク」 and 「タイル」, a new order moves the tasks to their
 * new places in the same animation, which asks for no fit and writes
 * nothing. Changing the mode moves the tasks from where
 * they are drawn to where the other mode has them, in the same animation,
 * while the nodes one of the two modes does not draw — the milestones —
 * stay where the DAG has them and fade out or in (`animatedOpacities`); a
 * node neither draws is left out. Nothing is saved for it, and outside
 * 「DAG」 the arrangement is kept but not drawn: a layout saved elsewhere
 * moves nothing on screen until the reader comes back to it.
 *
 * The node size (`view-model/node-size.mts`) is the size of every box: ELK
 * lays the DAG out again with it, and 「アーク」's column and 「タイル」's
 * rows follow it. A new size moves the nodes to their new places in the
 * same animation — in 「DAG」 once ELK has laid it out, and only the nodes
 * ELK places: a node put somewhere stays where it was put, its top-left
 * corner where it was — and asks for a fit. Nothing is saved for it.
 */

import {
  combine,
  createState,
  map,
  type InitializedObservable,
} from 'synstate';
import { Arr, Num, unknownToString } from 'ts-data-forge';
import {
  arcDiagramNodes,
  diagramTaskIds,
  easeOutCubic,
  initialGridPositions,
  interpolateOpacities,
  interpolatePositions,
  isOverFrameBudget,
  layoutInput,
  layoutKey,
  nodesBounds,
  placeNodes,
  positionsOf,
  recordFrame,
  resizeNodes,
  sameDiagramOrder,
  samePositions,
  startFrameBudget,
  tileDiagramNodes,
  type DagDirection,
  type DagLayout,
  type FrameBudget,
  type GraphLayout,
  type LaidOutNode,
  type LayoutInput,
  type Point,
} from '../dag/index.mjs';
import {
  buildDependencyGraph,
  listNodes,
  nodeId,
  type DomainState,
  type GraphNodeId,
  type SortSpec,
} from '../domain/index.mjs';
import {
  isArrangeable,
  shouldAnimate,
  type AnimationSetting,
  type DagViewMode,
  type NodeSize,
} from '../view-model/index.mjs';

export type DagLayoutState = Readonly<
  | { type: 'idle' }
  | { type: 'computing'; previous: GraphLayout | undefined }
  | { type: 'ready'; layout: GraphLayout }
  | { type: 'error'; message: string }
>;

/**
 * `H` is whatever `setTimer` hands back for `clearTimer` to take, and `F`
 * what `requestFrame` hands back for `cancelFrame`.
 */
export type DagLayoutDeps<H, F> = Readonly<{
  state: InitializedObservable<DomainState>;
  /** The saved arrangement; `undefined` while there is none. */
  stored: InitializedObservable<DagLayout | undefined>;
  /** The direction while nothing is saved. */
  defaultDirection: InitializedObservable<DagDirection>;
  /** Whether the DAG is on screen; nothing is laid out while it is not. */
  active: InitializedObservable<boolean>;
  layout: (input: LayoutInput) => Promise<GraphLayout>;
  save: (layout: DagLayout) => void;
  /** How long after the last arrow key a node moved by the keys is saved. */
  nudgeDelayMs: number;
  setTimer: (callback: () => void, delayMs: number) => H;
  clearTimer: (handle: H) => void;
  /** Whether the reader asks the system for less motion. */
  reducedMotion: InitializedObservable<boolean>;
  /** Whether to animate: as `reducedMotion` says, always, or never. */
  animationSetting: InitializedObservable<AnimationSetting>;
  /** How long the nodes take to move to their places. */
  animationMs: number;
  now: () => number;
  /**
   * Calls `callback` before the next frame is drawn. The time between these,
   * by `now`, is what judges whether the animation is too slow to go on.
   */
  requestFrame: (callback: () => void) => F;
  cancelFrame: (handle: F) => void;
  /** Which view of the graph is drawn; the nodes move when it changes. */
  viewMode: InitializedObservable<DagViewMode>;
  /**
   * The order of the tasks of 「アーク」 and 「タイル」: down the column, and
   * along the rows.
   */
  diagramSort: InitializedObservable<readonly SortSpec[]>;
  /**
   * The time the page shows the state at (`clock-store.mts`), which a
   * task's status, and so an order by status, depends on.
   */
  stateTime: InitializedObservable<number>;
  /** How big the nodes are drawn, in every mode. */
  nodeSize: InitializedObservable<NodeSize>;
}>;

export type DagLayoutStore = Readonly<{
  autoLayout: InitializedObservable<DagLayoutState>;
  /** The direction, and the positions of the nodes put somewhere. */
  arrangement: InitializedObservable<DagLayout>;
  /** Goes up by one whenever the whole graph should be fitted to the view. */
  fitRequests: InitializedObservable<number>;
  /**
   * Where each node is drawn while the nodes move to their places, and
   * `undefined` once they are there.
   */
  animatedPositions: InitializedObservable<
    ReadonlyMap<GraphNodeId, Point> | undefined
  >;
  /**
   * How opaque each node that one of two view modes does not draw is, while
   * the nodes move from one mode to the other, and `undefined` otherwise:
   * whether the view is changing mode.
   */
  animatedOpacities: InitializedObservable<
    ReadonlyMap<GraphNodeId, number> | undefined
  >;
  /**
   * How far the nodes have got, eased, from 0 to 1, while they move, and
   * `undefined` otherwise: for a view that follows them.
   */
  animationProgress: InitializedObservable<number | undefined>;
  /** Every task where 「アーク」 draws it, in the column's order. */
  arcNodes: InitializedObservable<readonly LaidOutNode[]>;
  /**
   * Every task where 「タイル」 draws it, row by row; none until the canvas
   * has said how wide it is.
   */
  tileNodes: InitializedObservable<readonly LaidOutNode[]>;
  /**
   * How wide the rows of 「タイル」 may be, at zoom 1: the canvas's width,
   * less a margin (`tileAvailableWidth`). In 「タイル」, the tasks move to
   * their new rows.
   */
  setTileWidth: (available: number) => void;
  /** Puts every node moving to its place there at once. */
  finishAnimation: () => void;
  /** A node dropped at `position`, which is saved at once. */
  moveNode: (id: GraphNodeId, position: Point) => void;
  /** A node moved by `delta` with the keys, saved after a pause. */
  nudgeNode: (id: GraphNodeId, delta: Point) => void;
  /** Saves the direction; no node moves. */
  setDirection: (direction: DagDirection) => void;
  /** Puts every node where ELK does, in the current direction, and saves. */
  autoArrange: () => void;
  /** Starts following the inputs, and returns what stops it. */
  start: () => () => void;
}>;

export const createDagLayoutStore = <H, F>(
  deps: DagLayoutDeps<H, F>,
): DagLayoutStore => {
  const [autoLayout, setAutoLayout, { getSnapshot: getAutoLayout }] =
    createState<DagLayoutState>({ type: 'idle' });

  const [arrangement, setArrangement, { getSnapshot: getArrangement }] =
    createState<DagLayout>(
      initialArrangement(
        deps.stored.getSnapshot().value,
        deps.defaultDirection.getSnapshot().value,
      ),
    );

  const [fitRequests, , { updateState: updateFitRequests }] = createState(0);

  const [
    animatedPositions,
    setAnimatedPositions,
    { getSnapshot: getAnimatedPositions },
  ] = createState<ReadonlyMap<GraphNodeId, Point> | undefined>(undefined);

  const [
    animatedOpacities,
    setAnimatedOpacities,
    { getSnapshot: getAnimatedOpacities },
  ] = createState<ReadonlyMap<GraphNodeId, number> | undefined>(undefined);

  const [
    animationProgress,
    setAnimationProgress,
    { getSnapshot: getAnimationProgress },
  ] = createState<number | undefined>(undefined);

  const [tileWidth, setTileWidthState, { getSnapshot: getTileWidth }] =
    createState<number | undefined>(undefined);

  /** The tasks of 「アーク」 and 「タイル」, in their order. */
  const diagramOrder = combine([
    deps.state,
    deps.diagramSort,
    deps.stateTime,
  ]).pipe(map(([state, sort, now]) => diagramTaskIds(state, sort, now)));

  const arcNodes = combine([diagramOrder, deps.nodeSize]).pipe(
    map(([ids, size]) => arcDiagramNodes(ids, size)),
  );

  const tileNodes = combine([diagramOrder, tileWidth, deps.nodeSize]).pipe(
    map(([ids, width, size]) => tileDiagramNodes(ids, width, size)),
  );

  let mut_viewMode = deps.viewMode.getSnapshot().value;

  let mut_nodeSize = deps.nodeSize.getSnapshot().value;

  let mut_diagramOrder = diagramOrder.getSnapshot().value;

  /**
   * Where the DAG drew the nodes before the node size changed, while the
   * layout at the new size is computed; `undefined` otherwise.
   */
  let mut_resizedFrom: ReadonlyMap<GraphNodeId, Point> | undefined = undefined;

  let mut_requestedKey: string | undefined = undefined;

  let mut_arrangeRequested = false;

  let mut_nudgeTimer: H | undefined = undefined;

  let mut_frame: F | undefined = undefined;

  let mut_animation:
    | Readonly<{
        from: ReadonlyMap<GraphNodeId, Point>;
        to: ReadonlyMap<GraphNodeId, Point>;
        fade: Fade | undefined;
        startedAt: number;
        budget: FrameBudget;
      }>
    | undefined = undefined;

  /** Whether the nodes have been shown moving to their places yet. */
  let mut_introduced = false;

  /** The automatic layout on screen: the current one, or the one before. */
  const shownAutoLayout = (): GraphLayout | undefined => {
    const current = getAutoLayout();

    return current.type === 'ready'
      ? current.layout
      : current.type === 'computing'
        ? current.previous
        : undefined;
  };

  /**
   * `next` with a position for every node there is: where it was put, or
   * where ELK has it. Positions of nodes that are gone are dropped here.
   */
  const frozen = (next: DagLayout): DagLayout => {
    const auto = positionsOf(shownAutoLayout()?.nodes ?? []);

    return {
      direction: next.direction,
      positions: new Map(
        listNodes(deps.state.getSnapshot().value).flatMap(({ id }) => {
          const position = next.positions.get(id) ?? auto.get(id);

          return position === undefined ? [] : [[id, position] as const];
        }),
      ),
    };
  };

  /**
   * Every node there is, where the DAG draws it when nothing is moving, at
   * the current size — which the layout on screen may not have been made
   * at yet.
   */
  const placed = (): readonly LaidOutNode[] =>
    placeNodes(
      resizeNodes(shownAutoLayout()?.nodes ?? [], mut_nodeSize),
      getArrangement().positions,
    );

  /**
   * The tasks `ids` where 「アーク」 or 「タイル」 draws them at `size`: what
   * they drew before a change of size or of order, and after it.
   */
  const diagramNodesAt = (
    mode: 'arc' | 'tile',
    ids: readonly GraphNodeId[],
    size: NodeSize,
  ): readonly LaidOutNode[] =>
    mode === 'arc'
      ? arcDiagramNodes(ids, size)
      : tileDiagramNodes(ids, getTileWidth(), size);

  /** The nodes `mode` draws, where it draws them when nothing is moving. */
  const drawnIn = (mode: DagViewMode): readonly LaidOutNode[] => {
    switch (mode) {
      case 'dag':
        return placed();

      case 'arc':
        return arcNodes.getSnapshot().value;

      case 'tile':
        return tileNodes.getSnapshot().value;
    }
  };

  /** Whether the nodes are on screen, and have been shown moving into place. */
  const onScreen = (): boolean =>
    mut_introduced && deps.active.getSnapshot().value;

  const finishAnimation = (): void => {
    if (mut_frame !== undefined) {
      deps.cancelFrame(mut_frame);

      mut_frame = undefined;
    }

    mut_animation = undefined;

    if (getAnimatedPositions() !== undefined) {
      setAnimatedPositions(undefined);
    }

    if (getAnimatedOpacities() !== undefined) {
      setAnimatedOpacities(undefined);
    }

    if (getAnimationProgress() !== undefined) {
      setAnimationProgress(undefined);
    }
  };

  const nextFrame = (): void => {
    mut_frame = undefined;

    if (mut_animation === undefined) {
      return;
    }

    const { from, to, fade, startedAt, budget } = mut_animation;

    const now = deps.now();

    const elapsed = now - startedAt;

    const nextBudget = recordFrame(budget, now);

    if (elapsed >= deps.animationMs || isOverFrameBudget(nextBudget)) {
      finishAnimation();

      return;
    }

    mut_animation = { from, to, fade, startedAt, budget: nextBudget };

    const t = easeOutCubic(
      Num.isNonZero(deps.animationMs) ? Num.div(elapsed, deps.animationMs) : 1,
    );

    setAnimationProgress(t);

    setAnimatedPositions(interpolatePositions(from, to, t));

    if (fade !== undefined) {
      setAnimatedOpacities(interpolateOpacities(fade.from, fade.to, t));
    }

    mut_frame = deps.requestFrame(nextFrame);
  };

  const animationAllowed = (): boolean =>
    shouldAnimate(
      deps.animationSetting.getSnapshot().value,
      deps.reducedMotion.getSnapshot().value,
    );

  /**
   * The nodes moving from `from` — or from where they are drawn, if they
   * are moving already — to `to`, and those of `fade` fading as it says, or
   * from how opaque they are drawn.
   */
  const animate = (
    from: ReadonlyMap<GraphNodeId, Point>,
    to: ReadonlyMap<GraphNodeId, Point>,
    fade?: Fade,
  ): void => {
    const drawn = getAnimatedPositions();

    const drawnOpacities = getAnimatedOpacities();

    finishAnimation();

    if (!animationAllowed()) {
      return;
    }

    const departure: ReadonlyMap<GraphNodeId, Point> =
      drawn === undefined
        ? from
        : new Map(Array.from(from, ([id, at]) => [id, drawn.get(id) ?? at]));

    const fading: Fade | undefined =
      fade === undefined
        ? undefined
        : ({
            from: new Map(
              Array.from(fade.from, ([id, opacity]) => [
                id,
                drawnOpacities?.get(id) ?? opacity,
              ]),
            ),
            to: fade.to,
          } as const);

    const startedAt = deps.now();

    mut_animation = {
      from: departure,
      to,
      fade: fading,
      startedAt,
      budget: startFrameBudget(startedAt),
    };

    setAnimationProgress(0);

    setAnimatedPositions(interpolatePositions(departure, to, 0));

    if (fading !== undefined) {
      setAnimatedOpacities(interpolateOpacities(fading.from, fading.to, 0));
    }

    mut_frame = deps.requestFrame(nextFrame);
  };

  /** The first time there is something to show: from a grid. */
  const introduce = (): void => {
    const nodes = drawnIn(mut_viewMode);

    if (mut_introduced || Arr.isEmpty(nodes)) {
      return;
    }

    mut_introduced = true;

    const madeAt = createdAtOf(deps.state.getSnapshot().value);

    const inOrder = nodes.toSorted((a, b) => {
      const byTime = (madeAt.get(a.id) ?? 0) - (madeAt.get(b.id) ?? 0);

      return byTime !== 0 ? byTime : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });

    animate(
      initialGridPositions(
        inOrder,
        getArrangement().direction,
        nodesBounds(nodes, 0),
      ),
      positionsOf(nodes),
    );
  };

  const cancelNudge = (): void => {
    if (mut_nudgeTimer === undefined) {
      return;
    }

    deps.clearTimer(mut_nudgeTimer);

    mut_nudgeTimer = undefined;
  };

  const commit = (next: DagLayout): void => {
    cancelNudge();

    const saved = frozen(next);

    setArrangement(saved);

    deps.save(saved);
  };

  const applyArrangeIfRequested = (laidOut: GraphLayout): void => {
    if (!mut_arrangeRequested) {
      return;
    }

    mut_arrangeRequested = false;

    const before = positionsOf(placed());

    commit({
      direction: getArrangement().direction,
      positions: positionsOf(laidOut.nodes),
    });

    // Outside the DAG, nothing on screen has moved.
    if (!isArrangeable(mut_viewMode)) {
      return;
    }

    const after = positionsOf(placed());

    if (!samePositions(before, after)) {
      animate(before, after);
    }

    updateFitRequests((count) => count + 1);
  };

  /**
   * From where `previous` draws the nodes to where `next` does. A node only
   * one of them draws stays where the DAG has it, and fades out or in; a
   * node neither draws is not drawn.
   */
  const switchMode = (previous: DagViewMode, next: DagViewMode): void => {
    const dag = positionsOf(placed());

    const before = positionsOf(drawnIn(previous));

    const after = positionsOf(drawnIn(next));

    const either = (id: GraphNodeId): boolean =>
      before.has(id) || after.has(id);

    const fading = Array.from(dag.keys()).filter(
      (id) => either(id) && !(before.has(id) && after.has(id)),
    );

    animate(
      onlyOf(overriding(dag, before), either),
      onlyOf(overriding(dag, after), either),
      {
        from: new Map(fading.map((id) => [id, before.has(id) ? 1 : 0])),
        to: new Map(fading.map((id) => [id, after.has(id) ? 1 : 0])),
      },
    );

    updateFitRequests((count) => count + 1);
  };

  /**
   * From where the nodes were drawn at `previous` to where they are at
   * `next`: at once in 「アーク」 and 「タイル」, and in 「DAG」 once ELK has
   * laid it out at the new size (`moveResized`).
   */
  const resize = (previous: NodeSize, next: NodeSize): void => {
    if (!onScreen()) {
      return;
    }

    if (mut_viewMode === 'dag') {
      mut_resizedFrom = positionsOf(placed());

      return;
    }

    const ids = diagramOrder.getSnapshot().value;

    const before = positionsOf(diagramNodesAt(mut_viewMode, ids, previous));

    const after = positionsOf(diagramNodesAt(mut_viewMode, ids, next));

    if (!samePositions(before, after)) {
      animate(before, after);
    }

    updateFitRequests((count) => count + 1);
  };

  /**
   * From where 「アーク」 or 「タイル」 drew the tasks in the `previous`
   * order to where they are in the `next`. The view stays where it is.
   */
  const reorder = (
    previous: readonly GraphNodeId[],
    next: readonly GraphNodeId[],
  ): void => {
    if (mut_viewMode === 'dag' || !onScreen()) {
      return;
    }

    const before = positionsOf(
      diagramNodesAt(mut_viewMode, previous, mut_nodeSize),
    );

    const after = positionsOf(diagramNodesAt(mut_viewMode, next, mut_nodeSize));

    if (!samePositions(before, after)) {
      animate(before, after);
    }
  };

  /** The DAG laid out at a new size: its nodes moved there. */
  const moveResized = (): void => {
    const before = mut_resizedFrom;

    if (before === undefined) {
      return;
    }

    mut_resizedFrom = undefined;

    if (!onScreen() || !isArrangeable(mut_viewMode)) {
      return;
    }

    const after = positionsOf(placed());

    if (!samePositions(before, after)) {
      animate(before, after);
    }

    updateFitRequests((count) => count + 1);
  };

  const setTileWidth = (available: number): void => {
    if (available === getTileWidth()) {
      return;
    }

    const before = positionsOf(tileNodes.getSnapshot().value);

    setTileWidthState(available);

    if (mut_viewMode !== 'tile' || !deps.active.getSnapshot().value) {
      return;
    }

    // The width the first showing in 「タイル」 was waiting for.
    if (!mut_introduced) {
      introduce();

      return;
    }

    const after = positionsOf(tileNodes.getSnapshot().value);

    if (!samePositions(before, after)) {
      animate(before, after);
    }
  };

  const positionOf = (id: GraphNodeId): Point | undefined =>
    getArrangement().positions.get(id) ??
    shownAutoLayout()?.nodes.find((node) => node.id === id);

  const moveNode = (id: GraphNodeId, position: Point): void => {
    const current = getArrangement();

    commit({
      direction: current.direction,
      positions: withPosition(current.positions, id, position),
    });
  };

  const nudgeNode = (id: GraphNodeId, delta: Point): void => {
    const from = positionOf(id);

    if (from === undefined) {
      return;
    }

    const current = getArrangement();

    setArrangement({
      direction: current.direction,
      positions: withPosition(current.positions, id, {
        x: from.x + delta.x,
        y: from.y + delta.y,
      }),
    });

    cancelNudge();

    mut_nudgeTimer = deps.setTimer(() => {
      mut_nudgeTimer = undefined;

      commit(getArrangement());
    }, deps.nudgeDelayMs);
  };

  const setDirection = (direction: DagDirection): void => {
    const current = getArrangement();

    if (direction === current.direction) {
      return;
    }

    commit({ direction, positions: current.positions });
  };

  const autoArrange = (): void => {
    mut_arrangeRequested = true;

    const current = getAutoLayout();

    if (current.type === 'ready') {
      applyArrangeIfRequested(current.layout);
    }
  };

  const start = (): (() => void) => {
    // A move not yet saved is not undone by a write coming back meanwhile:
    // it is saved over it.
    const storedSubscription = combine([
      deps.stored,
      deps.defaultDirection,
    ]).subscribe(([stored, defaultDirection]) => {
      if (mut_nudgeTimer !== undefined) {
        return;
      }

      const before = positionsOf(placed());

      setArrangement(initialArrangement(stored, defaultDirection));

      const after = positionsOf(placed());

      // Not for a write of this store's own, which comes back unchanged,
      // nor outside the DAG, where nothing on screen moves.
      if (
        !onScreen() ||
        !isArrangeable(mut_viewMode) ||
        samePositions(before, after)
      ) {
        return;
      }

      animate(before, after);

      updateFitRequests((count) => count + 1);
    });

    const layoutSubscription = combine([
      deps.state,
      arrangement,
      deps.active,
      deps.nodeSize,
    ]).subscribe(([state, { direction }, active, size]) => {
      if (!active) {
        finishAnimation();

        return;
      }

      const input = layoutInput(buildDependencyGraph(state), direction, size);

      const key = layoutKey(input);

      if (key === mut_requestedKey) {
        return;
      }

      mut_requestedKey = key;

      setAutoLayout({ type: 'computing', previous: shownAutoLayout() });

      deps
        .layout(input)
        .then((laidOut) => {
          if (mut_requestedKey !== key) {
            return;
          }

          setAutoLayout({ type: 'ready', layout: laidOut });

          applyArrangeIfRequested(laidOut);

          moveResized();

          introduce();
        })
        .catch((error: unknown) => {
          if (mut_requestedKey !== key) {
            return;
          }

          mut_arrangeRequested = false;

          mut_resizedFrom = undefined;

          setAutoLayout({ type: 'error', message: unknownToString(error) });
        });
    });

    // Turned off, or less motion asked for, in the middle of one.
    const motionSubscription = combine([
      deps.animationSetting,
      deps.reducedMotion,
    ]).subscribe(() => {
      if (!animationAllowed()) {
        finishAnimation();
      }
    });

    const viewModeSubscription = deps.viewMode.subscribe((mode) => {
      if (mode === mut_viewMode) {
        return;
      }

      const previous = mut_viewMode;

      mut_viewMode = mode;

      // Nothing on screen yet: it is drawn in the new mode from the start.
      if (!onScreen()) {
        return;
      }

      switchMode(previous, mode);
    });

    const nodeSizeSubscription = deps.nodeSize.subscribe((size) => {
      if (size === mut_nodeSize) {
        return;
      }

      const previous = mut_nodeSize;

      mut_nodeSize = size;

      resize(previous, size);
    });

    const diagramOrderSubscription = diagramOrder.subscribe((ids) => {
      if (sameDiagramOrder(ids, mut_diagramOrder)) {
        return;
      }

      const previous = mut_diagramOrder;

      mut_diagramOrder = ids;

      reorder(previous, ids);
    });

    return () => {
      cancelNudge();

      finishAnimation();

      diagramOrderSubscription.unsubscribe();

      nodeSizeSubscription.unsubscribe();

      viewModeSubscription.unsubscribe();

      storedSubscription.unsubscribe();

      layoutSubscription.unsubscribe();

      motionSubscription.unsubscribe();
    };
  };

  return {
    autoLayout,
    arrangement,
    fitRequests,
    animatedPositions,
    animatedOpacities,
    animationProgress,
    arcNodes,
    tileNodes,
    setTileWidth,
    finishAnimation,
    moveNode,
    nudgeNode,
    setDirection,
    autoArrange,
    start,
  };
};

/** The opacities of the nodes that fade, at the start and at the end. */
type Fade = Readonly<{
  from: ReadonlyMap<GraphNodeId, number>;
  to: ReadonlyMap<GraphNodeId, number>;
}>;

/** When each node was made, by its id. */
const createdAtOf = (state: DomainState): ReadonlyMap<GraphNodeId, number> => {
  const entries: readonly (readonly [GraphNodeId, number])[] = [
    ...state.tasks.map(
      ({ id, createdAt }) => [nodeId({ kind: 'task', id }), createdAt] as const,
    ),
    ...state.milestones.map(
      ({ id, createdAt }) =>
        [nodeId({ kind: 'milestone', id }), createdAt] as const,
    ),
  ] as const;

  return new Map(entries);
};

/** `base`, with the positions `over` has instead of its own, and more. */
const overriding = (
  base: ReadonlyMap<GraphNodeId, Point>,
  over: ReadonlyMap<GraphNodeId, Point>,
): ReadonlyMap<GraphNodeId, Point> => {
  const entries: readonly (readonly [GraphNodeId, Point])[] = [
    ...base,
    ...over,
  ] as const;

  return new Map(entries);
};

/** The entries of `positions` whose ids `keep` says to keep. */
const onlyOf = (
  positions: ReadonlyMap<GraphNodeId, Point>,
  keep: (id: GraphNodeId) => boolean,
): ReadonlyMap<GraphNodeId, Point> =>
  new Map(Array.from(positions).filter(([id]) => keep(id)));

/** `stored`, or the default direction with nothing put anywhere. */
const initialArrangement = (
  stored: DagLayout | undefined,
  defaultDirection: DagDirection,
): DagLayout => stored ?? { direction: defaultDirection, positions: new Map() };

const withPosition = (
  positions: ReadonlyMap<GraphNodeId, Point>,
  id: GraphNodeId,
  position: Point,
): ReadonlyMap<GraphNodeId, Point> => new Map([...positions, [id, position]]);
