import { Arr, Result } from 'ts-data-forge';
import type {
  CheckRunFacts,
  HeadChecks,
  WorkflowRoundFacts,
} from '../snapshot/index.mjs';
import {
  decideSpeculation,
  desiredLayers,
  DROPPED_RUN_QUIET_MS,
  isQueueLayerRun,
  isStackable,
  isStuck,
  LAYER_QUEUED_TIMEOUT_MS,
  LAYER_TIMEOUT_MS,
  layerRunsVerdict,
  layerStandings,
  matchLayers,
  MAX_DISPATCHES,
  mayBuildAbove,
  planDrop,
  stackedAhead,
  stackedLayerParent,
  withMovedHeads,
  withStackedAbove,
  type BuiltLayer,
  type LayerCandidate,
  type LayerStatus,
} from './layers.mjs';

const NOW = Date.parse('2026-11-11T12:00:00Z');

const HEAD = 'a'.repeat(40);

const GREEN: LayerStatus = { kind: 'green' } as const;

const RED: LayerStatus = {
  kind: 'red',
  name: 'code-check.yml',
  link: 'L',
} as const;

const RUNNING: LayerStatus = { kind: 'running', queued: false } as const;

/** Running with a job not started yet. */
const STARTING: LayerStatus = { kind: 'running', queued: true } as const;

const NOT_DISPATCHED: LayerStatus = { kind: 'not-dispatched' } as const;

const isoAt = (epochMs: number): string => {
  const date = new Date(epochMs);

  return date.toISOString();
};

const WORKFLOWS = ['code-check.yml', 'style-check.yml'] as const;

/** A dispatched run of `workflow`, finished with `conclusion` unless going. */
const round = (
  runId: number,
  workflow: string,
  conclusion: string | undefined,
  fields: Partial<WorkflowRoundFacts> = {},
): WorkflowRoundFacts =>
  ({
    checkSuiteId: runId * 10,
    runId,
    workflowId: 1,
    completed: conclusion !== undefined,
    attemptStartedAt: undefined,
    headBranch: 'queue/pr-5',
    path: `.github/workflows/${workflow}`,
    event: 'workflow_dispatch',
    status:
      conclusion === undefined
        ? ('in_progress' as const)
        : ('completed' as const),
    conclusion,
    createdAt: isoAt(NOW - 10 * 60_000),
    updatedAt: isoAt(NOW - 60_000),
    url: `https://github.com/runs/${runId}`,
    ...fields,
  }) as const;

const job = (
  checkSuiteId: number,
  name: string,
  status: string,
  startedAt: string | undefined,
): CheckRunFacts =>
  ({
    name,
    status,
    conclusion: status === 'completed' ? ('success' as const) : undefined,
    checkSuiteId,
    id: checkSuiteId + 1,
    startedAt,
    completedAt: undefined,
    annotationTitles: undefined,
    url: '',
  }) as const;

const checksOf = (
  rounds: readonly WorkflowRoundFacts[],
  runs: readonly CheckRunFacts[] = [],
): HeadChecks => ({ sha: 'tip', runs, statuses: [], rounds }) as const;

const built = (number: number, fields: Partial<BuiltLayer> = {}): BuiltLayer =>
  ({
    number,
    head: HEAD,
    branch: `queue/pr-${number}`,
    tip: `tip-${number}`,
    tree: `tree-${number}`,
    parent: 'main',
    parentTree: 'main-tree',
    builtAt: 0,
    checks: Result.ok(checksOf([])),
    ...fields,
  }) as const;

const candidate = (
  number: number,
  fields: Partial<LayerCandidate> = {},
): LayerCandidate =>
  ({
    number,
    headSha: HEAD,
    headRef: `feature/${number}`,
    fromFork: false,
    bypass: false,
    ...fields,
  }) as const;

/** A layer whose workflows were never cancelled too often. */
const plain = (
  status: LayerStatus,
): Readonly<{ status: LayerStatus; cancelledTooOften: boolean }> =>
  ({ status, cancelledTooOften: false }) as const;

