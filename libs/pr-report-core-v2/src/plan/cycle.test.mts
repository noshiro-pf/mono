import { Result } from 'ts-data-forge';
import type {
  HeadChecks,
  IssueFacts,
  MovedHead,
  PullRequestFacts,
  QueueLayerFacts,
  ReferenceFacts,
  Snapshot,
  WorkflowRoundFacts,
} from '../snapshot/index.mjs';
import {
  planCycle,
  type CyclePlan,
  type PickStep,
  type PlanConfig,
} from './cycle.mjs';
import { EMPTY_MEMORY, type InFlight, type WorkerMemory } from './memory.mjs';

const TIP = 'e'.repeat(40);

const NOW = Date.parse('2026-11-10T00:00:00Z');

const MINUTE = 60_000;

const REQUIRED = 'code-check-result / result';

const CONFIG: PlanConfig = {
  autoFix: true,
  watchTimeoutMs: 90 * MINUTE,
  idleAfter: 5,
  speculate: undefined,
  fixable: () => false,
} as const;

const label = (name: string) =>
  ({ name, color: '000000', description: '' }) as const;

const labels = (
  ...names: readonly string[]
): readonly Readonly<{ name: string; color: string; description: string }>[] =>
  names.map(label);

const checks = (
  sha: string,
  state: 'failure' | 'none' | 'pending' | 'success',
): HeadChecks =>
  ({
    sha,
    runs: [],
    statuses:
      state === 'none'
        ? ([] as const)
        : ([{ context: REQUIRED, state, url: undefined }] as const),
    rounds: [],
  }) as const;

const headOf = (number: number): string =>
  number.toString(16).padStart(40, '0');

const pull = (
  number: number,
  fields: Partial<PullRequestFacts> = {},
): PullRequestFacts => {
  const headSha = fields.headSha ?? headOf(number);

  return {
    number,
    title: `#${number}`,
    body: '',
    author: 'someone',
    url: '',
    isDraft: false,
    labels: labels('merge-queued', 'skip-ci'),
    autoMerge: false,
    headRef: `feature/${number}`,
    headSha,
    baseRef: 'main',
    fromFork: false,
    mergeState: 'BLOCKED',
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    headCommittedAt: Result.ok('2026-11-01T00:00:00Z'),
    checks: Result.ok(checks(headSha, 'none')),
    review: Result.ok({
      latestReviews: [],
      files: [],
      filesComplete: true,
      unresolvedConversations: 0,
      pushers: 'unknown',
    }),
    comments: Result.ok([]),
    closingIssues: Result.ok([]),
    comparison: Result.ok({ aheadBy: 1, behindBy: 0 }),
    nativeStack: Result.ok(undefined),
    baseChanges: Result.ok([]),
    mergedParent: Result.ok(undefined),
    ...fields,
  };
};

/** Released, armed, up to date, with `state` on its one required check. */
const released = (
  number: number,
  state: 'failure' | 'none' | 'pending' | 'success',
  fields: Partial<PullRequestFacts> = {},
): PullRequestFacts =>
  pull(number, {
    labels: labels('merge-queued'),
    autoMerge: true,
    mergeState: state === 'success' ? 'CLEAN' : 'BLOCKED',
    checks: Result.ok(checks(headOf(number), state)),
    ...fields,
  });

const snapshot = (
  pulls: readonly PullRequestFacts[],
  fields: Partial<Snapshot> = {},
): Snapshot =>
  ({
    readAt: '2026-11-10T00:00:00Z',
    authenticated: true,
    repository: {
      repo: { owner: 'noshiro-pf', name: 'mono' },
      defaultBranch: 'main',
      defaultBranchTip: TIP,
      viewer: Result.ok('noshiro-pf'),
      codeOwners: Result.ok(undefined),
      hasQueueLabel: Result.ok(true),
    },
    requirements: Result.ok({
      requiredContexts: [REQUIRED],
      requireCodeOwnerReview: false,
      requireConversationResolution: false,
    }),
    defaultBranchChecks: Result.ok(checks(TIP, 'success')),
    pullRequests: Result.ok(pulls),
    openIssues: Result.ok({ issues: [], complete: true }),
    otherIssues: Result.ok(new Map<number, IssueFacts>()),
    references: Result.ok(new Map<number, ReferenceFacts>()),
    merged: Result.ok([]),
    queueLayers: Result.ok({
      baseTree: 'tree',
      layers: [],
      movedHeads: new Map<number, MovedHead>(),
    }),
    branchTips: Result.ok(new Map<string, string>()),
    followed: Result.ok([]),
    ...fields,
  }) as const;

