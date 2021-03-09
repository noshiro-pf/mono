import { MinutesEnum } from '../../types';

export const getMinutes = (date: Date): MinutesEnum =>
  date.getMinutes() as MinutesEnum;

export const setMinutes = (curr: Date, minutes: MinutesEnum): Date => {
  const copy: Date = new Date(curr);
  copy.setMinutes(minutes);
  return copy;
};

export const updateMinutes = (
  curr: Date,
  updater: (date: MinutesEnum) => MinutesEnum
): Date => setMinutes(curr, updater(getMinutes(curr)));
