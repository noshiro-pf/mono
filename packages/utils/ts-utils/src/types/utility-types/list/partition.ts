import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { ReadonlyTuplePartition, TuplePartition } from '../tuple';

export type ListPartition<
  N extends number,
  T extends readonly unknown[]
> = TuplePartition<N, T>;

assertType<TypeEq<ListPartition<1, []>, []>>();
assertType<TypeEq<ListPartition<2, [1, 2, 3]>, [[1, 2], [3]]>>();
assertType<TypeEq<ListPartition<3, [1, 2, 3]>, [[1, 2, 3]]>>();
assertType<TypeEq<ListPartition<2, [1, 2, 3, 4]>, [[1, 2], [3, 4]]>>();

export type ReadonlyListPartition<
  N extends number,
  T extends readonly unknown[]
> = ReadonlyTuplePartition<N, T>;

assertType<TypeEq<ReadonlyListPartition<1, readonly []>, readonly []>>();
assertType<
  TypeEq<
    ReadonlyListPartition<2, readonly [1, 2, 3]>,
    readonly [readonly [1, 2], readonly [3]]
  >
>();
assertType<
  TypeEq<
    ReadonlyListPartition<3, readonly [1, 2, 3]>,
    readonly [readonly [1, 2, 3]]
  >
>();
assertType<
  TypeEq<
    ReadonlyListPartition<2, readonly [1, 2, 3, 4]>,
    readonly [readonly [1, 2], readonly [3, 4]]
  >
>();
