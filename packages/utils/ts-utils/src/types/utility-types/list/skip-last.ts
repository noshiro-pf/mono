import type { IsFixedLengthList } from '../is-fixed-length-list';
import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { ReadonlyTupleSkipLast, TupleSkipLast } from '../tuple';

export type ListSkipLast<
  N extends number,
  T extends readonly unknown[]
> = TupleSkipLast<N, T>;

assertType<TypeEq<ListSkipLast<0, []>, []>>();
assertType<TypeEq<ListSkipLast<1, []>, []>>();
assertType<TypeEq<ListSkipLast<0, [1, 2, 3]>, [1, 2, 3]>>();
assertType<TypeEq<ListSkipLast<1, [1, 2, 3]>, [1, 2]>>();
assertType<TypeEq<ListSkipLast<5, [1, 2, 3]>, []>>();

export type ReadonlyListSkipLast<
  N extends number,
  T extends readonly unknown[]
> = IsFixedLengthList<T> extends true ? ReadonlyTupleSkipLast<N, T> : T;

assertType<TypeEq<ReadonlyListSkipLast<0, readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyListSkipLast<1, readonly []>, readonly []>>();
assertType<
  TypeEq<ReadonlyListSkipLast<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>
>();
assertType<
  TypeEq<ReadonlyListSkipLast<1, readonly [1, 2, 3]>, readonly [1, 2]>
>();
assertType<TypeEq<ReadonlyListSkipLast<5, readonly [1, 2, 3]>, readonly []>>();
assertType<
  TypeEq<ReadonlyListSkipLast<5, readonly number[]>, readonly number[]>
>();
