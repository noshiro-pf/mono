import { DateUtils } from 'io-ts-types';
import { pipe } from 'ts-data-forge';
import { type DateEnum, type MonthEnum, type SafeUint } from 'ts-type-forge';

export type YearMonthDate = Readonly<{
  year: SafeUint;
  month: MonthEnum;
  date: DateEnum;
}>;

export type PartialYearMonthDate = Partial<YearMonthDate>;

export const defaultYearMonthDate = {
  year: pipe(DateUtils.today()).map(DateUtils.getLocaleYear).value,
  month: pipe(DateUtils.today()).map(DateUtils.getLocaleMonth).value,
  date: pipe(DateUtils.today()).map(DateUtils.getLocaleDate).value,
} as const satisfies YearMonthDate;

const d = defaultYearMonthDate;

export const fillYearMonthDate = (a?: PartialYearMonthDate): YearMonthDate =>
  ({
    year: a?.year ?? d.year,
    month: a?.month ?? d.month,
    date: a?.date ?? d.date,
  }) as const;

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
