import { DateLikeType } from './date-like-type';
import { toDate } from './to-date-object';

/**
 * @description 引数の日が含まれる月の最終日(28-31)の数値を返す
 */
export const getLastDateNumberOfMonth = (
  dateLikeValue: DateLikeType
): number => {
  const dt = toDate(dateLikeValue);
  return new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
};
