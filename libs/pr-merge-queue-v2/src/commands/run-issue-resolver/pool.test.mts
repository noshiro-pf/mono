import { setTimeout as sleep } from 'node:timers/promises';
import { Result } from 'ts-data-forge';
import {
  capForNext,
  pickApart,
  runPool,
  type PoolLimits,
  type PoolSteps,
  type RunError,
  type RunOutcome,
} from './pool.mjs';

type Candidate = Readonly<{ number: number }>;

type Outcome = Result<RunOutcome, RunError>;

/**
 * A session that spent `costUsd`, or an amount its result did not give, and
 * resolved its issue unless told otherwise.
 */
const costing = (
  costUsd: number | undefined,
  resolved: boolean = true,
): Outcome => Result.ok({ spent: true, costUsd, resolved });

const spent: Outcome = costing(1);

const notSpent: Outcome = Result.ok({
  spent: false,
  costUsd: undefined,
  resolved: false,
});

const failed = (fatal: boolean, message: string): Outcome =>
  Result.err({ fatal, message });

const INTERVAL_MS = 60_000;

const limits = (overrides: Partial<PoolLimits>): PoolLimits =>
  ({
    concurrency: 2,
    maxSessions: 10,
    once: false,
    intervalMs: INTERVAL_MS,
    // Far more than any test here spends, unless it says otherwise.
    totalUsd: 1000,
    ...overrides,
  }) as const;

/**
 * Steps over `issues`, the survey offering each until a session on it ends with
 * a result (as the record holds one), and each session ending after `ms` with
 * what `outcome` says for its attempt. A pause taken while nothing runs moves
 * the clock on by what it was asked for, at once, and the pool is asked to stop
 * once `stopAfterPauses` have.
 */
const fakeSteps = (
  issues: readonly number[],
  outcome: (
    number: number,
    attempt: number,
  ) => Readonly<{ ms: number; result: Outcome }>,
  stopAfterPauses: number = Number.POSITIVE_INFINITY,
): Readonly<{ steps: PoolSteps<Candidate>; seen: Seen }> => {
  const mut_started: number[] = [];

  const mut_caps: number[] = [];

  const mut_running = new Set<number>();

  const mut_pauses: number[] = [];

  const mut_logged: string[] = [];

  const mut_counts = { surveys: 0, maxRunning: 0, overlapped: false, now: 0 };

  const mut_settled = new Set<number>();

  const steps: PoolSteps<Candidate> = {
    survey: () => {
      mut_counts.surveys += 1;

      return Promise.resolve(
        Result.ok({
          fresh: issues
            .filter((number) => !mut_settled.has(number))
            .map((number) => ({ number })),
          notes: '',
        }),
      );
    },
    run: async ({ number }, capUsd) => {
      mut_caps.push(capUsd);

      if (mut_running.has(number)) {
        mut_counts.overlapped = true;
      }

      const attempt = mut_started.filter((n) => n === number).length;

      mut_started.push(number);

      mut_running.add(number);

      mut_counts.maxRunning = Math.max(mut_counts.maxRunning, mut_running.size);

      const { ms, result } = outcome(number, attempt);

      await sleep(ms);

      mut_running.delete(number);

      if (Result.isOk(result)) {
        mut_settled.add(number);
      }

      return result;
    },
    pause: async (ms, signal) => {
      // The interval is far longer than any session here: one running ends it.
      if (mut_running.size > 0) {
        await new Promise((resolve) => {
          signal.addEventListener('abort', resolve, { once: true });
        });

        return;
      }

      // A pause a session's end cut short is no pause.
      const ended = await Result.fromPromise(sleep(1, undefined, { signal }));

      if (Result.isErr(ended)) {
        return;
      }

      mut_pauses.push(ms);

      mut_counts.now += ms;
    },
    stopRequested: () => mut_pauses.length >= stopAfterPauses,
    now: () => mut_counts.now,
    log: (message) => {
      mut_logged.push(message);
    },
    apart: undefined,
  } as const;

  return {
    steps,
    seen: {
      started: mut_started,
      caps: mut_caps,
      running: mut_running,
      pauses: mut_pauses,
      logged: mut_logged,
      counts: mut_counts,
    },
  };
};

