import { Optional } from 'ts-data-forge';
import { localNoon, parseInteger } from '../internal/index.mjs';

/**
 * A date and a time of day to the minute, as a wall clock shows them: no time
 * zone, no seconds. `month` is 1 to 12, as written, not `Date`'s 0 to 11.
 *
 * What the pickers hold. Their values are the strings of `<input type="date">`
 * and `<input type="datetime-local">` (`YYYY-MM-DD`, `YYYY-MM-DDTHH:mm`), which
 * {@link parseWallClock} reads and {@link toDateValue} and
 * {@link toDateTimeValue} write.
 */
export type WallClock = Readonly<{
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}>;

/**
 * Reads `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm` (seconds, if any, are dropped), and
 * nothing for anything else, a day that the month does not have included. A
 * date alone is at 00:00.
 */
export const parseWallClock = (value: string): Optional<WallClock> => {
  const matched = DATE_TIME_PATTERN.exec(value) ?? DATE_PATTERN.exec(value);

  if (
    matched === null ||
    !SECONDS_PATTERN.test(value.slice(matched[0].length))
  ) {
    return Optional.none;
  }

  const [, year = '', month = '', day = '', hour = '0', minute = '0'] = matched;

  return wallClockFromParts({
    year: parseInteger(year),
    month: parseInteger(month),
    day: parseInteger(day),
    hour: parseInteger(hour),
    minute: parseInteger(minute),
  });
};

/**
 * `parts` as a {@link WallClock} when every field is in range, the day within
 * its month.
 */
export const wallClockFromParts = (parts: WallClock): Optional<WallClock> =>
  isIntegerIn(parts.year, 1, 9999) &&
  isIntegerIn(parts.month, 1, 12) &&
  isIntegerIn(parts.day, 1, daysInMonth(parts.year, parts.month)) &&
  isIntegerIn(parts.hour, 0, 23) &&
  isIntegerIn(parts.minute, 0, 59)
    ? Optional.some(parts)
    : Optional.none;

/** `YYYY-MM-DD`, the value of `<input type="date">`. */
export const toDateValue = ({ year, month, day }: WallClock): string =>
  `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}` as const;

/** `YYYY-MM-DDTHH:mm`, the value of `<input type="datetime-local">`. */
export const toDateTimeValue = (clock: WallClock): string =>
  `${toDateValue(clock)}T${pad(clock.hour, 2)}:${pad(clock.minute, 2)}` as const;

/** The local wall clock at `date`, to the minute. */
export const wallClockOf = (date: Readonly<Date>): WallClock =>
  ({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
  }) as const;

/** The local wall clock now, to the minute. */
export const now = (): WallClock => wallClockOf(new Date());

/** The number of days in `month` (1 to 12) of `year`. */
export const daysInMonth = (year: number, month: number): number =>
  // Day 0 of the next month is the last day of this one.
  localNoon(year, month + 1, 0).getDate();

/**
 * `clock` moved by `days` days, the time kept. Counted on the calendar, so a
 * change to or from daylight saving time moves nothing.
 */
export const addDays = (clock: WallClock, days: number): WallClock => {
  const moved = localNoon(clock.year, clock.month, clock.day + days);

  return {
    ...clock,
    year: moved.getFullYear(),
    month: moved.getMonth() + 1,
    day: moved.getDate(),
  };
};

/**
 * `clock` moved by `months` months, the day kept where the month has it and
 * otherwise the month's last, the time kept.
 */
export const addMonths = (clock: WallClock, months: number): WallClock => {
  const { year, month } = monthOfIndex(monthIndexOf(clock) + months);

  return {
    ...clock,
    year,
    month,
    day: Math.min(clock.day, daysInMonth(year, month)),
  };
};

/**
 * The month of `clock` as one number, `year * 12 + month - 1`: months compare
 * and subtract as numbers do.
 */
export const monthIndexOf = ({
  year,
  month,
}: Readonly<{ year: number; month: number }>): number => year * 12 + month - 1;

/** The year and month (1 to 12) of a {@link monthIndexOf}. */
export const monthOfIndex = (
  index: number,
): Readonly<{ year: number; month: number }> => {
  const year = Math.floor(index / 12);

  return { year, month: index - year * 12 + 1 };
};

/** Negative, zero or positive as the day of `a` is before, on or after `b`'s. */
export const compareDays = (a: WallClock, b: WallClock): number =>
  a.year === b.year
    ? a.month === b.month
      ? a.day - b.day
      : a.month - b.month
    : a.year - b.year;

/** Whether `a` and `b` are on the same day. */
export const isSameDay = (a: WallClock, b: WallClock): boolean =>
  compareDays(a, b) === 0;

/** Whether the day of `clock` is from `min`'s to `max`'s, both included. */
export const isDayInRange = (
  clock: WallClock,
  min: WallClock,
  max: WallClock,
): boolean => compareDays(clock, min) >= 0 && compareDays(clock, max) <= 0;

/**
 * The day of `clock` moved into the days from `min`'s to `max`'s, the time
 * kept.
 */
export const clampDay = (
  clock: WallClock,
  min: WallClock,
  max: WallClock,
): WallClock =>
  compareDays(clock, min) < 0
    ? withDayOf(clock, min)
    : compareDays(clock, max) > 0
      ? withDayOf(clock, max)
      : clock;

/** The day of `day` at the time of `time`. */
export const withDayOf = (time: WallClock, day: WallClock): WallClock =>
  ({
    ...time,
    year: day.year,
    month: day.month,
    day: day.day,
  }) as const;

/** The day of the week of `clock`, 0 for Sunday to 6 for Saturday. */
export const dayOfWeek = ({ year, month, day }: WallClock): number =>
  localNoon(year, month, day).getDay();

