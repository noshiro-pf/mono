import { safeSlice } from './safe-slice';

/** @internal */
export const take = <T>(array: readonly T[], num: number): T[] =>
  safeSlice(array, 0, num);
