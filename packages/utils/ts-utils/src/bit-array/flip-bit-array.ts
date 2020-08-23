import { MonoTypeFunction } from '../types';
import { ReadonlyBitArrayType } from './readonly-bit-array';

export const flipReadonlyBitArray: MonoTypeFunction<ReadonlyBitArrayType> = (
  rb
) => rb.map((v) => (v === 1 ? 0 : 1));
