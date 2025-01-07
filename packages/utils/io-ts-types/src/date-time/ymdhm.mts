import * as t from '@noshiro/io-ts';
import { DateUtils, Num, type DateType } from '@noshiro/ts-utils';
import { Dates, Hours, Minutes, Months, Years } from './time-enum.mjs';

export const Ymdhm = t.record({
  year: Years,
  month: Months,
  date: Dates,
  hours: Hours,
  minutes: Minutes,
});

export type Ymdhm = t.TypeOf<typeof Ymdhm>;

export const YmdhmFromDate = (date: RawDateType): Ymdhm => ({
  year: DateUtils.getLocaleYear(date),
  month: DateUtils.getLocaleMonth(date),
  date: DateUtils.getLocaleDate(date),
  hours: DateUtils.getLocaleHours(date),
  minutes: DateUtils.getLocaleMinutes(date),
});

export const Ymdhm2Date = (ymdhm: Ymdhm): DateType =>
  DateUtils.create(
    ymdhm.year,
    ymdhm.month,
    ymdhm.date,
    ymdhm.hours,
    ymdhm.minutes,
  );

export const compareYmdhm = (a: Ymdhm, b: Ymdhm): -1 | 0 | 1 => {
  if (a.year !== b.year)
    return Num.mapNaN2Undefined(Math.sign(a.year - b.year)) ?? 0;
  if (a.month !== b.month)
    return Num.mapNaN2Undefined(Math.sign(a.month - b.month)) ?? 0;
  if (a.date !== b.date)
    return Num.mapNaN2Undefined(Math.sign(a.date - b.date)) ?? 0;
  if (a.hours !== b.hours)
    return Num.mapNaN2Undefined(Math.sign(a.hours - b.hours)) ?? 0;
  if (a.minutes !== b.minutes)
    return Num.mapNaN2Undefined(Math.sign(a.minutes - b.minutes)) ?? 0;
  return 0;
};
