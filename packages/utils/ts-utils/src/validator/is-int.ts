import { isInRange } from '../num';

/** @description Number.isInteger */
export const isInt = (a: number): boolean => Number.isInteger(a);

/** @description Number.isSafeInteger */
export const isSafeInt = (a: number): boolean => Number.isSafeInteger(a);

/** @description check value with Number.isInteger and check range */
export const isUint32 = (a: number): boolean =>
  Number.isInteger(a) && isInRange(0, 2 ** 32 - 1)(a);