const watching = (number: number, fields: Partial<InFlight> = {}): InFlight =>
  ({
    number,
    head: headOf(number),
    releasedEpochMs: NOW - MINUTE,
    greenCount: 0,
    autoFixed: false,
    ...fields,
  }) as const;

const plan = (
  from: Snapshot,
  memory: WorkerMemory = EMPTY_MEMORY,
  options: Readonly<{ nowEpochMs?: number; config?: PlanConfig }> = {},
): CyclePlan =>
  Result.unwrapThrow(
    planCycle({
      snapshot: from,
      memory,
      config: options.config ?? CONFIG,
      nowEpochMs: options.nowEpochMs ?? NOW,
    }),
  );

/** Plans `times` cycles in a row, `stepMs` apart, carrying the memory on. */
const planRepeatedly = (
  from: Snapshot,
  times: number,
  memory: WorkerMemory = EMPTY_MEMORY,
  stepMs: number = MINUTE,
): CyclePlan => {
  const first = plan(from, memory);

  return Array.from({ length: times - 1 }, (_, index) => index + 1).reduce(
    (previous, index) =>
      plan(from, previous.memory, { nowEpochMs: NOW + index * stepMs }),
    first,
  );
};

const picksOf = (planned: CyclePlan): readonly PickStep[] =>
  planned.step.kind === 'pick' ? planned.step.picks : ([] as const);

