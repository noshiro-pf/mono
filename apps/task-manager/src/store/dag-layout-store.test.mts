import { createState } from 'synstate';
import { Arr, Num } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import {
  ARC_NODE_GAP,
  arrangementScale,
  COMPACT_MILESTONE_NODE_SIZE,
  COMPACT_TASK_NODE_SIZE,
  EMPTY_GROUP_SIZE,
  GROUP_HEADER,
  GROUP_PADDING,
  MILESTONE_NODE_SIZE,
  PLACEMENT_GAP,
  scaleArrangement,
  TASK_NODE_SIZE,
  TILE_NODE_GAP,
  type DagDirection,
  type DagLayout,
  type GraphLayout,
  type LayoutInput,
  type Point,
} from '../dag/index.mjs';
import {
  asGroupId,
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  nodeRefOf,
  regroupNode,
  type DomainState,
  type GraphNodeId,
  type Group,
  type GroupId,
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

const three: DomainState = {
  tasks: Arr.toPushed(
    two.tasks,
    createTask({ id: asTaskId('c'), title: 'C', now: 0 }),
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
 * A stand-in for ELK: the nodes `step` apart in the direction asked for, in the
 * order given.
 */
const laidOut = (input: LayoutInput | undefined, step: number): GraphLayout =>
  ({
    nodes: (input?.nodes ?? []).map((node, index) => ({
      ...node,
      x: input?.direction === 'right' ? index * step : 0,
      y: input?.direction === 'down' ? index * step : 0,
    })),
    edges: input?.edges ?? [],
    // Every group's box at the origin: only an empty one's is read.
    groups: (input?.groups ?? []).map((group) => ({
      ...group,
      x: 0,
      y: 0,
      ...EMPTY_GROUP_SIZE,
    })),
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
    hidden?: ReadonlySet<GraphNodeId>;
    groups?: readonly Group[];
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
  setHidden: (next: ReadonlySet<GraphNodeId>) => void;
  setGroups: (next: readonly Group[]) => void;
  /** Every node moved to a group, in order, and the group. */
  regrouped: readonly (readonly [GraphNodeId, GroupId | undefined])[];
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

  const [hidden, setHidden] = createState<ReadonlySet<GraphNodeId>>(
    options.hidden ?? new Set<GraphNodeId>(),
  );

  const [groups, setGroups] = createState<readonly Group[]>(
    options.groups ?? [],
  );

  const mut_saved: DagLayout[] = [];

  const mut_regrouped: (readonly [GraphNodeId, GroupId | undefined])[] = [];

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
    hidden,
    groups,
    setGroup: (id, groupId) => {
      mut_regrouped.push([id, groupId]);

      // As the repository does: the write comes back.
      const current = state.getSnapshot().value;

      const next = regroupNode(current, nodeRefOf(id), groupId, 0);

      if (next !== undefined) {
        setState(
          next.kind === 'task'
            ? {
                tasks: current.tasks.map((task) =>
                  task.id === next.task.id ? next.task : task,
                ),
                milestones: current.milestones,
              }
            : {
                tasks: current.tasks,
                milestones: current.milestones.map((milestone) =>
                  milestone.id === next.milestone.id
                    ? next.milestone
                    : milestone,
                ),
              },
        );
      }
    },
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
    setHidden: (next) => {
      setHidden(next);
    },
    setGroups: (next) => {
      setGroups(next);
    },
    regrouped: mut_regrouped,
    deferred,
    timer,
    clock,
    saved: mut_saved,
  };
};

/**
 * Two tasks put somewhere, as stored: where `task:a` is does not come back
 * the same from 「大」 by multiplying and dividing.
 */
const spreadStored: DagLayout = {
  direction: 'right',
  positions: new Map<GraphNodeId, Point>([
    ['task:a', { x: 11, y: 22 }],
    ['task:b', { x: 300, y: 40 }],
  ]),
  groupPositions: new Map<GroupId, Point>(),
} as const;

/** `spreadStored` as drawn at 「大」. */
const spreadAtLarge: ReadonlyMap<GraphNodeId, Point> = scaleArrangement(
  spreadStored,
  arrangementScale('large'),
).positions;

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

/** Where each node of `layout` is. */
const positionsOfLayout = (
  layout: GraphLayout | undefined,
): ReadonlyMap<GraphNodeId, Point> =>
  new Map((layout?.nodes ?? []).map(({ id, x, y }) => [id, { x, y }]));

/** Where 「タイル」 draws each task when nothing moves. */
const tilePlaces = (store: DagLayoutStore): ReadonlyMap<GraphNodeId, Point> =>
  new Map(
    store.tileNodes.getSnapshot().value.map(({ id, x, y }) => [id, { x, y }]),
  );

/** Where 「アーク」 draws each node when nothing moves. */
const arcColumn = (store: DagLayoutStore): ReadonlyMap<GraphNodeId, Point> =>
  new Map(
    store.arcNodes.getSnapshot().value.map(({ id, x, y }) => [id, { x, y }]),
  );

/**
 * The DAG shown with `mixed`, its animation run out, and the canvas said to be
 * `width` wide.
 */
const shownWithWidth = async (
  width: number,
  options: Parameters<typeof setup>[0] = {},
): Promise<ReturnType<typeof setup>> => {
  const result = await shown({ state: mixed, ...options });

  result.store.setTileWidth(width);

  return result;
};

/** Milestones `m0`, `m1`… on `dates`, in that order. */
const dated = (dates: readonly number[]): DomainState =>
  ({
    tasks: [],
    milestones: dates.map((date, index) =>
      createMilestone({
        id: asMilestoneId(`m${index}`),
        title: `M${index}`,
        now: 0,
        date,
      }),
    ),
  }) as const;

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

    test('orders the milestones that have a date by date, and follows a date changed', () => {
      const { deferred, setState } = setup({
        state: dated([3000, 1000, 2000]),
      });

      const implied = (index: number): readonly FixedLengthTuple<2, string>[] =>
        (deferred.requests[index]?.edges ?? [])
          .filter((edge) => edge.implied)
          .map(({ from, to }) => [from, to] as const);

      assert.deepStrictEqual(implied(0), [
        ['milestone:m1', 'milestone:m2'],
        ['milestone:m2', 'milestone:m0'],
      ]);

      setState(dated([3000, 2500, 2000]));

      assert.strictEqual(deferred.requests.length, 2);

      assert.deepStrictEqual(implied(1), [
        ['milestone:m2', 'milestone:m1'],
        ['milestone:m1', 'milestone:m0'],
      ]);
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
        stored: {
          direction: 'down',
          positions: new Map<GraphNodeId, Point>(),
          groupPositions: new Map<GroupId, Point>(),
        },
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
          groupPositions: new Map<GroupId, Point>(),
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
          groupPositions: new Map<GroupId, Point>(),
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
          groupPositions: new Map<GroupId, Point>(),
        },
      ]);

      assert.deepStrictEqual(store.arrangement.getSnapshot().value, saved[0]);
    });

    test('dragged with others selected, moves them all as far and writes once', async () => {
      const { store, deferred, saved } = setup({ state: three });

      deferred.resolve(0);

      await settle();

      store.moveNodes(['task:a', 'task:c'], { x: 10, y: 50 });

      assert.deepStrictEqual(saved, [
        {
          direction: 'right',
          positions: positions([
            ['task:a', { x: 10, y: 50 }],
            ['task:b', { x: 100, y: 0 }],
            ['task:c', { x: 210, y: 50 }],
          ]),
          groupPositions: new Map<GroupId, Point>(),
        },
      ]);
    });

    test('drops the positions of nodes that no longer exist', async () => {
      const { store, deferred, saved } = setup({
        stored: {
          direction: 'right',
          positions: positions([['task:gone', { x: 1, y: 1 }]]),
          groupPositions: new Map<GroupId, Point>(),
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
          groupPositions: new Map<GroupId, Point>(),
        },
      ]);

      assert.isFalse(timer.pending());
    });

    test('does not let a write coming back undo a move not yet saved', async () => {
      const { store, deferred, saved, timer, setStored } = setup();

      deferred.resolve(0);

      await settle();

      store.nudgeNode('task:a', { x: 8, y: 0 });

      setStored({
        direction: 'right',
        positions: new Map<GraphNodeId, Point>(),
        groupPositions: new Map<GroupId, Point>(),
      });

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
        groupPositions: new Map<GroupId, Point>(),
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
          groupPositions: new Map<GroupId, Point>(),
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
          groupPositions: new Map<GroupId, Point>(),
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
          groupPositions: new Map<GroupId, Point>(),
        },
      ]);
    });
  });

  describe('a node added', () => {
    test('lays the DAG out again when it was as 自動整列 left it', async () => {
      const { store, deferred, clock, saved, setState } = await shown();

      store.autoArrange();

      const fits = store.fitRequests.getSnapshot().value;

      setState(three);

      deferred.resolve(1, 300);

      await settle();

      assert.deepStrictEqual(saved.at(-1), {
        direction: 'right',
        positions: positions([
          ['task:a', { x: 0, y: 0 }],
          ['task:b', { x: 300, y: 0 }],
          ['task:c', { x: 600, y: 0 }],
        ]),
        groupPositions: new Map<GroupId, Point>(),
      });

      // From where they were, as for 自動整列.
      assert.deepStrictEqual(animated(store)?.get('task:b'), { x: 100, y: 0 });

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits + 1);

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));
    });

    test('lays it out again for a node removed, too', async () => {
      const { store, deferred, saved, setState } = await shown();

      store.autoArrange();

      setState(one);

      deferred.resolve(1, 300);

      await settle();

      assert.deepStrictEqual(saved.at(-1), {
        direction: 'right',
        positions: positions([['task:a', { x: 0, y: 0 }]]),
        groupPositions: new Map<GroupId, Point>(),
      });
    });

    test('keeps a layout written with nodes none of which it had, as an import writes', async () => {
      const { store, deferred, saved, setState, setStored } = await shown();

      store.autoArrange();

      await settle();

      const imported: DagLayout = {
        direction: 'right',
        positions: positions([
          ['task:x', { x: 1000, y: 1000 }],
          ['task:y', { x: 2000, y: 2000 }],
        ]),
        groupPositions: new Map<GroupId, Point>(),
      } as const;

      const writes = saved.length;

      // The nodes first; the order the two subscriptions hand them on in.
      setState({ tasks: mixed.tasks, milestones: [] });

      setStored(imported);

      assert.strictEqual(deferred.requests.length, 2);

      deferred.resolve(1, 300);

      await settle();

      assert.strictEqual(saved.length, writes);

      assert.deepStrictEqual(store.arrangement.getSnapshot().value, imported);
    });

    test('writes nothing while nothing was ever saved', async () => {
      const { deferred, saved, setState } = await shown();

      setState(three);

      deferred.resolve(1, 300);

      await settle();

      assert.deepStrictEqual(saved, []);
    });

    test('once a node was moved by hand, is put clear of the others and saved, the rest staying', async () => {
      const { store, deferred, saved, setState } = await shown();

      store.autoArrange();

      store.moveNode('task:b', { x: 300, y: 0 });

      const fits = store.fitRequests.getSnapshot().value;

      setState(three);

      // ELK puts `c` at (200, 0), over `b`.
      deferred.resolve(1);

      await settle();

      assert.deepStrictEqual(saved.at(-1), {
        direction: 'right',
        positions: positions([
          ['task:a', { x: 0, y: 0 }],
          ['task:b', { x: 300, y: 0 }],
          ['task:c', { x: 200, y: TASK_NODE_SIZE.height + PLACEMENT_GAP }],
        ]),
        groupPositions: new Map<GroupId, Point>(),
      });

      assert.isUndefined(animated(store));

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits);
    });

    test('does not lay the DAG out again for a new direction', async () => {
      const { store, deferred, saved } = await shown();

      store.autoArrange();

      store.setDirection('down');

      deferred.resolve(1);

      await settle();

      assert.deepStrictEqual(saved.at(-1), {
        direction: 'down',
        positions: positions([
          ['task:a', { x: 0, y: 0 }],
          ['task:b', { x: 100, y: 0 }],
        ]),
        groupPositions: new Map<GroupId, Point>(),
      });
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
          groupPositions: new Map<GroupId, Point>(),
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
        groupPositions: new Map<GroupId, Point>(),
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
          groupPositions: new Map<GroupId, Point>(),
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
        groupPositions: new Map<GroupId, Point>(),
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
        groupPositions: new Map<GroupId, Point>(),
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
        groupPositions: new Map<GroupId, Point>(),
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
          groupPositions: new Map<GroupId, Point>(),
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
    // ELK's places for `mixed`: x (0, 0), y (100, 0), m (200, 0). The column,
    // by title: y (Alpha) at the top, x (Zeta) below it, and m, joined to
    // neither, at the end, its right side lined up with theirs.
    const dagPlaces = positions([
      ['task:x', { x: 0, y: 0 }],
      ['task:y', { x: 100, y: 0 }],
      ['milestone:m', { x: 200, y: 0 }],
    ]);

    const arcPlaces = positions([
      ['task:y', { x: 0, y: 0 }],
      ['task:x', { x: 0, y: 72 }],
      ['milestone:m', { x: 16, y: 144 }],
    ]);

    test('puts the tasks and the milestones in a column, in the order given', () => {
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

    test('switched to アーク, moves every node to the column, fading none', async () => {
      const { store, clock, saved, setViewMode } = await shown({
        state: mixed,
      });

      const fits = store.fitRequests.getSnapshot().value;

      setViewMode('arc');

      // From where they are drawn.
      assert.deepStrictEqual(animated(store), dagPlaces);

      // Still a change of mode, for the view, with nothing to fade.
      assert.deepStrictEqual(opacities(store), new Map<GraphNodeId, number>());

      assert.strictEqual(store.fitRequests.getSnapshot().value, fits + 1);

      clock.advance(ANIMATION_MS / 2);

      const middleX = animated(store)?.get('task:x');

      assert.isDefined(middleX);

      assert.isAbove(middleX.y, 0);

      assert.isBelow(middleX.y, 72);

      const middleM = animated(store)?.get('milestone:m');

      assert.isDefined(middleM);

      assert.isAbove(middleM.x, 16);

      assert.isBelow(middleM.x, 200);

      clock.advance(ANIMATION_MS / 2);

      assert.isUndefined(animated(store));

      assert.isUndefined(opacities(store));

      assert.isFalse(clock.pending());

      assert.deepStrictEqual(arcColumn(store), arcPlaces);

      // Nothing is written for a change of mode.
      assert.deepStrictEqual(saved, []);
    });

    test('switched back to DAG, moves every node back', async () => {
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
          ['milestone:m', { x: 16, y: 144 }],
        ]),
      );

      assert.deepStrictEqual(opacities(store), new Map<GraphNodeId, number>());

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      assert.isUndefined(opacities(store));

      assert.deepStrictEqual(saved, []);

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions,
        new Map<GraphNodeId, Point>(),
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

    test('first shown in アーク, moves the nodes from a grid into the column without waiting for ELK', () => {
      const { store, deferred, clock } = setup({
        state: mixed,
        viewMode: 'arc',
      });

      // ELK has not answered yet.
      assert.strictEqual(
        store.autoLayout.getSnapshot().value.type,
        'computing',
      );

      const first = animated(store);

      assert.deepStrictEqual(
        new Set(first?.keys()),
        new Set<string>(['task:x', 'task:y', 'milestone:m']),
      );

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(arcColumn(store), arcPlaces);

      // Its answer moves nothing in アーク.
      deferred.resolve(0);

      assert.isUndefined(animated(store));
    });

    test('first shown in アーク, waits for the data', () => {
      const { store, setState } = setup({
        state: { tasks: [], milestones: [] },
        viewMode: 'arc',
      });

      assert.isUndefined(animated(store));

      setState(mixed);

      assert.deepStrictEqual(
        new Set(animated(store)?.keys()),
        new Set<string>(['task:x', 'task:y', 'milestone:m']),
      );
    });

    test('switched to DAG before ELK has laid it out once, moves the nodes from the column once it has', async () => {
      const { store, deferred, clock, setViewMode } = setup({
        state: mixed,
        viewMode: 'arc',
      });

      clock.advance(ANIMATION_MS);

      setViewMode('dag');

      // Nothing to go to yet: they stay, fading none, where they are.
      assert.deepStrictEqual(animated(store), arcPlaces);

      assert.deepStrictEqual(opacities(store), new Map<GraphNodeId, number>());

      clock.advance(ANIMATION_MS);

      deferred.resolve(0);

      await settle();

      assert.deepStrictEqual(animated(store), arcPlaces);

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(positionsOfLayout(readyLayout(store)), dagPlaces);
    });

    test('switched to アーク while a task added is laid out, fades that task in with the others', async () => {
      const { store, deferred, setState, setViewMode } = await shown({
        state: mixed,
      });

      const added: DomainState = {
        tasks: Arr.toPushed(
          mixed.tasks,
          createTask({ id: asTaskId('n'), title: 'New', now: 0 }),
        ),
        milestones: mixed.milestones,
      } as const;

      setState(added);

      // Laid out again, and not yet there.
      assert.strictEqual(deferred.requests.length, 2);

      setViewMode('arc');

      const column = arcColumn(store);

      assert.deepStrictEqual(
        animated(store)?.get('task:n'),
        column.get('task:n'),
      );

      assert.deepStrictEqual(
        opacities(store),
        new Map<GraphNodeId, number>([['task:n', 0]]),
      );
    });

    test('switched to DAG while a task added is laid out, moves it there from the column once it is', async () => {
      const { store, clock, deferred, setState, setViewMode } = await shown({
        state: mixed,
      });

      setViewMode('arc');

      clock.advance(ANIMATION_MS);

      const added: DomainState = {
        tasks: Arr.toPushed(
          mixed.tasks,
          createTask({ id: asTaskId('n'), title: 'New', now: 0 }),
        ),
        milestones: mixed.milestones,
      } as const;

      setState(added);

      const column = arcColumn(store);

      setViewMode('dag');

      // Not faded out: the DAG draws it once it is laid out.
      assert.deepStrictEqual(
        animated(store)?.get('task:n'),
        column.get('task:n'),
      );

      assert.deepStrictEqual(opacities(store), new Map<GraphNodeId, number>());

      clock.advance(ANIMATION_MS);

      deferred.resolve(1);

      await settle();

      assert.deepStrictEqual(
        animated(store)?.get('task:n'),
        column.get('task:n'),
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
        groupPositions: new Map<GroupId, Point>(),
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
        new Map<GraphNodeId, Point>(),
      );
    });

    test('keeps the nodes put somewhere where they were put', async () => {
      const stored: DagLayout = {
        direction: 'right',
        positions: positions([['task:y', { x: 500, y: 40 }]]),
        groupPositions: new Map<GroupId, Point>(),
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
        groupPositions: new Map<GroupId, Point>(),
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

    test('at 「大」, draws what is stored spread out', async () => {
      const { store } = await shown({
        stored: spreadStored,
        nodeSize: 'large',
      });

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions,
        spreadAtLarge,
      );
    });

    test('switched to 「大」, spreads the nodes put somewhere once ELK has laid it out, and writes nothing', async () => {
      const { store, deferred, clock, saved, setNodeSize } = await shown({
        stored: spreadStored,
      });

      setNodeSize('large');

      // Nothing moves until the new layout is there.
      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value,
        spreadStored,
      );

      deferred.resolve(1, 60);

      await settle();

      assert.deepStrictEqual(animated(store), spreadStored.positions);

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions,
        spreadAtLarge,
      );

      setNodeSize('standard');

      deferred.resolve(2, 60);

      await settle();

      // Drawn again from what is stored, not off by rounding.
      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value,
        spreadStored,
      );

      assert.deepStrictEqual(saved, []);
    });

    test('switched to 「大」 outside the DAG, spreads the arrangement too once ELK has laid it out', async () => {
      const { store, deferred, setNodeSize } = await shown({
        stored: spreadStored,
        viewMode: 'tile',
      });

      setNodeSize('large');

      deferred.resolve(1, 60);

      await settle();

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions,
        spreadAtLarge,
      );
    });

    test('at 「大」, saves a move as at 「標準」, the nodes not moved as they were read, and moves nothing when it comes back', async () => {
      const { store, saved, setStored } = await shown({
        stored: spreadStored,
        nodeSize: 'large',
      });

      const scale = arrangementScale('large');

      store.moveNode('task:b', { x: 50, y: 30 });

      assert.deepStrictEqual(saved, [
        {
          direction: 'right',
          positions: positions([
            ['task:a', { x: 11, y: 22 }],
            ['task:b', { x: Num.div(50, scale.x), y: Num.div(30, scale.y) }],
          ]),
          groupPositions: new Map<GroupId, Point>(),
        },
      ]);

      const drawn = store.arrangement.getSnapshot().value;

      assert.deepStrictEqual(drawn.positions.get('task:b'), { x: 50, y: 30 });

      setStored(saved[0]);

      assert.strictEqual(store.arrangement.getSnapshot().value, drawn);

      assert.isUndefined(animated(store));
    });

    test('carries a move not yet saved to 「大」, and saves it as at 「標準」', async () => {
      const { store, deferred, saved, timer, setNodeSize } = await shown({
        stored: spreadStored,
      });

      store.nudgeNode('task:b', { x: 8, y: 0 });

      setNodeSize('large');

      deferred.resolve(1, 60);

      await settle();

      assert.deepStrictEqual(saved, []);

      timer.fire();

      const written = saved[0]?.positions;

      assert.isDefined(written);

      // Not moved: as it was read.
      assert.deepStrictEqual(written.get('task:a'), { x: 11, y: 22 });

      assert.closeTo(written.get('task:b')?.x ?? Number.NaN, 308, 1e-9);

      assert.closeTo(written.get('task:b')?.y ?? Number.NaN, 40, 1e-9);
    });

    test('「自動整列」 asked for while ELK lays out 「大」 moves the nodes from where they were drawn', async () => {
      const { store, deferred, saved, setNodeSize } = await shown({
        stored: spreadStored,
      });

      setNodeSize('large');

      store.autoArrange();

      deferred.resolve(1, 60);

      await settle();

      assert.deepStrictEqual(animated(store), spreadStored.positions);

      const scale = arrangementScale('large');

      assert.deepStrictEqual(
        saved[0]?.positions,
        positions([
          ['task:a', { x: 0, y: 0 }],
          ['task:b', { x: Num.div(60, scale.x), y: 0 }],
        ]),
      );
    });

    test('a DAG still as 「自動整列」 left it moves a node new to it from where it would be put', async () => {
      const { store, deferred, clock, setState } = await shown();

      store.autoArrange();

      clock.advance(ANIMATION_MS);

      setState(three);

      deferred.resolve(1, 120);

      await settle();

      const start = animated(store)?.get('task:c');

      assert.isDefined(start);

      assert.notDeepEqual(start, { x: 240, y: 0 });

      clock.advance(ANIMATION_MS);

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions.get('task:c'),
        { x: 240, y: 0 },
      );
    });

    test('「自動整列」 asked for while ELK lays out 「大」 moves a node ELK placed from where it was drawn', async () => {
      const { store, deferred, setNodeSize } = await shown({
        stored: {
          direction: 'right',
          positions: positions([['task:a', { x: 0, y: 300 }]]),
          groupPositions: new Map<GroupId, Point>(),
        },
      });

      setNodeSize('large');

      store.autoArrange();

      deferred.resolve(1, 400);

      await settle();

      assert.deepStrictEqual(animated(store)?.get('task:b'), { x: 100, y: 0 });

      assert.deepStrictEqual(animated(store)?.get('task:a'), { x: 0, y: 300 });
    });

    test('draws the arrangement at the size of the automatic layout drawn with it', async () => {
      const { store, deferred, setNodeSize, setActive } = await shown({
        stored: spreadStored,
      });

      setNodeSize('large');

      setActive(false);

      setNodeSize('compact');

      deferred.resolve(1, 60);

      await settle();

      // Laid out at 「大」.
      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions,
        spreadAtLarge,
      );

      setActive(true);

      deferred.resolve(2, 60);

      await settle();

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value,
        spreadStored,
      );
    });

    test('a move before ELK has laid out a size changed off screen saves the nodes where they are drawn', async () => {
      const { store, saved, setNodeSize, setActive } = await shown();

      setActive(false);

      setNodeSize('large');

      setActive(true);

      store.moveNode('task:a', { x: 0, y: 200 });

      assert.deepStrictEqual(saved, [
        {
          direction: 'right',
          positions: positions([
            ['task:a', { x: 0, y: 200 }],
            ['task:b', { x: 100, y: 0 }],
          ]),
          groupPositions: new Map<GroupId, Point>(),
        },
      ]);
    });

    test('with every node hidden, spreads the arrangement at once', async () => {
      const { store, deferred, setNodeSize, setHidden } = await shown({
        stored: spreadStored,
      });

      setHidden(new Set<GraphNodeId>(['task:a', 'task:b']));

      deferred.resolve(1, 60);

      await settle();

      const requests = deferred.requests.length;

      setNodeSize('large');

      // No layout to wait for.
      assert.strictEqual(deferred.requests.length, requests);

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions,
        spreadAtLarge,
      );
    });

    test('carries a move not yet saved back from 「大」, the nodes not moved as they were read', async () => {
      const { store, deferred, saved, timer, setNodeSize } = await shown({
        stored: spreadStored,
        nodeSize: 'large',
      });

      store.nudgeNode('task:b', { x: 8, y: 0 });

      setNodeSize('standard');

      deferred.resolve(1, 60);

      await settle();

      timer.fire();

      const written = saved[0]?.positions;

      assert.isDefined(written);

      assert.deepStrictEqual(written.get('task:a'), { x: 11, y: 22 });

      assert.closeTo(
        written.get('task:b')?.x ?? Number.NaN,
        300 + Num.div(8, arrangementScale('large').x),
        1e-9,
      );
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
          [
            'milestone:m',
            {
              x: TASK_NODE_SIZE.width - MILESTONE_NODE_SIZE.width,
              y: 2 * (TASK_NODE_SIZE.height + ARC_NODE_GAP),
            },
          ],
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
          [
            'milestone:m',
            2 * (COMPACT_TASK_NODE_SIZE.height + ARC_NODE_GAP),
            COMPACT_MILESTONE_NODE_SIZE.height,
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

    test('resized in アーク and switched to DAG before ELK is done, moves the nodes when it is', async () => {
      const { store, deferred, clock, setViewMode, setNodeSize } = await shown({
        state: mixed,
      });

      setViewMode('arc');

      clock.advance(ANIMATION_MS);

      setNodeSize('compact');

      clock.advance(ANIMATION_MS);

      setViewMode('dag');

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      deferred.resolve(1, 60);

      await settle();

      // From where the DAG drew them, ELK's old places, to its new ones.
      assert.deepStrictEqual(
        animated(store),
        positions([
          ['task:x', { x: 0, y: 0 }],
          ['task:y', { x: 100, y: 0 }],
          ['milestone:m', { x: 200, y: 0 }],
        ]),
      );

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(
        positionsOfLayout(readyLayout(store)),
        positions([
          ['task:x', { x: 0, y: 0 }],
          ['task:y', { x: 60, y: 0 }],
          ['milestone:m', { x: 120, y: 0 }],
        ]),
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
        ['task:x', 'task:y', 'milestone:m'],
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

      assert.deepStrictEqual(
        opacities(store),
        new Map<GraphNodeId, number>([['milestone:m', 1]]),
      );

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

      assert.deepStrictEqual(
        opacities(store),
        new Map<GraphNodeId, number>([['milestone:m', 0]]),
      );

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(saved, []);

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions,
        new Map<GraphNodeId, Point>(),
      );
    });

    test('switched from アーク, moves the tasks and fades the milestones out', async () => {
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
          ['milestone:m', { x: 16, y: 144 }],
        ]),
      );

      assert.deepStrictEqual(
        opacities(store),
        new Map<GraphNodeId, number>([['milestone:m', 1]]),
      );

      clock.advance(ANIMATION_MS / 2);

      // Staying where 「アーク」 has it while it fades.
      assert.deepStrictEqual(animated(store)?.get('milestone:m'), {
        x: 16,
        y: 144,
      });

      clock.advance(ANIMATION_MS / 2);

      assert.isUndefined(animated(store));

      setViewMode('arc');

      assert.deepStrictEqual(
        new Set(animated(store)?.keys()),
        new Set<string>(['task:x', 'task:y', 'milestone:m']),
      );

      assert.deepStrictEqual(
        opacities(store),
        new Map<GraphNodeId, number>([['milestone:m', 0]]),
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

    test('first shown in タイル, waits for the width and not for ELK, then moves the tasks alone from a grid', () => {
      const { store, clock } = setup({
        state: mixed,
        viewMode: 'tile',
      });

      assert.isUndefined(animated(store));

      store.setTileWidth(twoColumns);

      assert.deepStrictEqual(
        new Set(animated(store)?.keys()),
        new Set<string>(['task:x', 'task:y']),
      );

      clock.advance(ANIMATION_MS);

      assert.isUndefined(animated(store));

      assert.deepStrictEqual(tilePlaces(store), inOneRow);
    });
  });

  describe('the order of アーク and タイル', () => {
    // `mixed` by title: y (Alpha), then x (Zeta); the other way round by title
    // descending. Either way, m, joined to neither, is last.
    const arcStep = TASK_NODE_SIZE.height + ARC_NODE_GAP;

    const lastMilestone = [
      'milestone:m',
      { x: TASK_NODE_SIZE.width - MILESTONE_NODE_SIZE.width, y: 2 * arcStep },
    ] as const;

    const byTitle = positions([
      ['task:y', { x: 0, y: 0 }],
      ['task:x', { x: 0, y: arcStep }],
      lastMilestone,
    ]);

    const byTitleDescending = positions([
      ['task:x', { x: 0, y: 0 }],
      ['task:y', { x: 0, y: arcStep }],
      lastMilestone,
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
      // y waits for a milestone dated 5000: blocked until then, after x, which
      // is ready; both ready from then, and y (Alpha) first by title.
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

      // The gate just above y, which waits for it.
      const milestoneX = TASK_NODE_SIZE.width - MILESTONE_NODE_SIZE.width;

      const belowGate = MILESTONE_NODE_SIZE.height + ARC_NODE_GAP;

      const blocked = positions([
        ['task:x', { x: 0, y: 0 }],
        ['milestone:gate', { x: milestoneX, y: arcStep }],
        ['task:y', { x: 0, y: arcStep + belowGate }],
      ]);

      assert.deepStrictEqual(arcColumn(store), blocked);

      setStateTime(2000);

      assert.isUndefined(animated(store));

      setStateTime(6000);

      assert.deepStrictEqual(animated(store), blocked);

      clock.advance(ANIMATION_MS);

      assert.deepStrictEqual(
        arcColumn(store),
        positions([
          ['milestone:gate', { x: milestoneX, y: 0 }],
          ['task:y', { x: 0, y: belowGate }],
          ['task:x', { x: 0, y: belowGate + arcStep }],
        ]),
      );

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

  describe('the nodes left out', () => {
    test('are not laid out, and are once they are drawn again', () => {
      const { deferred, setHidden } = setup({
        state: two,
        hidden: new Set<GraphNodeId>(['task:b']),
      });

      assert.deepStrictEqual(
        deferred.requests[0]?.nodes.map(({ id }) => id),
        ['task:a'],
      );

      setHidden(new Set<GraphNodeId>());

      assert.deepStrictEqual(
        deferred.requests[1]?.nodes.map(({ id }) => id),
        ['task:a', 'task:b'],
      );
    });

    test('keep where they were put, and it is saved with the rest', async () => {
      const { store, saved, deferred, setHidden } = await shown();

      store.moveNode('task:b', { x: 5, y: 5 });

      setHidden(new Set<GraphNodeId>(['task:b']));

      deferred.resolve(1);

      await settle();

      store.moveNode('task:a', { x: 1, y: 1 });

      assert.deepStrictEqual(
        saved.at(-1)?.positions,
        positions([
          ['task:a', { x: 1, y: 1 }],
          ['task:b', { x: 5, y: 5 }],
        ]),
      );

      setHidden(new Set<GraphNodeId>());

      deferred.resolve(2);

      await settle();

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions.get('task:b'),
        { x: 5, y: 5 },
      );
    });

    test('are not in アーク, and the rest move up to fill the gap', async () => {
      const { store, clock, saved, setViewMode, setHidden } =
        await shownWithWidth(TASK_NODE_SIZE.width, { state: mixed });

      setViewMode('arc');

      clock.advance(ANIMATION_MS);

      // By title: y (Alpha), then x (Zeta).
      setHidden(new Set<GraphNodeId>(['task:y']));

      const step = TASK_NODE_SIZE.height + ARC_NODE_GAP;

      const milestoneX = TASK_NODE_SIZE.width - MILESTONE_NODE_SIZE.width;

      assert.deepStrictEqual(
        animated(store),
        positions([
          ['task:x', { x: 0, y: step }],
          ['milestone:m', { x: milestoneX, y: 2 * step }],
        ]),
      );

      clock.advance(ANIMATION_MS);

      assert.deepStrictEqual(
        arcColumn(store),
        positions([
          ['task:x', { x: 0, y: 0 }],
          ['milestone:m', { x: milestoneX, y: step }],
        ]),
      );

      assert.deepStrictEqual(saved, []);
    });

    test('are not in タイル', async () => {
      const { store, clock, setViewMode, setHidden } = await shownWithWidth(
        TASK_NODE_SIZE.width,
        { state: mixed },
      );

      setViewMode('tile');

      clock.advance(ANIMATION_MS);

      setHidden(new Set<GraphNodeId>(['task:y']));

      clock.advance(ANIMATION_MS);

      assert.deepStrictEqual(
        tilePlaces(store),
        positions([['task:x', { x: 0, y: 0 }]]),
      );
    });

    test('still count for the order by status', async () => {
      // y waits for x, which is done: ready, as is z, after y by title — and
      // blocked, after z, were x not counted.
      const done: DomainState = {
        tasks: [
          createTask({
            id: asTaskId('x'),
            title: 'X',
            now: 0,
            progress: 'done',
            startedAt: 0,
            completedAt: 0,
          }),
          createTask({
            id: asTaskId('y'),
            title: 'Y',
            now: 0,
            dependencies: [
              {
                from: { kind: 'task', id: asTaskId('x') },
                type: 'finish-to-start',
                lagMs: 0,
              },
            ],
          }),
          createTask({ id: asTaskId('z'), title: 'Z', now: 0 }),
        ],
        milestones: [],
      } as const;

      const { store } = await shownWithWidth(TASK_NODE_SIZE.width, {
        state: done,
        hidden: new Set<GraphNodeId>(['task:x']),
        viewMode: 'arc',
        diagramSort: [
          { key: 'status', order: 'asc' },
          { key: 'title', order: 'asc' },
        ],
      });

      assert.deepStrictEqual(
        store.arcNodes.getSnapshot().value.map(({ id }) => id),
        ['task:y', 'task:z'],
      );
    });
  });

  describe('the groups', () => {
    const g = asGroupId('g');

    const h = asGroupId('h');

    const groupG: Group = {
      id: g,
      title: 'G',
      createdAt: 0,
      updatedAt: 0,
    } as const;

    const groupH: Group = {
      id: h,
      title: 'H',
      createdAt: 1,
      updatedAt: 1,
    } as const;

    /** `a` in `g`; `b` and `c` in none. */
    const grouped: DomainState = {
      tasks: [
        createTask({ id: asTaskId('a'), title: 'A', now: 0, groupId: g }),
        createTask({ id: asTaskId('b'), title: 'B', now: 0 }),
        createTask({ id: asTaskId('c'), title: 'C', now: 0 }),
      ],
      milestones: [],
    } as const;

    /** Laid out with every node where ELK has it, and that saved. */
    const arranged = async (): Promise<ReturnType<typeof setup>> => {
      const result = setup({ state: grouped, groups: [groupG] });

      result.deferred.resolve(0);

      await settle();

      result.clock.advance(ANIMATION_MS);

      result.store.autoArrange();

      return result;
    };

    test('lists each group with the nodes in it that are drawn', () => {
      const { store, setHidden } = setup({ state: grouped, groups: [groupG] });

      assert.deepStrictEqual(store.membership.getSnapshot().value, [
        { id: g, members: ['task:a'] },
      ]);

      setHidden(new Set<GraphNodeId>(['task:a']));

      assert.deepStrictEqual(store.membership.getSnapshot().value, [
        { id: g, members: [] },
      ]);
    });

    test('has ELK lay each group out with its nodes', () => {
      const { deferred } = setup({ state: grouped, groups: [groupG] });

      assert.deepStrictEqual(deferred.requests[0]?.groups, [
        { id: g, members: ['task:a'] },
      ]);
    });

    test('saves where each frame is, with every change', async () => {
      const { store, saved } = await arranged();

      store.moveNode('task:a', { x: 10, y: 10 });

      assert.deepStrictEqual(
        saved.at(-1)?.groupPositions,
        new Map<GroupId, Point>([
          [g, { x: 10 - GROUP_PADDING, y: 10 - GROUP_HEADER }],
        ]),
      );
    });

    test('moves a node dropped into a frame into its group, and keeps it where it was dropped', async () => {
      const { store, deferred, saved, regrouped } = await arranged();

      store.dropNode('task:b', { x: 50, y: 0 }, g);

      assert.deepStrictEqual(regrouped, [['task:b', g]]);

      assert.deepStrictEqual(saved.at(-1)?.positions.get('task:b'), {
        x: 50,
        y: 0,
      });

      // The frame round both, as the drop leaves them.
      assert.deepStrictEqual(saved.at(-1)?.groupPositions.get(g), {
        x: -GROUP_PADDING,
        y: -GROUP_HEADER,
      });

      assert.deepStrictEqual(deferred.requests.at(-1)?.groups, [
        { id: g, members: ['task:a', 'task:b'] },
      ]);

      const writes = saved.length;

      deferred.resolve(deferred.requests.length - 1);

      await settle();

      // Not put again, nor laid out again: it is where it was dropped.
      assert.strictEqual(saved.length, writes);

      assert.deepStrictEqual(
        store.arrangement.getSnapshot().value.positions.get('task:b'),
        { x: 50, y: 0 },
      );
    });

    test('moves a node dropped outside every frame into none', async () => {
      const { store, regrouped } = await arranged();

      store.dropNode('task:a', { x: 0, y: 500 }, undefined);

      assert.deepStrictEqual(regrouped, [['task:a', undefined]]);

      assert.deepStrictEqual(store.membership.getSnapshot().value, [
        { id: g, members: [] },
      ]);
    });

    test('leaves the frame a node was dropped out of where it was, once empty', async () => {
      const { store, saved } = await arranged();

      store.dropNode('task:a', { x: 0, y: 500 }, undefined);

      assert.deepStrictEqual(saved.at(-1)?.groupPositions.get(g), {
        x: -GROUP_PADDING,
        y: -GROUP_HEADER,
      });
    });

    test('moves nothing into another group for a drop in the same one', async () => {
      const { store, saved, regrouped } = await arranged();

      store.dropNode('task:a', { x: 20, y: 0 }, g);

      assert.deepStrictEqual(regrouped, []);

      assert.deepStrictEqual(saved.at(-1)?.positions.get('task:a'), {
        x: 20,
        y: 0,
      });
    });

    test('moves a frame dragged by its title, with its nodes, and saves', async () => {
      const { store, saved } = await arranged();

      store.moveGroup(g, { x: 100 - GROUP_PADDING, y: 100 - GROUP_HEADER });

      assert.deepStrictEqual(saved.at(-1)?.positions.get('task:a'), {
        x: 100,
        y: 100,
      });

      // The others stay.
      assert.deepStrictEqual(saved.at(-1)?.positions.get('task:b'), {
        x: 100,
        y: 0,
      });
    });

    test('moves an empty frame dragged by its title', async () => {
      const { store, saved } = await arranged();

      store.dropNode('task:a', { x: 0, y: 500 }, undefined);

      store.moveGroup(g, { x: 300, y: 300 });

      assert.deepStrictEqual(saved.at(-1)?.groupPositions.get(g), {
        x: 300,
        y: 300,
      });
    });

    test('puts a node moved to another group in its dialog beside that group', async () => {
      const { store, deferred, saved, setState } = await arranged();

      store.moveNode('task:b', { x: 900, y: 900 });

      setState({
        tasks: grouped.tasks.map((task) =>
          task.id === asTaskId('b') ? { ...task, groupId: g } : task,
        ),
        milestones: [],
      });

      deferred.resolve(deferred.requests.length - 1);

      await settle();

      // Where ELK has it, beside `a`, and clear of `a` and `c`.
      assert.deepStrictEqual(saved.at(-1)?.positions.get('task:b'), {
        x: 100,
        y: TASK_NODE_SIZE.height + PLACEMENT_GAP,
      });
    });

    test('saves where a new group’s frame is drawn, once something was saved', async () => {
      const { deferred, saved, setGroups } = await arranged();

      setGroups([groupG, groupH]);

      deferred.resolve(deferred.requests.length - 1);

      await settle();

      assert.isDefined(saved.at(-1)?.groupPositions.get(h));
    });
  });
});
