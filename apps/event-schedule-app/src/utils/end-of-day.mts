import {
  addDays,
  toDateTimeValue,
  wallClockOf,
  type WallClock,
} from 'blueprint-synstate';

/** 23:59 on the day of `clock`. */
export const endOfDay = (clock: WallClock): WallClock =>
  ({ ...clock, hour: 23, minute: 59 }) as const;

/** 23:59 on the day `days` after `today`. */
export const endOfDaysLater = (today: Date, days: number): Date =>
  // Read back as `answer-deadline.tsx` reads the picker's value: a string with
  // no zone is local time.
  new Date(toDateTimeValue(endOfDay(addDays(wallClockOf(today), days))));
