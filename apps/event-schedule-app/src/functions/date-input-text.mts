import {
  parseDateText,
  toDateValue,
  wallClockOf,
  type TimePrecision,
  type WallClock,
} from 'blueprint-synstate';
import { Optional } from 'ts-data-forge';
import { YearMonthDateFromDate } from 'ts-fortress-types';

/**
 * Whatever `Date` reads in the text, as Blueprint's input read it, except for
 * the forms blueprint-synstate reads itself (`YYYY-MM-DD` and `YYYY/MM/DD`, a
 * time after it if at all): those are that day here, and a month or day out of
 * range is no date. `Date` reads `YYYY-MM-DD` as midnight in UTC, the day
 * before west of UTC. A date alone (`timePrecision` left out) drops the time.
 */
export const parseDateInputText = (
  text: string,
  timePrecision?: TimePrecision,
): Optional<WallClock> => {
  const own = parseDateText(text, timePrecision);

  if (Optional.isSome(own) || partOfOwnForm.test(text.trim())) {
    return own;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return Optional.none;
  }

  const clock = wallClockOf(date);

  return Optional.some(
    timePrecision === 'minute' ? clock : { ...clock, hour: 0, minute: 0 },
  );
};

/**
 * A date of `parseDateText`'s forms typed part of the way, such as `2024-12` on
 * the way to a day: no date, rather than what `Date` makes of it.
 */
const partOfOwnForm = /^\d{4}[-/]\d{0,2}[-/]?\d{0,2}$/u;

/** December, 99 years from now: as far as the app's date inputs go. */
export const dateInputMaxDate = (): string => {
  const today = new Date();

  return toDateValue({
    ...wallClockOf(today),
    year: today.getFullYear() + 99,
    month: 12,
  });
};

/** A date as the browser writes dates, which Blueprint's inputs were given. */
export const formatDateInputText = ({ year, month, day }: WallClock): string =>
  localDate(year, month, day).toLocaleDateString();

/** A date as the date inputs take it: `YYYY-MM-DD`. */
export const ymdToDayValue = (ymd: YearMonthDate): string =>
  toDateValue({
    year: ymd.year,
    month: ymd.month,
    day: ymd.date,
    hour: 0,
    minute: 0,
  });

/** `YYYY-MM-DD`, or `''` for none, as a date. */
export const ymdFromDayValue = (value: string): YearMonthDate | undefined => {
  const [year, month, day] = value.split('-').map(Number);

  return year === undefined || month === undefined || day === undefined
    ? undefined
    : YearMonthDateFromDate(localDate(year, month, day));
};

/**
 * Midnight of `day` of `month` (1 to 12): built with the setter, since the
 * strict standard library narrows the constructor's month to 0–11.
 */
const localDate = (year: number, month: number, day: number): Date => {
  const mut_date = new Date(0);

  mut_date.setHours(0, 0, 0, 0);

  mut_date.setFullYear(year, month - 1, day);

  return mut_date;
};
