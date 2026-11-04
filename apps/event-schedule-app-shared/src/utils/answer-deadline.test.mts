// cspell:ignore unstub
import { asSafeUint } from 'ts-data-forge';
import type { Ymdhm } from 'ts-fortress-types';
import {
  answerDeadlineMillis,
  isAfterAnswerDeadline,
  utcMidnightMillis,
  wallClockInOffset,
} from './answer-deadline.mjs';

// `Date#getTimezoneOffset` values: UTC minus local time, in minutes.
const tokyo = -540;

const newYork = 300;

const deadline = {
  year: asSafeUint(2026),
  month: 11,
  date: 1,
  hours: 18,
  minutes: 0,
} as const;

const pad2 = (n: number): string => n.toString().padStart(2, '0');

/**
 * `isBeforeDeadline` in `apps/event-schedule-app/firestore.rules`, transcribed
 * apart from the code under test: `timestamp.date(y, m, d)` is UTC midnight of
 * that date, and the time and the offset are added in minutes.
 */
const rulesDeadlineMillis = (ymdhm: Ymdhm, offset: number): number =>
  Date.parse(
    `${ymdhm.year}-${pad2(ymdhm.month)}-${pad2(ymdhm.date)}T00:00:00Z`,
  ) +
  (ymdhm.hours * 60 + ymdhm.minutes + offset) * 60_000;

const event = (
  offset: number,
): Readonly<{ answerDeadline: Ymdhm; timezoneOffsetMinutes: number }> =>
  ({ answerDeadline: deadline, timezoneOffsetMinutes: offset }) as const;

describe(answerDeadlineMillis, () => {
  test.each([
    ['Tokyo', tokyo, '2026-11-01T09:00:00Z'],
    ['New York', newYork, '2026-11-01T23:00:00Z'],
    ['UTC', 0, '2026-11-01T18:00:00Z'],
  ] as const)(
    "reads the deadline in the event's own zone (%s), as the rules do",
    (_, offset, instant) => {
      assert.strictEqual(
        answerDeadlineMillis(deadline, offset),
        Date.parse(instant),
      );

      assert.strictEqual(
        answerDeadlineMillis(deadline, offset),
        rulesDeadlineMillis(deadline, offset),
      );
    },
  );
});

describe(isAfterAnswerDeadline, () => {
  test('closes at the deadline, exactly when the rules start refusing', () => {
    const closing = rulesDeadlineMillis(deadline, newYork);

    assert.isFalse(isAfterAnswerDeadline(event(newYork), closing - 1));

    assert.isTrue(isAfterAnswerDeadline(event(newYork), closing));
  });

  test('does not depend on the zone it runs in', () => {
    vi.stubEnv('TZ', 'Europe/London');

    onTestFinished(() => {
      vi.unstubAllEnvs();
    });

    // The zone took effect: London is on UTC in November.
    const tenUtc = new Date('2026-11-01T10:00:00Z');

    assert.strictEqual(tenUtc.getHours(), 10);

    // #2862: an event made in Tokyo, deadline 18:00 (09:00 UTC), viewed from
    // London at 10:00 UTC, is closed although 10:00 is before 18:00 there.
    assert.isTrue(
      isAfterAnswerDeadline(event(tokyo), Date.parse('2026-11-01T10:00:00Z')),
    );
  });

  test('never closes an event without a deadline', () => {
    assert.isFalse(
      isAfterAnswerDeadline(
        { answerDeadline: 'none', timezoneOffsetMinutes: tokyo },
        Number.MAX_SAFE_INTEGER,
      ),
    );
  });
});

describe(wallClockInOffset, () => {
  test('is the clock of the given zone, whatever zone this runs in', () => {
    vi.stubEnv('TZ', 'Asia/Tokyo');

    onTestFinished(() => {
      vi.unstubAllEnvs();
    });

    const instant = Date.parse('2026-11-01T03:30:00Z');

    assert.deepStrictEqual(wallClockInOffset(instant, newYork), {
      year: 2026,
      month: 10,
      date: 31,
      hours: 22,
      minutes: 30,
    });

    assert.deepStrictEqual(wallClockInOffset(instant, tokyo), {
      year: 2026,
      month: 11,
      date: 1,
      hours: 12,
      minutes: 30,
    });
  });

  test('is the inverse of answerDeadlineMillis', () => {
    assert.deepStrictEqual(
      wallClockInOffset(answerDeadlineMillis(deadline, newYork), newYork),
      deadline,
    );
  });
});

describe(utcMidnightMillis, () => {
  test('is midnight UTC of the date, with the month 1-12', () => {
    vi.stubEnv('TZ', 'America/New_York');

    onTestFinished(() => {
      vi.unstubAllEnvs();
    });

    assert.strictEqual(
      utcMidnightMillis(deadline),
      Date.parse('2026-11-01T00:00:00Z'),
    );
  });
});
