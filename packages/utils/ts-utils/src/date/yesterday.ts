import { DateLikeType } from './date-like-type';
import { toDate } from './to-date-object';

export const getYestereday = (dateLikeValue: DateLikeType): Date => {
  const dt = toDate(dateLikeValue);
  return new Date(new Date(dt).setDate(dt.getDate() - 1));
};

export const getYesteredayTimestamp = (dateLikeValue: DateLikeType): number =>
  getYestereday(dateLikeValue).getTime();
