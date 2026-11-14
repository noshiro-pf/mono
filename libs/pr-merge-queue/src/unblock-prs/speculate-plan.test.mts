import type { LayerStatus } from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import {
  desiredLayers,
  DROPPED_RUN_QUIET_MS,
  isStuck,
  LAYER_QUEUED_TIMEOUT_MS,
  LAYER_TIMEOUT_MS,
  layerBranch,
  layerMessage,
  layerOfMessage,
  layerTrailer,
  matchLayers,
  movedHeads,
  numberOfLayerBranch,
  planDrop,
  redAboveFirst,
  releaseOrder,
  releasing,
  stackedFirst,
  withMovedHeads,
  type BuiltLayer,
  type DropRun,
} from './speculate-plan.mjs';
import type { PullRequest } from './types.mjs';

describe(desiredLayers, () => {
  const context = {
    defaultBranch: 'main',
    bypass: new Map<number, string>(),
    depth: 3,
    stackedOn: new Map<number, number>(),
  } as const;

  test('takes the leading candidates, in order, up to the depth', () => {
    assert.deepStrictEqual(
      desiredLayers([pr(5), pr(3), pr(9), pr(11)], context),
      [layer(5), layer(3), layer(9)],
    );
  });

  // Each is released on its own once the layers before it have merged.
  test('stops at the version pull request, one only a bypass merges, or a fork', () => {
    assert.deepStrictEqual(
      desiredLayers(
        [pr(5), pr(6, { headRefName: 'changeset-release/main' }), pr(7)],
        context,
      ),
      [layer(5)],
    );

    assert.deepStrictEqual(
      desiredLayers([pr(5), pr(6), pr(7)], {
        ...context,
        bypass: new Map<number, string>([[6, 'only the author owns it']]),
      }),
      [layer(5)],
    );

    assert.deepStrictEqual(
      desiredLayers([pr(5, { isCrossRepository: true }), pr(6)], context),
      [],
    );
  });

  // Its own commits are the ones after its base's head: from its merge base with
  // `main`, the base's would be replayed again.
  test("stacks one on a pull request right above that one's layer, from its head", () => {
    assert.deepStrictEqual(
      desiredLayers([pr(5, { headRefOid: headOf(5) }), pr(9), pr(3)], {
        ...context,
        depth: 2,
        stackedOn: new Map<number, number>([[9, 5]]),
      }),
      [
        { number: 5, head: headOf(5) },
        { number: 9, head: HEAD, upstream: headOf(5) },
      ],
    );
  });

  test('stops at one stacked on a pull request no layer below it holds', () => {
    assert.deepStrictEqual(
      desiredLayers([pr(3), pr(9), pr(5)], {
        ...context,
        stackedOn: new Map<number, number>([[9, 5]]),
      }),
      [layer(3)],
    );
  });
});

describe(releaseOrder, () => {
  const built5 = built(5, { parentTree: 'main-tree', tree: 't5' });

  const built9 = built(9, { parentTree: 't5', tree: 't9', parent: 'tip-5' });

  const context = {
    mayStayAhead: movable,
    defaultBranch: 'main',
    bypass: new Map<number, string>(),
    stackedAbove: [],
  } as const;

  test('is the stacked order, with what it keeps ahead', () => {
    const ordered = releaseOrder(
      [pr(2), pr(5), pr(7), pr(9)],
      Result.ok({ built: [built9, built5], baseTree: 'main-tree' }),
      context,
    );

    assert.deepStrictEqual(
      ordered.order.map(({ number }) => number),
      [5, 9, 2, 7],
    );

    assert.deepStrictEqual(ordered.kept, [5, 9]);
  });

  // #6 is checked on #5, and is not released until #5 has merged.
  test('keeps a stack through one stacked on a candidate, and holds only candidates', () => {
    const built6 = built(6, { parentTree: 't5', tree: 't6', parent: 'tip-5' });

    const built9On6 = built(9, {
      parentTree: 't6',
      tree: 't9',
      parent: 'tip-6',
    });

    const ordered = releaseOrder(
      [pr(2), pr(5), pr(7), pr(9)],
      Result.ok({ built: [built9On6, built6, built5], baseTree: 'main-tree' }),
      { ...context, stackedAbove: [{ pr: pr(6), on: 5 }] },
    );

    assert.deepStrictEqual(
      ordered.order.map(({ number }) => number),
      [5, 9, 2, 7],
    );

    assert.deepStrictEqual(ordered.kept, [5, 9]);
  });

  // Checking ahead falls back to releasing as usual then.
  test("is the queue's own order when the layer branches could not be read", () => {
    const candidates = [pr(2), pr(5)] as const;

    assert.deepStrictEqual(
      releaseOrder(candidates, Result.err('ls-remote failed'), context),
      { order: candidates, kept: [] },
    );
  });
});

