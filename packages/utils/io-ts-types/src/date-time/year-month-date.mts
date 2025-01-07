import * as t from '@noshiro/io-ts';
import { DateUtils, Num, type DateType } from '@noshiro/ts-utils';
import { Dates, Months, Years } from './time-enum.mjs';

export const YearMonthDate = t.record({
  year: Years,
  month: Months,
  date: Dates,
});

export type YearMonthDate = t.TypeOf<typeof YearMonthDate>;

export const YearMonthDateFromDate = (date: DateType): YearMonthDate => ({
  year: DateUtils.getLocaleYear(date),
  month: DateUtils.getLocaleMonth(date),
  date: DateUtils.getLocaleDate(date),
});

export const compareYearMonthDate = (
  a: YearMonthDate,
  b: YearMonthDate,
): -1 | 0 | 1 => {
  if (a.year !== b.year)
    return Num.mapNaN2Undefined(Math.sign(a.year - b.year)) ?? 0;
  if (a.month !== b.month)
    return Num.mapNaN2Undefined(Math.sign(a.month - b.month)) ?? 0;
  if (a.date !== b.date)
    return Num.mapNaN2Undefined(Math.sign(a.date - b.date)) ?? 0;
  return 0;
};
