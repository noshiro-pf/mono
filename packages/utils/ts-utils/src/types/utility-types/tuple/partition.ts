import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { TupleHead } from './head';
import type { ReadonlyTupleReverse, TupleReverse } from './reverse';
import type { ReadonlyTupleTail, TupleTail } from './tail';

type _TuplePartition<
  N extends number,
  T extends readonly unknown[],
  R1 extends readonly unknown[],
  R2 extends readonly unknown[]
> = {
  0: TupleReverse<R2>;
  1: _TuplePartition<N, T, [], [TupleReverse<R1>, ...R2]>;
  2: _TuplePartition<N, TupleTail<T>, [TupleHead<T>, ...R1], R2>;
}[T extends readonly []
  ? R1 extends readonly []
    ? 0
    : 1
  : R1['length'] extends N
  ? 1
  : 2];

export type TuplePartition<N extends number, T extends readonly unknown[]> =
  _TuplePartition<N, T, [], []>;

assertType<TypeEq<TuplePartition<1, []>, []>>();
assertType<TypeEq<TuplePartition<2, [1, 2, 3]>, [[1, 2], [3]]>>();
assertType<TypeEq<TuplePartition<3, [1, 2, 3]>, [[1, 2, 3]]>>();
assertType<TypeEq<TuplePartition<2, [1, 2, 3, 4]>, [[1, 2], [3, 4]]>>();

type _ReadonlyTuplePartition<
  N extends number,
  T extends readonly unknown[],
  R1 extends readonly unknown[],
  R2 extends readonly unknown[]
> = {
  0: ReadonlyTupleReverse<R2>;
  1: _ReadonlyTuplePartition<
    N,
    T,
    readonly [],
    readonly [ReadonlyTupleReverse<R1>, ...R2]
  >;
  2: _ReadonlyTuplePartition<
    N,
    ReadonlyTupleTail<T>,
    readonly [TupleHead<T>, ...R1],
    R2
  >;
}[T extends readonly []
  ? R1 extends readonly []
    ? 0
    : 1
  : R1['length'] extends N
  ? 1
  : 2];

export type ReadonlyTuplePartition<
  N extends number,
  T extends readonly unknown[]
> = _ReadonlyTuplePartition<N, T, readonly [], readonly []>;

assertType<TypeEq<ReadonlyTuplePartition<1, readonly []>, readonly []>>();
assertType<
  TypeEq<
    ReadonlyTuplePartition<2, readonly [1, 2, 3]>,
    readonly [readonly [1, 2], readonly [3]]
  >
>();
assertType<
  TypeEq<
    ReadonlyTuplePartition<3, readonly [1, 2, 3]>,
    readonly [readonly [1, 2, 3]]
  >
>();
assertType<
  TypeEq<
    ReadonlyTuplePartition<2, readonly [1, 2, 3, 4]>,
    readonly [readonly [1, 2], readonly [3, 4]]
  >
>();
