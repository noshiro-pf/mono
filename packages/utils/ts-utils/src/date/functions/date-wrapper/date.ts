import { DateEnum } from '../../types';

export const getDate = (date: Date): DateEnum => date.getDate() as DateEnum;

export const setDate = (curr: Date, date: DateEnum): Date => {
  const copy: Date = new Date(curr);
  copy.setDate(date);
  return copy;
};
