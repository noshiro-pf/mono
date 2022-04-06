import { IDate, Num, pipe } from '@noshiro/ts-utils';

export type YearMonthDate = Readonly<{
  year: YearEnum;
  month: MonthEnum;
  date: DateEnum;
}>;

export type PartialYearMonthDate = Partial<YearMonthDate>;

export const defaultYearMonthDate: YearMonthDate = {
  year: pipe(IDate.today()).chain(IDate.getLocaleYear).value,
  month: pipe(IDate.today()).chain(IDate.getLocaleMonth).value,
  date: pipe(IDate.today()).chain(IDate.getLocaleDate).value,
} as const;

const d = defaultYearMonthDate;
export const fillYearMonthDate = (a?: PartialYearMonthDate): YearMonthDate => ({
  year: a?.year ?? d.year,
  month: a?.month ?? d.month,
  date: a?.date ?? d.date,
});

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
