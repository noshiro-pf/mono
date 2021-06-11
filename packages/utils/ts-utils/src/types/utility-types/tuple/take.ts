import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { TupleHead } from './head';
import type { ReadonlyTupleReverse, TupleReverse } from './reverse';
import type { ReadonlyTupleTail, TupleTail } from './tail';

type TupleTakeImpl<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[]
> = {
  0: TupleReverse<R>;
  1: TupleTakeImpl<N, TupleTail<T>, [TupleHead<T>, ...R]>;
}[T extends readonly [] ? 0 : R['length'] extends N ? 0 : 1];

export type TupleTake<N extends number, T extends readonly unknown[]> =
  TupleTakeImpl<N, T, []>;

assertType<TypeEq<TupleTake<2, []>, []>>();
assertType<TypeEq<TupleTake<2, [1, 2]>, [1, 2]>>();
assertType<TypeEq<TupleTake<2, [1, 2, 3]>, [1, 2]>>();
assertType<TypeEq<TupleTake<0, [1, 2, 3]>, []>>();

type ReadonlyTupleTakeImpl<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[]
> = {
  0: ReadonlyTupleReverse<R>;
  1: ReadonlyTupleTakeImpl<
    N,
    ReadonlyTupleTail<T>,
    readonly [TupleHead<T>, ...R]
  >;
}[T extends readonly [] ? 0 : R['length'] extends N ? 0 : 1];

export type ReadonlyTupleTake<N extends number, T extends readonly unknown[]> =
  ReadonlyTupleTakeImpl<N, T, readonly []>;

assertType<TypeEq<ReadonlyTupleTake<2, readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyTupleTake<2, readonly [1, 2]>, readonly [1, 2]>>();
assertType<TypeEq<ReadonlyTupleTake<2, readonly [1, 2, 3]>, readonly [1, 2]>>();
assertType<TypeEq<ReadonlyTupleTake<0, readonly [1, 2, 3]>, readonly []>>();
