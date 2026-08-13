import { type DayOfWeekIndex } from 'ts-type-forge';

/**
 * The handful of date helpers this app uses.
 *
 * Ported from the `DateUtils` of the `@noshiro/ts-utils` it used before the
 * monorepo consolidation; `ts-data-forge` has no successor for it. Only what
 * the app calls is here — the original covered far more.
 *
 * "Locale" here means local time, as opposed to the UTC variants the original
 * also provided.
 */
export namespace DateUtils {
  /** The current instant, as a `Date`. */
  export const today = (): Date => new Date();

  /** The current instant, in milliseconds since the epoch. */
  export const now = (): number => Date.now();

  /** The month, 1-12 — not `getMonth`'s 0-11. */
  export const getLocaleMonth = (date: Date): number => date.getMonth() + 1;

  /** The day of the month, 1-31. */
  export const getLocaleDate = (date: Date): number => date.getDate();

  /** The day of the week, 0-6, Sunday first. */
  export const getLocaleDayOfWeek = (date: Date): DayOfWeekIndex => {
    const day = date.getDay();

    // `getDay` is documented to return 0-6, but its type is `number`, so the
    // narrowing has to be written out for the index to be usable.
    return isDayOfWeekIndex(day) ? day : 0;
  };
}

const isDayOfWeekIndex = (n: number): n is DayOfWeekIndex =>
  Number.isSafeInteger(n) && n >= 0 && n <= 6;
