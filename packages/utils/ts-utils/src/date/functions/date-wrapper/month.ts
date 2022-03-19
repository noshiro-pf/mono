import type { MonthEnum } from '../../types';

export const getMonth = (date: ReadonlyDate): MonthEnum =>
  (date.getMonth() + 1) as MonthEnum;

export const setMonth = (curr: ReadonlyDate, month: MonthEnum): Date => {
  const copy: Date = new Date(curr as Date);

  copy.setMonth(month - 1);

  return copy;
};

export const updateMonth = (
  curr: ReadonlyDate,
  updater: (date: MonthEnum) => MonthEnum
): Date => setMonth(curr, updater(getMonth(curr)));
