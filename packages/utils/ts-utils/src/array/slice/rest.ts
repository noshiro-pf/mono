import type { uint32 } from '../../types';
import { arraySize } from '../length';
import { safeSlice } from './safe-slice';

export const rest = <T>(array: readonly T[]): T[] =>
  safeSlice(array, 1 as uint32, arraySize(array));
