import type { uint32 } from '../../types';
import { safeSlice } from './safe-slice';

export const take = <T>(array: readonly T[], num: uint32): T[] =>
  safeSlice(array, 0 as uint32, num);
