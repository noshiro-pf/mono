import type { YearMonthDate } from '@noshiro/event-schedule-app-shared';
import { Num } from '@noshiro/ts-utils';
import type { Phantomic } from '@noshiro/ts-utils-additional';

export type YmdKey = Phantomic<string, 'YmdKey'>;

export const ymdToKey = ({ year, month, date }: YearMonthDate): YmdKey =>
  `${year}-${month}-${date}` as YmdKey;

export const ymdFromKey = (ymdKey: YmdKey): YearMonthDate => {
  const [yearStr, monthStr, dateStr] = ymdKey.split(
    '-'
  ) as MutableArrayOfLength<3, string>;
  return {
    year: Num.parseInt(yearStr, 10) ?? 1970,
    month: (Num.parseInt(monthStr, 10) ?? 1) as MonthEnum,
    date: (Num.parseInt(dateStr, 10) ?? 1) as DateEnum,
  };
};
