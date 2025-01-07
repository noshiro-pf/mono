import * as t from '@noshiro/io-ts';
import { DateUtils, Num, type DateType } from '@noshiro/ts-utils';
import { Hours, Minutes } from './time-enum.mjs';

export const HoursMinutes = t.record({
  hours: Hours,
  minutes: Minutes,
});

export type HoursMinutes = t.TypeOf<typeof HoursMinutes>;

export const HoursMinutesFromDate = (date: DateType): HoursMinutes => ({
  hours: DateUtils.getLocaleHours(date),
  minutes: DateUtils.getLocaleMinutes(date),
});

export const compareHm = (a: HoursMinutes, b: HoursMinutes): -1 | 0 | 1 => {
  if (a.hours !== b.hours)
    return Num.mapNaN2Undefined(Math.sign(a.hours - b.hours)) ?? 0;
  if (a.minutes !== b.minutes)
    return Num.mapNaN2Undefined(Math.sign(a.minutes - b.minutes)) ?? 0;
  return 0;
};
