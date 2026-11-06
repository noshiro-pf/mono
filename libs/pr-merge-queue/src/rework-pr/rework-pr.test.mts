import { MERGE_QUEUED_LABEL, SKIP_CI_LABEL } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import {
  applyRework,
  doneSteps,
  isUntouchedSince,
  parseReworkArgs,
  readOwnDequeueEvent,
  startSteps,
  type QueueEvent,
  type QueueRecord,
  type ReworkArgs,
  type ReworkHandBack,
  type ReworkIo,
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
      ),
      Result.ok(['push', 'ready']),
    );
  });

  test('pushes alone when it could not be made a draft', () => {
    assert.deepStrictEqual(
      doneSteps(state({ labels: [SKIP_CI_LABEL] }), 'review', 'none'),
      Result.ok(['push']),
    );
  });

  test('requeue: puts merge-queued back last, when start took it off', () => {
    assert.deepStrictEqual(
      doneSteps(
        state({ labels: [SKIP_CI_LABEL], isDraft: true }),
        'requeue',
        'untouched',
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
        ),
      ),
    );

    assert.isTrue(
      Result.isErr(
        doneSteps(
          state({ labels: [SKIP_CI_LABEL], isDraft: true, isArmed: true }),
          'review',
          'none',
        ),
      ),
    );

    assert.isTrue(
      Result.isErr(doneSteps(state({ isDraft: true }), 'review', 'none')),
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
    const { io, ran } = fakeIo(
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

/**
 * Answers each read with the next of `reads`, fails `failing`, and answers
 * `record` for what `start` wrote down.
 */
const fakeIo = (
  reads: readonly (ReworkState | undefined)[],
  failing?: ReworkStep,
  record: QueueRecord | Result<QueueRecord, string> = 'none',
): Readonly<{ io: ReworkIo; ran: readonly ReworkStep[] }> => {
  const mut_ran: ReworkStep[] = [];

  let mut_reads = 0;

  const io: ReworkIo = {
    read: () => {
      const read = reads[mut_reads];

      mut_reads += 1;

      return Promise.resolve(Result.ok(read));
    },
    run: (_, step) => {
      mut_ran.push(step);

      return Promise.resolve(
        step === failing ? Result.err('refused') : Result.ok(undefined),
      );
    },
    queueRecord: () =>
      Promise.resolve(typeof record === 'string' ? Result.ok(record) : record),
    log: () => {},
  } as const;

  return { io, ran: mut_ran } as const;
};

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
