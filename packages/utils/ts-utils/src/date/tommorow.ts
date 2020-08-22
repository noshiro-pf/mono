import { DateLikeType } from './date-like-type';
import { toDate } from './to-date-object';

export const getTomorrow = (dateLikeValue: DateLikeType): Date => {
  const dt = toDate(dateLikeValue);
  return new Date(new Date(dt).setDate(dt.getDate() + 1));
};

export const getTomorrowTimestamp = (dateLikeValue: DateLikeType): number =>
  getTomorrow(dateLikeValue).getTime();
