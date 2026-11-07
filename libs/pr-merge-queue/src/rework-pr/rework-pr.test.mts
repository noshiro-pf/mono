import {
  MERGE_QUEUED_LABEL,
  SKIP_CI_LABEL,
  type QueueComments,
} from 'pr-report-core';
import { Result } from 'ts-data-forge';
import type { StackEntry } from '../unblock-prs/index.mjs';
import {
  applyRework,
  decideStanding,
  doneSteps,
  isGraphqlRefusal,
  isUntouchedSince,
  parseReworkArgs,
  pushFailure,
  readOwnDequeueEvent,
  startSteps,
  uncommittedRefusal,
  type QueueEvent,
  type QueueRecord,
  type ReworkArgs,
  type ReworkHandBack,
  type ReworkIo,
  type ReworkStanding,
  type ReworkState,
  type ReworkStep,
} from './rework-pr.mjs';

describe(parseReworkArgs, () => {
  test('reads the phase, with or without the -- pnpm forwards', () => {
    assert.deepStrictEqual(
      parseReworkArgs(['start']),
      Result.ok({ phase: 'start', dryRun: false }),
    );

    assert.deepStrictEqual(
      parseReworkArgs(['--', 'done', '--requeue', '--dry-run']),
      Result.ok({ phase: 'done', handBack: 'requeue', dryRun: true }),
    );

    assert.deepStrictEqual(
      parseReworkArgs(['done', '--review']),
      Result.ok({ phase: 'done', handBack: 'review', dryRun: false }),
    );
  });

  test('done: refuses neither and both of --requeue and --review', () => {
    assert.isTrue(Result.isErr(parseReworkArgs(['done'])));

    assert.isTrue(
      Result.isErr(parseReworkArgs(['done', '--requeue', '--review'])),
    );
  });

  test('start: refuses --requeue and --review', () => {
    assert.isTrue(Result.isErr(parseReworkArgs(['start', '--requeue'])));

    assert.isTrue(Result.isErr(parseReworkArgs(['start', '--review'])));
  });

  test('answers help', () => {
    assert.deepStrictEqual(parseReworkArgs(['--help']), Result.ok('help'));
  });

  test('refuses no phase, an unknown one, and more than one', () => {
    assert.isTrue(Result.isErr(parseReworkArgs([])));

    assert.isTrue(Result.isErr(parseReworkArgs(['begin'])));

    assert.isTrue(Result.isErr(parseReworkArgs(['start', 'done'])));
  });
});

describe(startSteps, () => {
  test('holds before it dequeues, then disarms and drafts', () => {
    assert.deepStrictEqual(
      startSteps(state({ labels: [MERGE_QUEUED_LABEL], isArmed: true })),
      ['hold', 'dequeue', 'disarm', 'draft'],
    );
  });

  test('skips each step already done', () => {
    assert.deepStrictEqual(startSteps(state({ labels: [SKIP_CI_LABEL] })), [
      'draft',
    ]);

    assert.deepStrictEqual(
      startSteps(state({ labels: [SKIP_CI_LABEL], isDraft: true })),
      [],
    );
  });
});

