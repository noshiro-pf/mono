import { MERGE_QUEUED_LABEL, SKIP_CI_LABEL } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import {
  applyRework,
  doneSteps,
  parseReworkArgs,
  startSteps,
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
      parseReworkArgs(['--', 'done', '--dry-run']),
      Result.ok({ phase: 'done', dryRun: true }),
    );
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
      doneSteps(state({ labels: [SKIP_CI_LABEL], isDraft: true })),
      Result.ok(['push', 'ready']),
    );
  });

  test('pushes alone when it could not be made a draft', () => {
    assert.deepStrictEqual(
      doneSteps(state({ labels: [SKIP_CI_LABEL] })),
      Result.ok(['push']),
    );
  });

  test('refuses what is still queued, armed or running its checks', () => {
    assert.isTrue(
      Result.isErr(
        doneSteps(
          state({ labels: [SKIP_CI_LABEL, MERGE_QUEUED_LABEL], isDraft: true }),
        ),
      ),
    );

    assert.isTrue(
      Result.isErr(
        doneSteps(
          state({ labels: [SKIP_CI_LABEL], isDraft: true, isArmed: true }),
        ),
      ),
    );

    assert.isTrue(Result.isErr(doneSteps(state({ isDraft: true }))));
  });
});

describe(applyRework, () => {
  test('start: reads again after the labels, and disarms what the worker armed meanwhile', async () => {
    const { io, ran } = fakeIo([
      state({ labels: [SKIP_CI_LABEL, MERGE_QUEUED_LABEL] }),
      state({ labels: [SKIP_CI_LABEL], isArmed: true }),
    ]);

    assert.deepStrictEqual(await applyRework('start', io), Result.ok(3456));

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

    assert.isTrue(Result.isErr(await applyRework('start', io)));

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

    assert.deepStrictEqual(await applyRework('start', io), Result.ok(3456));

    assert.deepStrictEqual(ran, ['hold', 'dequeue', 'draft']);
  });

  test('start: reads once when no label changes', async () => {
    const { io, ran } = fakeIo([state({ labels: [SKIP_CI_LABEL] })]);

    assert.deepStrictEqual(await applyRework('start', io), Result.ok(3456));

    assert.deepStrictEqual(ran, ['draft']);
  });

  test('start: says so when the pull request is gone by the second read', async () => {
    const { io, ran } = fakeIo([
      state({ labels: [SKIP_CI_LABEL, MERGE_QUEUED_LABEL] }),
      undefined,
    ]);

    const applied = await applyRework('start', io);

    assert.isTrue(Result.isErr(applied));

    assert.include(
      Result.isErr(applied) ? applied.value : '',
      'no longer open',
    );

    assert.deepStrictEqual(ran, ['dequeue']);
  });

  test('done: touches nothing on a pull request that is not held', async () => {
    const { io, ran } = fakeIo([
      state({ labels: [SKIP_CI_LABEL], isDraft: true, isArmed: true }),
    ]);

    assert.isTrue(Result.isErr(await applyRework('done', io)));

    assert.deepStrictEqual(ran, []);
  });

  test('done: pushes, then marks it ready', async () => {
    const { io, ran } = fakeIo([
      state({ labels: [SKIP_CI_LABEL], isDraft: true }),
    ]);

    assert.deepStrictEqual(await applyRework('done', io), Result.ok(3456));

    assert.deepStrictEqual(ran, ['push', 'ready']);
  });

  test('either: refuses a branch with no open pull request', async () => {
    const { io } = fakeIo([undefined]);

    assert.isTrue(Result.isErr(await applyRework('start', io)));
  });
});

/** Answers each read with the next of `reads`, and fails `failing`. */
const fakeIo = (
  reads: readonly (ReworkState | undefined)[],
  failing?: ReworkStep,
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
