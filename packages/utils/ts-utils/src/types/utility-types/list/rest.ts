import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';

export type Rest<T extends unknown[]> = ((...x: T) => void) extends (
  x: T[0],
  ...xs: infer XS
) => void
  ? XS
  : never;

assertType<TypeEq<Rest<[]>, []>>();
assertType<TypeEq<Rest<[1]>, []>>();
assertType<TypeEq<Rest<[1, 2, 3]>, [2, 3]>>();