describe(doneSteps, () => {
  test('pushes, then marks a draft ready', () => {
    assert.deepStrictEqual(
      doneSteps(
        state({ labels: [SKIP_CI_LABEL], isDraft: true }),
        'review',
        'none',
        false,
      ),
      Result.ok(['push', 'ready']),
    );
  });

  test('pushes alone when it could not be made a draft', () => {
    assert.deepStrictEqual(
      doneSteps(state({ labels: [SKIP_CI_LABEL] }), 'review', 'none', false),
      Result.ok(['push']),
    );
  });

  test('carries the layers above along right after the push', () => {
    assert.deepStrictEqual(
      doneSteps(
        state({ labels: [SKIP_CI_LABEL], isDraft: true }),
        'requeue',
        'untouched',
        true,
      ),
      Result.ok(['push', 'restack', 'ready', 'requeue', 'forget']),
    );
  });

  test('requeue: puts merge-queued back last, when start took it off', () => {
    assert.deepStrictEqual(
      doneSteps(
        state({ labels: [SKIP_CI_LABEL], isDraft: true }),
        'requeue',
        'untouched',
        false,
      ),
      Result.ok(['push', 'ready', 'requeue', 'forget']),
    );
  });

  test('requeue: leaves it off when start found it off', () => {
    assert.deepStrictEqual(
      doneSteps(
        state({ labels: [SKIP_CI_LABEL], isDraft: true }),
        'requeue',
        'none',
        false,
      ),
      Result.ok(['push', 'ready']),
    );
  });

  test('requeue: leaves it off once the label has moved, and forgets the record', () => {
    assert.deepStrictEqual(
      doneSteps(
        state({ labels: [SKIP_CI_LABEL], isDraft: true }),
        'requeue',
        'moved',
        false,
      ),
      Result.ok(['push', 'ready', 'forget']),
    );
  });

  test('review: leaves it off, and forgets that start took it off', () => {
    assert.deepStrictEqual(
      doneSteps(
        state({ labels: [SKIP_CI_LABEL], isDraft: true }),
        'review',
        'untouched',
        false,
      ),
      Result.ok(['push', 'ready', 'forget']),
    );
  });

  test('refuses what is still queued, armed or running its checks', () => {
    assert.isTrue(
      Result.isErr(
        doneSteps(
          state({ labels: [SKIP_CI_LABEL, MERGE_QUEUED_LABEL], isDraft: true }),
          'requeue',
          'untouched',
          false,
        ),
      ),
    );

    assert.isTrue(
      Result.isErr(
        doneSteps(
          state({ labels: [SKIP_CI_LABEL], isDraft: true, isArmed: true }),
          'review',
          'none',
          false,
        ),
      ),
    );

    assert.isTrue(
      Result.isErr(
        doneSteps(state({ isDraft: true }), 'review', 'none', false),
      ),
    );
  });
});

describe(isUntouchedSince, () => {
  test('true while the event start wrote down is the last', () => {
    assert.isTrue(
      isUntouchedSince(
        [
          { id: 1, event: 'labeled' },
          { id: 2, event: 'unlabeled' },
        ],
        2,
      ),
    );
  });

  test('false once anyone has put the label on or taken it off since', () => {
    assert.isFalse(
      isUntouchedSince(
        [
          { id: 2, event: 'unlabeled' },
          { id: 3, event: 'labeled' },
        ],
        2,
      ),
    );

    assert.isFalse(
      isUntouchedSince(
        [
          { id: 2, event: 'unlabeled' },
          { id: 3, event: 'labeled' },
          { id: 4, event: 'unlabeled' },
        ],
        2,
      ),
    );
  });

  test('false with no events, or a different one recorded', () => {
    assert.isFalse(isUntouchedSince([], 2));

    assert.isFalse(isUntouchedSince([{ id: 5, event: 'unlabeled' }], 2));
  });
});

describe(readOwnDequeueEvent, () => {
  test('reads again until GitHub lists the label taken off', async () => {
    const { read, waits } = fakeEvents([
      [{ id: 1, event: 'labeled' }],
      [{ id: 1, event: 'labeled' }],
      [
        { id: 1, event: 'labeled' },
        { id: 2, event: 'unlabeled' },
      ],
    ]);

    assert.deepStrictEqual(
      await readOwnDequeueEvent(read, waits.wait, 4),
      Result.ok(2),
    );

    assert.strictEqual(waits.count(), 2);
  });

  test('gives up after the reads it is given, waiting only between them', async () => {
    const { read, waits } = fakeEvents([[{ id: 1, event: 'labeled' }]]);

    assert.isTrue(Result.isErr(await readOwnDequeueEvent(read, waits.wait, 3)));

    assert.strictEqual(waits.count(), 2);
  });

  test('stops at a read that fails', async () => {
    const { waits } = fakeEvents([]);

    assert.isTrue(
      Result.isErr(
        await readOwnDequeueEvent(
          () => Promise.resolve(Result.err('500')),
          waits.wait,
          3,
        ),
      ),
    );

    assert.strictEqual(waits.count(), 0);
  });
});

