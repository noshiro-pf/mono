import type { MonthEnum, YearEnum } from '../types';
import { setDate } from './date-wrapper';
import { getLastDateNumberOfSameMonth } from './get-last-date-number-of-month';
import { newDate } from './new-date';
import { weekNumber } from './week-number';

export const numWeeksOfSameMonth = (date: ReadonlyDate): number => {
  const lastDateNumber = getLastDateNumberOfSameMonth(date);
  const lastDate = setDate(date, lastDateNumber);
  return weekNumber(lastDate) + 1;
};

export const numWeeksOfMonth = (year: YearEnum, month: MonthEnum): number =>
  numWeeksOfSameMonth(newDate(year, month));
