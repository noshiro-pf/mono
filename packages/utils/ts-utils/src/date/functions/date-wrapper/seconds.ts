import type { ReadonlyDate } from '../../../types';
import type { SecondsEnum } from '../../types';

export const getSeconds = (date: ReadonlyDate): SecondsEnum =>
  date.getSeconds() as SecondsEnum;

export const setSeconds = (curr: ReadonlyDate, seconds: SecondsEnum): Date => {
  const copy: Date = new Date(curr as Date);
  copy.setSeconds(seconds);
  return copy;
};

export const updateSeconds = (
  curr: ReadonlyDate,
  updater: (date: SecondsEnum) => SecondsEnum
): Date => setSeconds(curr, updater(getSeconds(curr)));
