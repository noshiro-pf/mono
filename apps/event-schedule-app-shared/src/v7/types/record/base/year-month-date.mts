import * as t from 'ts-fortress';
import { DateUtils } from 'ts-fortress-types';
import {
  datesTypeDef,
  monthsTypeDef,
  yearsTypeDef,
} from '../../enum/index.mjs';

export const yearMonthDateTypeDef = t.record({
  year: yearsTypeDef,
  month: monthsTypeDef,
  date: datesTypeDef,
});

export type YearMonthDate = t.TypeOf<typeof yearMonthDateTypeDef>;

export const yearMonthDateDefaultValue = yearMonthDateTypeDef.defaultValue;

export const isYearMonthDate = yearMonthDateTypeDef.is;

export const fillYearMonthDate = yearMonthDateTypeDef.fill;

export const ymdFromDate = (date: Date): YearMonthDate =>
  ({
    year: DateUtils.getLocaleYear(date),
    month: DateUtils.getLocaleMonth(date),
    date: DateUtils.getLocaleDate(date),
  }) as const;

export const compareYmd = (a: YearMonthDate, b: YearMonthDate): -1 | 0 | 1 => {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;

  if (a.month !== b.month) return a.month < b.month ? -1 : 1;

  if (a.date !== b.date) return a.date < b.date ? -1 : 1;

  return 0;
};
