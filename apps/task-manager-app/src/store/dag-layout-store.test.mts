import { createState } from 'synstate';
import { Arr } from 'ts-data-forge';
import {
  ARC_NODE_GAP,
  COMPACT_MILESTONE_NODE_SIZE,
  COMPACT_TASK_NODE_SIZE,
  TASK_NODE_SIZE,
  TILE_NODE_GAP,
  type DagDirection,
  type DagLayout,
  type GraphLayout,
  type LayoutInput,
  type Point,
} from '../dag/index.mjs';
import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type DomainState,
  type GraphNodeId,
  type SortSpec,
} from '../domain/index.mjs';
import {
  DEFAULT_DIAGRAM_SORT,
  type AnimationSetting,
  type DagViewMode,
  type NodeSize,
} from '../view-model/index.mjs';
import {
  createDagLayoutStore,
  type DagLayoutStore,
} from './dag-layout-store.mjs';

const one: DomainState = {
  tasks: [createTask({ id: asTaskId('a'), title: 'A', now: 0 })],
  milestones: [],
} as const;

const two: DomainState = {
  tasks: Arr.toPushed(
    one.tasks,
    createTask({ id: asTaskId('b'), title: 'B', now: 0 }),
  ),
  milestones: [],
} as const;

/** Two tasks whose titles sort the other way round, and a milestone. */
const mixed: DomainState = {
  tasks: [
    createTask({ id: asTaskId('x'), title: 'Zeta', now: 0 }),
    createTask({ id: asTaskId('y'), title: 'Alpha', now: 0 }),
  ],
  milestones: [createMilestone({ id: asMilestoneId('m'), title: 'M', now: 0 })],
} as const;

/**
 * A stand-in for ELK: the nodes `step` apart in the direction asked for, in
 * the order given.
 */
const laidOut = (input: LayoutInput | undefined, step: number): GraphLayout =>
  ({
    nodes: (input?.nodes ?? []).map((node, index) => ({
      ...node,
      x: input?.direction === 'right' ? index * step : 0,
      y: input?.direction === 'down' ? index * step : 0,
    })),
    edges: input?.edges ?? [],
  }) as const;

/** A layout function whose results are released by hand. */
const deferredLayout = (): Readonly<{
  layout: (input: LayoutInput) => Promise<GraphLayout>;
  requests: readonly LayoutInput[];
  /** Releases a result whose nodes are `step` apart, 100 unless given. */
  resolve: (index: number, step?: number) => void;
}> => {
  const mut_requests: LayoutInput[] = [];

  const mut_resolvers: ((layout: GraphLayout) => void)[] = [];

  return {
    layout: (input) => {
      mut_requests.push(input);

      return new Promise((resolve) => {
        mut_resolvers.push(resolve);
      });
    },
    requests: mut_requests,
    resolve: (index, step = 100) => {
      mut_resolvers[index]?.(laidOut(mut_requests[index], step));
    },
  };
};

/** Timers run by hand: `fire` runs the one that is pending, if any. */
const manualTimer = (): Readonly<{
  setTimer: (callback: () => void, delayMs: number) => number;
  clearTimer: (handle: number) => void;
  fire: () => void;
  pending: () => boolean;
}> => {
  let mut_next = 0;

  const mut_callbacks = new Map<number, () => void>();

  return {
    setTimer: (callback) => {
      mut_next += 1;

      mut_callbacks.set(mut_next, callback);

      return mut_next;
    },
    clearTimer: (handle) => {
      mut_callbacks.delete(handle);
    },
    fire: () => {
      const entries = Array.from(mut_callbacks);

      mut_callbacks.clear();

      for (const [, callback] of entries) {
        callback();
      }
    },
    pending: () => mut_callbacks.size > 0,
  };
};

/** Animation clock run by hand, against a clock moved by hand. */
const manualClock = (): Readonly<{
  now: () => number;
  requestFrame: (callback: () => void) => number;
  cancelFrame: (handle: number) => void;
  /** Moves the clock on by `ms` and runs the frame that is waiting. */
  advance: (ms: number) => void;
  pending: () => boolean;
}> => {
  let mut_now = 1000;

  const timer = manualTimer();

  return {
    now: () => mut_now,
    requestFrame: (callback) => timer.setTimer(callback, 0),
    cancelFrame: timer.clearTimer,
    advance: (ms) => {
      mut_now += ms;

      timer.fire();
    },
    pending: timer.pending,
  };
};

const ANIMATION_MS = 700;

const setup = (
  options: Readonly<{
    active?: boolean;
    stored?: DagLayout;
    state?: DomainState;
    reducedMotion?: boolean;
    animationSetting?: AnimationSetting;
    viewMode?: DagViewMode;
    nodeSize?: NodeSize;
    diagramSort?: readonly SortSpec[];
    stateTime?: number;
  }> = {},
): Readonly<{
  store: DagLayoutStore;
  setState: (next: DomainState) => void;
  setStored: (next: DagLayout | undefined) => void;
  setDefaultDirection: (next: DagDirection) => void;
  setActive: (next: boolean) => void;
  setReducedMotion: (next: boolean) => void;
  setAnimationSetting: (next: AnimationSetting) => void;
  setViewMode: (next: DagViewMode) => void;
  setDiagramSort: (next: readonly SortSpec[]) => void;
  setNodeSize: (next: NodeSize) => void;
  setStateTime: (next: number) => void;
  deferred: ReturnType<typeof deferredLayout>;
  timer: ReturnType<typeof manualTimer>;
  clock: ReturnType<typeof manualClock>;
  saved: readonly DagLayout[];
}> => {
  const [state, setState] = createState(options.state ?? one);

  const [stored, setStored] = createState<DagLayout | undefined>(
    options.stored,
  );

  const [defaultDirection, setDefaultDirection] =
    createState<DagDirection>('right');

  const [active, setActive] = createState(options.active ?? true);

  const deferred = deferredLayout();

  const timer = manualTimer();

  const clock = manualClock();

  const [reducedMotion, setReducedMotion] = createState(
    options.reducedMotion ?? false,
  );

  const [animationSetting, setAnimationSetting] = createState<AnimationSetting>(
    options.animationSetting ?? 'auto',
  );

  const [viewMode, setViewMode] = createState<DagViewMode>(
    options.viewMode ?? 'dag',
  );

  const [diagramSort, setDiagramSort] = createState<readonly SortSpec[]>(
    options.diagramSort ?? DEFAULT_DIAGRAM_SORT,
  );

  const [stateTime, setStateTime] = createState(options.stateTime ?? 0);

  const [nodeSize, setNodeSize] = createState<NodeSize>(
    options.nodeSize ?? 'standard',
  );

  const mut_saved: DagLayout[] = [];

  const store = createDagLayoutStore({
    state,
    stored,
    defaultDirection,
    active,
    layout: deferred.layout,
    save: (layout) => {
      mut_saved.push(layout);

      // As the repository does: the write comes back.
      setStored(layout);
    },
    nudgeDelayMs: 500,
    setTimer: timer.setTimer,
    clearTimer: timer.clearTimer,
    reducedMotion,
    animationSetting,
    animationMs: ANIMATION_MS,
    now: clock.now,
    requestFrame: clock.requestFrame,
    cancelFrame: clock.cancelFrame,
    viewMode,
    diagramSort,
    stateTime,
    nodeSize,
  });

  store.start();

  return {
    store,
    setState: (next) => {
      setState(next);
    },
    setStored: (next) => {
      setStored(next);
    },
    setDefaultDirection: (next) => {
      setDefaultDirection(next);
    },
    setActive: (next) => {
      setActive(next);
    },
    setReducedMotion: (next) => {
      setReducedMotion(next);
    },
    setAnimationSetting: (next) => {
      setAnimationSetting(next);
    },
    setViewMode: (next) => {
      setViewMode(next);
    },
    setDiagramSort: (next) => {
      setDiagramSort(next);
    },
    setNodeSize: (next) => {
      setNodeSize(next);
    },
    setStateTime: (next) => {
      setStateTime(next);
    },
    deferred,
    timer,
    clock,
    saved: mut_saved,
  };
};

