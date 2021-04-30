import { ReadonlyDate } from '../../../types';
import { YearEnum } from '../../types';

export const getYear = (date: ReadonlyDate): YearEnum =>
  date.getFullYear() as YearEnum;

export const setYear = (curr: ReadonlyDate, year: YearEnum): Date => {
  const copy: Date = new Date(curr as Date);
  copy.setFullYear(year);
  return copy;
};

export const updateYear = (
  curr: ReadonlyDate,
  updater: (date: YearEnum) => YearEnum
): Date => setYear(curr, updater(getYear(curr)));
