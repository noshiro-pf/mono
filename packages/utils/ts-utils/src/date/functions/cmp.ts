import { toTimestamp } from './to-timestamp';

/**
 * date1  <  date2 --> -1
 * date1  >  date2 -->  1
 * date1 === date2 -->  0
 */
export const dateCmp = (x: ReadonlyDate, y: ReadonlyDate): -1 | 0 | 1 => {
  const date1value = toTimestamp(x);
  const date2value = toTimestamp(y);
  if (date1value < date2value) return -1;
  if (date1value > date2value) return 1;
  return 0;
};
