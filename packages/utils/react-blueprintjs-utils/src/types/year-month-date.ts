import { DateEnum, MonthEnum, YearEnum } from '@noshiro/ts-utils';

export type YearMonthDate = Readonly<{
  year: YearEnum;
  month: MonthEnum;
  date: DateEnum;
}>;
