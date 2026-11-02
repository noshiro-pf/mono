import { setTimeout as sleep } from 'node:timers/promises';
import { Result } from 'ts-data-forge';
import {
  runPool,
  type PoolLimits,
  type PoolSteps,
  type RunError,
} from './pool.mjs';

type Candidate = Readonly<{ number: number }>;

type Outcome = Result<Readonly<{ spent: boolean }>, RunError>;

const spent: Outcome = Result.ok({ spent: true });

const notSpent: Outcome = Result.ok({ spent: false });

const failed = (fatal: boolean, message: string): Outcome =>
  Result.err({ fatal, message });

const INTERVAL_MS = 60_000;

const limits = (overrides: Partial<PoolLimits>): PoolLimits =>
  ({
    concurrency: 2,
    maxSessions: 10,
    once: false,
    intervalMs: INTERVAL_MS,
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
    run: async ({ number }) => {
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

      await sleep(1);

      mut_pauses.push(ms);

      mut_counts.now += ms;
    },
    stopRequested: () => mut_pauses.length >= stopAfterPauses,
    now: () => mut_counts.now,
    log: (message) => {
      mut_logged.push(message);
    },
  } as const;

  return {
    steps,
    seen: {
      started: mut_started,
      running: mut_running,
      pauses: mut_pauses,
      logged: mut_logged,
      counts: mut_counts,
    },
  };
};

type Seen = Readonly<{
  started: readonly number[];
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

    // Two at first, as many as --max-sessions; #1 spent nothing, so #3 too.
    assert.deepStrictEqual(seen.started, [1, 2, 3]);

    assert.isTrue(seen.logged.some((line) => line.includes('--max-sessions')));
  });

  test('starts nothing more after a fatal failure, and waits for what is running', async () => {
    const { steps, seen } = fakeSteps([1, 2, 3], (number) =>
      number === 1
        ? { ms: 5, result: failed(true, 'out of credit') }
        : { ms: 30, result: spent },
    );

    const result = await runPool(limits({ concurrency: 2 }), steps);

    assert.strictEqual(Result.unwrapErrOr(result, ''), 'out of credit');

    assert.deepStrictEqual(seen.started, [1, 2]);

    assert.strictEqual(seen.running.size, 0);
  });

  test('starts nothing from a look that a fatal failure overtook', async () => {
    const { steps, seen } = fakeSteps([1, 2, 3], (number) =>
      number === 1
        ? { ms: 5, result: spent }
        : { ms: 30, result: failed(true, 'out of credit') },
    );

    const mut_looks: { count: number; failing: Promise<unknown> } = {
      count: 0,
      failing: Promise.resolve(),
    };

    const result = await runPool(limits({ concurrency: 2 }), {
      ...steps,
      run: async (candidate) => {
        const ran = steps.run(candidate);

        if (candidate.number === 2) {
          mut_looks.failing = ran;
        }

        return ran;
      },
      // The second look, once #1 has ended, returns only after #2 has failed
      // and the pool has heard of it (a timer runs after every microtask).
      survey: async () => {
        mut_looks.count += 1;

        if (mut_looks.count > 1) {
          await mut_looks.failing;

          await sleep(1);
        }

        return steps.survey();
      },
    });

    assert.strictEqual(Result.unwrapErrOr(result, ''), 'out of credit');

    assert.deepStrictEqual(seen.started, [1, 2]);
  });

  test('with --once, surveys once, fills every slot, and waits for them', async () => {
    const { steps, seen } = fakeSteps([1, 2, 3], () => ({
      ms: 10,
      result: spent,
    }));

    const result = await runPool(limits({ concurrency: 2, once: true }), steps);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(seen.started, [1, 2]);

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
