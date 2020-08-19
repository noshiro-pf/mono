import { safeSlice } from './safe-slice';

/** @internal */
export const skip = <T>(array: readonly T[], num: number): T[] =>
  safeSlice(array, num, array.length);
