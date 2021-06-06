import type { Length, uint32 } from '../types';

export const arraySize = <T extends readonly unknown[]>(
  array: T
): Length<T> & uint32 => array.length as uint32;