describe(isQueueLayerRun, () => {
  test('is a dispatched run on a queue layer branch', () => {
    assert.isTrue(
      isQueueLayerRun({ event: 'workflow_dispatch', headBranch: 'queue/pr-5' }),
    );

    assert.isFalse(
      isQueueLayerRun({ event: 'pull_request', headBranch: 'queue/pr-5' }),
    );

    assert.isFalse(
      isQueueLayerRun({ event: 'workflow_dispatch', headBranch: 'main' }),
    );
  });
});

describe(layerRunsVerdict, () => {
  test('is green once the latest run of every workflow has finished', () => {
    assert.strictEqual(
      layerRunsVerdict(
        checksOf([
          round(1, 'code-check.yml', 'success'),
          round(2, 'style-check.yml', 'skipped'),
        ]),
        WORKFLOWS,
      ).status.kind,
      'green',
    );
  });

  test('reads only the latest dispatched run of each workflow', () => {
    assert.strictEqual(
      layerRunsVerdict(
        checksOf([
          round(1, 'code-check.yml', 'failure'),
          round(2, 'style-check.yml', 'success'),
          round(3, 'code-check.yml', 'success'),
          round(4, 'code-check.yml', 'failure', { event: 'push' }),
        ]),
        WORKFLOWS,
      ).status.kind,
      'green',
    );
  });

  test('is red once a latest run failed, whatever else is going or missing', () => {
    assert.deepStrictEqual(
      layerRunsVerdict(
        checksOf([round(1, 'style-check.yml', 'timed_out')]),
        WORKFLOWS,
      ).status,
      {
        kind: 'red',
        name: 'style-check.yml',
        link: 'https://github.com/runs/1',
      },
    );
  });

  test('is not dispatched while a workflow has no run, or a cancelled one', () => {
    const verdict = layerRunsVerdict(
      checksOf([
        round(1, 'code-check.yml', 'success'),
        round(2, 'style-check.yml', 'cancelled'),
      ]),
      WORKFLOWS,
    );

    assert.strictEqual(verdict.status.kind, 'not-dispatched');

    assert.deepStrictEqual(verdict.missing, ['style-check.yml']);

    assert.isFalse(verdict.cancelledTooOften);

    assert.isTrue(
      layerRunsVerdict(
        checksOf(
          Arr.seq(MAX_DISPATCHES).map((index) =>
            round(index + 1, 'code-check.yml', 'cancelled'),
          ),
        ),
        ['code-check.yml'],
      ).cancelledTooOften,
    );
  });

  test('is running, queued while its gate or a job has not finished starting', () => {
    const going = round(1, 'code-check.yml', undefined);

    const started = isoAt(NOW - 5 * 60_000);

    const queued = layerRunsVerdict(
      checksOf([going], [job(10, 'gates / check', 'in_progress', started)]),
      ['code-check.yml'],
    );

    assert.deepStrictEqual(queued.status, { kind: 'running', queued: true });

    const running = layerRunsVerdict(
      checksOf(
        [going],
        [
          job(10, 'gates / check', 'completed', started),
          job(10, 'test / unit', 'in_progress', started),
        ],
      ),
      ['code-check.yml'],
    );

    assert.deepStrictEqual(running.status, { kind: 'running', queued: false });

    assert.deepStrictEqual(running.since, {
      dispatched: NOW - 10 * 60_000,
      waiting: undefined,
      oldestJobRunning: NOW - 5 * 60_000,
    });
  });
});

