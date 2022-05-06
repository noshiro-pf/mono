import {
  hasKeyValue,
  IDate,
  isNonNullObject,
  isNumber,
  Num,
  pipe,
} from '@noshiro/ts-utils';

export type YearMonthDate = Readonly<{
  year: YearEnum;
  month: MonthEnum;
  date: DateEnum;
}>;

export const yearMonthDateDefaultValue: YearMonthDate = {
  year: pipe(IDate.today()).chain(IDate.getLocaleYear).value,
  month: pipe(IDate.today()).chain(IDate.getLocaleMonth).value,
  date: pipe(IDate.today()).chain(IDate.getLocaleDate).value,
} as const;

export const isYearEnum = (a: unknown): a is YearEnum =>
  isNumber(a) && Num.isInt(a) && a > 0;

export const isMonthEnum = (a: unknown): a is MonthEnum =>
  isNumber(a) && Num.isInt(a) && Num.isInRange(1, 12)(a);

export const isDateEnum = (a: unknown): a is DateEnum =>
  isNumber(a) && Num.isInt(a) && Num.isInRange(1, 31)(a);

export const isYearMonthDate = (a: unknown): a is YearMonthDate =>
  isNonNullObject(a) &&
  hasKeyValue(a, 'year', isYearEnum) &&
  hasKeyValue(a, 'month', isMonthEnum) &&
  hasKeyValue(a, 'date', isDateEnum);

const d = yearMonthDateDefaultValue;

export const fillYearMonthDate = (a?: unknown): YearMonthDate =>
  !isNonNullObject(a)
    ? d
    : {
        year: hasKeyValue(a, 'year', isYearEnum) ? a.year : d.year,
        month: hasKeyValue(a, 'month', isMonthEnum) ? a.month : d.month,
        date: hasKeyValue(a, 'date', isDateEnum) ? a.date : d.date,
      };

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
