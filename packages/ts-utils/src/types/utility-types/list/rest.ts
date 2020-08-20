import { assertType, TypeEq } from '../test-type';

export type Rest<T extends any[]> = ((...x: T) => void) extends (
  x: any,
  ...xs: infer XS
) => void
  ? XS
  : never;

assertType<TypeEq<Rest<[]>, []>>();
assertType<TypeEq<Rest<[1]>, []>>();
assertType<TypeEq<Rest<[1, 2, 3]>, [2, 3]>>();
