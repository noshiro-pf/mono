import {
  DateUtils,
  isNumber,
  isRecord,
  Num,
  Obj,
  pipe,
} from '@noshiro/ts-utils';

export type YearMonthDate = Readonly<{
  year: YearEnum;
  month: MonthEnum;
  date: DateEnum;
}>;

export const yearMonthDateDefaultValue: YearMonthDate = {
  year: pipe(DateUtils.today()).chain(DateUtils.getLocaleYear).value,
  month: pipe(DateUtils.today()).chain(DateUtils.getLocaleMonth).value,
  date: pipe(DateUtils.today()).chain(DateUtils.getLocaleDate).value,
} as const;

export const isYearEnum = (a: unknown): a is YearEnum =>
  isNumber(a) && Number.isInteger(a) && a > 0;

export const isMonthEnum = (a: unknown): a is MonthEnum =>
  isNumber(a) && Number.isInteger(a) && Num.isInRange(1, 12)(a);

export const isDateEnum = (a: unknown): a is DateEnum =>
  isNumber(a) && Number.isInteger(a) && Num.isInRange(1, 31)(a);

export const isYearMonthDate = (a: unknown): a is YearMonthDate =>
  isRecord(a) &&
  Obj.hasKeyValue(a, 'year', isYearEnum) &&
  Obj.hasKeyValue(a, 'month', isMonthEnum) &&
  Obj.hasKeyValue(a, 'date', isDateEnum);

const d = yearMonthDateDefaultValue;

export const fillYearMonthDate = (a?: unknown): YearMonthDate =>
  a === undefined || !isRecord(a)
    ? d
    : {
        year: Obj.hasKeyValue(a, 'year', isYearEnum) ? a.year : d.year,
        month: Obj.hasKeyValue(a, 'month', isMonthEnum) ? a.month : d.month,
        date: Obj.hasKeyValue(a, 'date', isDateEnum) ? a.date : d.date,
      };

export const ymdFromDate = (date: DateUtils): YearMonthDate => ({
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
