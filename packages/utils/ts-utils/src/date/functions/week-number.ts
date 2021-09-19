import { getDate, getDay } from './date-wrapper';

/**
 * @description 何週目か(0-origin)を返す
 */
export const weekNumber = (date: ReadonlyDate): number => {
  const date0Saturday = getDate(date) - 1 + (6 - getDay(date)); // 同じ週の土曜日
  return Math.floor(date0Saturday / 7);
};
