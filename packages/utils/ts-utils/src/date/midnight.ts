import { DateLikeType } from './date-like-type';
import { toDate } from './to-date-object';

export const toMidnight = (dateLikeValue: DateLikeType): Date => {
  const dt = toDate(dateLikeValue);
  const midnight = new Date(dt);
  midnight.setHours(0);
  midnight.setMinutes(0);
  midnight.setSeconds(0);
  midnight.setMilliseconds(0);
  return midnight;
};

export const toMidnightTimestamp = (dateLikeValue: DateLikeType): number =>
  toMidnight(dateLikeValue).getTime();
