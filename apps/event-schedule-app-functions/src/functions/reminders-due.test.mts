import { Arr, asSafeUint, asUint32 } from 'ts-data-forge';
import type { Ymdhm } from 'ts-fortress-types';
import { remindersDue } from './reminders-due.mjs';

/** Every hourly run (UTC, on the hour) of the four days from `from`. */
const hourly = (from: string): readonly number[] =>
  Arr.seq(asUint32(96)).map((i) => Date.parse(from) + i * 3_600_000);

const deadlineAt = (hours: Ymdhm['hours'], minutes: Ymdhm['minutes']): Ymdhm =>
  ({
    year: asSafeUint(2026),
    month: 11,
    date: 10,
    hours,
    minutes,
  }) as const;

const isoString = (millis: number): string => {
  const date = new Date(millis);

  return date.toISOString();
};

/** Each run that sends something, as an ISO string, with what it sends. */
const sent = (
  answerDeadline: Ymdhm,
  timezoneOffsetMinutes: number,
): readonly (readonly [string, readonly number[]])[] =>
  hourly('2026-11-08T00:00:00Z')
    .map(
      (run) =>
        [
          isoString(run),
          remindersDue({
            enabled: allEnabled,
            answerDeadline,
            timezoneOffsetMinutes,
            nowMillis: run,
          }),
        ] as const,
    )
    .filter(([, due]) => Arr.isNonEmpty(due));

const allEnabled = [0, 1, 3, 7, 14, 28] as const;

const utc = 0;

const india = -330;

describe(remindersDue, () => {
  // #3312: the day-of reminder went out at noon even when the deadline was
  // earlier that day.
  test.each([
    {
      name: 'a deadline after noon: the day before and the day at noon',
      deadline: deadlineAt(15, 0),
      offset: utc,
      expected: [
        ['2026-11-09T12:00:00.000Z', [1]],
        ['2026-11-10T12:00:00.000Z', [0]],
      ],
    },
    {
      name: 'a deadline before noon: the day of three hours before it',
      deadline: deadlineAt(9, 0),
      offset: utc,
      expected: [
        ['2026-11-09T12:00:00.000Z', [1]],
        ['2026-11-10T06:00:00.000Z', [0]],
      ],
    },
    {
      name: 'a deadline at noon: the day of three hours before it',
      deadline: deadlineAt(12, 0),
      offset: utc,
      expected: [
        ['2026-11-09T12:00:00.000Z', [1]],
        ['2026-11-10T09:00:00.000Z', [0]],
      ],
    },
    {
      name: 'a deadline early in the day: the day of at its first run',
      deadline: deadlineAt(1, 30),
      offset: utc,
      expected: [
        ['2026-11-09T12:00:00.000Z', [1]],
        ['2026-11-10T00:00:00.000Z', [0]],
      ],
    },
    {
      name: 'a deadline at midnight: no day-of reminder, which no run precedes',
      deadline: deadlineAt(0, 0),
      offset: utc,
      expected: [['2026-11-09T12:00:00.000Z', [1]]],
    },
    {
      // India's runs read hh:30, so the noon run (12:30) is after 12:15.
      name: 'a deadline just after noon in a half-hour zone: before the noon run',
      deadline: deadlineAt(12, 15),
      offset: india,
      expected: [
        ['2026-11-09T07:00:00.000Z', [1]],
        ['2026-11-10T04:00:00.000Z', [0]],
      ],
    },
    {
      name: 'a deadline just after midnight in a half-hour zone: no day-of run precedes it',
      deadline: deadlineAt(0, 15),
      offset: india,
      expected: [['2026-11-09T07:00:00.000Z', [1]]],
    },
  ] as const)('$name', ({ deadline, offset, expected }) => {
    assert.deepStrictEqual(sent(deadline, offset), expected);
  });

  test('sends only the reminders that are enabled', () => {
    assert.deepStrictEqual(
      remindersDue({
        enabled: [1],
        answerDeadline: deadlineAt(15, 0),
        timezoneOffsetMinutes: utc,
        nowMillis: Date.parse('2026-11-10T12:00:00Z'),
      }),
      [],
    );
  });
});