const positions = (
  entries: readonly (readonly [GraphNodeId, Point])[],
): ReadonlyMap<GraphNodeId, Point> => new Map(entries);

/** Where the nodes are drawn while they move to their places. */
const animated = (
  store: DagLayoutStore,
): ReadonlyMap<GraphNodeId, Point> | undefined =>
  store.animatedPositions.getSnapshot().value;

/** How opaque the nodes fading in or out are, while the mode changes. */
const opacities = (
  store: DagLayoutStore,
): ReadonlyMap<GraphNodeId, number> | undefined =>
  store.animatedOpacities.getSnapshot().value;

/** Lets the promise of a resolved layout run its `then`. */
const settle = (): Promise<void> => Promise.resolve();

/** The DAG shown with `two` laid out, and its animation run out. */
const shown = async (
  options: Parameters<typeof setup>[0] = {},
): Promise<ReturnType<typeof setup>> => {
  const result = setup({ state: two, ...options });

  result.deferred.resolve(0);

  await settle();

  result.clock.advance(ANIMATION_MS);

  assert.isUndefined(animated(result.store));

  return result;
};

/** The DAG shown with `two` laid out, its animation started and not run. */
const started = async (
  options: Parameters<typeof setup>[0] = {},
): Promise<ReturnType<typeof setup>> => {
  const result = setup({ state: two, ...options });

  result.deferred.resolve(0);

  await settle();

  assert.isDefined(animated(result.store));

  return result;
};

/** Each node of `layout`, and how big it is. */
const boxes = (
  layout: GraphLayout | undefined,
): readonly (readonly [GraphNodeId, number, number])[] =>
  (layout?.nodes ?? []).map(
    ({ id, width, height }) => [id, width, height] as const,
  );

/** The automatic layout, once there is one. */
const readyLayout = (store: DagLayoutStore): GraphLayout | undefined => {
  const current = store.autoLayout.getSnapshot().value;

  return current.type === 'ready' ? current.layout : undefined;
};

/** Where 「タイル」 draws each task when nothing moves. */
const tilePlaces = (store: DagLayoutStore): ReadonlyMap<GraphNodeId, Point> =>
  new Map(
    store.tileNodes.getSnapshot().value.map(({ id, x, y }) => [id, { x, y }]),
  );

/** Where 「アーク」 draws each task when nothing moves. */
const arcColumn = (store: DagLayoutStore): ReadonlyMap<GraphNodeId, Point> =>
  new Map(
    store.arcNodes.getSnapshot().value.map(({ id, x, y }) => [id, { x, y }]),
  );

/**
 * The DAG shown with `mixed`, its animation run out, and the canvas said to
 * be `width` wide.
 */
const shownWithWidth = async (
  width: number,
  options: Parameters<typeof setup>[0] = {},
): Promise<ReturnType<typeof setup>> => {
  const result = await shown({ state: mixed, ...options });

  result.store.setTileWidth(width);

  return result;
};

