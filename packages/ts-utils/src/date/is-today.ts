import { DateLikeType } from './date-like-type';
import { toDate } from './to-date-object';

export const isToday = (dateLikeValue: DateLikeType): boolean => {
  const dt = toDate(dateLikeValue);
  // Get today's date
  const today = new Date();
  // call setHours to take the time out of the comparison
  return dt.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
};
