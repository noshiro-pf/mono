import { asSafeUint, isSafeUint, Num } from 'ts-data-forge';
import type {
  DateEnum,
  DayOfWeekIndex,
  HoursEnum,
  Index,
  MinutesEnum,
  MonthEnum,
  ReadonlyRecord,
  SafeUint,
} from 'ts-type-forge';

/**
 * The date accessors this package needs.
 *
 * Ported from the `DateUtils` of the `@noshiro/ts-utils` it used before the
 * monorepo consolidation; `ts-data-forge` has no successor for it. The original
 * also defined a `DateType` that hid `Date`'s own getters so that these had to
 * be used; that is not reproduced here — the parameter is a plain `Date`.
 *
 * `Date`'s getters are typed `number`, so each result is narrowed before it is
 * returned. A real `Date` always satisfies these ranges; the fallbacks exist
 * because the type system cannot know that.
 *
 * "Locale" means local time, as opposed to the UTC variants the original also
 * provided.
 */
export namespace DateUtils {
  /** The current instant, as a `Date`. */
  export const today = (): Date => new Date();

  /** The current instant, in milliseconds since the epoch. */
  export const now = (): SafeUint => {
    const ms = Date.now();

    return isSafeUint(ms) ? ms : asSafeUint(0);
  };

  /** The year. */
  export const getLocaleYear = (date: Date): SafeUint => {
    const year = date.getFullYear();

    return isSafeUint(year) ? year : asSafeUint(1970);
  };

  /** The month, 1-12 — not `getMonth`'s 0-11. */
  export const getLocaleMonth = (date: Date): MonthEnum => {
    const month = date.getMonth() + 1;

    return isMonth(month) ? month : 1;
  };

  /** The day of the month, 1-31. */
  export const getLocaleDate = (date: Date): DateEnum => {
    const dayOfMonth = date.getDate();

    return isDayOfMonth(dayOfMonth) ? dayOfMonth : 1;
  };

  /** The hour, 0-23. */
  export const getLocaleHours = (date: Date): HoursEnum => {
    const hours = date.getHours();

    return isHours(hours) ? hours : 0;
  };

  /** The minute, 0-59. */
  export const getLocaleMinutes = (date: Date): MinutesEnum => {
    const minutes = date.getMinutes();

    return isMinutes(minutes) ? minutes : 0;
  };

  /** Parses whatever `new Date(…)` accepts. */
  export const from = (value: number | string): Date => new Date(value);

  /** The instant as a `Date`; the identity here, kept for the call sites. */
  export const toDate = (date: Date): Date => date;

  /** `YYYY-MM-DD` in local time. */
  export const toLocaleYMD = (date: Date, separator = '-'): string =>
    [
      getLocaleYear(date),
      getLocaleMonth(date).toString().padStart(2, '0'),
      getLocaleDate(date).toString().padStart(2, '0'),
    ].join(separator);

  /** `HH:MM` in local time. */
  export const toLocaleHM = (date: Date, separator = ':'): string =>
    [
      getLocaleHours(date).toString().padStart(2, '0'),
      getLocaleMinutes(date).toString().padStart(2, '0'),
    ].join(separator);

  /**
   * A copy with the month replaced, taking 1-12. The day of the month is
   * clamped to the last day of that month, so 31 January set to February is the
   * end of February rather than early March.
   */
  export const setLocaleMonth =
    (month: MonthEnum) =>
    (date: Date): Date =>
      withLocaleYearMonth(date, date.getFullYear(), monthToIndex[month]);

  /**
   * A copy with the year replaced by `updater`'s result. The day of the month is
   * clamped, so 29 February in a year without one is 28 February.
   */
  export const updateLocaleYear =
    (updater: (year: SafeUint) => SafeUint) =>
    (date: Date): Date =>
      withLocaleYearMonth(date, updater(getLocaleYear(date)), date.getMonth());

  /** The day of the week, 0-6, Sunday first. */
  export const getLocaleDayOfWeek = (date: Date): DayOfWeekIndex => {
    const day = date.getDay();

    return isDayOfWeek(day) ? day : 0;
  };

  /** Milliseconds since the epoch. */
  export const toTimestamp = (date: Date): number => date.getTime();

  /** A copy with the time of day set to 00:00:00.000. */
  export const toMidnight = (date: Date): Date => {
    const mut_next = new Date(date);

    mut_next.setHours(0, 0, 0, 0);

    return mut_next;
  };

  /** Builds a `Date` from local-time parts, taking the month as 1-12. */
  export const create = (
    year: SafeUint,
    month: MonthEnum,
    date: DateEnum = 1,
    hours: HoursEnum = 0,
    minutes: MinutesEnum = 0,
  ): Date => new Date(year, monthToIndex[month], date, hours, minutes);
}

/**
 * `Date`'s month argument is 0-based, and the strict standard library types it
 * as `Index<12>` rather than `number`. `month - 1` is provably in range for a
 * `MonthEnum`, but subtraction widens to `number`, so the mapping is written
 * out instead of asserted.
 */
const monthToIndex = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  7: 6,
  8: 7,
  9: 8,
  10: 9,
  11: 10,
  12: 11,
} as const satisfies ReadonlyRecord<MonthEnum, Index<12>>;

/**
 * The last day of the month `monthIndex` (0-based, carried into the next or
 * previous year as `setFullYear` does) of `year`. Counted in UTC, where no
 * daylight-saving change can move the day.
 */
const lastDayOfMonth = (year: number, monthIndex: number): number => {
  // Day 0 of the following month is the last day of this one.
  const mut_lastDay = new Date(0);

  mut_lastDay.setUTCFullYear(year, monthIndex + 1, 0);

  return mut_lastDay.getUTCDate();
};

/**
 * A copy of `date` in the local `year` and month `monthIndex` (0-based, carried
 * into the next or previous year as `setFullYear` does), with the day of the
 * month clamped to that month's last day and the time of day kept. Every setter
 * that moves the year or month goes through here.
 */
const withLocaleYearMonth = (
  date: Date,
  year: number,
  monthIndex: number,
): Date => {
  const mut_next = new Date(date);

  // One call sets the year, month and day together, so a day the target month
  // does not have cannot roll over into the month after, and the date never
  // passes through the 1st, which may fall in a daylight-saving gap.
  mut_next.setFullYear(
    year,
    monthIndex,
    Math.min(date.getDate(), lastDayOfMonth(year, monthIndex)),
  );

  return mut_next;
};

const isMonth: (n: number) => n is MonthEnum = Num.isUintInRangeInclusive(
  1,
  12,
);

const isDayOfMonth: (n: number) => n is DateEnum = Num.isUintInRangeInclusive(
  1,
  31,
);

const isHours: (n: number) => n is HoursEnum = Num.isUintInRangeInclusive(
  0,
  23,
);

const isMinutes = (n: number): n is MinutesEnum =>
  Number.isSafeInteger(n) && Num.isInRangeInclusive(0, 59)(n);

const isDayOfWeek: (n: number) => n is DayOfWeekIndex =
  Num.isUintInRangeInclusive(0, 6);
