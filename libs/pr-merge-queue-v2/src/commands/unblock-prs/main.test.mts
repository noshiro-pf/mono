import {
  EMPTY_MEMORY,
  ok,
  parseWorkerMemory,
  recordedTransport,
  status,
  writePullRequestClaimComment,
  writeSetAsideComment,
  type HeadChecks,
  type IssueFacts,
  type MovedHead,
  type PullRequestFacts,
  type Read,
  type ReferenceFacts,
  type Snapshot,
  type WorkerMemory,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Config } from '../../config/index.mjs';
import type {
  AutoFixResult,
  BuiltLayers,
  TipRebaseOutcome,
} from '../../git/index.mjs';
import {
  runCycle,
  unblockPrs,
  waitMsOf,
  type UnblockPrsWorld,
} from './main.mjs';
import type { UnblockPrsOptions } from './options.mjs';

const TIP = 'e'.repeat(40);

const NOW = Date.parse('2026-11-10T00:00:00Z');

const REQUIRED = 'code-check-result / result';

const OPTIONS: UnblockPrsOptions = {
  once: true,
  dryRun: false,
  activeIntervalMs: 60_000,
  idleAfter: 5,
  idleIntervalMs: 300_000,
  pollIntervalMs: 60_000,
  watchTimeoutMs: 90 * 60_000,
  autoFix: true,
  repo: 'o/n',
} as const;

const label = (name: string) =>
  ({ name, color: '000000', description: '' }) as const;

const headOf = (number: number): string =>
  number.toString(16).padStart(40, '0');

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
    labels: [label('merge-queued'), label('skip-ci')],
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

