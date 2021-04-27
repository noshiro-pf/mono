import { uint32 } from '../../types';
import { length } from '../length';
import { safeSlice } from './safe-slice';

export const rest = <T>(array: readonly T[]): T[] =>
  safeSlice(array, 1 as uint32, length(array));
