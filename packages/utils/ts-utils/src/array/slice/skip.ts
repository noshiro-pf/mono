import type { uint32 } from '../../types';
import { arraySize } from '../length';
import { safeSlice } from './safe-slice';

export const skip = <T>(array: readonly T[], num: uint32): T[] =>
  safeSlice(array, num, arraySize(array));