describe(planCycle, () => {
  test('plans nothing while the open pull requests are unread', () => {
    const planned = planCycle({
      snapshot: snapshot([], {
        pullRequests: Result.err({
          kind: 'unavailable',
          what: 'the open pull requests',
          message: '502',
        }),
      }),
      memory: EMPTY_MEMORY,
      config: CONFIG,
      nowEpochMs: NOW,
    });

    assert.isTrue(Result.isErr(planned));
  });

  test('sleeps with nothing to do, and goes idle once the snapshot sits still', () => {
    const first = plan(snapshot([]));

    assert.deepStrictEqual(first.step, { kind: 'sleep' });

    assert.strictEqual(first.next, 'active');

    assert.strictEqual(planRepeatedly(snapshot([]), 5).next, 'idle');
  });

  describe('picking', () => {
    test('rebases a candidate behind the tip first', () => {
      const pr = pull(1, {
        comparison: Result.ok({ aheadBy: 1, behindBy: 2 }),
        mergeState: 'BEHIND',
      });

      assert.deepStrictEqual(picksOf(plan(snapshot([pr]))), [
        { kind: 'rebase', number: 1, head: headOf(1), onto: undefined },
      ]);
    });

    test('rebases onto the squash commit of a merged parent it still contains', () => {
      const parent = {
        number: 9,
        headSha: 'a'.repeat(40),
        mergeCommitSha: 'b'.repeat(40),
        containsHead: true,
      } as const;

      const pr = pull(1, { mergedParent: Result.ok(parent) });

      assert.deepStrictEqual(picksOf(plan(snapshot([pr])))[0], {
        kind: 'rebase',
        number: 1,
        head: headOf(1),
        onto: parent,
      });
    });

    test('arms an up-to-date candidate, then releases it', () => {
      assert.strictEqual(picksOf(plan(snapshot([pull(1)])))[0]?.kind, 'arm');

      assert.strictEqual(
        picksOf(plan(snapshot([pull(1, { autoMerge: true })])))[0]?.kind,
        'release',
      );
    });

    test('never rebases the version pull request', () => {
      const pr = pull(1, {
        headRef: 'changeset-release/main',
        comparison: Result.ok({ aheadBy: 1, behindBy: 0 }),
        autoMerge: true,
      });

      assert.strictEqual(picksOf(plan(snapshot([pr])))[0]?.kind, 'release');
    });

    test('lists every candidate in order, for the next to be tried', () => {
      assert.deepStrictEqual(
        picksOf(plan(snapshot([pull(2), pull(1)]))).map(({ number }) => number),
        [1, 2],
      );
    });

    test('leaves out a candidate whose head is not its branch tip, and sets it aside after 10 minutes', () => {
      const pr = pull(1);

      const outOfSync = snapshot([pr], {
        branchTips: Result.ok(
          new Map<string, string>([[pr.headRef, 'f'.repeat(40)]]),
        ),
      });

      const first = plan(outOfSync);

      assert.deepStrictEqual(first.step, { kind: 'sleep' });

      assert.deepStrictEqual(first.setAsides, []);

      const later = plan(outOfSync, first.memory, {
        nowEpochMs: NOW + 10 * MINUTE,
      });

      assert.deepStrictEqual(
        later.setAsides.map(({ number, reason }) => [number, reason]),
        [[1, 'head-out-of-sync']],
      );
    });

    test('sets aside after three failed pushes, counted by the worker', () => {
      const memory: WorkerMemory = {
        ...EMPTY_MEMORY,
        conditions: [
          {
            number: 1,
            head: headOf(1),
            kind: 'push-failed',
            firstEpochMs: NOW - MINUTE,
            count: 3,
            refired: false,
          },
        ],
      } as const;

      const planned = plan(snapshot([pull(1)]), memory);

      assert.deepStrictEqual(
        planned.setAsides.map(({ reason }) => reason),
        ['push-failed'],
      );

      assert.deepStrictEqual(planned.step, { kind: 'sleep' });
    });
  });

  describe('in flight', () => {
    test('adopts a released pull request memory does not hold', () => {
      const planned = plan(snapshot([released(1, 'pending'), pull(2)]));

      assert.deepStrictEqual(planned.step, {
        kind: 'watch',
        number: 1,
        head: headOf(1),
      });

      assert.strictEqual(planned.next, 'poll');

      assert.strictEqual(planned.memory.inFlight?.number, 1);
    });

    test('ends the watch of one that merged', () => {
      const planned = plan(
        snapshot([], {
          followed: Result.ok([
            { number: 1, state: 'merged', at: '2026-11-10T00:00:00Z' },
          ]),
        }),
        { ...EMPTY_MEMORY, inFlight: watching(1) },
      );

      assert.strictEqual(planned.step.kind, 'watch-ended');

      assert.isTrue(planned.memory.inFlight === undefined);
    });

    test('puts skip-ci back on one whose auto-merge was switched off', () => {
      const planned = plan(
        snapshot([released(1, 'pending', { autoMerge: false })]),
        { ...EMPTY_MEMORY, inFlight: watching(1) },
      );

      assert.strictEqual(planned.step.kind, 'pause');

      assert.isTrue(planned.memory.inFlight === undefined);
    });

    test('ends the watch once its head moved', () => {
      const planned = plan(
        snapshot([released(1, 'pending', { headSha: 'c'.repeat(40) })]),
        { ...EMPTY_MEMORY, inFlight: watching(1) },
      );

      assert.strictEqual(planned.step.kind, 'watch-ended');
    });

    test('tries Auto-fix once per watch, then sets aside checks-failed', () => {
      const failing = snapshot([released(1, 'failure')]);

      const first = plan(failing, { ...EMPTY_MEMORY, inFlight: watching(1) });

      assert.deepStrictEqual(first.step, {
        kind: 'auto-fix',
        number: 1,
        head: headOf(1),
        failed: [REQUIRED],
      });

      const again = plan(failing, first.memory);

      assert.deepStrictEqual(
        again.setAsides.map(({ reason }) => reason),
        ['checks-failed'],
      );
    });

    test('sets aside checks-failed at once without Auto-fix', () => {
      const planned = plan(
        snapshot([released(1, 'failure')]),
        { ...EMPTY_MEMORY, inFlight: watching(1) },
        { config: { ...CONFIG, autoFix: false } },
      );

      assert.deepStrictEqual(
        planned.setAsides.map(({ reason }) => reason),
        ['checks-failed'],
      );
    });

    test('sets aside not-merging after two green snapshots, and demotes it', () => {
      const green = snapshot([released(1, 'success'), pull(2)]);

      const first = plan(green, { ...EMPTY_MEMORY, inFlight: watching(1) });

      assert.strictEqual(first.step.kind, 'watch');

      const second = plan(green, first.memory);

      assert.deepStrictEqual(
        second.setAsides.map(({ reason }) => reason),
        ['not-merging'],
      );

      assert.deepStrictEqual(second.memory.demoted, [
        { number: 1, head: headOf(1) },
      ]);
    });

    test('waits five green snapshots while BLOCKED', () => {
      const blocked = snapshot([
        released(1, 'success', { mergeState: 'BLOCKED' }),
      ]);

      const fourth = planRepeatedly(blocked, 4, {
        ...EMPTY_MEMORY,
        inFlight: watching(1),
      });

      assert.strictEqual(fourth.step.kind, 'watch');

      assert.deepStrictEqual(
        plan(blocked, fourth.memory).setAsides.map(({ reason }) => reason),
        ['not-merging'],
      );
    });

    test('refires a check that never started, then sets it aside', () => {
      const silent = snapshot([released(1, 'none')]);

      const memory = { ...EMPTY_MEMORY, inFlight: watching(1) } as const;

      const first = plan(silent, memory);

      assert.strictEqual(first.step.kind, 'watch');

      const refire = plan(silent, first.memory, {
        nowEpochMs: NOW + 5 * MINUTE,
      });

      assert.strictEqual(refire.step.kind, 'refire');

      const waited = plan(silent, refire.memory, {
        nowEpochMs: NOW + 6 * MINUTE,
      });

      assert.strictEqual(waited.step.kind, 'watch');

      const given = plan(silent, waited.memory, {
        nowEpochMs: NOW + 10 * MINUTE,
      });

      assert.deepStrictEqual(
        given.setAsides.map(({ reason }) => reason),
        ['checks-not-started'],
      );
    });

    test('sets aside read-failed after five unread snapshots, unless main is unread too', () => {
      const unreadChecks = released(1, 'pending', {
        checks: Result.err({
          kind: 'unavailable',
          what: 'the checks of #1',
          message: '502',
        }),
      });

      const memory = { ...EMPTY_MEMORY, inFlight: watching(1) } as const;

      assert.deepStrictEqual(
        planRepeatedly(snapshot([unreadChecks]), 5, memory).setAsides.map(
          ({ reason }) => reason,
        ),
        ['read-failed'],
      );

      const outage = planRepeatedly(
        snapshot([unreadChecks], {
          defaultBranchChecks: Result.err({
            kind: 'unavailable',
            what: 'the checks of main',
            message: '502',
          }),
        }),
        5,
        memory,
      );

      assert.strictEqual(outage.step.kind, 'watch');
    });

    test('sets aside watch-timeout past the watch', () => {
      const planned = plan(
        snapshot([released(1, 'pending')]),
        { ...EMPTY_MEMORY, inFlight: watching(1) },
        { nowEpochMs: NOW + 90 * MINUTE },
      );

      assert.deepStrictEqual(
        planned.setAsides.map(({ reason }) => reason),
        ['watch-timeout'],
      );
    });

    test('re-runs a red code-owner check approved since, twice at most', () => {
      const gated = snapshot(
        [
          released(1, 'failure', {
            review: Result.ok({
              latestReviews: [{ login: 'owner', state: 'APPROVED' }],
              files: [
                { path: 'a.ts', change: 'modified', previousPath: undefined },
              ],
              filesComplete: true,
              unresolvedConversations: 0,
              pushers: ['someone'],
            }),
          }),
        ],
        {
          repository: {
            repo: { owner: 'noshiro-pf', name: 'mono' },
            defaultBranch: 'main',
            defaultBranchTip: TIP,
            viewer: Result.ok('noshiro-pf'),
            codeOwners: Result.ok(`# enforced-by: ${REQUIRED}\n* @owner\n`),
            hasQueueLabel: Result.ok(true),
          },
        },
      );

      const first = plan(gated, { ...EMPTY_MEMORY, inFlight: watching(1) });

      assert.deepStrictEqual(first.step, {
        kind: 'rerun',
        number: 1,
        head: headOf(1),
        context: REQUIRED,
      });

      const second = plan(gated, first.memory);

      assert.strictEqual(second.step.kind, 'rerun');

      assert.deepStrictEqual(
        plan(gated, second.memory).setAsides.map(({ reason }) => reason),
        ['checks-failed'],
      );
    });
  });

  test('yields its own release to one released beside it and first in the order', () => {
    const planned = plan(
      snapshot([released(1, 'pending'), released(2, 'pending')]),
      {
        ...EMPTY_MEMORY,
        inFlight: watching(2),
        release: {
          number: 2,
          decidedEpochMs: NOW - MINUTE,
          order: [1, 2],
          paused: [1],
        },
      },
    );

    assert.deepStrictEqual(planned.step, {
      kind: 'yield',
      number: 2,
      head: headOf(2),
    });

    assert.isTrue(planned.memory.inFlight === undefined);

    assert.isTrue(planned.memory.release === undefined);
  });

  test('keeps a waiting auto-rebase pull request on the tip when nothing else is to do', () => {
    const waiting = pull(1, {
      labels: labels('auto-rebase', 'skip-ci'),
      comparison: Result.ok({ aheadBy: 1, behindBy: 3 }),
    });

    assert.deepStrictEqual(plan(snapshot([waiting])).step, {
      kind: 'keep-on-tip',
      numbers: [1],
    });
  });
});