describe(stackedFirst, () => {
  // Built on `main` in this order, before #2 and #7 became candidates.
  const built5 = built(5, { parentTree: 'main-tree', tree: 't5' });

  const built9 = built(9, { parentTree: 't5', tree: 't9', parent: 'tip-5' });

  test('keeps the layers already stacked first, and the rest in their order', () => {
    assert.deepStrictEqual(
      stackedFirst(
        [pr(2), pr(5), pr(7), pr(9)],
        [built9, built5],
        'main-tree',
        {
          mayStayAhead: movable,
          defaultBranch: 'main',
          bypass: new Map<number, string>(),
          stackedAbove: [],
        },
      ).map(({ number }) => number),
      [5, 9, 2, 7],
    );
  });

  test('stops the kept stack at a layer whose pull request moved or left', () => {
    assert.deepStrictEqual(
      stackedFirst(
        [pr(2), pr(5, { headRefOid: 'b'.repeat(40) }), pr(9)],
        [built5, built9],
        'main-tree',
        {
          mayStayAhead: movable,
          defaultBranch: 'main',
          bypass: new Map<number, string>(),
          stackedAbove: [],
        },
      ).map(({ number }) => number),
      [2, 5, 9],
    );

    assert.deepStrictEqual(
      stackedFirst([pr(2), pr(9)], [built5, built9], 'main-tree', {
        mayStayAhead: movable,
        defaultBranch: 'main',
        bypass: new Map<number, string>(),
        stackedAbove: [],
      }).map(({ number }) => number),
      [2, 9],
    );
  });

  // Released once and left green, it goes last, as the candidates' order has
  // it; keeping it first would release it again and again.
  test('keeps no layer whose pull request may not stay ahead', () => {
    assert.deepStrictEqual(
      stackedFirst([pr(2), pr(9), pr(5)], [built5, built9], 'main-tree', {
        mayStayAhead: ({ number }) => number !== 5,
        defaultBranch: 'main',
        bypass: new Map<number, string>(),
        stackedAbove: [],
      }).map(({ number }) => number),
      [2, 9, 5],
    );
  });

  // An old layer of #2 still being dropped stands on the same tree: the stack
  // being checked is the one built last, however long the old one is.
  test('keeps the stack built last when two stand on the same tree', () => {
    const old2 = {
      ...built(2, { parentTree: 'main-tree', tree: 't2' }),
      builtAt: -1,
    } as const;

    const old3 = {
      ...built(3, { parentTree: 't2', tree: 't3', parent: 'tip-2' }),
      builtAt: -1,
    } as const;

    assert.deepStrictEqual(
      stackedFirst([pr(2), pr(3), pr(5)], [old2, old3, built5], 'main-tree', {
        mayStayAhead: movable,
        defaultBranch: 'main',
        bypass: new Map<number, string>(),
        stackedAbove: [],
      }).map(({ number }) => number),
      [5, 2, 3],
    );
  });

  // The old layer of #2 was built after #5's, but #9 was built on #5 since.
  test('keeps the stack whose newest layer was built last', () => {
    const old2 = {
      ...built(2, { parentTree: 'main-tree', tree: 't2' }),
      builtAt: 1000,
    } as const;

    assert.deepStrictEqual(
      stackedFirst(
        [pr(2), pr(5), pr(9)],
        [old2, built5, { ...built9, builtAt: 2000 }],
        'main-tree',
        {
          mayStayAhead: movable,
          defaultBranch: 'main',
          bypass: new Map<number, string>(),
          stackedAbove: [],
        },
      ).map(({ number }) => number),
      [5, 9, 2],
    );
  });

  // Built in the same second (a commit's time is in seconds): the longer is the
  // one being checked, whatever the queue's order says now.
  test('keeps the longer of two stacks built in the same second', () => {
    const old2 = built(2, { parentTree: 'main-tree', tree: 't2' });

    for (const candidates of [
      [pr(2), pr(5), pr(9)],
      [pr(9), pr(5), pr(2)],
    ]) {
      assert.deepStrictEqual(
        Arr.take(
          stackedFirst(candidates, [old2, built5, built9], 'main-tree', {
            mayStayAhead: movable,
            defaultBranch: 'main',
            bypass: new Map<number, string>(),
            stackedAbove: [],
          }),
          2,
        ).map(({ number }) => number),
        [5, 9],
      );
    }
  });

  // A layer that changes nothing leaves the tree as it found it: the one on it
  // is its next, not a stack of its own.
  test('follows an empty layer to the one on it', () => {
    const empty2 = built(2, { parentTree: 'main-tree', tree: 'main-tree' });

    const on2 = {
      ...built(5, {
        parentTree: 'main-tree',
        tree: 't5',
        parent: empty2.tip,
      }),
      builtAt: 1000,
    } as const;

    assert.deepStrictEqual(
      stackedFirst([pr(9), pr(5), pr(2)], [empty2, on2], 'main-tree', {
        mayStayAhead: movable,
        defaultBranch: 'main',
        bypass: new Map<number, string>(),
        stackedAbove: [],
      }).map(({ number }) => number),
      [2, 5, 9],
    );
  });

  // Its branch outlives it, until the survey drops it as stale.
  test('starts at a layer on an empty one no longer a candidate', () => {
    const empty2 = built(2, { parentTree: 'main-tree', tree: 'main-tree' });

    const on2 = built(5, {
      parentTree: 'main-tree',
      tree: 't5',
      parent: empty2.tip,
    });

    assert.deepStrictEqual(
      stackedFirst([pr(9), pr(5)], [empty2, on2], 'main-tree', {
        mayStayAhead: movable,
        defaultBranch: 'main',
        bypass: new Map<number, string>(),
        stackedAbove: [],
      }).map(({ number }) => number),
      [5, 9],
    );
  });

  test('keeps nothing ahead of the version pull request that the order puts after it', () => {
    assert.deepStrictEqual(
      stackedFirst(
        [pr(2), pr(1, { headRefName: 'changeset-release/main' }), pr(5), pr(9)],
        [built(2, { parentTree: 'main-tree', tree: 't2' }), built5, built9],
        'main-tree',
        {
          mayStayAhead: movable,
          defaultBranch: 'main',
          bypass: new Map<number, string>(),
          stackedAbove: [],
        },
      ).map(({ number }) => number),
      [2, 1, 5, 9],
    );
  });

  // Waiting for a person, it would hold every layer above it.
  test('keeps no layer whose pull request can no longer be stacked', () => {
    assert.deepStrictEqual(
      stackedFirst([pr(2), pr(5), pr(9)], [built5, built9], 'main-tree', {
        mayStayAhead: movable,
        defaultBranch: 'main',
        bypass: new Map<number, string>([[5, 'review']]),
        stackedAbove: [],
      }).map(({ number }) => number),
      [2, 5, 9],
    );
  });

  test('keeps nothing that does not stand on the base', () => {
    assert.deepStrictEqual(
      stackedFirst([pr(2), pr(5)], [built5], 'other-tree', {
        mayStayAhead: movable,
        defaultBranch: 'main',
        bypass: new Map<number, string>(),
        stackedAbove: [],
      }).map(({ number }) => number),
      [2, 5],
    );
  });

  test('puts one stacked on a candidate right after it, among what is not yet stacked', () => {
    assert.deepStrictEqual(
      stackedFirst([pr(2), pr(5), pr(7)], [], 'main-tree', {
        mayStayAhead: movable,
        defaultBranch: 'main',
        bypass: new Map<number, string>(),
        stackedAbove: [{ pr: pr(6), on: 2 }],
      }).map(({ number }) => number),
      [2, 6, 5, 7],
    );
  });

  // #6 was queued once #5 and #9 were stacked: it goes on top of them.
  test('puts one stacked on a kept layer right after the kept stack', () => {
    assert.deepStrictEqual(
      stackedFirst(
        [pr(2), pr(5), pr(7), pr(9)],
        [built9, built5],
        'main-tree',
        {
          mayStayAhead: movable,
          defaultBranch: 'main',
          bypass: new Map<number, string>(),
          stackedAbove: [{ pr: pr(6), on: 5 }],
        },
      ).map(({ number }) => number),
      [5, 9, 6, 2, 7],
    );
  });
});

