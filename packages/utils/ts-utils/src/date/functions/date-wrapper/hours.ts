import type { ReadonlyDate } from '../../../types';
import type { HoursEnum } from '../../types';

export const getHours = (date: ReadonlyDate): HoursEnum =>
  date.getHours() as HoursEnum;

export const setHours = (curr: ReadonlyDate, minutes: HoursEnum): Date => {
  const copy: Date = new Date(curr as Date);
  copy.setHours(minutes);
  return copy;
};

export const updateHours = (
  curr: ReadonlyDate,
  updater: (date: HoursEnum) => HoursEnum
): Date => setHours(curr, updater(getHours(curr)));
