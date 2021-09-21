import { IList } from '../../immutable';
import type { DateEnum, MonthEnum, YearEnum } from '../types';
import { getLastDateNumberOfMonth } from './get-last-date-number-of-month';
import { newDate } from './new-date';
import { toTimestamp } from './to-timestamp';

export const getAllDatesOfMonth = (
  year: YearEnum,
  month: MonthEnum
): readonly Date[] =>
  IList.rangeThrow(1, getLastDateNumberOfMonth(year, month) + 1).map((date) =>
    newDate(year, month, date as DateEnum)
  );

export const getAllDatesOfMonthAsTimestamp = (
  year: YearEnum,
  month: MonthEnum
): readonly number[] => getAllDatesOfMonth(year, month).map(toTimestamp);
