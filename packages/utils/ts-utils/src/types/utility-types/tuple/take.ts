import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { TupleHead } from './head';
import type { ReadonlyTupleReverse, TupleReverse } from './reverse';
import type { ReadonlyTupleTail, TupleTail } from './tail';

type _TupleTake<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[]
> = {
  0: TupleReverse<R>;
  1: _TupleTake<N, TupleTail<T>, [TupleHead<T>, ...R]>;
}[T extends readonly [] ? 0 : R['length'] extends N ? 0 : 1];

export type TupleTake<N extends number, T extends readonly unknown[]> =
  _TupleTake<N, T, []>;

assertType<TypeEq<TupleTake<2, []>, []>>();
assertType<TypeEq<TupleTake<2, [1, 2]>, [1, 2]>>();
assertType<TypeEq<TupleTake<2, [1, 2, 3]>, [1, 2]>>();
assertType<TypeEq<TupleTake<0, [1, 2, 3]>, []>>();

type _ReadonlyTupleTake<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[]
> = {
  0: ReadonlyTupleReverse<R>;
  1: _ReadonlyTupleTake<N, ReadonlyTupleTail<T>, readonly [TupleHead<T>, ...R]>;
}[T extends readonly [] ? 0 : R['length'] extends N ? 0 : 1];

export type ReadonlyTupleTake<N extends number, T extends readonly unknown[]> =
  _ReadonlyTupleTake<N, T, readonly []>;

assertType<TypeEq<ReadonlyTupleTake<2, readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyTupleTake<2, readonly [1, 2]>, readonly [1, 2]>>();
assertType<TypeEq<ReadonlyTupleTake<2, readonly [1, 2, 3]>, readonly [1, 2]>>();
assertType<TypeEq<ReadonlyTupleTake<0, readonly [1, 2, 3]>, readonly []>>();
