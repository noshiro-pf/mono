import { sign } from '@mono/ts-utils';
import { DateEnum } from '../../utils/datetime/types/date';
import { MonthEnum } from '../../utils/datetime/types/month';
import { YearEnum } from '../../utils/datetime/types/year';
import { IRecord, IRecordType } from '../../utils/immutable';

export type YearMonthDateType = {
  year: YearEnum;
  month: MonthEnum;
  date: DateEnum;
};

export const IYearMonthDate = IRecord<YearMonthDateType>({
  year: new Date().getFullYear() as YearEnum,
  month: (new Date().getMonth() + 1) as MonthEnum,
  date: new Date().getDate() as DateEnum,
});

export type IYearMonthDateType = IRecordType<YearMonthDateType>;

export const compareYmd = (
  a: IYearMonthDateType,
  b: IYearMonthDateType
): -1 | 0 | 1 => {
  if (a.year !== b.year) return sign(a.year - b.year);
  if (a.month !== b.month) return sign(a.month - b.month);
  if (a.date !== b.date) return sign(a.date - b.date);
  return 0;
};
