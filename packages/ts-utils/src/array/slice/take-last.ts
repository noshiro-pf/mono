import { safeSlice } from './safe-slice';

export const takeLast = <T>(array: readonly T[], num: number): T[] =>
  safeSlice(array, array.length - num, array.length);