const withLayers = (
  pulls: readonly PullRequestFacts[],
  layers: readonly QueueLayerFacts[],
): Snapshot =>
  snapshot(pulls, {
    queueLayers: Result.ok({
      baseTree: 'tree',
      layers,
      movedHeads: new Map<number, MovedHead>(),
    }),
  });

const isoAt = (epochMs: number): string => {
  const date = new Date(epochMs);

  return date.toISOString();
};

describe('checking ahead', () => {
  const SPECULATE: PlanConfig = {
    ...CONFIG,
    speculate: { workflows: ['code-check.yml'], depth: 2 },
  } as const;

  const ON_TIP = { tip: TIP, tree: 'tree' } as const;

  const run = (
    runId: number,
    conclusion: string | undefined,
  ): WorkflowRoundFacts =>
    ({
      checkSuiteId: runId,
      runId,
      workflowId: 1,
      completed: conclusion !== undefined,
      attemptStartedAt: undefined,
      headBranch: 'queue/pr-1',
      path: '.github/workflows/code-check.yml',
      event: 'workflow_dispatch',
      status:
        conclusion === undefined
          ? ('in_progress' as const)
          : ('completed' as const),
      conclusion,
      createdAt: isoAt(NOW - MINUTE),
      updatedAt: isoAt(NOW - MINUTE),
      url: `https://github.com/runs/${runId}`,
    }) as const;

  /** The layer of #`number`, on `below`. */
  const layer = (
    number: number,
    rounds: readonly WorkflowRoundFacts[],
    below: Readonly<{ tip: string; tree: string }> = ON_TIP,
  ): QueueLayerFacts =>
    ({
      branch: `queue/pr-${number}`,
      origin: { number, builtFromHead: headOf(number) },
      sha: `layer-${number}`,
      tree: `layer-tree-${number}`,
      parent: below.tip,
      parentTree: below.tree,
      committedAt: '2026-11-09T00:00:00Z',
      checks: Result.ok({
        sha: `layer-${number}`,
        runs: [],
        statuses: [],
        rounds,
      }),
    }) as const;

  test('builds the leading candidates and waits for the first one’s layer', () => {
    const planned = plan(
      withLayers([pull(1), pull(2), pull(3)], []),
      EMPTY_MEMORY,
      {
        config: SPECULATE,
      },
    );

    assert.deepStrictEqual(planned.step, {
      kind: 'wait-for-layer',
      number: 1,
      head: headOf(1),
      why: "waiting for its layer's checks before releasing it",
    });

    assert.deepStrictEqual(planned.layers?.work.build, {
      base: TIP,
      onTip: true,
      layers: [
        { number: 1, head: headOf(1), upstream: undefined },
        { number: 2, head: headOf(2), upstream: undefined },
      ],
    });

    assert.deepStrictEqual(planned.layers?.work.dispatch, {
      number: 1,
      branch: 'queue/pr-1',
      workflows: ['code-check.yml'],
      first: true,
    });

    assert.strictEqual(planned.next, 'poll');
  });

  test('releases the first candidate alone once its layer is green, and keeps picking it after its rebase', () => {
    const layers = [
      layer(1, [run(1, 'success')]),
      layer(2, [run(2, undefined)], { tip: 'layer-1', tree: 'layer-tree-1' }),
    ] as const;

    const planned = plan(withLayers([pull(1), pull(2)], layers), EMPTY_MEMORY, {
      config: SPECULATE,
    });

    assert.deepStrictEqual(
      picksOf(planned).map(({ number }) => number),
      [1],
    );

    assert.deepStrictEqual(planned.memory.releasing, {
      number: 1,
      head: headOf(1),
      tree: 'layer-tree-1',
    });

    const rebased = plan(
      withLayers([pull(1, { headSha: 'f'.repeat(40) }), pull(2)], layers),
      planned.memory,
      { config: SPECULATE },
    );

    assert.deepStrictEqual(
      picksOf(rebased).map(({ number }) => number),
      [1],
    );

    assert.isUndefined(rebased.layers);
  });

  test('stacks a queued pull request stacked on a candidate right above it, from its head, and never releases it', () => {
    const stacked = pull(2, { baseRef: 'feature/1' });

    const planned = plan(
      withLayers([pull(1), stacked, pull(3)], []),
      EMPTY_MEMORY,
      { config: SPECULATE },
    );

    assert.deepStrictEqual(planned.layers?.work.build?.layers, [
      { number: 1, head: headOf(1), upstream: undefined },
      { number: 2, head: headOf(2), upstream: headOf(1) },
    ]);

    const green = [
      layer(1, [run(1, 'success')]),
      layer(2, [run(2, 'success')], { tip: 'layer-1', tree: 'layer-tree-1' }),
    ] as const;

    const onGreen = plan(
      withLayers([pull(1), stacked, pull(3)], green),
      EMPTY_MEMORY,
      { config: SPECULATE },
    );

    assert.deepStrictEqual(
      picksOf(onGreen).map(({ number }) => number),
      [1],
    );
  });

  test("keeps a layer whose pull request's head moved to a commit with the layer's tree", () => {
    const moved = 'e'.repeat(40);

    const layers = [layer(1, [run(1, 'success')])] as const;

    const followed = plan(
      snapshot([pull(1, { headSha: moved })], {
        queueLayers: Result.ok({
          baseTree: 'tree',
          layers,
          movedHeads: new Map<number, MovedHead>([
            [1, { head: moved, tree: 'layer-tree-1' }],
          ]),
        }),
      }),
      EMPTY_MEMORY,
      { config: SPECULATE },
    );

    assert.deepStrictEqual(
      picksOf(followed).map(({ number }) => number),
      [1],
    );

    assert.deepStrictEqual(followed.layers?.work.drops, []);

    const elsewhere = plan(
      withLayers([pull(1, { headSha: moved })], layers),
      EMPTY_MEMORY,
      { config: SPECULATE },
    );

    assert.deepStrictEqual(
      elsewhere.layers?.work.drops.map(({ branch }) => branch),
      ['queue/pr-1'],
    );
  });

  test('sets aside the pull request of a red first layer once its runs finish', () => {
    const red = [layer(1, [run(1, 'failure')])] as const;

    const planned = plan(withLayers([pull(1), pull(2)], red), EMPTY_MEMORY, {
      config: SPECULATE,
    });

    assert.deepStrictEqual(
      planned.setAsides.map(({ number, reason }) => [number, reason]),
      [[1, 'checks-failed']],
    );

    assert.deepStrictEqual(
      planned.layers?.work.drops.map(({ number, cancel, deleteBranch }) => [
        number,
        cancel,
        deleteBranch,
      ]),
      [[1, [], true]],
    );
  });

  test('releases as usual, the layer dropped, when only fixers’ diffs failed on it', () => {
    const red = [layer(1, [run(1, 'failure')])] as const;

    const planned = plan(withLayers([pull(1), pull(2)], red), EMPTY_MEMORY, {
      config: { ...SPECULATE, fixable: () => true },
    });

    assert.deepStrictEqual(
      picksOf(planned).map(({ number }) => number),
      [1, 2],
    );

    assert.deepStrictEqual(planned.layers?.work.drops[0]?.deleteRuns, [1]);
  });

  test('releases as usual when the layers are unread', () => {
    const planned = plan(
      snapshot([pull(1), pull(2)], {
        queueLayers: Result.err({
          kind: 'unavailable',
          what: 'x',
          message: '502',
        }),
      }),
      EMPTY_MEMORY,
      { config: SPECULATE },
    );

    assert.deepStrictEqual(
      picksOf(planned).map(({ number }) => number),
      [1, 2],
    );

    assert.include(planned.layers?.note ?? '', 'not checking ahead');
  });

  test('drops every layer once the queue has drained', () => {
    const planned = plan(
      withLayers([], [layer(1, [run(1, undefined)])]),
      EMPTY_MEMORY,
      {
        config: SPECULATE,
      },
    );

    assert.deepStrictEqual(planned.step, { kind: 'sleep' });

    assert.deepStrictEqual(
      planned.layers?.work.drops.map(({ cancel }) => cancel),
      [[1]],
    );
  });
});
