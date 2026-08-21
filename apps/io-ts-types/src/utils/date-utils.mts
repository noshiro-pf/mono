import { asSafeUint } from 'ts-data-forge';
import {
  type DateEnum,
  type HoursEnum,
  type MinutesEnum,
  type MonthEnum,
  type SafeUint,
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

  /** The current instant, as a `Date`. */
  export const today = (): Date => new Date();

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

  /** A copy with the month replaced, taking 1-12. */
  export const setLocaleMonth =
    (month: MonthEnum) =>
    (date: Date): Date => {
      const next = new Date(date);

      next.setMonth(month - 1);

      return next;
    };

  /** A copy with the year replaced by `updater`'s result. */
  export const updateLocaleYear =
    (updater: (year: SafeUint) => SafeUint) =>
    (date: Date): Date => {
      const next = new Date(date);

      next.setFullYear(updater(getLocaleYear(date)));

      return next;
    };

  /** Builds a `Date` from local-time parts, taking the month as 1-12. */
  export const create = (
    year: SafeUint,
    month: MonthEnum,
    date: DateEnum = 1,
    hours: HoursEnum = 0,
    minutes: MinutesEnum = 0,
  ): Date => new Date(year, month - 1, date, hours, minutes);
}

const isInteger = (n: number, min: number, max: number): boolean =>
  Number.isSafeInteger(n) && n >= min && n <= max;

const isSafeUint = (n: number): n is SafeUint =>
  Number.isSafeInteger(n) && n >= 0;

const isMonth = (n: number): n is MonthEnum => isInteger(n, 1, 12);

const isDayOfMonth = (n: number): n is DateEnum => isInteger(n, 1, 31);

const isHours = (n: number): n is HoursEnum => isInteger(n, 0, 23);

const isMinutes = (n: number): n is MinutesEnum => isInteger(n, 0, 59);
