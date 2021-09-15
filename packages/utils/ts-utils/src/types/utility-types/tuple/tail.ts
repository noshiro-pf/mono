import { assertType } from '../test-type';

// export type Rest<T extends unknown[]> = ((...x: T) => void) extends (
//   x: T[0],
//   ...xs: infer XS
// ) => void
//   ? XS
//   : never;

export type TupleTail<A extends readonly unknown[]> = A extends readonly []
  ? []
  : A extends readonly [unknown, ...infer R]
  ? R
  : A;

assertType<TypeEq<TupleTail<[]>, []>>();
assertType<TypeEq<TupleTail<[1]>, []>>();
assertType<TypeEq<TupleTail<[1, 2, 3]>, [2, 3]>>();

export type ReadonlyTupleTail<A extends readonly unknown[]> =
  A extends readonly []
    ? readonly []
    : A extends readonly [unknown, ...infer R]
    ? Readonly<R>
    : Readonly<A>;

assertType<TypeEq<ReadonlyTupleTail<readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyTupleTail<readonly [1]>, readonly []>>();
assertType<TypeEq<ReadonlyTupleTail<readonly [1, 2, 3]>, readonly [2, 3]>>();
