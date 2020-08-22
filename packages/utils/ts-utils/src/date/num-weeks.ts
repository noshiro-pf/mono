import { DateLikeType } from './date-like-type';
import { getLastDateNumberOfMonth } from './get-last-date-number-of-month';
import { toDate } from './to-date-object';
import { weekNumber } from './week-number';

export const numWeeks = (dateLikeValue: DateLikeType): number => {
  const dt = toDate(dateLikeValue);
  const lastDateNumber = getLastDateNumberOfMonth(dt);
  const lastDate: Date = new Date(dt);
  lastDate.setDate(lastDateNumber);
  return weekNumber(lastDate) + 1;
};
