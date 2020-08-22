import { safeSlice } from './safe-slice';

export const rest = <T>(array: readonly T[]): T[] =>
  safeSlice(array, 1, array.length);
