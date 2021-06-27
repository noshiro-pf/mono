import type { YearMonthDate } from '@noshiro/event-schedule-app-shared';
import type {
  ArrayOfLength,
  DateEnum,
  MonthEnum,
  Phantomic,
  YearEnum,
} from '@noshiro/ts-utils';

export type YmdKey = Phantomic<string, 'YmdKey'>;

export const ymdToKey = ({ year, month, date }: YearMonthDate): YmdKey =>
  `${year}-${month}-${date}` as YmdKey;

export const ymdFromKey = (ymdKey: YmdKey): YearMonthDate => {
  const [year, month, date] = ymdKey.split('-') as ArrayOfLength<3, string>;
  return {
    year: parseInt(year, 10) as YearEnum,
    month: parseInt(month, 10) as MonthEnum,
    date: parseInt(date, 10) as DateEnum,
  };
};
