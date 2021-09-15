import type { IsFixedLengthList } from '../is-fixed-length-list';
import { assertType } from '../test-type';
import type { ReadonlyTupleSkip, TupleSkip } from '../tuple';

export type ListSkip<
  N extends number,
  T extends readonly unknown[]
> = TupleSkip<N, T>;

assertType<TypeEq<ListSkip<0, []>, []>>();
assertType<TypeEq<ListSkip<1, []>, []>>();
assertType<TypeEq<ListSkip<0, [1, 2, 3]>, [1, 2, 3]>>();
assertType<TypeEq<ListSkip<1, [1, 2, 3]>, [2, 3]>>();
assertType<TypeEq<ListSkip<5, [1, 2, 3]>, []>>();

export type ReadonlyListSkip<
  N extends number,
  T extends readonly unknown[]
> = IsFixedLengthList<T> extends true ? ReadonlyTupleSkip<N, T> : T;

assertType<TypeEq<ReadonlyListSkip<0, readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyListSkip<1, readonly []>, readonly []>>();
assertType<
  TypeEq<ReadonlyListSkip<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>
>();
assertType<TypeEq<ReadonlyListSkip<1, readonly [1, 2, 3]>, readonly [2, 3]>>();
assertType<TypeEq<ReadonlyListSkip<5, readonly [1, 2, 3]>, readonly []>>();
assertType<TypeEq<ReadonlyListSkip<5, readonly number[]>, readonly number[]>>();
