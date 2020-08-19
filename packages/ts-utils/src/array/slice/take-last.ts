import { safeSlice } from './safe-slice';

/** @internal */
export const takeLast = <T>(array: readonly T[], num: number): T[] =>
  safeSlice(array, array.length - num, array.length);