// Releasing #5 rebases it and restacks #9 on its new head: #9's layer is still
// its own while its head has the layer's tree.
describe(withMovedHeads, () => {
  const built9 = built(9, { parentTree: 't5', tree: 't9', parent: 'tip-5' });

  test("follows a pull request's head that moved to the layer's tree", () => {
    assert.deepStrictEqual(
      withMovedHeads(
        [built9],
        new Map<number, HeadAndTree>([[9, { head: headOf(9), tree: 't9' }]]),
      ),
      [{ ...built9, head: headOf(9) }],
    );
  });

  test('leaves a layer whose pull request moved to another tree, or did not move', () => {
    assert.deepStrictEqual(
      withMovedHeads(
        [built9],
        new Map<number, HeadAndTree>([
          [9, { head: headOf(9), tree: 't9-pushed' }],
        ]),
      ),
      [built9],
    );

    assert.deepStrictEqual(
      withMovedHeads([built9], new Map<number, HeadAndTree>()),
      [built9],
    );
  });
});

describe(movedHeads, () => {
  test('is each open pull request whose layer was built at another head', () => {
    assert.deepStrictEqual(
      movedHeads(
        [
          built(5, { parentTree: 'main-tree', tree: 't5' }),
          built(6, { parentTree: 't5', tree: 't6' }),
          built(7, { parentTree: 't6', tree: 't7' }),
        ],
        [pr(5), pr(6, { headRefOid: headOf(6) })],
      ),
      [{ number: 6, head: headOf(6) }],
    );
  });
});