describe(decideStanding, () => {
  test('answers the branch and the layers above it, lowest first', () => {
    const standing = decideStanding({
      number: 1,
      entries: [
        entry(1),
        entry(3, { baseRef: 'branch-2', stackedOn: 2 }),
        entry(2, { baseRef: 'branch-1', stackedOn: 1 }),
        entry(4),
      ],
      owner: { owner: 'worker', reason: 'in the queue' },
      queue: queueOf([1, NO_COMMENTS], [2, NO_COMMENTS], [3, NO_COMMENTS]),
    });

    assert.isTrue(Result.isOk(standing));

    assert.strictEqual(standing.value.pr.headRefName, 'branch-1');

    assert.deepStrictEqual(
      standing.value.layers.map(({ number }) => number),
      [2, 3],
    );

    assert.deepStrictEqual(standing.value.claimedLayers, []);
  });

  test('leaves a claimed layer, and one it cannot read, out of those to carry', () => {
    const standing = decideStanding({
      number: 1,
      entries: [
        entry(1),
        entry(2, { baseRef: 'branch-1', stackedOn: 1 }),
        entry(3, { baseRef: 'branch-1', stackedOn: 1 }),
        entry(4, { baseRef: 'branch-1', stackedOn: 1 }),
      ],
      owner: undefined,
      queue: queueOf(
        [1, NO_COMMENTS],
        [2, claimedBy('another-session', true)],
        [3, NO_COMMENTS],
      ),
    });

    assert.isTrue(Result.isOk(standing));

    assert.deepStrictEqual(
      standing.value.layers.map(({ number }) => number),
      [3],
    );

    assert.deepStrictEqual(standing.value.claimedLayers, [2, 4]);
  });

  test('takes a pull request the queue does not cover', () => {
    assert.isTrue(
      Result.isOk(
        decideStanding({
          number: 1,
          entries: [entry(1)],
          owner: undefined,
          queue: queueOf([1, NO_COMMENTS]),
        }),
      ),
    );
  });

  test('refuses one whose owner is a skill, and says to claim it', () => {
    const standing = decideStanding({
      number: 1,
      entries: [entry(1)],
      owner: { owner: 'skill', reason: 'set aside `rebase-failed`' },
      queue: queueOf([1, NO_COMMENTS]),
    });

    assert.isTrue(Result.isErr(standing));

    assert.include(standing.value, 'set aside `rebase-failed`');

    assert.include(standing.value, 'claim-pr');
  });

  test('refuses a claim that holds, whatever the owner reads', () => {
    const standing = decideStanding({
      number: 1,
      entries: [entry(1)],
      // Not in the queue: `done` under `skip-ci` alone reads no owner at all.
      owner: undefined,
      queue: queueOf([1, claimedBy('another-session', true)]),
    });

    assert.isTrue(Result.isErr(standing));

    assert.include(standing.value, 'another-session');
  });

  test('takes a claim that has ended', () => {
    assert.isTrue(
      Result.isOk(
        decideStanding({
          number: 1,
          entries: [entry(1)],
          owner: undefined,
          queue: queueOf([1, claimedBy('another-session', false)]),
        }),
      ),
    );
  });

  test('refuses what it could not read', () => {
    assert.isTrue(
      Result.isErr(
        decideStanding({
          number: 1,
          entries: [entry(1)],
          owner: undefined,
          queue: queueOf(),
        }),
      ),
    );

    assert.isTrue(
      Result.isErr(
        decideStanding({
          number: 1,
          entries: [],
          owner: undefined,
          queue: queueOf([1, NO_COMMENTS]),
        }),
      ),
    );
  });
});

