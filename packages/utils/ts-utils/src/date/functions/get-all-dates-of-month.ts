import { range } from '../../array';
import type { uint32 } from '../../types';
import type { DateEnum, MonthEnum, YearEnum } from '../types';
import { getLastDateNumberOfMonth } from './get-last-date-number-of-month';
import { newDate } from './new-date';
import { toTimestamp } from './to-timestamp';

export const getAllDatesOfMonth = (year: YearEnum, month: MonthEnum): Date[] =>
  range(1 as uint32, (getLastDateNumberOfMonth(year, month) + 1) as uint32).map(
    (date) => newDate(year, month, date as DateEnum)
  );

export const getAllDatesOfMonthAsTimestamp = (
  year: YearEnum,
  month: MonthEnum
): number[] => getAllDatesOfMonth(year, month).map(toTimestamp);