describe(releasing, () => {
  const order = [pr(5), pr(9), pr(2)] as const;

  test('releases the first of the kept order alone while a layer stands', () => {
    assert.deepStrictEqual(
      releasing(order, true).map(({ number }) => number),
      [5],
    );
  });

  // Whatever this survey could not do, what is stacked still goes first.
  test('tries each in the kept order otherwise', () => {
    assert.deepStrictEqual(
      releasing(order, false).map(({ number }) => number),
      [5, 9, 2],
    );
  });
});

describe(matchLayers, () => {
  test('keeps the layers that stand on the base, in order, and builds the rest', () => {
    const first = built(5, { parentTree: 'main-tree', tree: 't5' });

    const second = built(3, { parentTree: 't5', tree: 't3' });

    assert.deepStrictEqual(
      matchLayers({
        desired: [layer(5), layer(3), layer(9)],
        built: [second, first],
        baseTree: 'main-tree',
      }),
      { kept: [first, second], toBuild: [layer(9)], stale: [] },
    );
  });

  // After the first layer's pull request merged, `main` has the first layer's
  // tree, and the second layer stands on it unchanged.
  test('keeps a layer on a base whose tree it was built on, whatever the commit', () => {
    const second = built(3, { parentTree: 't5', tree: 't3' });

    assert.deepStrictEqual(
      matchLayers({
        desired: [layer(3)],
        built: [built(5, { parentTree: 'old', tree: 't5' }), second],
        baseTree: 't5',
      }),
      {
        kept: [second],
        toBuild: [],
        stale: [built(5, { parentTree: 'old', tree: 't5' })],
      },
    );
  });

  test('builds again from a layer whose base or head moved, with everything above it', () => {
    const first = built(5, { parentTree: 'main-tree', tree: 't5' });

    const second = built(3, { parentTree: 't5', tree: 't3' });

    assert.deepStrictEqual(
      matchLayers({
        desired: [layer(5), layer(3)],
        built: [first, second],
        baseTree: 'moved-main',
      }),
      { kept: [], toBuild: [layer(5), layer(3)], stale: [first, second] },
    );

    assert.deepStrictEqual(
      matchLayers({
        desired: [{ number: 5, head: 'f'.repeat(40) }, layer(3)],
        built: [first, second],
        baseTree: 'main-tree',
      }),
      {
        kept: [],
        toBuild: [{ number: 5, head: 'f'.repeat(40) }, layer(3)],
        stale: [first, second],
      },
    );
  });
});

