import * as t from 'ts-fortress';
import { DateUtils } from '../utils/index.mjs';
import { Dates, Months, Years } from './time-enum.mjs';

export const YearMonthDate = t.record({
  year: Years,
  month: Months,
  date: Dates,
});

export type YearMonthDate = t.TypeOf<typeof YearMonthDate>;

export const YearMonthDateFromDate = (date: Date): YearMonthDate =>
  ({
    year: DateUtils.getLocaleYear(date),
    month: DateUtils.getLocaleMonth(date),
    date: DateUtils.getLocaleDate(date),
  }) as const;

export const compareYearMonthDate = (
  a: YearMonthDate,
  b: YearMonthDate,
): -1 | 0 | 1 => {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;

  if (a.month !== b.month) return a.month < b.month ? -1 : 1;

  if (a.date !== b.date) return a.date < b.date ? -1 : 1;

  return 0;
};
