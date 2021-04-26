import { uint32 } from '../types';

export const length = (array: readonly unknown[]): uint32 =>
  array.length as uint32;
