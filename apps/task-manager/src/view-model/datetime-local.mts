/**
 * Between an instant and what an `<input type="datetime-local">` holds —
 * `YYYY-MM-DDTHH:mm`, a wall-clock time with no zone. The page passes no
 * `timeZone` and gets the browser's; the tests pin one.
 *
 * Written on `Intl.DateTimeFormat` and arithmetic rather than `Date` or
 * `Temporal`: `Temporal` is not in every browser this app supports (Safari on
 * iPhone), and `valueAsNumber` on that input reads the value as UTC.
 */

import { Arr, Num, Result } from 'ts-data-forge';
import { HOUR_MS, MINUTE_MS } from './format.mjs';

export const toDateTimeLocal = (epochMs: number, timeZone?: string): string => {
  const { year, month, day, hour, minute } = wallClock(epochMs, timeZone);

  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}T${pad(hour, 2)}:${pad(minute, 2)}`;
};

/**
 * The instant `value` names on the wall clock of `timeZone`, or `undefined`
 * when it is empty or not a real date and time. In a daylight-saving gap or
 * overlap it picks one of the instants that zone could mean.
 */
export const fromDateTimeLocal = (
  value: string,
  timeZone?: string,
): number | undefined => {
  const fields = parseFields(value);

  if (fields === undefined) {
    return undefined;
  }

  if (!isValidWallClock(fields)) {
    return undefined;
  }

  const asUtc = wallClockAsUtc(fields);

  const firstGuess = asUtc - offsetAt(asUtc, timeZone);

  return asUtc - offsetAt(firstGuess, timeZone);
};

type WallClock = Readonly<{
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}>;

const SECOND_MS = 1000;

/**
 * `YYYY-MM-DDTHH:mm`, or with `:ss` after it, as numbers — not yet checked to
 * be a real date.
 */
const parseFields = (value: string): WallClock | undefined => {
  const [date = '', time = '', ...rest] = value.split('T');

  const [year, month, day, ...restOfDate] = date.split('-');

  const [hour, minute, second = '00', ...restOfTime] = time.split(':');

  if (
    Arr.isNonEmpty(rest) ||
    Arr.isNonEmpty(restOfDate) ||
    Arr.isNonEmpty(restOfTime) ||
    !hasDigits(year, 4) ||
    !hasDigits(month, 2) ||
    !hasDigits(day, 2) ||
    !hasDigits(hour, 2) ||
    !hasDigits(minute, 2) ||
    !hasDigits(second, 2)
  ) {
    return undefined;
  }

  return {
    year: toNumber(year),
    month: toNumber(month),
    day: toNumber(day),
    hour: toNumber(hour),
    minute: toNumber(minute),
    second: toNumber(second),
  };
};

const hasDigits = (s: string | undefined, digits: number): s is string =>
  s?.length === digits && DIGITS.test(s);

const DIGITS = /^\d+$/u;

const toNumber = (s: string): number =>
  Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);

const pad = (n: number, width: number): string =>
  String(n).padStart(width, '0');

/** The wall clock of `timeZone` at `epochMs`. */
const wallClock = (
  epochMs: number,
  timeZone: string | undefined,
): WallClock => {
  const format = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
    ...(timeZone === undefined ? {} : { timeZone }),
  });

  const parts = format.formatToParts(epochMs);

  const part = (type: Intl.DateTimeFormatPartTypes): number =>
    toNumber(parts.find((p) => p.type === type)?.value ?? '0');

  return {
    year: part('year'),
    month: part('month'),
    day: part('day'),
    hour: part('hour'),
    minute: part('minute'),
    second: part('second'),
  };
};

/** How far ahead of UTC the wall clock of `timeZone` is at `epochMs`. */
const offsetAt = (epochMs: number, timeZone: string | undefined): number =>
  wallClockAsUtc(wallClock(epochMs, timeZone)) -
  (epochMs - (((epochMs % SECOND_MS) + SECOND_MS) % SECOND_MS));

/** The instant that has `fields` as its wall clock in UTC. */
const wallClockAsUtc = ({
  year,
  month,
  day,
  hour,
  minute,
  second,
}: WallClock): number =>
  daysFromCivil(year, month, day) * 24 * HOUR_MS +
  hour * HOUR_MS +
  minute * MINUTE_MS +
  second * SECOND_MS;

const isValidWallClock = ({
  year,
  month,
  day,
  hour,
  minute,
  second,
}: WallClock): boolean =>
  1 <= month &&
  month <= 12 &&
  1 <= day &&
  day <= daysInMonth(year, month) &&
  hour <= 23 &&
  minute <= 59 &&
  second <= 59;

const daysInMonth = (year: number, month: number): number =>
  month === 2
    ? isLeapYear(year)
      ? 29
      : 28
    : [4, 6, 9, 11].includes(month)
      ? 30
      : 31;

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/**
 * Days from 1970-01-01 to the given date of the proleptic Gregorian calendar
 * (Howard Hinnant's `days_from_civil`).
 */
const daysFromCivil = (year: number, month: number, day: number): number => {
  const y = month <= 2 ? year - 1 : year;

  const era = Math.floor(y / 400);

  const yearOfEra = y - era * 400;

  const dayOfYear =
    Math.floor((153 * (month > 2 ? month - 3 : month + 9) + 2) / 5) + day - 1;

  const dayOfEra =
    yearOfEra * 365 +
    Math.floor(yearOfEra / 4) -
    Math.floor(yearOfEra / 100) +
    dayOfYear;

  return era * 146_097 + dayOfEra - 719_468;
};
