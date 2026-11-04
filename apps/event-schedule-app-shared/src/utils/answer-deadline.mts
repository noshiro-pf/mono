import { Ymdhm, type YearMonthDate } from 'ts-fortress-types';

/**
 * The instant, in milliseconds since the epoch, at which the wall-clock time
 * `ymdhm` occurs in the zone whose `Date#getTimezoneOffset` is
 * `timezoneOffsetMinutes` (UTC minus local time, in minutes).
 *
 * An event stores its answer deadline as a wall-clock time with the offset of
 * the zone it was made in, and this is how `isBeforeDeadline` in
 * `apps/event-schedule-app/firestore.rules` reads the pair. The page and the
 * functions read it here, so that all three close answers at the same instant
 * wherever they run.
 */
export const answerDeadlineMillis = (
  ymdhm: Ymdhm,
  timezoneOffsetMinutes: number,
): number =>
  utcMidnightMillis(ymdhm) +
  (ymdhm.hours * 60 + ymdhm.minutes + timezoneOffsetMinutes) *
    millisecondsOfAMinute;

/**
 * Whether answers to the event are closed at `nowMillis`: from its deadline on,
 * which is when `isBeforeDeadline` in `firestore.rules` starts refusing them.
 */
export const isAfterAnswerDeadline = (
  event: Readonly<{
    answerDeadline: Ymdhm | 'none';
    timezoneOffsetMinutes: number;
  }>,
  nowMillis: number,
): boolean =>
  event.answerDeadline !== 'none' &&
  nowMillis >=
    answerDeadlineMillis(event.answerDeadline, event.timezoneOffsetMinutes);

/**
 * The wall-clock time at `epochMillis` in the zone whose `Date#getTimezoneOffset`
 * is `timezoneOffsetMinutes`: an event's "now" or "today", in its own zone
 * rather than the one this code runs in.
 */
export const wallClockInOffset = (
  epochMillis: number,
  timezoneOffsetMinutes: number,
): Ymdhm => {
  const shifted = new Date(
    epochMillis - timezoneOffsetMinutes * millisecondsOfAMinute,
  );

  return Ymdhm.fill({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    date: shifted.getUTCDate(),
    hours: shifted.getUTCHours(),
    minutes: shifted.getUTCMinutes(),
  });
};

/**
 * Midnight UTC of the date, in milliseconds since the epoch: what
 * `timestamp.date(y, m, d)` is in `firestore.rules`. Two dates are a whole
 * number of days apart in it, since UTC has no daylight-saving change.
 */
export const utcMidnightMillis = (ymd: YearMonthDate): number => {
  const midnight = new Date(0);

  // `month` is 1-12, the argument 0-11.
  midnight.setUTCFullYear(ymd.year, ymd.month - 1, ymd.date);

  return midnight.getTime();
};

const millisecondsOfAMinute = 60_000;
