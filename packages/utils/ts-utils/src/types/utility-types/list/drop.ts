import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { ReadonlyTupleSkip, TupleSkip } from '../tuple';

export type ListDrop<
  N extends number,
  T extends readonly unknown[]
> = TupleSkip<N, T>;

assertType<TypeEq<ListDrop<0, []>, []>>();
assertType<TypeEq<ListDrop<1, []>, []>>();
assertType<TypeEq<ListDrop<0, [1, 2, 3]>, [1, 2, 3]>>();
assertType<TypeEq<ListDrop<1, [1, 2, 3]>, [2, 3]>>();
assertType<TypeEq<ListDrop<5, [1, 2, 3]>, []>>();

export type ReadonlyListDrop<
  N extends number,
  T extends readonly unknown[]
> = ReadonlyTupleSkip<N, T>;

assertType<TypeEq<ReadonlyListDrop<0, readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyListDrop<1, readonly []>, readonly []>>();
assertType<
  TypeEq<ReadonlyListDrop<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>
>();
assertType<TypeEq<ReadonlyListDrop<1, readonly [1, 2, 3]>, readonly [2, 3]>>();
assertType<TypeEq<ReadonlyListDrop<5, readonly [1, 2, 3]>, readonly []>>();
