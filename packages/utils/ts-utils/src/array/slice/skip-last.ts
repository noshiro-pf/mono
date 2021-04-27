import { uint32 } from '../../types';
import { length } from '../length';
import { safeSlice } from './safe-slice';

export const skipLast = <T>(array: readonly T[], num: uint32): T[] =>
  safeSlice(array, 0 as uint32, (length(array) - num) as uint32);
