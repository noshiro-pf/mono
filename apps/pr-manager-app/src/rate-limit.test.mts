import { type ReadonlyRecord } from 'ts-type-forge';
import { isRunningLow, readRateLimit, type RateLimit } from './rate-limit.mjs';

const headers = (entries: ReadonlyRecord<string, string>): Headers =>
  new Headers(entries);

const at = (remaining: number, limit: number): RateLimit => ({
  remaining,
  limit,
  resetEpochMs: 0,
});

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
