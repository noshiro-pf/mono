import { DateLikeType } from './date-like-type';
import { toDate } from './to-date-object';

/**
 * @description 何週目か(0-origin)を返す
 */
export const weekNumber = (dateLikeValue: DateLikeType): number => {
  const dt = toDate(dateLikeValue);
  const date0Saturday = dt.getDate() - 1 + (6 - dt.getDay()); // 同じ週の土曜日
  return Math.floor(date0Saturday / 7);
};