describe(uncommittedRefusal, () => {
  test('nothing on a clean tree', () => {
    assert.isUndefined(uncommittedRefusal(''));

    assert.isUndefined(uncommittedRefusal('\n'));
  });

  test('names a changed file and an untracked one', () => {
    const refusal = uncommittedRefusal(' M src/a.mts\n?? src/new.mts\n');

    assert.include(refusal, 'src/a.mts');

    assert.include(refusal, '?? src/new.mts');
  });
});

describe(pushFailure, () => {
  test('hints at a fetch when the lease refused the push', () => {
    assert.include(
      pushFailure(' ! [rejected] b -> b (stale info)', 'b'),
      'git fetch origin b',
    );

    assert.include(
      pushFailure(
        ' ! [rejected] b -> b (remote ref updated since checkout)',
        'b',
      ),
      'git fetch origin b',
    );
  });

  test('says only what git said for any other refusal', () => {
    const forbidden = 'remote: Permission denied\nfatal: 403';

    assert.strictEqual(pushFailure(forbidden, 'b'), forbidden);

    const hook = ' ! [remote rejected] b -> b (pre-receive hook declined)';

    assert.strictEqual(pushFailure(hook, 'b'), hook);
  });
});

describe(isGraphqlRefusal, () => {
  test('true for what GraphQL will go on refusing', () => {
    assert.isTrue(isGraphqlRefusal('403 Forbidden: GraphQL is not allowed'));

    assert.isTrue(isGraphqlRefusal('404 Not Found: Not Found'));

    assert.isTrue(
      isGraphqlRefusal('Resource not accessible by personal access token'),
    );
  });

  test('false for what may pass on another try', () => {
    assert.isFalse(isGraphqlRefusal('502 Bad Gateway: try again'));

    assert.isFalse(isGraphqlRefusal('429 Too Many Requests: slow down'));

    assert.isFalse(isGraphqlRefusal('408 Request Timeout: slow'));

    assert.isFalse(isGraphqlRefusal('403 Forbidden: API rate limit exceeded'));

    assert.isFalse(isGraphqlRefusal('request failed: ECONNRESET'));

    assert.isFalse(isGraphqlRefusal('Something went wrong'));

    assert.isFalse(
      isGraphqlRefusal('502 Bad Gateway: upstream permission check timed out'),
    );

    assert.isFalse(
      isGraphqlRefusal(
        '403 Forbidden: You have triggered an abuse detection mechanism',
      ),
    );
  });
});