describe(redAboveFirst, () => {
  const first = built(5, { parentTree: 'main-tree', tree: 't5' });

  const second = built(3, { parentTree: 't5', tree: 't3' });

  const third = built(9, { parentTree: 't3', tree: 't9' });

  const candidates = new Set<number>([5, 3, 9]);

  // The first layer's red is its own pull request's set-aside, not a repair.
  test('is each red layer above the first that is not cleaned up', () => {
    assert.deepStrictEqual(
      redAboveFirst([first, second], [RUNNING, RED], undefined, candidates),
      [second],
    );

    assert.deepStrictEqual(
      redAboveFirst([first, second], [RED, RED], 1, candidates),
      [],
    );

    assert.deepStrictEqual(
      redAboveFirst([first, second, third], [GREEN, RED, RED], 2, candidates),
      [second],
    );
  });

  test('leaves out a layer still running or green', () => {
    assert.deepStrictEqual(
      redAboveFirst(
        [first, second, third],
        [RUNNING, GREEN, RUNNING],
        undefined,
        candidates,
      ),
      [],
    );
  });

  // One stacked on a candidate is on that one's branch, not on `main`.
  test('leaves out a layer of a pull request that is no candidate', () => {
    assert.deepStrictEqual(
      redAboveFirst(
        [first, second],
        [RUNNING, RED],
        undefined,
        new Set<number>([5]),
      ),
      [],
    );
  });
});

describe(planDrop, () => {
  const updatedMs = Date.parse('2026-11-01T00:00:00Z');

  const run = (id: number, status: string): DropRun =>
    ({ id, status, updated_at: '2026-11-01T00:00:00Z' }) as const;

  const runs = [run(1, 'completed'), run(2, 'in_progress')] as const;

  // Their verdicts will not be used, and they hold runners; nothing of them has
  // to be deleted, since a layer's run diffs against `main`.
  test('cancels the runs still going of a layer no longer valid, and drops its branch', () => {
    assert.deepStrictEqual(planDrop(false, runs, updatedMs), {
      cancel: [2],
      deleteBranch: true,
    });
  });

  // The comment links to a finished run, whoever fixes it sees every failure at
  // once, and a job still to start finds its commit.
  test('leaves the runs of a set-aside layer to finish, and drops its branch once they have', () => {
    assert.deepStrictEqual(planDrop(true, runs, updatedMs), {
      cancel: [],
      deleteBranch: false,
    });

    assert.isTrue(planDrop(true, Arr.take(runs, 1), updatedMs).deleteBranch);
  });

  test('drops the branch of a set-aside layer once a run has gone quiet past the bound', () => {
    assert.isFalse(
      planDrop(true, runs, updatedMs + DROPPED_RUN_QUIET_MS).deleteBranch,
    );

    assert.isTrue(
      planDrop(true, runs, updatedMs + DROPPED_RUN_QUIET_MS + 1).deleteBranch,
    );
  });
});

