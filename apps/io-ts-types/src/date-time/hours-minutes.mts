import * as t from 'ts-fortress';
import { DateUtils } from '../utils/index.mjs';
import { Hours, Minutes } from './time-enum.mjs';

export const HoursMinutes = t.record({
  hours: Hours,
  minutes: Minutes,
});

export type HoursMinutes = t.TypeOf<typeof HoursMinutes>;

export const HoursMinutesFromDate = (date: Date): HoursMinutes =>
  ({
    hours: DateUtils.getLocaleHours(date),
    minutes: DateUtils.getLocaleMinutes(date),
  }) as const;

export const compareHm = (a: HoursMinutes, b: HoursMinutes): -1 | 0 | 1 => {
  if (a.hours !== b.hours) return a.hours < b.hours ? -1 : 1;

  if (a.minutes !== b.minutes) return a.minutes < b.minutes ? -1 : 1;

  return 0;
};
