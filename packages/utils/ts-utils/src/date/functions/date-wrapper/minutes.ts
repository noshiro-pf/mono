import type { MinutesEnum } from '../../types';

export const getMinutes = (date: ReadonlyDate): MinutesEnum =>
  date.getMinutes() as MinutesEnum;

export const setMinutes = (curr: ReadonlyDate, minutes: MinutesEnum): Date => {
  const copy: Date = new Date(curr as Date);
  copy.setMinutes(minutes);
  return copy;
};

export const updateMinutes = (
  curr: ReadonlyDate,
  updater: (date: MinutesEnum) => MinutesEnum
): Date => setMinutes(curr, updater(getMinutes(curr)));
