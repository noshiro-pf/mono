import type { DateEnum, MonthEnum, YearEnum } from '@noshiro/ts-utils';
import { sign } from '../../../utils/sign';

export type YearMonthDateType = Readonly<{
  year: YearEnum;
  month: MonthEnum;
  date: DateEnum;
}>;

export const compareYmd = (
  a: YearMonthDateType,
  b: YearMonthDateType
): -1 | 0 | 1 => {
  if (a.year !== b.year) return sign(a.year - b.year);
  if (a.month !== b.month) return sign(a.month - b.month);
  if (a.date !== b.date) return sign(a.date - b.date);
  return 0;
};
