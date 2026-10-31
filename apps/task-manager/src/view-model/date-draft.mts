/**
 * A due date or a milestone's date as a form holds it — a date field, and
 * whether it is all day — and back. An all-day date stands for one edge of its
 * day: a due date its end, a milestone's date its start.
 */

import { Result } from 'ts-data-forge';
import {
  fromDateLocal,
  fromDateTimeLocal,
  switchAllDay,
  toDateLocal,
  toDateTimeLocal,
  type DayEdge,
} from './datetime-local.mjs';

/**
 * What a date field holds for `epochMs`: `YYYY-MM-DDTHH:mm`, as
 * `<input type="datetime-local">` holds it, or `YYYY-MM-DD` alone when it is
 * all day; empty for none.
 */
export const dateField = (
  epochMs: number | undefined,
  allDay: boolean,
  timeZone: string | undefined,
): string =>
  epochMs === undefined
    ? ''
    : allDay
      ? toDateLocal(epochMs, timeZone)
      : toDateTimeLocal(epochMs, timeZone);

/**
 * The date of a date field (`value`, all day or not) and whether it is all day
 * — `stored` as it is while the field shows it unchanged, so that saving from
 * another time zone does not move it — or `undefined` with no date; an error
 * for what is not one. An all-day date is that `edge` of its day.
 */
export const draftedDate = (
  value: string,
  allDay: boolean,
  stored: StoredDate,
  edge: DayEdge,
  timeZone: string | undefined,
): Result<StoredDate, undefined> =>
  allDay === stored.allDay &&
  value === dateField(stored.at, stored.allDay, timeZone)
    ? Result.ok({ at: stored.at, allDay: stored.at !== undefined && allDay })
    : Result.map(
        optionalDateTime(value, timeZone, allDay ? edge : undefined),
        (at) => ({ at, allDay: at !== undefined && allDay }),
      );

/**
 * What a date field holds once 「終日」 is turned on or off: see
 * `switchAllDay`, but turned off on the day `stored` is timed on, the time it
 * is stored with — so that turning it on and off again on a stored date changes
 * nothing.
 */
export const switchDateField = (
  value: string,
  allDay: boolean,
  stored: StoredDate,
  edge: DayEdge,
  timeZone: string | undefined,
): string => {
  const switched = switchAllDay(value, allDay, edge);

  return switched === '' ||
    allDay ||
    stored.allDay ||
    stored.at === undefined ||
    switchAllDay(switched, true, edge) !== toDateLocal(stored.at, timeZone)
    ? switched
    : toDateTimeLocal(stored.at, timeZone);
};

/** A date as a task or a milestone stores it. */
export type StoredDate = Readonly<{ at: number | undefined; allDay: boolean }>;

/**
 * An empty field is `undefined`; anything else has to be a date and time — or
 * with `allDayEdge`, a day alone, read as that end of it.
 */
const optionalDateTime = (
  value: string,
  timeZone: string | undefined,
  allDayEdge: DayEdge | undefined,
): Result<number | undefined, undefined> => {
  if (value.trim() === '') {
    return Result.ok(undefined);
  }

  const epochMs =
    allDayEdge === undefined
      ? fromDateTimeLocal(value.trim(), timeZone)
      : fromDateLocal(value.trim(), allDayEdge, timeZone);

  return epochMs === undefined ? Result.err(undefined) : Result.ok(epochMs);
};
