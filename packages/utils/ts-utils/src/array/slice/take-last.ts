import type { uint32 } from '../../types';
import { arraySize } from '../length';
import { safeSlice } from './safe-slice';

export const takeLast = <T>(array: readonly T[], num: uint32): T[] =>
  safeSlice(array, (arraySize(array) - num) as uint32, arraySize(array));