describe(isStuck, () => {
  test('is a job running past the limit from its own start', () => {
    assert.isTrue(
      isStuck(
        RUNNING,
        { dispatched: 0, oldestJobRunning: 0 },
        LAYER_TIMEOUT_MS + 1,
      ),
    );

    assert.isFalse(
      isStuck(
        RUNNING,
        { dispatched: 0, oldestJobRunning: 0 },
        LAYER_TIMEOUT_MS,
      ),
    );

    assert.isFalse(
      isStuck(GREEN, { oldestJobRunning: 0 }, LAYER_TIMEOUT_MS * 2),
    );
  });

  // A busy account is no reason to give up as soon as a run of its own would.
  test('measures a wait for runners from the dispatch of the run waiting, further out', () => {
    assert.isFalse(isStuck(RUNNING, { waiting: 0 }, LAYER_TIMEOUT_MS + 1));

    assert.isFalse(isStuck(RUNNING, { waiting: 0 }, LAYER_QUEUED_TIMEOUT_MS));

    assert.isTrue(
      isStuck(RUNNING, { waiting: 0 }, LAYER_QUEUED_TIMEOUT_MS + 1),
    );
  });

  // Each clock is its own: an old run's dispatch is no measure of a run
  // dispatched again later, and the time spent waiting stops counting once the
  // jobs have started.
  test('measures each run from its own clock', () => {
    assert.isFalse(
      isStuck(
        RUNNING,
        {
          dispatched: 0,
          waiting: LAYER_QUEUED_TIMEOUT_MS,
          oldestJobRunning: LAYER_QUEUED_TIMEOUT_MS,
        },
        LAYER_QUEUED_TIMEOUT_MS + LAYER_TIMEOUT_MS,
      ),
    );
  });

  test('counts a job running past the limit while another run still waits', () => {
    assert.isTrue(
      isStuck(
        RUNNING,
        { waiting: 0, oldestJobRunning: 0 },
        LAYER_TIMEOUT_MS + 1,
      ),
    );
  });

  // Every job finished, and the run never completes: nothing else says so.
  test('falls back on the dispatch when no run waits and no job runs', () => {
    assert.isFalse(
      isStuck(RUNNING, { dispatched: 0 }, LAYER_QUEUED_TIMEOUT_MS),
    );

    assert.isTrue(
      isStuck(RUNNING, { dispatched: 0 }, LAYER_QUEUED_TIMEOUT_MS + 1),
    );
  });
});

describe('layer branches and trailers', () => {
  test('round-trips a pull request number through its branch', () => {
    assert.strictEqual(layerBranch(42), 'queue/pr-42');

    assert.strictEqual(numberOfLayerBranch('queue/pr-42'), 42);

    for (const branch of ['queue/pr-', 'queue/pr-04', 'queue/x', 'pr-42']) {
      assert.isUndefined(numberOfLayerBranch(branch));
    }
  });

  test('round-trips a layer through its commit message', () => {
    const message = [
      'feat: something',
      '',
      'Body.',
      '',
      layerTrailer(layer(42)),
    ].join('\n');

    assert.deepStrictEqual(layerOfMessage(message), layer(42));

    assert.isUndefined(layerOfMessage('feat: something\n'));

    assert.isUndefined(layerOfMessage('Queue-Layer: 42 not-a-sha\n'));
  });

  // GitHub links `#N` in a pushed commit's message, on any branch, so each
  // rebuild of a layer would add to the timeline of the pull request it names.
  test('writes no pull request reference GitHub would link', () => {
    assert.notInclude(layerMessage(layer(42)), '#');

    assert.deepStrictEqual(layerOfMessage(layerMessage(layer(42))), layer(42));
  });
});

const HEAD = 'a'.repeat(40);

type HeadAndTree = Readonly<{ head: string; tree: string }>;

/** A head other than {@link HEAD}, told apart by its number. */
const headOf = (number: number): string =>
  number.toString(16).padStart(40, '0');

/** Lets every candidate stay ahead (`stackedFirst`). */
const movable = (): boolean => true;

const GREEN: LayerStatus = { kind: 'green' } as const;

const RUNNING: LayerStatus = { kind: 'running', queued: false } as const;

const RED: LayerStatus = {
  kind: 'red',
  name: 'code-check',
  link: 'https://example.invalid/run',
} as const;

const layer = (number: number): Readonly<{ number: number; head: string }> =>
  ({ number, head: HEAD }) as const;

const built = (
  number: number,
  trees: Readonly<{ parentTree: string; tree: string; parent?: string }>,
): BuiltLayer =>
  ({
    ...layer(number),
    tip: `tip-${number}`,
    parent: 'main-commit',
    builtAt: 0,
    ...trees,
  }) as const;

const pr = (
  number: number,
  overrides: Partial<PullRequest> = {},
): PullRequest =>
  ({
    number,
    id: `PR_${number}`,
    title: `#${number}`,
    body: '',
    state: 'OPEN',
    headRefName: `branch-${number}`,
    headRefOid: HEAD,
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'BEHIND',
    autoMergeRequest: null,
    labels: [],
    ...overrides,
  }) as const;