const snapshotOf = (pulls: readonly PullRequestFacts[]): Snapshot =>
  ({
    readAt: '2026-11-10T00:00:00Z',
    authenticated: true,
    repository: {
      repo: { owner: 'o', name: 'n' },
      defaultBranch: 'main',
      defaultBranchTip: TIP,
      viewer: Result.ok('me'),
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
  }) as const;

/** GitHub's answer for pull request `number` read again before acting. */
const pullNow = (
  number: number,
  labels: readonly string[],
): Parameters<typeof recordedTransport>[0] =>
  ({
    [`/repos/o/n/pulls/${number}`]: ok({
      state: 'open',
      node_id: `PR_${number}`,
      head: { sha: headOf(number) },
      base: { ref: 'main' },
      labels: labels.map((name) => ({ name })),
    }),
  }) as const;

const DECLINED: AutoFixResult = Result.ok({
  kind: 'declined',
  why: 'not configured',
});

/** An Auto-fix that answers `result`. */
const answering = (result: AutoFixResult) => (): Promise<AutoFixResult> =>
  Promise.resolve(result);

/** A configuration with Auto-fix on, for the cycles that try it. */
const WITH_AUTO_FIX: Config = {
  autoFix: {
    ignore: [],
    before: [],
    prepare: [],
    fixers: [],
    after: [],
    notFixableAnnotation: undefined,
  },
  generatedBranches: [],
  translation: undefined,
  openingHeading: undefined,
  regenerate: undefined,
  speculate: undefined,
} as const;

type Fakes = Readonly<{
  routes?: Parameters<typeof recordedTransport>[0];
  rebases?: ReadonlyRecord<number, Result<TipRebaseOutcome, string>>;
  conflicts?: Result<boolean, string>;
  autoFix?: AutoFixResult;
  built?: BuiltLayers;
  config?: Config;
}>;

const worldOf = (
  snapshot: Read<Snapshot>,
  fakes: Fakes,
): Readonly<{
  world: UnblockPrsWorld;
  acts: readonly string[];
  lines: readonly string[];
  written: () => string | undefined;
}> => {
  const recorded = recordedTransport({
    '/repos/o/n': ok({ full_name: 'o/n', default_branch: 'main' }),
    '/user': ok({ login: 'me' }),
    ...fakes.routes,
  });

  const mut_acts: string[] = [];

  const mut_lines: string[] = [];

  let mut_written: string | undefined = undefined;

  const world: UnblockPrsWorld = {
    transport: async (request) => {
      if (request.method !== 'GET') {
        mut_acts.push(
          `${request.method} ${request.url.replace('https://api.github.com/repos/o/n', '')}`,
        );
      }

      return recorded.transport(request);
    },
    env: { GH_TOKEN: 'token' },
    originUrl: () => Promise.resolve(undefined),
    manifestUrl: () => Promise.resolve(undefined),
    ghAuthToken: () => Promise.resolve(Result.err('no gh')),
    nowEpochMs: () => NOW,
    sleep: () => Promise.resolve(),
    log: (line) => {
      mut_lines.push(line);
    },
    stopRequested: () => false,
    readConfig: () => Promise.resolve(Result.ok(undefined)),
    readSnapshot: () => Promise.resolve(snapshot),
    memory: {
      read: () => Promise.resolve(Result.ok(mut_written)),
      write: (_, text) => {
        mut_written = text;

        return Promise.resolve(Result.ok(undefined));
      },
    },
    git: {
      branchTips: () => Promise.resolve(Result.ok(new Map<string, string>())),
      // Answers only for a head commit and the snapshot's tip, in that order.
      conflictsWithTip: (head, tip) =>
        Promise.resolve(
          tip === TIP && head !== TIP && /^[\da-f]{40}$/u.test(head)
            ? (fakes.conflicts ?? Result.ok(false))
            : Result.err(`asked of ${head} and ${tip}`),
        ),
      rebaseOnTip: ({ number, regenerate }) => {
        mut_acts.push(
          `rebase #${number}${regenerate === undefined ? '' : ', regenerating'}`,
        );

        return Promise.resolve(
          fakes.rebases?.[number] ??
            Result.ok({
              kind: 'pushed',
              head: 'f'.repeat(40),
              onto: TIP,
              regenerated: [],
            }),
        );
      },
      restack: (_moved, layers) => {
        if (Arr.isNonEmpty(layers)) {
          mut_acts.push(
            `restack ${layers.map(({ number }) => `#${number}`).join(', ')}`,
          );
        }

        return Promise.resolve([]);
      },
      buildLayers: (_base, _defaultBranch, layers) => {
        mut_acts.push(
          `build ${layers.map(({ number }) => `#${number}`).join(', ')}`,
        );

        return Promise.resolve(
          fakes.built ?? {
            built: layers.map(({ number }) => number),
            failed: undefined,
          },
        );
      },
      deleteBranch: (branch) => {
        mut_acts.push(`delete ${branch}`);

        return Promise.resolve(Result.ok(undefined));
      },
    },
    autoFix: () => answering(fakes.autoFix ?? DECLINED),
  } as const;

  return {
    world,
    acts: mut_acts,
    lines: mut_lines,
    written: () => mut_written,
  };
};

const cycle = async (
  snapshot: Read<Snapshot>,
  fakes: Fakes = {},
  memory: WorkerMemory = EMPTY_MEMORY,
  options: UnblockPrsOptions = OPTIONS,
): Promise<
  Awaited<ReturnType<typeof runCycle>> &
    Readonly<{ acts: readonly string[]; lines: readonly string[] }>
> => {
  const made = worldOf(snapshot, fakes);

  const done = await runCycle(memory, {
    context: {
      transport: made.world.transport,
      owner: 'o',
      name: 'n',
      token: 'token',
    },
    repo: { owner: 'o', name: 'n' },
    defaultBranch: 'main',
    config: fakes.config,
    options,
    world: made.world,
  });

  return { ...done, acts: made.acts, lines: made.lines };
};

describe(runCycle, () => {
  test('reads again later when the snapshot cannot be read', async () => {
    const done = await cycle(
      Result.err({ kind: 'unavailable', what: 'the tip', message: '502' }),
    );

    assert.strictEqual(done.next, 'active');

    assert.deepStrictEqual(done.acts, []);
  });

  test('arms an up-to-date candidate after reading it again', async () => {
    const done = await cycle(Result.ok(snapshotOf([pull(1)])), {
      routes: {
        ...pullNow(1, ['merge-queued', 'skip-ci']),
        'graphql:enablePullRequestAutoMerge': ok({ data: {} }),
      },
    });

    assert.deepStrictEqual(done.acts, ['POST https://api.github.com/graphql']);

    assert.strictEqual(done.next, 'at-once');
  });

  test('does not arm one that changed since the snapshot', async () => {
    const done = await cycle(Result.ok(snapshotOf([pull(1)])), {
      routes: pullNow(1, ['skip-ci']),
    });

    assert.deepStrictEqual(done.acts, []);

    assert.strictEqual(done.next, 'at-once');
  });

  test('releases an armed candidate and remembers it in flight', async () => {
    const done = await cycle(
      Result.ok(snapshotOf([pull(1, { autoMerge: true }), pull(2)])),
      {
        routes: {
          ...pullNow(1, ['merge-queued', 'skip-ci']),
          'DELETE /repos/o/n/issues/1/labels/skip-ci': ok([]),
        },
      },
    );

    assert.deepStrictEqual(done.acts, ['DELETE /issues/1/labels/skip-ci']);

    assert.strictEqual(done.memory.inFlight?.number, 1);

    assert.deepStrictEqual(done.memory.release?.paused, [1, 2]);
  });

  test('counts a failed release, and sets it aside on the third', async () => {
    const refused = {
      ...pullNow(1, ['merge-queued', 'skip-ci']),
      'DELETE /repos/o/n/issues/1/labels/skip-ci': status(403, 'Forbidden'),
    } as const;

    const armed = Result.ok(snapshotOf([pull(1, { autoMerge: true })]));

    const first = await cycle(armed, { routes: refused });

    const second = await cycle(armed, { routes: refused }, first.memory);

    const third = await cycle(armed, { routes: refused }, second.memory);

    const fourth = await cycle(
      armed,
      { routes: { 'POST /repos/o/n/issues/1/comments': ok({ id: 9 }) } },
      third.memory,
    );

    assert.deepStrictEqual(fourth.acts, ['POST /issues/1/comments']);
  });

  test('sets aside a candidate whose rebase conflicts, and rebases the next on the same snapshot', async () => {
    const behind = {
      comparison: Result.ok({ aheadBy: 1, behindBy: 1 }),
    } as const;

    const done = await cycle(
      Result.ok(snapshotOf([pull(1, behind), pull(2, behind)])),
      {
        routes: { 'POST /repos/o/n/issues/1/comments': ok({ id: 9 }) },
        rebases: {
          1: Result.ok({ kind: 'conflict', detail: 'conflicts in `a.ts`' }),
        },
      },
    );

    assert.deepStrictEqual(done.acts, [
      'rebase #1',
      'rebase #2',
      'POST /issues/1/comments',
    ]);

    assert.strictEqual(done.next, 'at-once');
  });

  test('regenerates on the rebase of a queued pull request only', async () => {
    const behind = {
      comparison: Result.ok({ aheadBy: 1, behindBy: 1 }),
    } as const;

    const withRegenerate: Config = {
      ...WITH_AUTO_FIX,
      regenerate: { before: [], generators: [] },
    } as const;

    const queued = await cycle(Result.ok(snapshotOf([pull(1, behind)])), {
      config: withRegenerate,
    });

    assert.deepStrictEqual(Arr.take(queued.acts, 1), [
      'rebase #1, regenerating',
    ]);

    const off = await cycle(
      Result.ok(snapshotOf([pull(1, behind)])),
      { config: withRegenerate },
      EMPTY_MEMORY,
      { ...OPTIONS, autoFix: false },
    );

    assert.deepStrictEqual(Arr.take(off.acts, 1), ['rebase #1']);
  });

  test('goes on to arm one whose rebase changed nothing', async () => {
    const done = await cycle(
      Result.ok(
        snapshotOf([
          pull(1, { comparison: Result.ok({ aheadBy: 1, behindBy: 1 }) }),
        ]),
      ),
      {
        routes: {
          ...pullNow(1, ['merge-queued', 'skip-ci']),
          'graphql:enablePullRequestAutoMerge': ok({ data: {} }),
        },
        rebases: { 1: Result.ok({ kind: 'unchanged' }) },
      },
    );

    assert.deepStrictEqual(done.acts, [
      'rebase #1',
      'POST https://api.github.com/graphql',
    ]);
  });

  test('sets aside the one in flight whose checks failed, when Auto-fix declines', async () => {
    const failing = pull(1, {
      labels: [label('merge-queued')],
      autoMerge: true,
      checks: Result.ok(checks(headOf(1), 'failure')),
    });

    const done = await cycle(
      Result.ok(snapshotOf([failing])),
      { routes: { 'POST /repos/o/n/issues/1/comments': ok({ id: 9 }) } },
      {
        ...EMPTY_MEMORY,
        inFlight: {
          number: 1,
          head: headOf(1),
          releasedEpochMs: NOW,
          greenCount: 0,
          autoFixed: false,
        },
      },
    );

    assert.deepStrictEqual(done.acts, ['POST /issues/1/comments']);

    assert.isTrue(done.memory.inFlight === undefined);
  });

  test('watches the head Auto-fix pushed, and tries again after a failed push', async () => {
    const failing = Result.ok(
      snapshotOf([
        pull(1, {
          labels: [label('merge-queued')],
          autoMerge: true,
          checks: Result.ok(checks(headOf(1), 'failure')),
        }),
      ]),
    );

    const watched: WorkerMemory = {
      ...EMPTY_MEMORY,
      inFlight: {
        number: 1,
        head: headOf(1),
        releasedEpochMs: NOW,
        greenCount: 0,
        autoFixed: false,
      },
    } as const;

    const pushed = await cycle(
      failing,
      {
        config: WITH_AUTO_FIX,
        autoFix: Result.ok({ kind: 'pushed', head: 'd'.repeat(40) }),
      },
      watched,
    );

    assert.strictEqual(pushed.memory.inFlight?.head, 'd'.repeat(40));

    assert.isTrue(pushed.memory.inFlight?.autoFixed === true);

    const refused = await cycle(
      failing,
      { config: WITH_AUTO_FIX, autoFix: Result.err('push refused') },
      watched,
    );

    assert.isTrue(refused.memory.inFlight?.autoFixed === false);

    assert.deepStrictEqual(
      refused.memory.conditions.map(({ kind }) => kind),
      ['push-failed'],
    );
  });

  test('settles a set-aside whose head moved before it plans', async () => {
    const stale = writeSetAsideComment(
      { reason: 'rebase-failed', headSha: 'a'.repeat(40), baseSha: TIP },
      'Set aside.',
    );

    const done = await cycle(
      Result.ok(
        snapshotOf([
          pull(1, {
            comments: Result.ok([
              { id: 5, body: stale, createdAt: '2026-11-01T00:00:00Z' },
            ]),
          }),
        ]),
      ),
      {
        routes: {
          'PATCH /repos/o/n/issues/comments/5': ok({ id: 5 }),
          ...pullNow(1, ['merge-queued', 'skip-ci']),
          'graphql:enablePullRequestAutoMerge': ok({ data: {} }),
        },
      },
    );

    assert.deepStrictEqual(done.acts, [
      'PATCH /issues/comments/5',
      'POST https://api.github.com/graphql',
    ]);
  });

  test('keeps a rebase-failed standing on the new base while it still conflicts', async () => {
    const standing = writeSetAsideComment(
      { reason: 'rebase-failed', headSha: headOf(1), baseSha: 'b'.repeat(40) },
      'Set aside.',
    );

    const done = await cycle(
      Result.ok(
        snapshotOf([
          pull(1, {
            comments: Result.ok([
              { id: 5, body: standing, createdAt: '2026-11-01T00:00:00Z' },
            ]),
          }),
        ]),
      ),
      {
        routes: { 'PATCH /repos/o/n/issues/comments/5': ok({ id: 5 }) },
        conflicts: Result.ok(true),
      },
    );

    assert.deepStrictEqual(done.acts, ['PATCH /issues/comments/5']);

    assert.isTrue(done.lines.some((line) => line.includes('still conflicts')));
  });

  test('leaves a rebase-failed as it stands when whether it still conflicts is unknown', async () => {
    const standing = writeSetAsideComment(
      { reason: 'rebase-failed', headSha: headOf(1), baseSha: 'b'.repeat(40) },
      'Set aside.',
    );

    const done = await cycle(
      Result.ok(
        snapshotOf([
          pull(1, {
            comments: Result.ok([
              { id: 5, body: standing, createdAt: '2026-11-01T00:00:00Z' },
            ]),
          }),
        ]),
      ),
      { conflicts: Result.err('cannot reach origin') },
    );

    assert.isFalse(done.acts.includes('PATCH /issues/comments/5'));

    assert.isTrue(
      done.lines.some((line) => line.includes('cannot tell whether')),
    );
  });

  test('restacks a pull request GitHub moved off a merged parent, with every layer above it', async () => {
    const moved = pull(2, {
      labels: [],
      mergedParent: Result.ok({
        number: 1,
        headSha: headOf(1),
        mergeCommitSha: TIP,
        containsHead: true,
      }),
    });

    const done = await cycle(
      Result.ok(
        snapshotOf([
          moved,
          pull(3, { labels: [], baseRef: 'feature/2' }),
          pull(4, { labels: [], baseRef: 'feature/3' }),
        ]),
      ),
    );

    assert.deepStrictEqual(done.acts, ['rebase #2', 'restack #3, #4']);

    assert.strictEqual(done.next, 'at-once');
  });

  test('leaves a moved pull request, and a layer above, that someone has claimed', async () => {
    const claimed = (number: number): PullRequestFacts['comments'] =>
      Result.ok([
        {
          id: 9,
          body: writePullRequestClaimComment(
            {
              headSha: headOf(number),
              by: 'session-a',
              at: '2026-11-09T23:30:00Z',
            },
            'Being fixed.',
          ),
          createdAt: '2026-11-09T23:30:00Z',
        },
      ]);

    const parent = Result.ok({
      number: 1,
      headSha: headOf(1),
      mergeCommitSha: TIP,
      containsHead: true,
    });

    const held = await cycle(
      Result.ok(
        snapshotOf([
          pull(2, { labels: [], mergedParent: parent, comments: claimed(2) }),
        ]),
      ),
    );

    assert.isFalse(held.acts.includes('rebase #2'));

    const above = await cycle(
      Result.ok(
        snapshotOf([
          pull(2, { labels: [], mergedParent: parent }),
          pull(3, { labels: [], baseRef: 'feature/2', comments: claimed(3) }),
          pull(4, { labels: [], baseRef: 'feature/2' }),
        ]),
      ),
    );

    assert.deepStrictEqual(above.acts, ['rebase #2', 'restack #4']);

    const onClaimed = await cycle(
      Result.ok(
        snapshotOf([
          pull(2, { labels: [], mergedParent: parent }),
          pull(3, { labels: [], baseRef: 'feature/2', comments: claimed(3) }),
          pull(4, { labels: [], baseRef: 'feature/3' }),
        ]),
      ),
    );

    assert.deepStrictEqual(onClaimed.acts, ['rebase #2']);

    assert.isTrue(
      onClaimed.lines.includes(
        '#4: not restacked — the layer it is on, feature/3, is left.',
      ),
    );
  });

  test('changes nothing under --dry-run', async () => {
    const done = await cycle(
      Result.ok(
        snapshotOf([
          pull(1, { comparison: Result.ok({ aheadBy: 1, behindBy: 1 }) }),
        ]),
      ),
      {},
      EMPTY_MEMORY,
      { ...OPTIONS, dryRun: true },
    );

    assert.deepStrictEqual(done.acts, []);

    assert.isTrue(done.lines.some((line) => line.includes('would rebase')));
  });
});

describe(unblockPrs, () => {
  test('runs one cycle under --once and writes the memory', async () => {
    const made = worldOf(Result.ok(snapshotOf([])), {});

    const result = await unblockPrs(OPTIONS, made.world);

    assert.deepStrictEqual(result, Result.ok('One cycle run.'));

    const written = made.written();

    assert.isTrue(
      written !== undefined && Result.isOk(parseWorkerMemory(written)),
    );
  });
});

describe(waitMsOf, () => {
  test('waits by what the cycle asks', () => {
    assert.strictEqual(waitMsOf('at-once', OPTIONS), 0);

    assert.strictEqual(waitMsOf('stale', OPTIONS), 30_000);

    assert.strictEqual(waitMsOf('idle', OPTIONS), 300_000);
  });

  describe('checking ahead', () => {
    const SPECULATING: Config = {
      ...WITH_AUTO_FIX,
      speculate: { workflows: ['code-check.yml'], depth: 2 },
    } as const;

    const DISPATCH =
      'POST /repos/o/n/actions/workflows/code-check.yml/dispatches';

    test('builds the leading layers and dispatches on the first, releasing nothing', async () => {
      const done = await cycle(Result.ok(snapshotOf([pull(1), pull(2)])), {
        config: SPECULATING,
        routes: { [DISPATCH]: ok(null) },
      });

      assert.deepStrictEqual(done.acts, [
        'build #1, #2',
        'POST /actions/workflows/code-check.yml/dispatches',
      ]);

      assert.strictEqual(done.next, 'poll');
    });

    test('releases as usual when the first layer cannot be built', async () => {
      const done = await cycle(
        Result.ok(
          snapshotOf([
            pull(1, { comparison: Result.ok({ aheadBy: 1, behindBy: 1 }) }),
            pull(2),
          ]),
        ),
        {
          config: SPECULATING,
          built: { built: [], failed: { number: 1, why: 'conflicts' } },
        },
      );

      assert.deepStrictEqual(done.acts, ['build #1, #2', 'rebase #1']);
    });

    test('releases as usual when the first layer cannot be dispatched', async () => {
      const done = await cycle(
        Result.ok(
          snapshotOf([
            pull(1, { comparison: Result.ok({ aheadBy: 1, behindBy: 1 }) }),
          ]),
        ),
        {
          config: SPECULATING,
          routes: { [DISPATCH]: status(422, 'no such workflow') },
        },
      );

      assert.deepStrictEqual(done.acts, [
        'build #1',
        'POST /actions/workflows/code-check.yml/dispatches',
        'rebase #1',
      ]);
    });
  });
});
