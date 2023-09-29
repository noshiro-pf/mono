import * as t from '@noshiro/io-ts';
import { DateUtils, Num, type DateType } from '@noshiro/ts-utils';
import { datesTypeDef, monthsTypeDef, yearsTypeDef } from '../../enum';

export const yearMonthDateTypeDef = t.record({
  year: yearsTypeDef,
  month: monthsTypeDef,
  date: datesTypeDef,
});

export type YearMonthDate = t.TypeOf<typeof yearMonthDateTypeDef>;

export const yearMonthDateDefaultValue = yearMonthDateTypeDef.defaultValue;

export const isYearMonthDate = yearMonthDateTypeDef.is;

export const fillYearMonthDate = yearMonthDateTypeDef.fill;

export const ymdFromDate = (date: DateType): YearMonthDate => ({
  year: DateUtils.getLocaleYear(date),
  month: DateUtils.getLocaleMonth(date),
  date: DateUtils.getLocaleDate(date),
});

export const compareYmd = (a: YearMonthDate, b: YearMonthDate): -1 | 0 | 1 => {
  if (a.year !== b.year)
    return Num.mapNaN2Undefined(Math.sign(a.year - b.year)) ?? 0;
  if (a.month !== b.month)
    return Num.mapNaN2Undefined(Math.sign(a.month - b.month)) ?? 0;
  if (a.date !== b.date)
    return Num.mapNaN2Undefined(Math.sign(a.date - b.date)) ?? 0;
  return 0;
};
