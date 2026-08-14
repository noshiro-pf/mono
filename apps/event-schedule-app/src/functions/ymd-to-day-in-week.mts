import { type DayOfWeekName } from 'ts-type-forge';
import { ymd2day } from '../utils/index.mjs';

export const ymdToDayInWeek = (ymd: YearMonthDate): DayOfWeekName =>
  (['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'] as const)[ymd2day(ymd)];
