import { assertType } from '../test-type';
import type { ReadonlyTupleConcat, TupleConcat } from '../tuple';

export type ListConcat<A extends unknown[], B extends unknown[]> = TupleConcat<
  A,
  B
>;

assertType<TypeEq<ListConcat<[], []>, []>>();
assertType<TypeEq<ListConcat<[1, 2], []>, [1, 2]>>();
assertType<TypeEq<ListConcat<[], [1, 2]>, [1, 2]>>();
assertType<TypeEq<ListConcat<[1, 2], [3, 4, 5]>, [1, 2, 3, 4, 5]>>();

export type ReadonlyListConcat<
  A extends readonly unknown[],
  B extends readonly unknown[]
> = ReadonlyTupleConcat<A, B>;

assertType<TypeEq<ReadonlyListConcat<readonly [], readonly []>, readonly []>>();
assertType<
  TypeEq<ReadonlyListConcat<readonly [1, 2], readonly []>, readonly [1, 2]>
>();
assertType<
  TypeEq<ReadonlyListConcat<readonly [], readonly [1, 2]>, readonly [1, 2]>
>();
assertType<
  TypeEq<
    ReadonlyListConcat<readonly [1, 2], readonly [3, 4, 5]>,
    readonly [1, 2, 3, 4, 5]
  >
>();
