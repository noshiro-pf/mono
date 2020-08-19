import { safeSlice } from './safe-slice';

/** @internal */
export const skipLast = <T>(array: readonly T[], num: number): T[] =>
  safeSlice(array, 0, array.length - num);