describe(applyRework, () => {
  test('start: reads again after the labels, and disarms what the worker armed meanwhile', async () => {
    const { io, ran } = fakeIo([
      state({ labels: [SKIP_CI_LABEL, MERGE_QUEUED_LABEL] }),
      state({ labels: [SKIP_CI_LABEL], isArmed: true }),
    ]);

    assert.deepStrictEqual(
      await applyRework(START, io),
      Result.ok({ number: 3456, steps: ['dequeue', 'disarm', 'draft'] }),
    );

    assert.deepStrictEqual(ran, ['dequeue', 'disarm', 'draft']);
  });

  test('start: a GraphQL step refused still comes after the second read', async () => {
    const { io, ran } = fakeIo(
      [
        state({ labels: [MERGE_QUEUED_LABEL] }),
        state({ labels: [SKIP_CI_LABEL], isArmed: true }),
      ],
      'disarm',
    );

    assert.isTrue(Result.isErr(await applyRework(START, io)));

    assert.deepStrictEqual(ran, ['hold', 'dequeue', 'disarm']);
  });

  test('start: a draft refused is said, and the pull request is still held', async () => {
    const { io, ran, logged } = fakeIo(
      [
        state({ labels: [MERGE_QUEUED_LABEL] }),
        state({ labels: [SKIP_CI_LABEL] }),
      ],
      'draft',
    );

    assert.deepStrictEqual(
      await applyRework(START, io),
      Result.ok({ number: 3456, steps: ['hold', 'dequeue'] }),
    );

    assert.deepStrictEqual(ran, ['hold', 'dequeue', 'draft']);

    assert.include(
      logged.at(-1),
      '#3456: cannot make it a draft: 403 Forbidden: refused. It is held all the same',
    );
  });

  test('start: a draft that failed for any other reason fails, held', async () => {
    const { io, ran } = fakeIo(
      [
        state({ labels: [MERGE_QUEUED_LABEL] }),
        state({ labels: [SKIP_CI_LABEL] }),
      ],
      'draft',
      'none',
      { failure: '502 Bad Gateway: try again' },
    );

    const applied = await applyRework(START, io);

    assert.isTrue(Result.isErr(applied));

    assert.include(applied.value, '502 Bad Gateway');

    assert.include(applied.value, 'rework-pr start again');

    assert.deepStrictEqual(ran, ['hold', 'dequeue', 'draft']);
  });

  test('either: touches nothing on a pull request refused by its standing', async () => {
    for (const args of [START, done('requeue')]) {
      const { io, ran } = fakeIo(
        [state({ labels: [SKIP_CI_LABEL, MERGE_QUEUED_LABEL] })],
        undefined,
        'none',
        { standing: Result.err('another-session claimed it') },
      );

      const applied = await applyRework(args, io);

      assert.isTrue(Result.isErr(applied));

      assert.include(applied.value, '#3456: another-session claimed it');

      assert.deepStrictEqual(ran, []);
    }
  });

  test('done: refuses uncommitted work, an untracked file included, and touches nothing', async () => {
    const { io, ran } = fakeIo(
      [state({ labels: [SKIP_CI_LABEL], isDraft: true })],
      undefined,
      'untouched',
      { uncommitted: '?? src/new.mts\n' },
    );

    const applied = await applyRework(done('requeue'), io);

    assert.isTrue(Result.isErr(applied));

    assert.include(applied.value, '?? src/new.mts');

    assert.deepStrictEqual(ran, []);
  });

  test('done: says which claimed layers it leaves, and still pushes', async () => {
    const { io, ran, logged } = fakeIo(
      [state({ labels: [SKIP_CI_LABEL] })],
      undefined,
      'none',
      {
        standing: Result.ok({
          pr: branch(entry(1)),
          layers: [],
          claimedLayers: [2],
        }),
      },
    );

    assert.isTrue(Result.isOk(await applyRework(done('review'), io)));

    assert.deepStrictEqual(ran, ['push']);

    assert.include(logged[0], '#2: not carried along');
  });

  test('start: does not read the working tree', async () => {
    const { io, ran } = fakeIo(
      [state({ labels: [SKIP_CI_LABEL] })],
      undefined,
      'none',
      { uncommitted: Result.err('no git') },
    );

    assert.isTrue(Result.isOk(await applyRework(START, io)));

    assert.deepStrictEqual(ran, ['draft']);
  });

  test('done: carries the layers along between the push and the rest, saying nothing for them', async () => {
    const { io, ran, logged } = fakeIo(
      [state({ labels: [SKIP_CI_LABEL], isDraft: true })],
      undefined,
      'untouched',
      {
        standing: Result.ok({
          pr: branch(entry(1)),
          layers: [branch(entry(2))],
          claimedLayers: [],
        }),
      },
    );

    assert.deepStrictEqual(
      await applyRework(done('requeue'), io),
      Result.ok({
        number: 3456,
        steps: ['push', 'restack', 'ready', 'requeue', 'forget'],
      }),
    );

    assert.deepStrictEqual(ran, [
      'push',
      'restack',
      'ready',
      'requeue',
      'forget',
    ]);

    assert.isFalse(logged.some((line) => line.includes('carry along')));
  });

  test('start: reads once when no label changes', async () => {
    const { io, ran } = fakeIo([state({ labels: [SKIP_CI_LABEL] })]);

    assert.deepStrictEqual(
      await applyRework(START, io),
      Result.ok({ number: 3456, steps: ['draft'] }),
    );

    assert.deepStrictEqual(ran, ['draft']);
  });

  test('start: says so when the pull request is gone by the second read', async () => {
    const { io, ran } = fakeIo([
      state({ labels: [SKIP_CI_LABEL, MERGE_QUEUED_LABEL] }),
      undefined,
    ]);

    const applied = await applyRework(START, io);

    assert.isTrue(Result.isErr(applied));

    assert.include(applied.value, 'no longer open');

    assert.deepStrictEqual(ran, ['dequeue']);
  });

  test('done: touches nothing on a pull request that is not held', async () => {
    const { io, ran } = fakeIo([
      state({ labels: [SKIP_CI_LABEL], isDraft: true, isArmed: true }),
    ]);

    assert.isTrue(Result.isErr(await applyRework(done('requeue'), io)));

    assert.deepStrictEqual(ran, []);
  });

  test('done --review: pushes, then marks it ready', async () => {
    const { io, ran } = fakeIo([
      state({ labels: [SKIP_CI_LABEL], isDraft: true }),
    ]);

    assert.deepStrictEqual(
      await applyRework(done('review'), io),
      Result.ok({ number: 3456, steps: ['push', 'ready'] }),
    );

    assert.deepStrictEqual(ran, ['push', 'ready']);
  });

  test('done --requeue: queues it again when start took merge-queued off', async () => {
    const { io, ran } = fakeIo(
      [state({ labels: [SKIP_CI_LABEL], isDraft: true })],
      undefined,
      'untouched',
    );

    assert.deepStrictEqual(
      await applyRework(done('requeue'), io),
      Result.ok({
        number: 3456,
        steps: ['push', 'ready', 'requeue', 'forget'],
      }),
    );

    assert.deepStrictEqual(ran, ['push', 'ready', 'requeue', 'forget']);
  });

  test('done --review: goes on when what start wrote down cannot be read', async () => {
    const { io, ran } = fakeIo(
      [state({ labels: [SKIP_CI_LABEL], isDraft: true })],
      undefined,
      Result.err('no git'),
    );

    assert.deepStrictEqual(
      await applyRework(done('review'), io),
      Result.ok({ number: 3456, steps: ['push', 'ready'] }),
    );

    assert.deepStrictEqual(ran, ['push', 'ready']);
  });

  test('done --requeue: stops when what start wrote down cannot be read', async () => {
    const { io, ran } = fakeIo(
      [state({ labels: [SKIP_CI_LABEL], isDraft: true })],
      undefined,
      Result.err('no git'),
    );

    assert.isTrue(Result.isErr(await applyRework(done('requeue'), io)));

    assert.deepStrictEqual(ran, []);
  });

  test('done --requeue: a push refused queues nothing', async () => {
    const { io, ran } = fakeIo(
      [state({ labels: [SKIP_CI_LABEL], isDraft: true })],
      'push',
      'untouched',
    );

    assert.isTrue(Result.isErr(await applyRework(done('requeue'), io)));

    assert.deepStrictEqual(ran, ['push']);
  });

  test('either: refuses a branch with no open pull request', async () => {
    const { io } = fakeIo([undefined]);

    assert.isTrue(Result.isErr(await applyRework(START, io)));
  });
});

