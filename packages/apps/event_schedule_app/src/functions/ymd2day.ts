import type { YearMonthDate } from '@noshiro/event-schedule-app-api';
import type { WeekDayEnum } from '@noshiro/ts-utils';
import { getDay, newDate } from '@noshiro/ts-utils';

export const ymd2day = (ymd: YearMonthDate): WeekDayEnum =>
  getDay(newDate(ymd.year, ymd.month, ymd.date));
