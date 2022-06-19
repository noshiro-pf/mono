import * as t from '@noshiro/io-ts';
import { IDate, Num } from '@noshiro/ts-utils';
import { datesTypeDef, monthsTypeDef, yearsTypeDef } from '../../enum';

export const yearMonthDateTypeDef = t.record({
  year: yearsTypeDef,
  month: monthsTypeDef,
  date: datesTypeDef,
});

export type YearMonthDate = t.Typeof<typeof yearMonthDateTypeDef>;

export const yearMonthDateDefaultValue = yearMonthDateTypeDef.defaultValue;

export const isYearMonthDate = yearMonthDateTypeDef.is;

export const fillYearMonthDate = yearMonthDateTypeDef.fill;

export const ymdFromDate = (date: IDate): YearMonthDate => ({
  year: IDate.getLocaleYear(date),
  month: IDate.getLocaleMonth(date),
  date: IDate.getLocaleDate(date),
});

export const compareYmd = (a: YearMonthDate, b: YearMonthDate): -1 | 0 | 1 => {
  if (a.year !== b.year) return Num.sign(a.year - b.year);
  if (a.month !== b.month) return Num.sign(a.month - b.month);
  if (a.date !== b.date) return Num.sign(a.date - b.date);
  return 0;
};
