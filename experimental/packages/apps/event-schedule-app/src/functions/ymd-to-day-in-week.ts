import { ymd2day } from '../utils';

export const ymdToDayInWeek = (ymd: YearMonthDate): DayOfWeekName =>
  (['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'] as const)[ymd2day(ymd)];