describe(decideSpeculation, () => {
  const layers = [
    { number: 5, head: HEAD },
    { number: 3, head: HEAD },
    { number: 9, head: HEAD },
  ] as const;

  test('releases the first candidate once its layer is green, or with no layer', () => {
    assert.isTrue(
      decideSpeculation({
        layers,
        statuses: [GREEN, RUNNING, NOT_DISPATCHED],
        firstCandidate: 5,
      }).release,
    );

    assert.isFalse(
      decideSpeculation({
        layers,
        statuses: [RUNNING, RUNNING, NOT_DISPATCHED],
        firstCandidate: 5,
      }).release,
    );

    assert.isTrue(
      decideSpeculation({ layers: [], statuses: [], firstCandidate: 7 })
        .release,
    );
  });

  test('dispatches the next layer once every job below it has started', () => {
    assert.strictEqual(
      decideSpeculation({
        layers,
        statuses: [GREEN, RUNNING, NOT_DISPATCHED],
        firstCandidate: 5,
      }).dispatch,
      2,
    );

    assert.isUndefined(
      decideSpeculation({
        layers,
        statuses: [GREEN, STARTING, NOT_DISPATCHED],
        firstCandidate: 5,
      }).dispatch,
    );

    assert.isUndefined(
      decideSpeculation({
        layers,
        statuses: [RUNNING, RED, NOT_DISPATCHED],
        firstCandidate: 5,
      }).dispatch,
    );
  });

  test('sets aside the pull request of a red first layer, and drops the layers above it', () => {
    assert.deepStrictEqual(
      decideSpeculation({
        layers,
        statuses: [RED, RUNNING, NOT_DISPATCHED],
        firstCandidate: 5,
      }),
      {
        setAside: { number: 5, head: HEAD, name: 'code-check.yml', link: 'L' },
        dropFrom: 1,
        dispatch: undefined,
        release: false,
      },
    );
  });

  test('holds a red layer over green ones until it is first', () => {
    assert.deepStrictEqual(
      decideSpeculation({
        layers,
        statuses: [GREEN, RED, RUNNING],
        firstCandidate: 5,
      }),
      { setAside: undefined, dropFrom: 2, dispatch: undefined, release: true },
    );
  });
});

describe(mayBuildAbove, () => {
  test('is false only on top of a red layer over green ones', () => {
    assert.isTrue(mayBuildAbove([GREEN, RUNNING]));

    assert.isTrue(mayBuildAbove([RUNNING, RED]));

    assert.isFalse(mayBuildAbove([GREEN, RED]));
  });
});

describe(layerStandings, () => {
  test('says what the worker does with each layer, as it decides it', () => {
    assert.deepStrictEqual(
      layerStandings([GREEN, RUNNING, NOT_DISPATCHED].map(plain)),
      ['green', 'running', 'to-dispatch'],
    );

    assert.deepStrictEqual(
      layerStandings([GREEN, STARTING, NOT_DISPATCHED].map(plain)),
      ['green', 'running', 'waits'],
    );

    assert.deepStrictEqual(
      layerStandings([RED, RUNNING, NOT_DISPATCHED].map(plain)),
      ['set-aside', 'dropped', 'dropped'],
    );

    assert.deepStrictEqual(
      layerStandings([
        plain(GREEN),
        { status: NOT_DISPATCHED, cancelledTooOften: true },
        plain(NOT_DISPATCHED),
      ]),
      ['green', 'stalled', 'waits'],
    );
  });
});

describe(isStackable, () => {
  test('is not the version pull request, one only a bypass merges, or a fork’s', () => {
    assert.isTrue(isStackable(candidate(1), 'main'));

    assert.isFalse(
      isStackable(candidate(1, { headRef: 'changeset-release/main' }), 'main'),
    );

    assert.isFalse(isStackable(candidate(1, { bypass: true }), 'main'));

    assert.isFalse(isStackable(candidate(1, { fromFork: true }), 'main'));
  });
});

describe(stackedAhead, () => {
  const context = { mayStayAhead: () => true, defaultBranch: 'main' } as const;

  // #9 on #5 on `main`, stacked before #2 and #7 became candidates.
  const layers = [
    built(9, { parent: 'tip-5', parentTree: 'tree-5' }),
    built(5),
  ] as const;

  test('keeps the stack from the base up, in the order it was stacked', () => {
    assert.deepStrictEqual(
      stackedAhead(
        [candidate(2), candidate(5), candidate(7), candidate(9)],
        layers,
        'main-tree',
        context,
      ).map(({ number }) => number),
      [5, 9],
    );
  });

  test('stops at a layer whose pull request moved, or may not stay ahead', () => {
    assert.deepStrictEqual(
      stackedAhead(
        [candidate(5, { headSha: 'b'.repeat(40) }), candidate(9)],
        layers,
        'main-tree',
        context,
      ),
      [],
    );

    assert.deepStrictEqual(
      stackedAhead([candidate(5), candidate(9)], layers, 'main-tree', {
        ...context,
        mayStayAhead: ({ number }) => number !== 9,
      }).map(({ number }) => number),
      [5],
    );
  });

  test('keeps nothing the order puts after the version pull request', () => {
    assert.deepStrictEqual(
      stackedAhead(
        [
          candidate(5),
          candidate(3, { headRef: 'changeset-release/main' }),
          candidate(9),
        ],
        layers,
        'main-tree',
        context,
      ).map(({ number }) => number),
      [5],
    );
  });
});

