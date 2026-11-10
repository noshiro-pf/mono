import {
  delayOnShow,
  nextPollInterval,
  nextPollIntervalOver,
  POLL,
  type BudgetSample,
} from './poll.mjs';

const sample = (remaining: number, resetAtMs = 1): BudgetSample =>
  ({
    rateLimit: { remaining, limit: 5000, resetAtMs },
  }) as const;

describe(nextPollInterval, () => {
  test('stays as it was without two samples of one window', () => {
    assert.strictEqual(nextPollInterval(20_000, undefined, sample(10)), 20_000);

    assert.strictEqual(
      nextPollInterval(20_000, sample(100), sample(10, 2)),
      20_000,
    );
  });

  test('reads every 15 seconds while a read costs 5 points or fewer', () => {
    assert.strictEqual(
      nextPollInterval(15_000, sample(5000), sample(4995)),
      POLL.minMs,
    );
  });

  test('spaces out a costlier read to a quarter of the budget, in 5 s steps', () => {
    // 9 points a read every 15 s is 2,160 an hour; 1,250 allowed: 25.92 s → 30 s.
    assert.strictEqual(
      nextPollInterval(15_000, sample(5000), sample(4991)),
      30_000,
    );
  });

  test('counts a read asked early (Refresh) as one read, not as a rate', () => {
    // 9 points two seconds after the last read: still one read of 9 points.
    assert.strictEqual(
      nextPollInterval(15_000, sample(5000), sample(4991)),
      30_000,
    );
  });

  test('slows down a read that takes longer than the interval', () => {
    // 50 points a read, 20 s a read: 50 × 3600 / 1250 = 144 s → 145 s.
    assert.strictEqual(
      nextPollInterval(15_000, sample(5000), sample(4950)),
      145_000,
    );
  });

  test('never waits more than 5 minutes', () => {
    assert.strictEqual(
      nextPollInterval(15_000, sample(5000), sample(3000)),
      POLL.maxMs,
    );
  });
});

describe(nextPollIntervalOver, () => {
  test('takes the longest interval any budget asks for', () => {
    assert.strictEqual(
      nextPollIntervalOver(
        15_000,
        new Map<string, BudgetSample>([
          ['graphql', sample(5000)],
          ['core', sample(5000)],
        ]),
        new Map<string, BudgetSample>([
          ['graphql', sample(4995)],
          ['core', sample(4950)],
        ]),
      ),
      // 50 points a read at a quarter of 5,000 an hour: 144 s, stepped.
      145_000,
    );
  });

  test('stays as it was when no budget has two samples of one window', () => {
    assert.strictEqual(
      nextPollIntervalOver(
        20_000,
        new Map<string, BudgetSample>(),
        new Map<string, BudgetSample>([['graphql', sample(4900)]]),
      ),
      20_000,
    );
  });
});

describe(delayOnShow, () => {
  test('reads at once once an interval has passed, else waits the rest', () => {
    assert.strictEqual(delayOnShow(15_000, undefined, 100), 0);

    assert.strictEqual(delayOnShow(15_000, 0, 20_000), 0);

    assert.strictEqual(delayOnShow(15_000, 0, 5000), 10_000);
  });
});
