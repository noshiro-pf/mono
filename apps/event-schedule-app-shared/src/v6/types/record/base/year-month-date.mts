import { DateUtils } from 'io-ts-types';
import { Num, isNumber, isRecord, pipe } from 'ts-data-forge';
import { type DateEnum, type MonthEnum, type SafeUint } from 'ts-type-forge';
import { hasKeyValue } from '../../../../utils/index.mjs';

export type YearMonthDate = Readonly<{
  year: SafeUint;
  month: MonthEnum;
  date: DateEnum;
}>;

export const yearMonthDateDefaultValue = {
  year: pipe(DateUtils.today()).map(DateUtils.getLocaleYear).value,
  month: pipe(DateUtils.today()).map(DateUtils.getLocaleMonth).value,
  date: pipe(DateUtils.today()).map(DateUtils.getLocaleDate).value,
} as const satisfies YearMonthDate;

export const isYearEnum = (a: unknown): a is SafeUint =>
  isNumber(a) && Number.isSafeInteger(a) && a > 0;

export const isMonthEnum = (a: unknown): a is MonthEnum =>
  isNumber(a) && Number.isSafeInteger(a) && Num.isInRangeInclusive(1, 12)(a);

export const isDateEnum = (a: unknown): a is DateEnum =>
  isNumber(a) && Number.isSafeInteger(a) && Num.isInRangeInclusive(1, 31)(a);

export const isYearMonthDate = (a: unknown): a is YearMonthDate =>
  isRecord(a) &&
  hasKeyValue(a, 'year', isYearEnum) &&
  hasKeyValue(a, 'month', isMonthEnum) &&
  hasKeyValue(a, 'date', isDateEnum);

const d = yearMonthDateDefaultValue;

export const fillYearMonthDate = (a?: unknown): YearMonthDate =>
  a === undefined || !isRecord(a)
    ? d
    : ({
        year: hasKeyValue(a, 'year', isYearEnum) ? a.year : d.year,
        month: hasKeyValue(a, 'month', isMonthEnum) ? a.month : d.month,
        date: hasKeyValue(a, 'date', isDateEnum) ? a.date : d.date,
      } as const);

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
