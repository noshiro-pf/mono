import type { ReadonlyDate } from '../../../types';
import type { YearEnum } from '../../types';

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
