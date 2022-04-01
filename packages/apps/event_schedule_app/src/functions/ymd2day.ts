import type { YearMonthDate } from '@noshiro/event-schedule-app-shared';
import type { WeekDayEnum } from '@noshiro/ts-utils';
import { IDate } from '@noshiro/ts-utils';

export const ymd2day = (ymd: YearMonthDate): WeekDayEnum =>
  IDate.getLocaleDayOfWeek(IDate.create(ymd.year, ymd.month, ymd.date));
