import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { ReadonlyTupleButLast, TupleButLast } from './butlast';
import type { TupleLast } from './last';

type TupleTakeLastImpl<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[]
> = {
  0: R;
  1: TupleTakeLastImpl<N, TupleButLast<T>, [TupleLast<T>, ...R]>;
}[T extends readonly [] ? 0 : R['length'] extends N ? 0 : 1];

export type TupleTakeLast<
  N extends number,
  T extends readonly unknown[]
> = TupleTakeLastImpl<N, T, []>;

assertType<TypeEq<TupleTakeLast<2, []>, []>>();
assertType<TypeEq<TupleTakeLast<2, [1, 2]>, [1, 2]>>();
assertType<TypeEq<TupleTakeLast<2, [1, 2, 3]>, [2, 3]>>();
assertType<TypeEq<TupleTakeLast<0, [1, 2, 3]>, []>>();

type ReadonlyTupleTakeLastImpl<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[]
> = {
  0: R;
  1: ReadonlyTupleTakeLastImpl<
    N,
    ReadonlyTupleButLast<T>,
    readonly [TupleLast<T>, ...R]
  >;
}[T extends readonly [] ? 0 : R['length'] extends N ? 0 : 1];

export type ReadonlyTupleTakeLast<
  N extends number,
  T extends readonly unknown[]
> = ReadonlyTupleTakeLastImpl<N, T, readonly []>;

assertType<TypeEq<ReadonlyTupleTakeLast<2, readonly []>, readonly []>>();
assertType<
  TypeEq<ReadonlyTupleTakeLast<2, readonly [1, 2]>, readonly [1, 2]>
>();
assertType<
  TypeEq<ReadonlyTupleTakeLast<2, readonly [1, 2, 3]>, readonly [2, 3]>
>();
assertType<TypeEq<ReadonlyTupleTakeLast<0, readonly [1, 2, 3]>, readonly []>>();
