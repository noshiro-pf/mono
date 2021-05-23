import type {
  DateEnum,
  DeepReadonly,
  MonthEnum,
  YearEnum,
} from '@noshiro/ts-utils';
import { sign } from '@noshiro/ts-utils';
import { IRecord } from '../../../utils';

type YearMonthDateBaseType = Readonly<{
  year: YearEnum;
  month: MonthEnum;
  date: DateEnum;
}>;

export type PartialYearMonthDate = Partial<Readonly<YearMonthDateBaseType>>;

export type IYearMonthDate = DeepReadonly<
  IRecord<YearMonthDateBaseType> & YearMonthDateBaseType
>;

const IYearMonthDateRecordFactory = IRecord<YearMonthDateBaseType>({
  year: new Date().getFullYear() as YearEnum,
  month: (new Date().getMonth() + 1) as MonthEnum,
  date: new Date().getDate() as DateEnum,
});

export const createIYearMonthDate: (
  a?: YearMonthDateBaseType
) => IYearMonthDate = IYearMonthDateRecordFactory;

export const fillYearMonthDate: (a?: PartialYearMonthDate) => IYearMonthDate =
  IYearMonthDateRecordFactory;

export const compareYmd = (
  a: IYearMonthDate,
  b: IYearMonthDate
): -1 | 0 | 1 => {
  if (a.year !== b.year) return sign(a.year - b.year);
  if (a.month !== b.month) return sign(a.month - b.month);
  if (a.date !== b.date) return sign(a.date - b.date);
  return 0;
};
