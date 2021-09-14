import type { IsFixedLengthList } from '../is-fixed-length-list';
import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { ReadonlyTupleTakeLast, TupleTakeLast } from '../tuple';

export type ListTakeLast<
  N extends number,
  T extends readonly unknown[]
> = TupleTakeLast<N, T>;

assertType<TypeEq<ListTakeLast<2, []>, []>>();
assertType<TypeEq<ListTakeLast<2, [1, 2]>, [1, 2]>>();
assertType<TypeEq<ListTakeLast<2, [1, 2, 3]>, [2, 3]>>();
assertType<TypeEq<ListTakeLast<0, [1, 2, 3]>, []>>();

export type ReadonlyListTakeLast<
  N extends number,
  T extends readonly unknown[]
> = IsFixedLengthList<T> extends true ? ReadonlyTupleTakeLast<N, T> : T;

assertType<TypeEq<ReadonlyListTakeLast<2, readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyListTakeLast<2, readonly [1, 2]>, readonly [1, 2]>>();
assertType<
  TypeEq<ReadonlyListTakeLast<2, readonly [1, 2, 3]>, readonly [2, 3]>
>();
assertType<TypeEq<ReadonlyListTakeLast<0, readonly [1, 2, 3]>, readonly []>>();
assertType<
  TypeEq<ReadonlyListTakeLast<2, readonly number[]>, readonly number[]>
>();
assertType<
  TypeEq<ReadonlyListTakeLast<0, readonly number[]>, readonly number[]>
>();