const desiredContext = (depth: number): Parameters<typeof desiredLayers>[1] =>
  ({
    defaultBranch: 'main',
    depth,
    stackedOn: new Map<number, number>(),
    mergedUpstream: () => undefined,
  }) as const;

describe(desiredLayers, () => {
  test('takes the leading candidates up to the depth and the first unstackable', () => {
    assert.deepStrictEqual(
      desiredLayers(
        [
          candidate(1),
          candidate(2),
          candidate(3, { bypass: true }),
          candidate(4),
        ],
        desiredContext(5),
      ).map(({ number }) => number),
      [1, 2],
    );

    assert.deepStrictEqual(
      desiredLayers([candidate(1), candidate(2)], desiredContext(1)).map(
        ({ number }) => number,
      ),
      [1],
    );
  });

  test("builds one stacked on another from that one's head, and none below it", () => {
    const stackedOn = new Map<number, number>([[2, 1]]);

    assert.deepStrictEqual(
      desiredLayers([candidate(1), candidate(2)], {
        ...desiredContext(5),
        stackedOn,
      }),
      [
        { number: 1, head: candidate(1).headSha, upstream: undefined },
        {
          number: 2,
          head: candidate(2).headSha,
          upstream: candidate(1).headSha,
        },
      ],
    );

    assert.deepStrictEqual(
      desiredLayers([candidate(2), candidate(1)], {
        ...desiredContext(5),
        stackedOn,
      }),
      [],
    );
  });

  test("builds one GitHub moved off a merged parent from that parent's head", () => {
    assert.deepStrictEqual(
      desiredLayers([candidate(1)], {
        ...desiredContext(5),
        mergedUpstream: (number) => (number === 1 ? 'merged-head' : undefined),
      }),
      [{ number: 1, head: candidate(1).headSha, upstream: 'merged-head' }],
    );
  });
});

describe(matchLayers, () => {
  test('keeps the layers standing on the trees below, rebuilds from the first that does not', () => {
    const matched = matchLayers({
      desired: [
        { number: 5, head: HEAD },
        { number: 9, head: HEAD },
        { number: 2, head: HEAD },
      ],
      built: [built(5), built(9, { parentTree: 'stale-tree' }), built(7)],
      baseTree: 'main-tree',
    });

    assert.deepStrictEqual(
      matched.kept.map(({ number }) => number),
      [5],
    );

    assert.deepStrictEqual(
      matched.toBuild.map(({ number }) => number),
      [9, 2],
    );

    assert.deepStrictEqual(
      matched.stale.map(({ number }) => number),
      [9, 7],
    );
  });

  // The first merged: the tip is a squash with its tree.
  test('keeps a layer standing on a squash with the tree below it', () => {
    assert.deepStrictEqual(
      matchLayers({
        desired: [{ number: 9, head: HEAD }],
        built: [built(9, { parent: 'tip-5', parentTree: 'tree-5' })],
        baseTree: 'tree-5',
      }).kept.map(({ number }) => number),
      [9],
    );
  });
});

describe(planDrop, () => {
  const going = round(1, 'code-check.yml', undefined);

  const layer = built(5, {
    checks: Result.ok(
      checksOf([going, round(2, 'style-check.yml', 'failure')]),
    ),
  });

  test('cancels the runs still going and deletes the branch', () => {
    assert.deepStrictEqual(planDrop(layer, false, NOW), {
      number: 5,
      branch: 'queue/pr-5',
      tip: 'tip-5',
      cancel: [1],
      deleteRuns: [],
      deleteBranch: true,
    });
  });

  test('lets a set-aside layer’s runs finish before its branch goes', () => {
    const kept = planDrop(layer, true, NOW);

    assert.deepStrictEqual([kept.cancel, kept.deleteBranch], [[], false]);

    assert.isTrue(
      planDrop(layer, true, NOW + DROPPED_RUN_QUIET_MS).deleteBranch,
    );
  });

  test('keeps a branch whose runs are unread', () => {
    assert.isFalse(
      planDrop(
        built(5, {
          checks: Result.err({
            kind: 'unavailable',
            what: 'x',
            message: '502',
          }),
        }),
        false,
        NOW,
      ).deleteBranch,
    );
  });
});