/**
 * The weeks a month is drawn in, from the week of its first day to the week of
 * its last, each seven days from `weekStartsOn` (0 for Sunday), the days of the
 * months before and after included, all at 00:00. Four to six weeks, as the
 * month needs.
 */
export const monthWeeks = (
  year: number,
  month: number,
  weekStartsOn: number,
): readonly (readonly WallClock[])[] => {
  const first: WallClock = { year, month, day: 1, hour: 0, minute: 0 } as const;

  const daysBefore = (dayOfWeek(first) - weekStartsOn + 7) % 7;

  const start = addDays(first, -daysBefore);

  const weekCount = Math.ceil((daysBefore + daysInMonth(year, month)) / 7);

  return Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: 7 }, (__, weekday) =>
      addDays(start, week * 7 + weekday),
    ),
  );
};

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u;

const DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/u;

/** What may follow the minutes: nothing, or the seconds. */
const SECONDS_PATTERN = /^$|^:\d{2}$|^:\d{2}\.\d{1,3}$/u;

const isIntegerIn = (value: number, min: number, max: number): boolean =>
  Number.isSafeInteger(value) && min <= value && value <= max;

const pad = (value: number, width: number): string =>
  value.toString().padStart(width, '0');

if (import.meta.vitest !== undefined) {
  describe(parseWallClock, () => {
    test('reads a date and time', () => {
      assert.deepStrictEqual(
        parseWallClock('2026-10-23T14:05'),
        Optional.some({ year: 2026, month: 10, day: 23, hour: 14, minute: 5 }),
      );
    });

    test('reads a date alone as 00:00', () => {
      assert.deepStrictEqual(
        parseWallClock('2024-02-29'),
        Optional.some({ year: 2024, month: 2, day: 29, hour: 0, minute: 0 }),
      );
    });

    test('drops the seconds', () => {
      assert.deepStrictEqual(
        parseWallClock('2026-10-23T14:05:59.123'),
        Optional.some({ year: 2026, month: 10, day: 23, hour: 14, minute: 5 }),
      );
    });

    test.each([
      '',
      '2026-10-23 14:05',
      '2026-1-23',
      '2025-02-29',
      '2026-13-01',
      '2026-10-23T24:00',
      '2026-10-23T12:60',
    ])('rejects %j', (value) => {
      assert.isTrue(Optional.isNone(parseWallClock(value)));
    });
  });

  describe(toDateTimeValue, () => {
    test('pads every field', () => {
      assert.strictEqual(
        toDateTimeValue({ year: 987, month: 1, day: 2, hour: 3, minute: 4 }),
        '0987-01-02T03:04',
      );
    });
  });

  describe(addMonths, () => {
    test('keeps the last day where the month is shorter', () => {
      assert.deepStrictEqual(
        addMonths({ year: 2026, month: 1, day: 31, hour: 9, minute: 30 }, 1),
        { year: 2026, month: 2, day: 28, hour: 9, minute: 30 },
      );
    });

    test('crosses years both ways', () => {
      const clock = {
        year: 2026,
        month: 1,
        day: 15,
        hour: 0,
        minute: 0,
      } as const;

      assert.deepStrictEqual(addMonths(clock, -1), {
        ...clock,
        year: 2025,
        month: 12,
      });

      assert.deepStrictEqual(addMonths(clock, 12), { ...clock, year: 2027 });
    });
  });

  describe(addDays, () => {
    test('crosses months and keeps the time', () => {
      assert.deepStrictEqual(
        addDays({ year: 2026, month: 12, day: 31, hour: 23, minute: 59 }, 1),
        { year: 2027, month: 1, day: 1, hour: 23, minute: 59 },
      );
    });
  });

  describe(monthWeeks, () => {
    test('draws October 2026 in five weeks from Sunday', () => {
      const weeks = monthWeeks(2026, 10, 0);

      assert.deepStrictEqual(
        weeks.map((week) => week.map(({ day }) => day)),
        [
          [27, 28, 29, 30, 1, 2, 3],
          [4, 5, 6, 7, 8, 9, 10],
          [11, 12, 13, 14, 15, 16, 17],
          [18, 19, 20, 21, 22, 23, 24],
          [25, 26, 27, 28, 29, 30, 31],
        ],
      );
    });

    test('starts the week on the day asked for', () => {
      const weeks = monthWeeks(2026, 10, 1);

      assert.deepStrictEqual(
        weeks[0]?.map(({ day }) => day),
        [28, 29, 30, 1, 2, 3, 4],
      );

      assert.strictEqual(weeks.length, 5);
    });

    test('draws February 2026 in four weeks', () => {
      assert.strictEqual(monthWeeks(2026, 2, 0).length, 4);
    });

    test('draws August 2026 in six weeks', () => {
      assert.strictEqual(monthWeeks(2026, 8, 0).length, 6);
    });
  });

  describe(clampDay, () => {
    const min = { year: 2026, month: 1, day: 10, hour: 0, minute: 0 } as const;

    const max = { year: 2026, month: 3, day: 5, hour: 0, minute: 0 } as const;

    test('moves a day before the range to its first, keeping the time', () => {
      assert.deepStrictEqual(
        clampDay(
          { year: 2025, month: 12, day: 31, hour: 8, minute: 15 },
          min,
          max,
        ),
        { year: 2026, month: 1, day: 10, hour: 8, minute: 15 },
      );
    });

    test('moves a day after the range to its last', () => {
      assert.deepStrictEqual(
        clampDay(
          { year: 2026, month: 3, day: 6, hour: 8, minute: 15 },
          min,
          max,
        ),
        { year: 2026, month: 3, day: 5, hour: 8, minute: 15 },
      );
    });
  });
}
