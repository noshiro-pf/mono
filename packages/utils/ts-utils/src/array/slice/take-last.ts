import { uint32 } from '../../types';
import { length } from '../length';
import { safeSlice } from './safe-slice';

export const takeLast = <T>(array: readonly T[], num: uint32): T[] =>
  safeSlice(array, (length(array) - num) as uint32, length(array));