type Seen = Readonly<{
  started: readonly number[];
  /** What each session started was capped at, in the order they started. */
  caps: readonly number[];
  running: ReadonlySet<number>;
  pauses: readonly number[];
  logged: readonly string[];
  counts: Readonly<{
    surveys: number;
    maxRunning: number;
    overlapped: boolean;
  }>;
}>;

describe(runPool, () => {
  test('runs as many sessions at once as the concurrency allows, never two on one issue', async () => {
    const { steps, seen } = fakeSteps(
      [1, 2, 3, 4, 5],
      () => ({ ms: 10, result: spent }),
      1,
    );

    const result = await runPool(limits({ concurrency: 2 }), steps);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(seen.started, [1, 2, 3, 4, 5]);

    assert.strictEqual(seen.counts.maxRunning, 2);

    assert.isFalse(seen.counts.overlapped);
  });

  test('counts against --max-sessions only the sessions that may have spent', async () => {
    const { steps, seen } = fakeSteps([1, 2, 3, 4], (number) =>
      number === 1 ? { ms: 5, result: notSpent } : { ms: 30, result: spent },
    );

    const result = await runPool(
      limits({ concurrency: 3, maxSessions: 2 }),
      steps,
    );

    assert.isTrue(Result.isOk(result));

    // One at a time until an issue is resolved; #1 spent nothing, so after
    // #2, --max-sessions has room for #3 too.
    assert.deepStrictEqual(seen.started, [1, 2, 3]);

    assert.isTrue(seen.logged.some((line) => line.includes('--max-sessions')));
  });

  test('starts nothing more after a fatal failure, and waits for what is running', async () => {
    const { steps, seen } = fakeSteps([1, 2, 3, 4], (number) =>
      number === 2
        ? { ms: 5, result: failed(true, 'out of credit') }
        : { ms: number === 1 ? 5 : 30, result: spent },
    );

    const result = await runPool(limits({ concurrency: 2 }), steps);

    assert.strictEqual(Result.unwrapErrOr(result, ''), 'out of credit');

    // #1 alone, until an issue is resolved; then #2 and #3 at once.
    assert.deepStrictEqual(seen.started, [1, 2, 3]);

    assert.strictEqual(seen.running.size, 0);
  });

  test('runs one session at a time, capped at a quarter of the total, until an issue is resolved', async () => {
    const { steps, seen } = fakeSteps(
      [1, 2, 3, 4, 5],
      (number) =>
        number === 1
          ? { ms: 5, result: costing(1, false) }
          : { ms: number === 2 ? 5 : 10, result: costing(2) },
      1,
    );

    const result = await runPool(
      limits({ concurrency: 3, totalUsd: 20 }),
      steps,
    );

    assert.isTrue(Result.isOk(result));

    // #1 left its issue, so #2 is the first that says what one costs: $2. A
    // cap is then three times that, out of what is left besides the caps of the
    // ones running: $6, $6, and the $5 left.
    assert.deepStrictEqual(seen.started, [1, 2, 3, 4, 5]);

    assert.deepStrictEqual(seen.caps, [5, 5, 6, 6, 5]);

    assert.strictEqual(seen.counts.maxRunning, 3);

    assert.isTrue(
      seen.logged.some((line) =>
        line.startsWith('Waiting for a session to resolve an issue'),
      ),
    );
  });

  test('stops once what is left is less than an issue has cost on average', async () => {
    const { steps, seen } = fakeSteps([1, 2, 3, 4, 5, 6], () => ({
      ms: 5,
      result: costing(2),
    }));

    const result = await runPool(
      limits({ concurrency: 1, totalUsd: 8 }),
      steps,
    );

    assert.isTrue(Result.isOk(result));

    // $2 for the first; three times the $2 average after, until what is left is
    // the cap; then nothing is left.
    assert.deepStrictEqual(seen.caps, [2, 6, 4, 2]);

    assert.isTrue(
      seen.logged.some(
        (line) =>
          line.startsWith('$8.00 of $8.00 spent') &&
          line.includes('starting no more'),
      ),
    );
  });

  test('stops at a quarter of the total left when no issue is ever resolved', async () => {
    const { steps, seen } = fakeSteps([1, 2, 3, 4, 5], () => ({
      ms: 5,
      result: costing(1, false),
    }));

    const result = await runPool(
      limits({ concurrency: 2, totalUsd: 4 }),
      steps,
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(seen.caps, [1, 1, 1, 1]);

    assert.strictEqual(seen.counts.maxRunning, 1);
  });

  test('counts a run that threw, or a session that gave no cost, as its whole cap', async () => {
    const { steps, seen } = fakeSteps(
      [1, 2, 3],
      (number) => ({
        ms: 5,
        result: costing(number === 2 ? undefined : 1),
      }),
      1,
    );

    const result = await runPool(limits({ concurrency: 1, totalUsd: 8 }), {
      ...steps,
      run: async (candidate, capUsd) => {
        if (candidate.number === 1) {
          throw new Error('ENOSPC');
        }

        return steps.run(candidate, capUsd);
      },
    });

    assert.isTrue(Result.isOk(result));

    // #1's $2 and #2's: #2 resolved its issue, but without a cost, so #3 is
    // still capped as the first is; #1 waits out the interval.
    assert.deepStrictEqual(seen.started, [2, 3]);

    assert.deepStrictEqual(seen.caps, [2, 2]);

    assert.isTrue(
      seen.logged.some((line) => line.startsWith('$5.00 of $8.00 spent')),
    );
  });

  test('starts nothing from a look that a fatal failure overtook', async () => {
    const { steps, seen } = fakeSteps([1, 2, 3, 4], (number) =>
      number === 2
        ? { ms: 30, result: failed(true, 'out of credit') }
        : { ms: 5, result: spent },
    );

    const mut_looks: { count: number; failing: Promise<unknown> } = {
      count: 0,
      failing: Promise.resolve(),
    };

    const result = await runPool(limits({ concurrency: 2 }), {
      ...steps,
      run: async (candidate, capUsd) => {
        const ran = steps.run(candidate, capUsd);

        if (candidate.number === 2) {
          mut_looks.failing = ran;
        }

        return ran;
      },
      // #1 runs alone; #2 and #3 start on the second look. The third, once #3
      // has ended, returns only after #2 has failed and the pool has heard of
      // it (a timer runs after every microtask).
      survey: async () => {
        mut_looks.count += 1;

        if (mut_looks.count > 2) {
          await mut_looks.failing;

          await sleep(1);
        }

        return steps.survey();
      },
    });

    assert.strictEqual(Result.unwrapErrOr(result, ''), 'out of credit');

    assert.deepStrictEqual(seen.started, [1, 2, 3]);
  });

  test('with --once, surveys once, starts what the slots and the budget allow, and waits', async () => {
    const { steps, seen } = fakeSteps([1, 2, 3], () => ({
      ms: 10,
      result: spent,
    }));

    const result = await runPool(limits({ concurrency: 2, once: true }), steps);

    assert.isTrue(Result.isOk(result));

    // No issue resolved yet: one at a time.
    assert.deepStrictEqual(seen.started, [1]);

    assert.strictEqual(seen.counts.surveys, 1);

    assert.strictEqual(seen.running.size, 0);
  });

  test('with --once, returns a failure that is not fatal', async () => {
    const { steps } = fakeSteps([1], () => ({
      ms: 5,
      result: failed(false, 'GitHub answered 502'),
    }));

    const result = await runPool(limits({ concurrency: 2, once: true }), steps);

    assert.strictEqual(Result.unwrapErrOr(result, ''), 'GitHub answered 502');
  });

  test('hands an issue whose start failed on again only after the interval', async () => {
    const { steps, seen } = fakeSteps([1], (_number, attempt) =>
      attempt === 0
        ? { ms: 5, result: failed(false, 'GitHub answered 502') }
        : { ms: 5, result: spent },
    );

    const result = await runPool(
      limits({ concurrency: 1, maxSessions: 1 }),
      steps,
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(seen.started, [1, 1]);

    assert.deepStrictEqual(seen.pauses, [INTERVAL_MS]);

    assert.include(seen.logged, 'GitHub answered 502');

    assert.isTrue(
      seen.logged.some((line) =>
        line.startsWith('#1: failed to start; tried again'),
      ),
    );
  });

  test('waits the interval while there is nothing to start, until asked to stop', async () => {
    const { steps, seen } = fakeSteps([], () => ({ ms: 5, result: spent }), 2);

    const result = await runPool(limits({}), steps);

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(seen.counts.surveys, 2);

    assert.deepStrictEqual(seen.pauses, [INTERVAL_MS, INTERVAL_MS]);

    assert.deepStrictEqual(seen.started, []);
  });

  test('waits out a survey that failed, and stops at one that is fatal', async () => {
    const { steps, seen } = fakeSteps([], () => ({ ms: 5, result: spent }), 1);

    const waited = await runPool(limits({}), {
      ...steps,
      survey: () =>
        Promise.resolve(
          Result.err({ fatal: false, message: 'cannot read the issues' }),
        ),
    });

    assert.isTrue(Result.isOk(waited));

    assert.include(seen.logged, 'cannot read the issues');

    assert.deepStrictEqual(seen.pauses, [INTERVAL_MS]);

    const stopped = await runPool(limits({}), {
      ...steps,
      stopRequested: () => false,
      survey: () =>
        Promise.resolve(
          Result.err({ fatal: true, message: 'cannot read the record' }),
        ),
    });

    assert.strictEqual(
      Result.unwrapErrOr(stopped, ''),
      'cannot read the record',
    );
  });
});

describe(capForNext, () => {
  const budget = {
    totalUsd: 100,
    spentUsd: 0,
    heldUsd: 0,
    running: 0,
    resolvedCosts: [2],
  } as const;

  test('starts at three times the average, or at what is left if less', () => {
    assert.deepStrictEqual(capForNext(budget), { kind: 'start', capUsd: 6 });

    assert.deepStrictEqual(capForNext({ ...budget, spentUsd: 97 }), {
      kind: 'start',
      capUsd: 3,
    });

    // Exactly the average left still fits.
    assert.deepStrictEqual(capForNext({ ...budget, spentUsd: 98 }), {
      kind: 'start',
      capUsd: 2,
    });
  });

  test('starts nothing on less than the average, or past the total', () => {
    assert.deepStrictEqual(capForNext({ ...budget, spentUsd: 98.5 }), {
      kind: 'short',
    });

    assert.deepStrictEqual(capForNext({ ...budget, spentUsd: 101 }), {
      kind: 'short',
    });
  });

  test('never caps below the dearest issue resolved so far', () => {
    assert.deepStrictEqual(
      capForNext({ ...budget, resolvedCosts: [0.1, 0.1, 0.1, 0.1, 5] }),
      { kind: 'start', capUsd: 5 },
    );
  });

  test('before any is resolved, one at a time at a quarter of the total', () => {
    assert.deepStrictEqual(capForNext({ ...budget, resolvedCosts: [] }), {
      kind: 'start',
      capUsd: 25,
    });

    assert.deepStrictEqual(
      capForNext({ ...budget, resolvedCosts: [], running: 1, heldUsd: 25 }),
      { kind: 'first' },
    );

    assert.deepStrictEqual(
      capForNext({ ...budget, resolvedCosts: [], spentUsd: 80 }),
      { kind: 'short' },
    );
  });
});

describe(pickApart, () => {
  test('takes the first slots when nothing keeps them apart', () => {
    assert.deepStrictEqual(pickApart([1, 2, 3], 2, undefined), [1, 2]);
  });

  test('passes over one apart refuses, and takes the next', () => {
    assert.deepStrictEqual(pickApart([1, 3, 2, 4, 5], 2, otherParity), [1, 2]);
  });
});

/** Apart when no number taken has the same parity. */
const otherParity = (taken: readonly number[], next: number): boolean =>
  taken.every((each) => each % 2 !== next % 2);
