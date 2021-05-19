import type { WeekDayEnum } from '@noshiro/ts-utils';
import { getDay, newDate } from '@noshiro/ts-utils';
import type { IYearMonthDate } from '../types';

export const ymd2day = (ymd: IYearMonthDate): WeekDayEnum =>
  getDay(newDate(ymd.year, ymd.month, ymd.date));