const START = { phase: 'start', dryRun: false } as const satisfies ReworkArgs;

const done = (handBack: ReworkHandBack): ReworkArgs =>
  ({ phase: 'done', handBack, dryRun: false }) as const;

const entry = (
  number: number,
  {
    baseRef = 'main',
    stackedOn,
  }: Readonly<{ baseRef?: string; stackedOn?: number }> = {},
): StackEntry =>
  ({
    number,
    headRef: `branch-${number}`,
    headSha: `sha-${number}`,
    baseRef,
    fromFork: false,
    stackedOn,
  }) as const;

const branch = (e: StackEntry): ReworkStanding['pr'] =>
  ({
    number: e.number,
    state: 'OPEN',
    headRefName: e.headRef,
    headRefOid: e.headSha,
    baseRefName: e.baseRef,
    isCrossRepository: e.fromFork,
  }) as const;

/**
 * Answers each read with the next of `reads`, fails `failing`, and answers
 * `record` for what `start` wrote down.
 */
const fakeIo = (
  reads: readonly (ReworkState | undefined)[],
  failing?: ReworkStep,
  record: QueueRecord | Result<QueueRecord, string> = 'none',
  {
    failure = '403 Forbidden: refused',
    standing = Result.ok({
      pr: branch(entry(3456)),
      layers: [],
      claimedLayers: [],
    }),
    uncommitted = '',
  }: Readonly<{
    failure?: string;
    standing?: Result<ReworkStanding, string>;
    uncommitted?: Result<string, string> | string;
  }> = {},
): Readonly<{
  io: ReworkIo;
  ran: readonly ReworkStep[];
  logged: readonly string[];
}> => {
  const mut_ran: ReworkStep[] = [];

  const mut_logged: string[] = [];

  let mut_reads = 0;

  const io: ReworkIo = {
    read: () => {
      const read = reads[mut_reads];

      mut_reads += 1;

      return Promise.resolve(Result.ok(read));
    },
    standing: () => Promise.resolve(standing),
    uncommitted: () =>
      Promise.resolve(
        typeof uncommitted === 'string' ? Result.ok(uncommitted) : uncommitted,
      ),
    run: (_, step) => {
      mut_ran.push(step);

      return Promise.resolve(
        step === failing ? Result.err(failure) : Result.ok(undefined),
      );
    },
    queueRecord: () =>
      Promise.resolve(typeof record === 'string' ? Result.ok(record) : record),
    log: (message) => {
      mut_logged.push(message);
    },
  } as const;

  return { io, ran: mut_ran, logged: mut_logged } as const;
};

