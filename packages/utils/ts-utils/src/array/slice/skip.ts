import { safeSlice } from './safe-slice';

export const skip = <T>(array: readonly T[], num: number): T[] =>
  safeSlice(array, num, array.length);
