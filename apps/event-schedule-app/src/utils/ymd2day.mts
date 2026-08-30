import { DateUtils } from 'ts-fortress-types';
import { type DayOfWeekIndex } from 'ts-type-forge';

export const ymd2day = (ymd: YearMonthDate): DayOfWeekIndex =>
  DateUtils.getLocaleDayOfWeek(DateUtils.create(ymd.year, ymd.month, ymd.date));
