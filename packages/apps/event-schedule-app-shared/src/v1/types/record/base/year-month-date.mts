import { DateUtils, Num, pipe, type DateType } from '@noshiro/ts-utils';

export type YearMonthDate = Readonly<{
  year: YearEnum;
  month: MonthEnum;
  date: DateEnum;
}>;

export type PartialYearMonthDate = Partial<YearMonthDate>;

export const defaultYearMonthDate = {
  year: pipe(DateUtils.today()).chain(DateUtils.getLocaleYear).value,
  month: pipe(DateUtils.today()).chain(DateUtils.getLocaleMonth).value,
  date: pipe(DateUtils.today()).chain(DateUtils.getLocaleDate).value,
} as const satisfies YearMonthDate;

const d = defaultYearMonthDate;
export const fillYearMonthDate = (a?: PartialYearMonthDate): YearMonthDate => ({
  year: a?.year ?? d.year,
  month: a?.month ?? d.month,
  date: a?.date ?? d.date,
});

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
