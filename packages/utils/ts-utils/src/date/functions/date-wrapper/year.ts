import { YearEnum } from '../../types';

export const getYear = (date: Date): YearEnum => date.getFullYear() as YearEnum;

export const setYear = (curr: Date, year: YearEnum): Date => {
  const copy: Date = new Date(curr);
  copy.setFullYear(year);
  return copy;
};

export const updateYear = (
  curr: Date,
  updater: (date: YearEnum) => YearEnum
): Date => setYear(curr, updater(getYear(curr)));
