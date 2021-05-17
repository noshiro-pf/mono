import type { uint32 } from '../types';

export const arraySize = (array: readonly unknown[]): uint32 =>
  array.length as uint32;
