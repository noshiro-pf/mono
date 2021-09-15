import { assertType } from '../test-type';
import type { ReadonlyTupleButLast, TupleButLast } from './butlast';
import type { TupleLast } from './last';

type TupleSkipLastImpl<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[]
> = {
  0: T;
  1: TupleSkipLastImpl<N, TupleButLast<T>, [TupleLast<T>, ...R]>;
}[T extends readonly [] ? 0 : R['length'] extends N ? 0 : 1];

export type TupleSkipLast<
  N extends number,
  T extends readonly unknown[]
> = TupleSkipLastImpl<N, T, []>;

assertType<TypeEq<TupleSkipLast<0, []>, []>>();
assertType<TypeEq<TupleSkipLast<1, []>, []>>();
assertType<TypeEq<TupleSkipLast<0, [1, 2, 3]>, [1, 2, 3]>>();
assertType<TypeEq<TupleSkipLast<1, [1, 2, 3]>, [1, 2]>>();
assertType<TypeEq<TupleSkipLast<5, [1, 2, 3]>, []>>();

type ReadonlyTupleSkipLastImpl<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[]
> = {
  0: T;
  1: ReadonlyTupleSkipLastImpl<
    N,
    ReadonlyTupleButLast<T>,
    readonly [TupleLast<T>, ...R]
  >;
}[T extends readonly [] ? 0 : R['length'] extends N ? 0 : 1];

export type ReadonlyTupleSkipLast<
  N extends number,
  T extends readonly unknown[]
> = ReadonlyTupleSkipLastImpl<N, T, readonly []>;

assertType<TypeEq<ReadonlyTupleSkipLast<0, readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyTupleSkipLast<1, readonly []>, readonly []>>();
assertType<
  TypeEq<ReadonlyTupleSkipLast<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>
>();
assertType<
  TypeEq<ReadonlyTupleSkipLast<1, readonly [1, 2, 3]>, readonly [1, 2]>
>();
assertType<TypeEq<ReadonlyTupleSkipLast<5, readonly [1, 2, 3]>, readonly []>>();
