import type { ReadonlyRecord } from 'ts-type-forge';
import { POLL_INTERVAL_MS } from './constants.mjs';
import {
  isRunningLow,
  MAX_POLL_INTERVAL_MS,
  pollIntervalFor,
  readRateLimit,
  type RateLimit,
} from './rate-limit.mjs';

const headers = (entries: ReadonlyRecord<string, string>): Headers =>
  new Headers(entries);

const at = (remaining: number, limit: number): RateLimit =>
  ({
    remaining,
    limit,
    resetEpochMs: 0,
  }) as const;

describe(readRateLimit, () => {
  test('reads the three headers GitHub sends, with the reset in milliseconds', () => {
    assert.deepStrictEqual(
      readRateLimit(
        headers({
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '4827',
          'x-ratelimit-reset': '1758387338',
        }),
      ),
      {
        limit: 5000,
        remaining: 4827,
        // Seconds on the wire, milliseconds everywhere in this app, which is
        // the unit the page's own clock is in.
        resetEpochMs: 1_758_387_338_000,
      },
    );
  });

  test('reads a spent budget rather than mistaking zero for nothing', () => {
    const rateLimit = readRateLimit(
      headers({
        'x-ratelimit-limit': '60',
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': '1758387338',
      }),
    );

    expect(rateLimit?.remaining).toBe(0);
  });

  test('says nothing when the answer said nothing', () => {
    expect(readRateLimit(headers({}))).toBeUndefined();
  });

  // A partial answer is not a budget, and half of one would be shown as a
  // number a reader could act on.
  test('says nothing when only some of the three are there', () => {
    expect(
      readRateLimit(headers({ 'x-ratelimit-remaining': '57' })),
    ).toBeUndefined();
  });

  test('says nothing rather than NaN for a header that is not a number', () => {
    expect(
      readRateLimit(
        headers({
          'x-ratelimit-limit': 'lots',
          'x-ratelimit-remaining': '57',
          'x-ratelimit-reset': '1758387338',
        }),
      ),
    ).toBeUndefined();
  });
});

describe(isRunningLow, () => {
  // A fraction rather than a count, so that the same test reads correctly for
  // both windows.
  test('is a fraction of the window, not a fixed number of requests', () => {
    assert.isTrue(isRunningLow(at(15, 60)));

    assert.isFalse(isRunningLow(at(16, 60)));

    // The same 15 requests left, against the authenticated window.
    assert.isTrue(isRunningLow(at(1250, 5000)));

    assert.isFalse(isRunningLow(at(1251, 5000)));
  });

  test('is true of a budget that is gone', () => {
    assert.isTrue(isRunningLow(at(0, 60)));
  });
});

describe(pollIntervalFor, () => {
  test('stays at fifteen seconds while a read costs what one costs here', () => {
    // 9 points in 15 seconds is 2,160 an hour, within half of 5,000.
    assert.strictEqual(
      pollIntervalFor({
        intervalMs: POLL_INTERVAL_MS,
        previous: sample(4000, 0),
        current: sample(3991, 15_000),
      }),
      POLL_INTERVAL_MS,
    );
  });

  test('reads less often where a read costs more, to spend half the budget', () => {
    // 30 points every 15 seconds is 7,200 an hour; half of 5,000 is 2,500,
    // which 30 points a read reaches at one read every 43.2 seconds.
    assert.strictEqual(
      pollIntervalFor({
        intervalMs: POLL_INTERVAL_MS,
        previous: sample(4000, 0),
        current: sample(3970, 15_000),
      }),
      45_000,
    );
  });

  test('comes back once reads cost less again', () => {
    assert.strictEqual(
      pollIntervalFor({
        intervalMs: 45_000,
        previous: sample(4000, 0),
        current: sample(3991, 45_000),
      }),
      POLL_INTERVAL_MS,
    );
  });

  test('never waits longer than five minutes', () => {
    assert.strictEqual(
      pollIntervalFor({
        intervalMs: POLL_INTERVAL_MS,
        previous: sample(4000, 0),
        current: sample(1000, 15_000),
      }),
      MAX_POLL_INTERVAL_MS,
    );
  });

  test('keeps the interval it has when the two say nothing about the cost', () => {
    for (const [previous, current] of [
      [undefined, sample(3991, 15_000)],
      // A new window began between them.
      [sample(10, 0, 1), sample(4990, 15_000, 2)],
      [sample(4000, 15_000), sample(3990, 15_000)],
    ] as const) {
      assert.strictEqual(
        pollIntervalFor({ intervalMs: 30_000, previous, current }),
        30_000,
      );
    }
  });
});

const sample = (remaining: number, atMs: number, resetEpochMs = 0) =>
  ({
    rateLimit: { remaining, limit: 5000, resetEpochMs },
    atMs,
  }) as const;
