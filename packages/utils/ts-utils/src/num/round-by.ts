import { uint32 } from '../types';

export const roundBy = (digit: uint32, value: number): number =>
  Math.round(value * 10 ** digit) / 10 ** digit;
