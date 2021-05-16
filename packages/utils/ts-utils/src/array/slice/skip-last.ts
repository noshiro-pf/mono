import type { uint32 } from '../../types';
import { arraySize } from '../length';
import { safeSlice } from './safe-slice';

export const skipLast = <T>(array: readonly T[], num: uint32): T[] =>
  safeSlice(array, 0 as uint32, (arraySize(array) - num) as uint32);