describe(createDagLayoutStore, () => {
  describe('the automatic layout', () => {
    test('lays nothing out while the DAG is not shown', () => {
      const { store, deferred, setActive } = setup({ active: false });

      assert.strictEqual(deferred.requests.length, 0);

      assert.strictEqual(store.autoLayout.getSnapshot().value.type, 'idle');

      setActive(true);

      assert.strictEqual(deferred.requests.length, 1);
    });

    test('lays out again only when the structure or direction changes', async () => {
      const { store, deferred, setState } = setup({ state: two });

      deferred.resolve(0);

      await settle();

      assert.deepStrictEqual(store.autoLayout.getSnapshot().value, {
        type: 'ready',
        layout: laidOut(deferred.requests[0], 100),
      });

      setState({
        ...two,
        tasks: two.tasks.map((task) => ({ ...task, title: 'renamed' })),
      });

      store.moveNode('task:a', { x: 5, y: 5 });

      store.nudgeNode('task:a', { x: 8, y: 0 });

      assert.strictEqual(deferred.requests.length, 1);

      store.setDirection('down');

      assert.strictEqual(deferred.requests.length, 2);

      assert.strictEqual(deferred.requests[1]?.direction, 'down');

      setState(one);

      assert.strictEqual(deferred.requests.length, 3);
    });

    test('keeps the previous layout on screen while the next is computed', async () => {
      const { store, deferred, setState } = setup();

      deferred.resolve(0);

      await settle();

      setState(two);

      assert.deepStrictEqual(store.autoLayout.getSnapshot().value, {
        type: 'computing',
        previous: laidOut(deferred.requests[0], 100),
      });
    });

    test('drops a result that a newer request has overtaken', async () => {
      const { store, deferred, setState } = setup();

      setState(two);

      deferred.resolve(1);

      await settle();

      deferred.resolve(0);

      await settle();

      assert.deepStrictEqual(store.autoLayout.getSnapshot().value, {
        type: 'ready',
        layout: laidOut(deferred.requests[1], 100),
      });
    });
  });

  describe('the direction', () => {
    test('follows the screen while nobody has chosen, and writes nothing', () => {
      const { store, setDefaultDirection, deferred, saved } = setup();

      assert.strictEqual(
        store.arrangement.getSnapshot().value.direction,
        'right',
      );

      setDefaultDirection('down');

      assert.strictEqual(
        store.arrangement.getSnapshot().value.direction,
        'down',
      );

      assert.strictEqual(deferred.requests.at(-1)?.direction, 'down');

      assert.deepStrictEqual(saved, []);
    });

    test('is the stored one once there is one', () => {
      const { store, setDefaultDirection } = setup({
        stored: { direction: 'down', positions: new Map() },
      });

      setDefaultDirection('right');

      assert.strictEqual(
        store.arrangement.getSnapshot().value.direction,
        'down',
      );
    });

    test('toggled, is saved alone, every node staying where it is', async () => {
      const { store, deferred, saved } = setup({
        state: two,
        stored: {
          direction: 'right',
          positions: positions([['task:b', { x: 500, y: 60 }]]),
        },
      });

      deferred.resolve(0);

      await settle();

      store.setDirection('down');

      assert.deepStrictEqual(saved, [
        {
          direction: 'down',
          // `a` where ELK had it, `b` where it was put.
          positions: positions([
            ['task:a', { x: 0, y: 0 }],
            ['task:b', { x: 500, y: 60 }],
          ]),
        },
      ]);

      store.setDirection('down');

      assert.strictEqual(saved.length, 1);
    });
  });

  describe('moving a node', () => {
    test('by dragging writes once, with every node where it is shown', async () => {
      const { store, deferred, saved } = setup({ state: two });

      deferred.resolve(0);

      await settle();

      store.moveNode('task:b', { x: 40, y: 300 });

      assert.deepStrictEqual(saved, [
        {
          direction: 'right',
          positions: positions([
            ['task:a', { x: 0, y: 0 }],
            ['task:b', { x: 40, y: 300 }],
          ]),
        },
      ]);

      assert.deepStrictEqual(store.arrangement.getSnapshot().value, saved[0]);
    });

    test('drops the positions of nodes that no longer exist', async () => {
      const { store, deferred, saved } = setup({
        stored: {
          direction: 'right',
          positions: positions([['task:gone', { x: 1, y: 1 }]]),
        },
      });

      deferred.resolve(0);

      await settle();

      store.moveNode('task:a', { x: 7, y: 7 });

      assert.deepStrictEqual(
        saved.map(({ positions: written }) => Array.from(written.keys())),
        [['task:a']],
      );
    });

    test('by the arrow keys moves at once and writes once after a pause', async () => {
      const { store, deferred, saved, timer } = setup();

      deferred.resolve(0);

      await settle();

      store.nudgeNode('task:a', { x: 8, y: 0 });

      store.nudgeNode('task:a', { x: 0, y: 40 });

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions.get('task:a'),
        { x: 8, y: 40 },
      );

      assert.deepStrictEqual(saved, []);

      timer.fire();

      assert.deepStrictEqual(saved, [
        {
          direction: 'right',
          positions: positions([['task:a', { x: 8, y: 40 }]]),
        },
      ]);

      assert.isFalse(timer.pending());
    });

    test('does not let a write coming back undo a move not yet saved', async () => {
      const { store, deferred, saved, timer, setStored } = setup();

      deferred.resolve(0);

      await settle();

      store.nudgeNode('task:a', { x: 8, y: 0 });

      setStored({ direction: 'right', positions: new Map() });

      timer.fire();

      assert.deepStrictEqual(saved.at(-1)?.positions.get('task:a'), {
        x: 8,
        y: 0,
      });
    });

    test('takes a layout written elsewhere', () => {
      const { store, setStored } = setup();

      const elsewhere: DagLayout = {
        direction: 'down',
        positions: positions([['task:a', { x: 3, y: 4 }]]),
      } as const;

      setStored(elsewhere);

      assert.deepStrictEqual(store.arrangement.getSnapshot().value, elsewhere);
    });
  });

  describe('自動整列', () => {
    test('replaces every position with ELK’s, and asks for a fit', async () => {
      const { store, deferred, saved } = setup({
        state: two,
        stored: {
          direction: 'down',
          positions: positions([
            ['task:a', { x: 900, y: 900 }],
            ['task:b', { x: -50, y: 20 }],
          ]),
        },
      });

      deferred.resolve(0);

      await settle();

      const fits = store.fitRequests.getSnapshot().value;

      store.autoArrange();

      assert.deepStrictEqual(saved, [
        {
          direction: 'down',
          positions: positions([
            ['task:a', { x: 0, y: 0 }],
            ['task:b', { x: 0, y: 100 }],
          ]),
        },
      ]);

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits + 1);
    });

    test('waits for a layout still being computed', async () => {
      const { store, deferred, saved } = setup();

      store.autoArrange();

      assert.deepStrictEqual(saved, []);

      deferred.resolve(0);

      await settle();

      assert.deepStrictEqual(saved, [
        {
          direction: 'right',
          positions: positions([['task:a', { x: 0, y: 0 }]]),
        },
      ]);
    });
  });

  describe('the placement animation', () => {
    test('moves the nodes from a grid to their places when first shown', async () => {
      const { store, deferred, clock, saved } = setup({ state: two });

      assert.isUndefined(animated(store));

      deferred.resolve(0);

      await settle();

      // ELK's places: a at (0, 0), b at (100, 0).
      const final = positions([
        ['task:a', { x: 0, y: 0 }],
        ['task:b', { x: 100, y: 0 }],
      ]);

      const first = animated(store);

      assert.isDefined(first);

      assert.notDeepEqual(first, final);

      clock.advance(ANIMATION_MS / 2);

      const middle = animated(store);

      assert.isDefined(middle);

      // Between the grid and its place, and nearer its place.
      const [startA, middleA] = [
        first.get('task:a'),
        middle.get('task:a'),
      ] as const;

      assert.isDefined(startA);

      assert.isDefined(middleA);

      assert.isBelow(
        Math.hypot(middleA.x, middleA.y),
        Math.hypot(startA.x, startA.y) / 2,
      );

      clock.advance(ANIMATION_MS / 2);

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());

      // An animation writes nothing.
      assert.deepStrictEqual(saved, []);
    });

    test('plays once a session, and stops when the DAG is hidden', async () => {
      const { store, deferred, setActive } = setup({ state: two });

      deferred.resolve(0);

      await settle();

      assert.isDefined(animated(store));

      setActive(false);

      assert.isUndefined(animated(store));

      setActive(true);

      assert.isUndefined(animated(store));
    });

    test('waits for there to be nodes', async () => {
      const { store, deferred, setState } = setup({
        state: { tasks: [], milestones: [] },
      });

      deferred.resolve(0);

      await settle();

      assert.isUndefined(animated(store));

      setState(two);

      deferred.resolve(1);

      await settle();

      assert.isDefined(animated(store));
    });

    test('moves the nodes from where they were after 自動整列', async () => {
      const { store, clock } = await shown({
        stored: {
          direction: 'right',
          positions: positions([
            ['task:a', { x: 900, y: 900 }],
            ['task:b', { x: -50, y: 20 }],
          ]),
        },
      });

      store.autoArrange();

      assert.deepStrictEqual(
        animated(store),
        positions([
          ['task:a', { x: 900, y: 900 }],
          ['task:b', { x: -50, y: 20 }],
        ]),
      );

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));
    });

    test('moves the nodes to a layout written elsewhere, and fits it', async () => {
      const { store, setStored, clock } = await shown();

      const fits = store.fitRequests.getSnapshot().value;

      setStored({
        direction: 'right',
        positions: positions([
          ['task:a', { x: 300, y: 300 }],
          ['task:b', { x: 600, y: 300 }],
        ]),
      });

      assert.deepStrictEqual(
        animated(store),
        positions([
          ['task:a', { x: 0, y: 0 }],
          ['task:b', { x: 100, y: 0 }],
        ]),
      );

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits + 1);

      clock.advance(ANIMATION_MS * 2);

      assert.isUndefined(animated(store));
    });

    test('does not play for a drag, the keys, the direction or a write coming back', async () => {
      const { store, timer, clock } = await shown();

      store.moveNode('task:a', { x: 40, y: 300 });

      store.nudgeNode('task:b', { x: 8, y: 0 });

      timer.fire();

      store.setDirection('down');

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());
    });

    test('is not restarted by its own write coming back', async () => {
      const { store, clock } = await shown({
        stored: {
          direction: 'right',
          positions: positions([['task:a', { x: 900, y: 900 }]]),
        },
      });

      store.autoArrange();

      clock.advance(ANIMATION_MS / 2);

      const middle = animated(store);

      assert.isDefined(middle);

      // `save` has written it back already; the animation goes on.
      clock.advance(ANIMATION_MS / 2);

      assert.isUndefined(animated(store));
    });

    test('jumps to the end when finished early', async () => {
      const { store, deferred, clock } = setup({ state: two });

      deferred.resolve(0);

      await settle();

      store.finishAnimation();

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());
    });

    test('does not play when the reader asks for less motion', async () => {
      const { store, deferred, clock, setStored } = setup({
        state: two,
        reducedMotion: true,
      });

      deferred.resolve(0);

      await settle();

      assert.isUndefined(animated(store));

      setStored({
        direction: 'right',
        positions: positions([['task:a', { x: 300, y: 300 }]]),
      });

      store.autoArrange();

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());
    });
  });

  describe('the animation setting', () => {
    test('「オフ」 never animates', async () => {
      const { store, deferred, clock, setStored } = setup({
        state: two,
        animationSetting: 'off',
      });

      deferred.resolve(0);

      await settle();

      assert.isUndefined(animated(store));

      setStored({
        direction: 'right',
        positions: positions([['task:a', { x: 300, y: 300 }]]),
      });

      store.autoArrange();

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());
    });

    test('「オン」 animates for a reader who asks for less motion', async () => {
      const { store, deferred } = setup({
        state: two,
        reducedMotion: true,
        animationSetting: 'on',
      });

      deferred.resolve(0);

      await settle();

      assert.isDefined(animated(store));
    });

    test('「自動」 follows the request for less motion as it changes', async () => {
      const { store, setReducedMotion, setStored } = await shown({
        reducedMotion: true,
      });

      setReducedMotion(false);

      setStored({
        direction: 'right',
        positions: positions([['task:a', { x: 300, y: 300 }]]),
      });

      assert.isDefined(animated(store));

      // Asked for in the middle of one: it ends there.
      setReducedMotion(true);

      assert.isUndefined(animated(store));
    });

    test('turned 「オフ」 while the nodes move, puts them in place', async () => {
      const { store, deferred, clock, setAnimationSetting } = setup({
        state: two,
      });

      deferred.resolve(0);

      await settle();

      clock.advance(16);

      assert.isDefined(animated(store));

      setAnimationSetting('off');

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());
    });
  });

  describe('the frame budget', () => {
    test('goes on while the frames come at 60 fps', async () => {
      const { store, clock } = await started();

      // A slow first frame — the setup — counts for nothing.
      clock.advance(80);

      for (const _ of Array.from({ length: 30 })) {
        clock.advance(16);

        assert.isDefined(animated(store));
      }

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));
    });

    test('puts the nodes in place when the frames are slow on average', async () => {
      const { store, clock, saved } = await started();

      clock.advance(16);

      clock.advance(50);

      assert.isDefined(animated(store));

      clock.advance(50);

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());

      assert.deepStrictEqual(saved, []);
    });

    test('puts the nodes in place after a single long stall', async () => {
      const { store, clock } = await started();

      clock.advance(16);

      clock.advance(16);

      clock.advance(120);

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());
    });

    test('stops a slow animation under 「オン」 too', async () => {
      const { store, clock } = await started({
        animationSetting: 'on',
        reducedMotion: true,
      });

      clock.advance(16);

      clock.advance(120);

      assert.isUndefined(animated(store));
    });

    test('starts afresh for the next animation', async () => {
      const { store, clock } = await shown({
        stored: {
          direction: 'right',
          positions: positions([['task:a', { x: 900, y: 900 }]]),
        },
      });

      store.autoArrange();

      clock.advance(16);

      clock.advance(16);

      clock.advance(16);

      assert.isDefined(animated(store));
    });
  });

  describe('the view mode', () => {
    // ELK's places for `mixed`: x (0, 0), y (100, 0), m (200, 0). The
    // column, by title: y (Alpha) at the top, x (Zeta) below it.
    const dagPlaces = positions([
      ['task:x', { x: 0, y: 0 }],
      ['task:y', { x: 100, y: 0 }],
      ['milestone:m', { x: 200, y: 0 }],
    ]);

    const arcPlaces = positions([
      ['task:y', { x: 0, y: 0 }],
      ['task:x', { x: 0, y: 72 }],
    ]);

    test('puts the tasks alone in a column, in the order given', () => {
      const { store } = setup({ state: mixed });

      assert.deepStrictEqual(
        new Map(
          store.arcNodes
            .getSnapshot()
            .value.map(({ id, x, y }) => [id, { x, y }]),
        ),
        arcPlaces,
      );
    });

    test('switched to アーク, moves the tasks to the column and fades the milestones out', async () => {
      const { store, clock, saved, setViewMode } = await shown({
        state: mixed,
      });

      const fits = store.fitRequests.getSnapshot().value;

      setViewMode('arc');

      // From where they are drawn, the milestone staying where it is.
      assert.deepStrictEqual(animated(store), dagPlaces);

      assert.deepStrictEqual(opacities(store), new Map([['milestone:m', 1]]));

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits + 1);

      clock.advance(ANIMATION_MS / 2);

      const middleX = animated(store)?.get('task:x');

      assert.isDefined(middleX);

      assert.isAbove(middleX.y, 0);

      assert.isBelow(middleX.y, 72);

      assert.strictEqual(
        animated(store)?.get('milestone:m')?.x,
        dagPlaces.get('milestone:m')?.x,
      );

      const fading = opacities(store)?.get('milestone:m');

      assert.isDefined(fading);

      assert.isAbove(fading, 0);

      assert.isBelow(fading, 1);

      clock.advance(ANIMATION_MS / 2);

      assert.isUndefined(animated(store));

      assert.isUndefined(opacities(store));

      assert.isFalse(clock.pending());

      // Nothing is written for a change of mode.
      assert.deepStrictEqual(saved, []);
    });

    test('switched back to DAG, moves the tasks back and fades the milestones in', async () => {
      const { store, clock, saved, setViewMode } = await shown({
        state: mixed,
      });

      setViewMode('arc');

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      setViewMode('dag');

      assert.deepStrictEqual(
        animated(store),
        positions([
          ['task:x', { x: 0, y: 72 }],
          ['task:y', { x: 0, y: 0 }],
          ['milestone:m', { x: 200, y: 0 }],
        ]),
      );

      assert.deepStrictEqual(opacities(store), new Map([['milestone:m', 0]]));

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      assert.isUndefined(opacities(store));

      assert.deepStrictEqual(saved, []);

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions,
        new Map(),
      );
    });

    test('says how far the switch has got, for the view to follow', async () => {
      const { store, clock, setViewMode } = await shown({ state: mixed });

      assert.isUndefined(store.animationProgress.getSnapshot().value);

      setViewMode('arc');

      assert.strictEqual(store.animationProgress.getSnapshot().value, 0);

      clock.advance(ANIMATION_MS / 2);

      const middle = store.animationProgress.getSnapshot().value;

      assert.isDefined(middle);

      // Eased: past halfway at half the time.
      assert.isAbove(middle, 0.5);

      assert.isBelow(middle, 1);

      clock.advance(ANIMATION_MS / 2);

      assert.isUndefined(store.animationProgress.getSnapshot().value);
    });

    test('switched back halfway, turns round from where the nodes are drawn', async () => {
      const { store, clock, setViewMode } = await shown({ state: mixed });

      setViewMode('arc');

      clock.advance(ANIMATION_MS / 2);

      const drawn = animated(store);

      const faded = opacities(store);

      setViewMode('dag');

      assert.deepStrictEqual(animated(store), drawn);

      assert.deepStrictEqual(opacities(store), faded);
    });

    test('jumps with the animation 「オフ」, and still fits the view', async () => {
      const { store, clock, setViewMode } = await shown({
        state: mixed,
        animationSetting: 'off',
      });

      const fits = store.fitRequests.getSnapshot().value;

      setViewMode('arc');

      assert.isUndefined(animated(store));

      assert.isUndefined(opacities(store));

      assert.isFalse(clock.pending());

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits + 1);
    });

    test('stops a switch whose frames are too slow', async () => {
      const { store, clock, setViewMode } = await shown({ state: mixed });

      setViewMode('arc');

      clock.advance(16);

      clock.advance(120);

      assert.isUndefined(animated(store));

      assert.isUndefined(opacities(store));

      assert.isFalse(clock.pending());
    });

    test('plays nothing while the DAG is hidden', async () => {
      const { store, clock, setViewMode, setActive } = await shown({
        state: mixed,
      });

      setActive(false);

      setViewMode('arc');

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());
    });

    test('first shown in アーク, moves the tasks alone from a grid into the column', async () => {
      const { store, deferred, clock } = setup({
        state: mixed,
        viewMode: 'arc',
      });

      deferred.resolve(0);

      await settle();

      const first = animated(store);

      assert.deepStrictEqual(
        new Set(first?.keys()),
        new Set(['task:x', 'task:y']),
      );

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));
    });

    test('in アーク, a layout written elsewhere moves nothing on screen', async () => {
      const { store, clock, setViewMode, setStored } = await shown({
        state: mixed,
      });

      setViewMode('arc');

      clock.advance(ANIMATION_MS);

      const fits = store.fitRequests.getSnapshot().value;

      setStored({
        direction: 'right',
        positions: positions([['task:x', { x: 500, y: 500 }]]),
      });

      assert.isUndefined(animated(store));

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits);

      // It is there on the way back.
      setViewMode('dag');

      clock.advance(ANIMATION_MS);

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions.get('task:x'),
        { x: 500, y: 500 },
      );
    });
  });

  describe('the node size', () => {
    test('lays the DAG out again with nodes of the new size', async () => {
      const { store, deferred, setNodeSize } = await shown({ state: mixed });

      setNodeSize('compact');

      assert.strictEqual(deferred.requests.length, 2);

      assert.deepStrictEqual(
        deferred.requests[1]?.nodes.map(
          ({ id, width, height }) => [id, width, height] as const,
        ),
        [
          [
            'task:x',
            COMPACT_TASK_NODE_SIZE.width,
            COMPACT_TASK_NODE_SIZE.height,
          ],
          [
            'task:y',
            COMPACT_TASK_NODE_SIZE.width,
            COMPACT_TASK_NODE_SIZE.height,
          ],
          [
            'milestone:m',
            COMPACT_MILESTONE_NODE_SIZE.width,
            COMPACT_MILESTONE_NODE_SIZE.height,
          ],
        ],
      );

      deferred.resolve(1, 60);

      await settle();

      assert.deepStrictEqual(boxes(readyLayout(store)), [
        ['task:x', COMPACT_TASK_NODE_SIZE.width, COMPACT_TASK_NODE_SIZE.height],
        ['task:y', COMPACT_TASK_NODE_SIZE.width, COMPACT_TASK_NODE_SIZE.height],
        [
          'milestone:m',
          COMPACT_MILESTONE_NODE_SIZE.width,
          COMPACT_MILESTONE_NODE_SIZE.height,
        ],
      ]);

      // And back, at the size it was.
      setNodeSize('standard');

      assert.deepStrictEqual(
        deferred.requests[2]?.nodes.map(({ width }) => width),
        [TASK_NODE_SIZE.width, TASK_NODE_SIZE.width, 168],
      );
    });

    test('moves the nodes ELK places to their new places, fits the view, and writes nothing', async () => {
      const { store, deferred, clock, saved, setNodeSize } = await shown({
        state: mixed,
      });

      const fits = store.fitRequests.getSnapshot().value;

      setNodeSize('compact');

      // Nothing moves until the new layout is there.
      assert.isUndefined(animated(store));

      deferred.resolve(1, 60);

      await settle();

      assert.deepStrictEqual(
        animated(store),
        positions([
          ['task:x', { x: 0, y: 0 }],
          ['task:y', { x: 100, y: 0 }],
          ['milestone:m', { x: 200, y: 0 }],
        ]),
      );

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits + 1);

      clock.advance(ANIMATION_MS / 2);

      const middle = animated(store)?.get('milestone:m');

      assert.isDefined(middle);

      assert.isAbove(middle.x, 120);

      assert.isBelow(middle.x, 200);

      clock.advance(ANIMATION_MS / 2);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(saved, []);

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions,
        new Map(),
      );
    });

    test('keeps the nodes put somewhere where they were put', async () => {
      const stored: DagLayout = {
        direction: 'right',
        positions: positions([['task:y', { x: 500, y: 40 }]]),
      } as const;

      const { store, deferred, clock, saved, setNodeSize } = await shown({
        state: mixed,
        stored,
      });

      setNodeSize('compact');

      deferred.resolve(1, 60);

      await settle();

      // The others move; that one stays.
      const from = animated(store);

      assert.deepStrictEqual(from?.get('task:y'), { x: 500, y: 40 });

      clock.advance(ANIMATION_MS / 2);

      assert.deepStrictEqual(animated(store)?.get('task:y'), {
        x: 500,
        y: 40,
      });

      clock.advance(ANIMATION_MS / 2);

      assert.deepStrictEqual(saved, []);

      assert.deepStrictEqual(store.arrangement.getSnapshot().value, stored);
    });

    test('moves nothing, and still fits, when every node was put somewhere', async () => {
      const stored: DagLayout = {
        direction: 'right',
        positions: positions([
          ['task:a', { x: 10, y: 10 }],
          ['task:b', { x: 300, y: 10 }],
        ]),
      } as const;

      const { store, deferred, clock, saved, setNodeSize } = await shown({
        stored,
      });

      const fits = store.fitRequests.getSnapshot().value;

      setNodeSize('compact');

      deferred.resolve(1, 60);

      await settle();

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits + 1);

      assert.deepStrictEqual(saved, []);
    });

    test('jumps with the animation 「オフ」', async () => {
      const { store, deferred, clock, setNodeSize } = await shown({
        state: mixed,
        animationSetting: 'off',
      });

      setNodeSize('compact');

      deferred.resolve(1, 60);

      await settle();

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());
    });

    test('in アーク, moves the tasks to a closer column at once, and fits the view', async () => {
      const { store, clock, saved, setViewMode, setNodeSize } = await shown({
        state: mixed,
      });

      setViewMode('arc');

      clock.advance(ANIMATION_MS);

      const fits = store.fitRequests.getSnapshot().value;

      setNodeSize('compact');

      assert.deepStrictEqual(
        animated(store),
        positions([
          ['task:y', { x: 0, y: 0 }],
          ['task:x', { x: 0, y: TASK_NODE_SIZE.height + ARC_NODE_GAP }],
        ]),
      );

      // Not a change of mode: nothing fades.
      assert.isUndefined(opacities(store));

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits + 1);

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(
        store.arcNodes
          .getSnapshot()
          .value.map(({ id, y, height }) => [id, y, height] as const),
        [
          ['task:y', 0, COMPACT_TASK_NODE_SIZE.height],
          [
            'task:x',
            COMPACT_TASK_NODE_SIZE.height + ARC_NODE_GAP,
            COMPACT_TASK_NODE_SIZE.height,
          ],
        ],
      );

      assert.deepStrictEqual(saved, []);
    });

    test('in タイル, moves the tasks to rows with more to a row', async () => {
      // One standard task to a row, two compact ones.
      const width = 2 * COMPACT_TASK_NODE_SIZE.width + TILE_NODE_GAP;

      assert.isBelow(width, 2 * TASK_NODE_SIZE.width + TILE_NODE_GAP);

      const { store, clock, saved, setViewMode, setNodeSize } =
        await shownWithWidth(width);

      setViewMode('tile');

      clock.advance(ANIMATION_MS);

      setNodeSize('compact');

      assert.deepStrictEqual(
        animated(store),
        positions([
          ['task:y', { x: 0, y: 0 }],
          ['task:x', { x: 0, y: TASK_NODE_SIZE.height + TILE_NODE_GAP }],
        ]),
      );

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(
        tilePlaces(store),
        positions([
          ['task:y', { x: 0, y: 0 }],
          ['task:x', { x: COMPACT_TASK_NODE_SIZE.width + TILE_NODE_GAP, y: 0 }],
        ]),
      );

      assert.deepStrictEqual(saved, []);
    });

    test('while the DAG is hidden, moves nothing, and lays out on coming back', async () => {
      const { store, deferred, clock, setActive, setNodeSize } = await shown({
        state: mixed,
      });

      setActive(false);

      setNodeSize('compact');

      assert.isUndefined(animated(store));

      assert.strictEqual(deferred.requests.length, 1);

      setActive(true);

      assert.strictEqual(deferred.requests.length, 2);

      deferred.resolve(1, 60);

      await settle();

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());
    });

    test('in アーク, lays the DAG out again for when it comes back, moving nothing on screen', async () => {
      const { store, deferred, clock, setViewMode, setNodeSize } = await shown({
        state: mixed,
      });

      setViewMode('arc');

      clock.advance(ANIMATION_MS);

      setNodeSize('compact');

      clock.advance(ANIMATION_MS);

      deferred.resolve(1, 60);

      await settle();

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(
        boxes(readyLayout(store)).map(([, width]) => width),
        [
          COMPACT_TASK_NODE_SIZE.width,
          COMPACT_TASK_NODE_SIZE.width,
          COMPACT_MILESTONE_NODE_SIZE.width,
        ],
      );
    });
  });

  describe('タイル', () => {
    // `mixed` in rows: y (Alpha) first, then x (Zeta); the milestone not at
    // all. Two task widths and a gap make two columns; less, one.
    const twoColumns = 2 * TASK_NODE_SIZE.width + TILE_NODE_GAP;

    const oneColumn = twoColumns - 1;

    const columnStep = TASK_NODE_SIZE.width + TILE_NODE_GAP;

    const rowStep = TASK_NODE_SIZE.height + TILE_NODE_GAP;

    const inOneRow = positions([
      ['task:y', { x: 0, y: 0 }],
      ['task:x', { x: columnStep, y: 0 }],
    ]);

    const inOneColumn = positions([
      ['task:y', { x: 0, y: 0 }],
      ['task:x', { x: 0, y: rowStep }],
    ]);

    test('puts the tasks alone in rows as wide as the canvas, in order', () => {
      const { store } = setup({ state: mixed });

      store.setTileWidth(twoColumns);

      assert.deepStrictEqual(tilePlaces(store), inOneRow);

      store.setTileWidth(oneColumn);

      assert.deepStrictEqual(tilePlaces(store), inOneColumn);
    });

    test('lays nothing out until the width of the canvas is known', () => {
      const { store } = setup({ state: mixed });

      assert.deepStrictEqual(store.tileNodes.getSnapshot().value, []);
    });

    test('follows the order the diagrams share, as アーク does', () => {
      const { store, setDiagramSort } = setup({ state: mixed });

      store.setTileWidth(twoColumns);

      setDiagramSort([{ key: 'title', order: 'desc' }]);

      assert.deepStrictEqual(
        store.tileNodes.getSnapshot().value.map(({ id }) => id),
        ['task:x', 'task:y'],
      );

      assert.deepStrictEqual(
        store.arcNodes.getSnapshot().value.map(({ id }) => id),
        ['task:x', 'task:y'],
      );
    });

    test('switched to タイル, moves the tasks to the rows and fades the milestones out', async () => {
      const { store, clock, saved, setViewMode } =
        await shownWithWidth(twoColumns);

      // A width given outside タイル moves nothing.
      assert.isUndefined(animated(store));

      const fits = store.fitRequests.getSnapshot().value;

      setViewMode('tile');

      assert.deepStrictEqual(
        animated(store),
        positions([
          ['task:x', { x: 0, y: 0 }],
          ['task:y', { x: 100, y: 0 }],
          ['milestone:m', { x: 200, y: 0 }],
        ]),
      );

      assert.deepStrictEqual(opacities(store), new Map([['milestone:m', 1]]));

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits + 1);

      clock.advance(ANIMATION_MS / 2);

      const fading = opacities(store)?.get('milestone:m');

      assert.isDefined(fading);

      assert.isAbove(fading, 0);

      assert.isBelow(fading, 1);

      clock.advance(ANIMATION_MS / 2);

      assert.isUndefined(animated(store));

      assert.isUndefined(opacities(store));

      assert.deepStrictEqual(tilePlaces(store), inOneRow);

      assert.deepStrictEqual(saved, []);
    });

    test('switched back to DAG, moves the tasks back and fades the milestones in', async () => {
      const { store, clock, saved, setViewMode } =
        await shownWithWidth(twoColumns);

      setViewMode('tile');

      clock.advance(ANIMATION_MS);

      setViewMode('dag');

      assert.deepStrictEqual(
        animated(store),
        positions([
          ['task:y', { x: 0, y: 0 }],
          ['task:x', { x: columnStep, y: 0 }],
          ['milestone:m', { x: 200, y: 0 }],
        ]),
      );

      assert.deepStrictEqual(opacities(store), new Map([['milestone:m', 0]]));

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(saved, []);

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions,
        new Map(),
      );
    });

    test('switched from アーク, moves the tasks alone, and no milestone shows', async () => {
      const { store, clock, saved, setViewMode } =
        await shownWithWidth(twoColumns);

      setViewMode('arc');

      clock.advance(ANIMATION_MS);

      setViewMode('tile');

      assert.deepStrictEqual(
        animated(store),
        positions([
          ['task:y', { x: 0, y: 0 }],
          ['task:x', { x: 0, y: 72 }],
        ]),
      );

      // Still a change of mode, for the view, with nothing to fade.
      assert.deepStrictEqual(opacities(store), new Map());

      clock.advance(ANIMATION_MS / 2);

      const middle = animated(store);

      assert.isDefined(middle);

      assert.isFalse(middle.has('milestone:m'));

      clock.advance(ANIMATION_MS / 2);

      assert.isUndefined(animated(store));

      setViewMode('arc');

      assert.deepStrictEqual(
        new Set(animated(store)?.keys()),
        new Set(['task:x', 'task:y']),
      );

      clock.advance(ANIMATION_MS);

      assert.deepStrictEqual(saved, []);
    });

    test('jumps with the animation 「オフ」, and still fits the view', async () => {
      const { store, clock, setViewMode } = await shownWithWidth(twoColumns, {
        animationSetting: 'off',
      });

      const fits = store.fitRequests.getSnapshot().value;

      setViewMode('tile');

      assert.isUndefined(animated(store));

      assert.isUndefined(opacities(store));

      assert.isFalse(clock.pending());

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits + 1);
    });

    test('a new width moves the tasks to their new rows, writing nothing', async () => {
      const { store, clock, saved, setViewMode } =
        await shownWithWidth(twoColumns);

      setViewMode('tile');

      clock.advance(ANIMATION_MS);

      const fits = store.fitRequests.getSnapshot().value;

      store.setTileWidth(oneColumn);

      assert.deepStrictEqual(animated(store), inOneRow);

      // Not a change of mode: nothing fades, and the view stays where it is.
      assert.isUndefined(opacities(store));

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits);

      clock.advance(ANIMATION_MS / 2);

      const middle = animated(store)?.get('task:x');

      assert.isDefined(middle);

      assert.isAbove(middle.y, 0);

      assert.isBelow(middle.y, rowStep);

      clock.advance(ANIMATION_MS / 2);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(tilePlaces(store), inOneColumn);

      assert.deepStrictEqual(saved, []);
    });

    test('a new width that keeps the rows moves nothing', async () => {
      const { store, clock, setViewMode } = await shownWithWidth(twoColumns);

      setViewMode('tile');

      clock.advance(ANIMATION_MS);

      store.setTileWidth(twoColumns + 50);

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());
    });

    test('a new width with the animation 「オフ」 puts the tasks there at once', async () => {
      const { store, clock, setViewMode } = await shownWithWidth(twoColumns, {
        animationSetting: 'off',
      });

      setViewMode('tile');

      store.setTileWidth(oneColumn);

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());

      assert.deepStrictEqual(tilePlaces(store), inOneColumn);
    });

    test('a new width while the DAG is hidden moves nothing', async () => {
      const { store, clock, setViewMode, setActive } =
        await shownWithWidth(twoColumns);

      setViewMode('tile');

      clock.advance(ANIMATION_MS);

      setActive(false);

      store.setTileWidth(oneColumn);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(tilePlaces(store), inOneColumn);
    });

    test('first shown in タイル, waits for the width, then moves the tasks alone from a grid', async () => {
      const { store, deferred, clock } = setup({
        state: mixed,
        viewMode: 'tile',
      });

      deferred.resolve(0);

      await settle();

      assert.isUndefined(animated(store));

      store.setTileWidth(twoColumns);

      assert.deepStrictEqual(
        new Set(animated(store)?.keys()),
        new Set(['task:x', 'task:y']),
      );

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(tilePlaces(store), inOneRow);
    });
  });

  describe('the order of アーク and タイル', () => {
    // `mixed` by title: y (Alpha), then x (Zeta); the other way round by
    // title descending.
    const arcStep = TASK_NODE_SIZE.height + ARC_NODE_GAP;

    const byTitle = positions([
      ['task:y', { x: 0, y: 0 }],
      ['task:x', { x: 0, y: arcStep }],
    ]);

    const byTitleDescending = positions([
      ['task:x', { x: 0, y: 0 }],
      ['task:y', { x: 0, y: arcStep }],
    ]);

    const titleDescending = [{ key: 'title', order: 'desc' }] as const;

    /** Shown with `mixed` in `mode`, its animation run out. */
    const shownIn = async (
      mode: 'arc' | 'tile',
      options: Parameters<typeof setup>[0] = {},
    ): Promise<ReturnType<typeof setup>> => {
      // One task to a row, so that 「タイル」 is a column too.
      const result = await shownWithWidth(TASK_NODE_SIZE.width, options);

      result.setViewMode(mode);

      result.clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(result.store));

      return result;
    };

    test('in アーク, a new order moves the tasks to their new places, writing nothing', async () => {
      const { store, clock, saved, setDiagramSort } = await shownIn('arc');

      const fits = store.fitRequests.getSnapshot().value;

      assert.deepStrictEqual(arcColumn(store), byTitle);

      setDiagramSort(titleDescending);

      // From where they were drawn.
      assert.deepStrictEqual(animated(store), byTitle);

      // Not a change of mode: nothing fades, and the view stays where it is.
      assert.isUndefined(opacities(store));

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits);

      clock.advance(ANIMATION_MS / 2);

      const middle = animated(store)?.get('task:x');

      assert.isDefined(middle);

      assert.isAbove(middle.y, 0);

      assert.isBelow(middle.y, arcStep);

      clock.advance(ANIMATION_MS / 2);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(arcColumn(store), byTitleDescending);

      assert.deepStrictEqual(saved, []);
    });

    test('in タイル, a new order moves the tasks to their new places, writing nothing', async () => {
      const { store, clock, saved, setDiagramSort } = await shownIn('tile');

      const rowStep = TASK_NODE_SIZE.height + TILE_NODE_GAP;

      const before = positions([
        ['task:y', { x: 0, y: 0 }],
        ['task:x', { x: 0, y: rowStep }],
      ]);

      assert.deepStrictEqual(tilePlaces(store), before);

      setDiagramSort(titleDescending);

      assert.deepStrictEqual(animated(store), before);

      assert.isUndefined(opacities(store));

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(
        tilePlaces(store),
        positions([
          ['task:x', { x: 0, y: 0 }],
          ['task:y', { x: 0, y: rowStep }],
        ]),
      );

      assert.deepStrictEqual(saved, []);
    });

    test('in DAG, a new order moves nothing, and is there on switching', async () => {
      const { store, clock, saved, setDiagramSort, setViewMode } = await shown({
        state: mixed,
      });

      const fits = store.fitRequests.getSnapshot().value;

      setDiagramSort(titleDescending);

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits);

      assert.deepStrictEqual(saved, []);

      setViewMode('arc');

      clock.advance(ANIMATION_MS);

      assert.deepStrictEqual(arcColumn(store), byTitleDescending);
    });

    test('an order that puts the tasks where they were moves nothing', async () => {
      const { store, clock, setDiagramSort } = await shownIn('arc');

      setDiagramSort([
        { key: 'priority', order: 'asc' },
        { key: 'title', order: 'asc' },
      ]);

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());
    });

    test('no keys at all is title ascending', async () => {
      const { store, clock, setDiagramSort } = await shownIn('arc', {
        diagramSort: titleDescending,
      });

      assert.deepStrictEqual(arcColumn(store), byTitleDescending);

      setDiagramSort([]);

      clock.advance(ANIMATION_MS);

      assert.deepStrictEqual(arcColumn(store), byTitle);
    });

    test('a renamed task moves to its new place', async () => {
      const { store, clock, saved, setState } = await shownIn('arc');

      setState({
        tasks: mixed.tasks.map((task) =>
          task.id === 'x' ? { ...task, title: 'Aardvark' } : task,
        ),
        milestones: mixed.milestones,
      });

      assert.deepStrictEqual(animated(store), byTitle);

      clock.advance(ANIMATION_MS);

      assert.deepStrictEqual(arcColumn(store), byTitleDescending);

      assert.deepStrictEqual(saved, []);
    });

    test('follows the time, for an order by status', async () => {
      // y waits for a milestone dated 5000: blocked until then, after x,
      // which is ready; both ready from then, and y (Alpha) first by title.
      const gate = asMilestoneId('gate');

      const gated: DomainState = {
        tasks: mixed.tasks.map((task) =>
          task.id === 'y'
            ? {
                ...task,
                dependencies: [
                  { from: { kind: 'milestone', id: gate }, lagMs: 0 },
                ],
              }
            : task,
        ),
        milestones: [
          createMilestone({ id: gate, title: 'Gate', now: 0, date: 5000 }),
        ],
      } as const;

      const { store, clock, saved, setStateTime } = await shownIn('arc', {
        state: gated,
        stateTime: 1000,
        diagramSort: [
          { key: 'status', order: 'asc' },
          { key: 'title', order: 'asc' },
        ],
      });

      assert.deepStrictEqual(arcColumn(store), byTitleDescending);

      setStateTime(2000);

      assert.isUndefined(animated(store));

      setStateTime(6000);

      assert.deepStrictEqual(animated(store), byTitleDescending);

      clock.advance(ANIMATION_MS);

      assert.deepStrictEqual(arcColumn(store), byTitle);

      assert.deepStrictEqual(saved, []);
    });

    test('jumps with the animation 「オフ」', async () => {
      const { store, clock, setDiagramSort } = await shownIn('arc', {
        animationSetting: 'off',
      });

      setDiagramSort(titleDescending);

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());

      assert.deepStrictEqual(arcColumn(store), byTitleDescending);
    });

    test('moves nothing while the DAG is hidden', async () => {
      const { store, clock, setActive, setDiagramSort } = await shownIn('tile');

      setActive(false);

      setDiagramSort(titleDescending);

      assert.isUndefined(animated(store));

      assert.isFalse(clock.pending());

      // Drawn in the new order on coming back, with nothing to move.
      setActive(true);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(
        store.tileNodes.getSnapshot().value.map(({ id }) => id),
        ['task:x', 'task:y'],
      );
    });
  });
});