describe(isStuck, () => {
  const since = {
    dispatched: undefined,
    waiting: undefined,
    oldestJobRunning: undefined,
  } as const;

  test('gives each clock its own limit', () => {
    assert.isTrue(
      isStuck(
        {
          status: RUNNING,
          since: { ...since, waiting: NOW - LAYER_QUEUED_TIMEOUT_MS - 1 },
        },
        NOW,
      ),
    );

    assert.isTrue(
      isStuck(
        {
          status: RUNNING,
          since: { ...since, oldestJobRunning: NOW - LAYER_TIMEOUT_MS - 1 },
        },
        NOW,
      ),
    );

    assert.isFalse(
      isStuck(
        {
          status: RUNNING,
          since: {
            dispatched: NOW - LAYER_QUEUED_TIMEOUT_MS - 1,
            waiting: undefined,
            oldestJobRunning: NOW - 60_000,
          },
        },
        NOW,
      ),
    );

    assert.isFalse(
      isStuck({ status: GREEN, since: { ...since, waiting: 0 } }, NOW),
    );
  });
});

const pr = (number: number): Readonly<{ number: number }> =>
  ({ number }) as const;

describe(withStackedAbove, () => {
  test('puts what is stacked on each right after it, and each once', () => {
    assert.deepStrictEqual(
      withStackedAbove(
        [pr(1), pr(5)],
        [
          { pr: pr(3), on: 1 },
          { pr: pr(2), on: 1 },
          { pr: pr(4), on: 2 },
          { pr: pr(6), on: 9 },
          { pr: pr(1), on: 4 },
        ],
      ).map(({ number }) => number),
      [1, 2, 4, 3, 5],
    );
  });
});

describe(withMovedHeads, () => {
  test("follows a head moved to a commit with its layer's tree, and no other", () => {
    const layers: readonly Readonly<{
      number: number;
      head: string;
      tree: string;
    }>[] = [
      { number: 1, head: 'a', tree: 't1' },
      { number: 2, head: 'b', tree: 't2' },
      { number: 3, head: 'c', tree: 't3' },
    ] as const;

    assert.deepStrictEqual(
      withMovedHeads(
        layers,
        new Map<number, Readonly<{ head: string; tree: string }>>([
          [1, { head: 'a2', tree: 't1' }],
          [2, { head: 'b2', tree: 'other' }],
        ]),
      ),
      [
        { number: 1, head: 'a2', tree: 't1' },
        { number: 2, head: 'b', tree: 't2' },
        { number: 3, head: 'c', tree: 't3' },
      ],
    );
  });
});

describe(stackedLayerParent, () => {
  const stacked = { kind: 'stacked', on: 1, cyclic: false } as const;

  test('names the one it is stacked on when it waits on nothing else', () => {
    assert.strictEqual(
      stackedLayerParent({ fromFork: false, blockedBy: [1] }, stacked),
      1,
    );
  });

  test("is undefined on a cycle, for a fork's, waiting on another, or not stacked", () => {
    assert.isUndefined(
      stackedLayerParent(
        { fromFork: false, blockedBy: [1] },
        { ...stacked, cyclic: true },
      ),
    );

    assert.isUndefined(
      stackedLayerParent({ fromFork: true, blockedBy: [1] }, stacked),
    );

    assert.isUndefined(
      stackedLayerParent({ fromFork: false, blockedBy: [1, 7] }, stacked),
    );

    assert.isUndefined(
      stackedLayerParent(
        { fromFork: false, blockedBy: [] },
        { kind: 'candidate' },
      ),
    );
  });
});
