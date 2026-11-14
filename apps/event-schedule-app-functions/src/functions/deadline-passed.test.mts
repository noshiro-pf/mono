// cspell:ignore unstub
import { asSafeUint } from 'ts-data-forge';
import type { Ymdhm } from 'ts-fortress-types';
import { deadlinePassedWithin } from './deadline-passed.mjs';

const deadlinePassed = (
  answerDeadline: Ymdhm,
  timezoneOffsetMinutes: number,
  lookbackMillis: number,
  nowMillis: number,
): boolean =>
  deadlinePassedWithin(
    answerDeadline,
    timezoneOffsetMinutes,
    lookbackMillis,
    nowMillis,
  ) !== undefined;

describe(deadlinePassedWithin, () => {
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

  const window = 10 * 60_000;

  test("is true in the window after the deadline in the event's own zone", () => {
    // The functions run in UTC, but the deadline is not read as Tokyo's 18:00
    // (09:00 UTC), 14 hours early.
    vi.stubEnv('TZ', 'UTC');

    onTestFinished(() => {
      vi.unstubAllEnvs();
    });

    assert.isFalse(
      deadlinePassed(
        deadline,
        newYork,
        window,
        Date.parse('2026-11-01T09:05:00Z'),
      ),
    );

    assert.isFalse(
      deadlinePassed(
        deadline,
        newYork,
        window,
        Date.parse('2026-11-01T22:59:00Z'),
      ),
    );

    assert.isTrue(
      deadlinePassed(
        deadline,
        newYork,
        window,
        Date.parse('2026-11-01T23:05:00Z'),
      ),
    );

    assert.isFalse(
      deadlinePassed(
        deadline,
        newYork,
        window,
        Date.parse('2026-11-01T23:11:00Z'),
      ),
    );
  });

  // The window is half-open: it holds a deadline at `nowMillis` itself, and not
  // one a full window before it.
  test('is true at the deadline itself', () => {
    assert.isTrue(
      deadlinePassed(
        deadline,
        newYork,
        window,
        Date.parse('2026-11-01T23:00:00Z'),
      ),
    );
  });

  test('is true up to just before a full window after the deadline', () => {
    assert.isTrue(
      deadlinePassed(
        deadline,
        newYork,
        window,
        Date.parse('2026-11-01T23:09:59.999Z'),
      ),
    );
  });

  test('is false a full window after the deadline', () => {
    assert.isFalse(
      deadlinePassed(
        deadline,
        newYork,
        window,
        Date.parse('2026-11-01T23:10:00Z'),
      ),
    );
  });

  test('gives the instant of the deadline', () => {
    assert.strictEqual(
      deadlinePassedWithin(
        deadline,
        newYork,
        window,
        Date.parse('2026-11-01T23:05:00Z'),
      ),
      Date.parse('2026-11-01T23:00:00Z'),
    );
  });

  test('windows one after another share no deadline', () => {
    // Windows ending at 17:50, 18:00 and 18:10 New York time, the deadline at
    // 18:00.
    const runs = [
      '2026-11-01T22:50:00Z',
      '2026-11-01T23:00:00Z',
      '2026-11-01T23:10:00Z',
    ] as const;

    assert.deepStrictEqual(
      runs.map((run) =>
        deadlinePassed(deadline, newYork, window, Date.parse(run)),
      ),
      [false, true, false],
    );
  });
});