const queueOf = (
  ...pairs: readonly (readonly [number, QueueComments])[]
): ReadonlyMap<number, QueueComments> => new Map(pairs);

const NO_COMMENTS = {
  setAside: undefined,
  claim: undefined,
} as const satisfies QueueComments;

const claimedBy = (by: string, applies: boolean): QueueComments =>
  ({
    setAside: undefined,
    claim: {
      commentId: 1,
      applies,
      says: {
        kind: 'standing',
        claim: { headSha: 'sha-1', by, at: '2026-11-07T00:00:00Z' },
      },
    },
  }) as const;

const state = ({
  labels = [],
  isDraft = false,
  isArmed = false,
}: Readonly<{
  labels?: readonly string[];
  isDraft?: boolean;
  isArmed?: boolean;
}>): ReworkState =>
  ({ number: 3456, nodeId: 'PR_x', labels, isDraft, isArmed }) as const;

/** Answers each read with the next of `pages`, the last one over and over. */
const fakeEvents = (
  pages: readonly (readonly QueueEvent[])[],
): Readonly<{
  read: () => Promise<Result<readonly QueueEvent[], string>>;
  waits: Readonly<{ wait: () => Promise<void>; count: () => number }>;
}> => {
  let mut_reads = 0;

  let mut_waits = 0;

  return {
    read: () => {
      const page = pages[Math.min(mut_reads, pages.length - 1)] ?? [];

      mut_reads += 1;

      return Promise.resolve(Result.ok(page));
    },
    waits: {
      wait: () => {
        mut_waits += 1;

        return Promise.resolve();
      },
      count: () => mut_waits,
    },
  } as const;
};
