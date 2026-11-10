/**
 * Instants as the queue writes and GitHub sends them: UTC, `Z`-suffixed
 * (`2026-09-24T09:39:18Z`), GitHub's sometimes with a fraction of a second.
 */

import { Num, Result } from 'ts-data-forge';

/**
 * Milliseconds since the epoch, or `undefined` for any string not of that one
 * shape or naming no real date and time.
 *
 * Counted field by field rather than handed to `Date`, whose parse of anything
 * but ECMAScript's exact format is left to the engine.
 */
export const epochMsOf = (instant: string): number | undefined => {
  if (!instant.endsWith('Z')) {
    return undefined;
  }

  const dot = instant.indexOf('.');

  const whole = instant.slice(0, dot === -1 ? -1 : dot);

  const fraction = dot === -1 ? '0' : instant.slice(dot + 1, -1);

  const groups = WHOLE_SECONDS.exec(whole)?.groups;

  if (groups === undefined || !FRACTION.test(fraction)) {
    return undefined;
  }

  const field = (key: string): number =>
    Result.unwrapOkOr(Num.safeParseInt(groups[key] ?? ''), Number.NaN);

  const year = field('year');

  const month = field('month');

  const day = field('day');

  const hour = field('hour');

  const minute = field('minute');

  const second = field('second');

  if (
    month < 1 ||
    12 < month ||
    day < 1 ||
    daysInMonth(year, month) < day ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return undefined;
  }

  const millis = Result.unwrapOkOr(
    Num.safeParseInt(fraction.padEnd(3, '0').slice(0, 3)),
    0,
  );

  const seconds =
    daysFromCivil(year, month, day) * SECONDS_PER_DAY +
    hour * SECONDS_PER_HOUR +
    minute * SECONDS_PER_MINUTE +
    second;

  return seconds * MS_PER_SECOND + millis;
};

/** `epochMs` as the queue writes an instant: UTC, to the second. */
export const instantOf = (epochMs: number): string => {
  const date = new Date(epochMs);

  return `${date.toISOString().slice(0, 19)}Z`;
};

/** Everything before the fraction of a second and the `Z`. */
const WHOLE_SECONDS =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})$/u;

const FRACTION = /^\d{1,9}$/u;

const MS_PER_SECOND = 1000;

const SECONDS_PER_MINUTE = 60;

const SECONDS_PER_HOUR = 3600;

const SECONDS_PER_DAY = 86_400;

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (year: number, month: number): number =>
  month === 2
    ? isLeapYear(year)
      ? 29
      : 28
    : month === 4 || month === 6 || month === 9 || month === 11
      ? 30
      : 31;

/**
 * Days from 1970-01-01 to a proleptic Gregorian date, months from 1: Howard
 * Hinnant's `days_from_civil`, whose year starts in March so that the leap day
 * falls at its end.
 */
const daysFromCivil = (year: number, month: number, day: number): number => {
  const marchYear = month <= 2 ? year - 1 : year;

  const era = Math.floor(marchYear / 400);

  const yearOfEra = marchYear - era * 400;

  const dayOfYear = Math.floor((153 * ((month + 9) % 12) + 2) / 5) + day - 1;

  const dayOfEra =
    yearOfEra * 365 +
    Math.floor(yearOfEra / 4) -
    Math.floor(yearOfEra / 100) +
    dayOfYear;

  return era * 146_097 + dayOfEra - 719_468;
};
