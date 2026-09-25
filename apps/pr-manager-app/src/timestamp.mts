/** GitHub's timestamps, as the numbers the page does arithmetic with. */

import { Arr, Num, Result } from 'ts-data-forge';

/**
 * Milliseconds since the epoch, or `undefined` for a string that is not
 * the one shape GitHub sends: `2026-09-24T09:39:18Z`, UTC, sometimes with a
 * fraction of a second.
 *
 * Counted out field by field rather than handed to `Date`, whose parse is
 * left to the engine for anything but the exact format ECMAScript defines
 * and whose months count from zero, and rather than to `Temporal`, which not
 * every browser this page may be opened in has yet.
 */
export const epochMsOf = (timestamp: string): number | undefined => {
  if (!timestamp.endsWith('Z')) return undefined;

  const [whole = '', fraction = '', ...rest] = timestamp
    .slice(0, -1)
    .split('.');

  const groups = WHOLE_SECONDS.exec(whole)?.groups;

  if (groups === undefined || Arr.isNonEmpty(rest) || !DIGITS.test(fraction)) {
    return undefined;
  }

  const field = (key: string): number =>
    Result.unwrapOkOr(Num.safeParseInt(groups[key] ?? ''), 0);

  const millis = Result.unwrapOkOr(
    Num.safeParseInt(fraction.padEnd(3, '0').slice(0, 3)),
    0,
  );

  const days = daysFromCivil(field('year'), field('month'), field('day'));

  const seconds =
    days * SECONDS_PER_DAY +
    field('hour') * SECONDS_PER_HOUR +
    field('minute') * SECONDS_PER_MINUTE +
    field('second');

  return seconds * MS_PER_SECOND + millis;
};

/** Everything before the fraction of a second and the `Z`. */
const WHOLE_SECONDS =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})$/u;

const DIGITS = /^\d{0,9}$/u;

const MS_PER_SECOND = 1000;

const SECONDS_PER_MINUTE = 60;

const SECONDS_PER_HOUR = 3600;

const SECONDS_PER_DAY = 86_400;

/**
 * Days from 1970-01-01 to a date of the proleptic Gregorian calendar, with
 * the month counted from 1. Howard Hinnant's `days_from_civil`: the year is
 * taken to start in March, so the leap day falls at its end and every month
 * before it has a fixed length.
 */
const daysFromCivil = (year: number, month: number, day: number): number => {
  const marchYear = month <= 2 ? year - 1 : year;

  const era = Math.floor(marchYear / 400);

  const yearOfEra = marchYear - era * 400;

  const marchMonth = (month + 9) % 12;

  const dayOfYear = Math.floor((153 * marchMonth + 2) / 5) + day - 1;

  const dayOfEra =
    yearOfEra * 365 +
    Math.floor(yearOfEra / 4) -
    Math.floor(yearOfEra / 100) +
    dayOfYear;

  return era * 146_097 + dayOfEra - 719_468;
};
