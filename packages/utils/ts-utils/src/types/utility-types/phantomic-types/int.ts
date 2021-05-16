import type { Phantomic } from '../phantomic';

// int
export type int = Phantomic<number, 'int'>;

export const isInt = (a: number): a is int => Number.isInteger(a);

// safeint
export type safeint = int & Phantomic<number, 'safeint'>;

export const isSafeInt = (a: number): a is safeint => Number.isSafeInteger(a);

// uint32
export type uint32 = Phantomic<number, 'uint32'> & safeint;

export const isUint32 = (a: number): a is uint32 =>
  Number.isInteger(a) && 0 <= a && a <= 2 ** 32 - 1;
