import { ReadonlyDate } from '../../../types';
import { DateEnum } from '../../types';

export const getDate = (date: ReadonlyDate): DateEnum =>
  date.getDate() as DateEnum;

export const setDate = (curr: ReadonlyDate, date: DateEnum): Date => {
  const copy: Date = new Date(curr as Date);
  copy.setDate(date);
  return copy;
};

export const updateDate = (
  curr: ReadonlyDate,
  updater: (date: DateEnum) => DateEnum
): Date => setDate(curr, updater(getDate(curr)));
