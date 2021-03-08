import { MonthEnum } from '../../types';

export const getMonth = (date: Date): MonthEnum =>
  (date.getMonth() + 1) as MonthEnum;

export const setMonth = (curr: Date, month: MonthEnum): Date => {
  const copy: Date = new Date(curr);
  copy.setMonth(month - 1);
  return copy;
};
