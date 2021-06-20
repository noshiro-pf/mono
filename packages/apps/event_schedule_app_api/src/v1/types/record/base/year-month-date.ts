import type {
  DateEnum,
  MonthEnum,
  ReadonlyDate,
  YearEnum,
} from '@noshiro/ts-utils';
import { getDate, getMonth, getYear, sign } from '@noshiro/ts-utils';

export type YearMonthDate = Readonly<{
  year: YearEnum;
  month: MonthEnum;
  date: DateEnum;
}>;

export type PartialYearMonthDate = Partial<YearMonthDate>;

export const defaultYearMonthDate: YearMonthDate = {
  year: new Date().getFullYear() as YearEnum,
  month: (new Date().getMonth() + 1) as MonthEnum,
  date: new Date().getDate() as DateEnum,
} as const;

const d = defaultYearMonthDate;
export const fillYearMonthDate = (a?: PartialYearMonthDate): YearMonthDate => ({
  year: a?.year ?? d.year,
  month: a?.month ?? d.month,
  date: a?.date ?? d.date,
});

export const ymdFromDate = (date: ReadonlyDate): YearMonthDate => ({
  year: getYear(date),
  month: getMonth(date),
  date: getDate(date),
});

export const compareYmd = (a: YearMonthDate, b: YearMonthDate): -1 | 0 | 1 => {
  if (a.year !== b.year) return sign(a.year - b.year);
  if (a.month !== b.month) return sign(a.month - b.month);
  if (a.date !== b.date) return sign(a.date - b.date);
  return 0;
};
