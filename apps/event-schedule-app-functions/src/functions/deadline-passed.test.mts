// cspell:ignore unstub
import { asSafeUint } from 'ts-data-forge';
import { deadlinePassed } from './deadline-passed.mjs';

describe(deadlinePassed, () => {
  // An event made in New York (`getTimezoneOffset` 300), deadline 18:00 there,
  // which is 23:00 UTC.
  const deadline = {
    year: asSafeUint(2026),
    month: 11,
    date: 1,
    hours: 18,
    minutes: 0,
  } as const;

  const newYork = 300;

  test("is true in the window after the deadline in the event's own zone", () => {
    // The functions run in UTC, but the deadline is not read as Tokyo's 18:00
    // (09:00 UTC), 14 hours early.
    vi.stubEnv('TZ', 'UTC');

    onTestFinished(() => {
      vi.unstubAllEnvs();
    });

    assert.isFalse(
      deadlinePassed(deadline, newYork, 10, Date.parse('2026-11-01T09:05:00Z')),
    );

    assert.isFalse(
      deadlinePassed(deadline, newYork, 10, Date.parse('2026-11-01T22:59:00Z')),
    );

    assert.isTrue(
      deadlinePassed(deadline, newYork, 10, Date.parse('2026-11-01T23:05:00Z')),
    );

    assert.isFalse(
      deadlinePassed(deadline, newYork, 10, Date.parse('2026-11-01T23:11:00Z')),
    );
  });
});
