import { HoursEnum } from '../../types';

export const getHours = (date: Date): HoursEnum => date.getHours() as HoursEnum;

export const setHours = (curr: Date, minutes: HoursEnum): Date => {
  const copy: Date = new Date(curr);
  copy.setHours(minutes);
  return copy;
};
