import { SecondsEnum } from '../../types';

export const getSeconds = (date: Date): SecondsEnum =>
  date.getSeconds() as SecondsEnum;

export const setSeconds = (curr: Date, seconds: SecondsEnum): Date => {
  const copy: Date = new Date(curr);
  copy.setSeconds(seconds);
  return copy;
};
