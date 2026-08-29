import * as t from 'ts-fortress';
import { DateUtils } from '../utils/index.mjs';
import { Dates, Hours, Minutes, Months, Years } from './time-enum.mjs';

export const Ymdhm = t.record({
  year: Years,
  month: Months,
  date: Dates,
  hours: Hours,
  minutes: Minutes,
});

export type Ymdhm = t.TypeOf<typeof Ymdhm>;

export const YmdhmFromDate = (date: Date): Ymdhm =>
  ({
    year: DateUtils.getLocaleYear(date),
    month: DateUtils.getLocaleMonth(date),
    date: DateUtils.getLocaleDate(date),
    hours: DateUtils.getLocaleHours(date),
    minutes: DateUtils.getLocaleMinutes(date),
  }) as const;

export const Ymdhm2Date = (ymdhm: Ymdhm): Date =>
  DateUtils.create(
    ymdhm.year,
    ymdhm.month,
    ymdhm.date,
    ymdhm.hours,
    ymdhm.minutes,
  );

export const compareYmdhm = (a: Ymdhm, b: Ymdhm): -1 | 0 | 1 => {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;

  if (a.month !== b.month) return a.month < b.month ? -1 : 1;

  if (a.date !== b.date) return a.date < b.date ? -1 : 1;

  if (a.hours !== b.hours) return a.hours < b.hours ? -1 : 1;

  if (a.minutes !== b.minutes) return a.minutes < b.minutes ? -1 : 1;

  return 0;
};
