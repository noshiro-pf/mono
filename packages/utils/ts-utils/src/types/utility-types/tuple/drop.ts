import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { TupleHead } from './head';
import type { ReadonlyTupleTail, TupleTail } from './tail';

type TupleDropImpl<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[]
> = {
  0: T;
  1: TupleDropImpl<N, TupleTail<T>, [TupleHead<T>, ...R]>;
}[T extends readonly [] ? 0 : R['length'] extends N ? 0 : 1];

export type TupleSkip<
  N extends number,
  T extends readonly unknown[]
> = TupleDropImpl<N, T, []>;

assertType<TypeEq<TupleSkip<0, []>, []>>();
assertType<TypeEq<TupleSkip<1, []>, []>>();
assertType<TypeEq<TupleSkip<0, [1, 2, 3]>, [1, 2, 3]>>();
assertType<TypeEq<TupleSkip<1, [1, 2, 3]>, [2, 3]>>();
assertType<TypeEq<TupleSkip<5, [1, 2, 3]>, []>>();

type _ReadonlyTupleSkip<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[]
> = {
  0: T;
  1: _ReadonlyTupleSkip<N, ReadonlyTupleTail<T>, readonly [TupleHead<T>, ...R]>;
}[T extends readonly [] ? 0 : R['length'] extends N ? 0 : 1];

export type ReadonlyTupleSkip<
  N extends number,
  T extends readonly unknown[]
> = _ReadonlyTupleSkip<N, T, readonly []>;

assertType<TypeEq<ReadonlyTupleSkip<0, readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyTupleSkip<1, readonly []>, readonly []>>();
assertType<
  TypeEq<ReadonlyTupleSkip<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>
>();
assertType<TypeEq<ReadonlyTupleSkip<1, readonly [1, 2, 3]>, readonly [2, 3]>>();
assertType<TypeEq<ReadonlyTupleSkip<5, readonly [1, 2, 3]>, readonly []>>();
