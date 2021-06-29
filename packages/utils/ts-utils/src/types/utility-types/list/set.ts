import type { IsFixedLengthList } from '../is-fixed-length-list';
import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { ReadonlyTupleSet, TupleSet } from '../tuple';

export type ListSet<
  T extends readonly unknown[],
  I extends number,
  V
> = IsFixedLengthList<T> extends true ? TupleSet<T, I, V> : (T[number] | V)[];

assertType<TypeEq<ListSet<[], 2, 999>, []>>();
assertType<TypeEq<ListSet<[1, 2], 2, 999>, [1, 2]>>();
assertType<TypeEq<ListSet<[1, 2, 3], 1, 999>, [1, 999, 3]>>();
assertType<TypeEq<ListSet<number[], 0, 999>, number[]>>();

export type ReadonlyListSet<
  T extends readonly unknown[],
  I extends number,
  V
> = IsFixedLengthList<T> extends true
  ? ReadonlyTupleSet<T, I, V>
  : readonly (T[number] | V)[];

assertType<TypeEq<ReadonlyListSet<readonly [], 2, 999>, readonly []>>();
assertType<TypeEq<ReadonlyListSet<readonly [1, 2], 2, 999>, readonly [1, 2]>>();
assertType<
  TypeEq<ReadonlyListSet<readonly [1, 2, 3], 1, 999>, readonly [1, 999, 3]>
>();
assertType<
  TypeEq<ReadonlyListSet<readonly [1, 2, 3], 0, 999>, readonly [999, 2, 3]>
>();
