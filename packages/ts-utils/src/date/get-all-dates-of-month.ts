import { range } from '../array';
import { getLastDateNumberOfMonth } from './get-last-date-number-of-month';

export const getAllDatesOfMonth = (year: number, month: number): Date[] => {
  const firstDateOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
  return range(1, getLastDateNumberOfMonth(firstDateOfMonth)).map(
    (dt) => new Date(year, month, dt, 0, 0, 0, 0)
  );
};

export const getAllDatesOfMonthAsTimestamp = (
  year: number,
  month: number
): number[] => getAllDatesOfMonth(year, month).map((dt) => dt.getTime());
