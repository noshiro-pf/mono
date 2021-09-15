import { assertType } from '../test-type';
import type { ReadonlyTupleButLast, TupleButLast } from '../tuple';

export type ListButLast<A extends readonly unknown[]> = TupleButLast<A>;

assertType<TypeEq<ListButLast<[]>, []>>();
assertType<TypeEq<ListButLast<[1]>, []>>();
assertType<TypeEq<ListButLast<[1, 2, 3]>, [1, 2]>>();
assertType<
  TypeEq<ListButLast<[1, 2, 3, ...number[]]>, [1, 2, 3, ...number[]]>
>();

export type ReadonlyListButLast<A extends readonly unknown[]> =
  ReadonlyTupleButLast<A>;

assertType<TypeEq<ReadonlyListButLast<readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyListButLast<readonly [1]>, readonly []>>();
assertType<TypeEq<ReadonlyListButLast<readonly [1, 2, 3]>, readonly [1, 2]>>();
assertType<
  TypeEq<
    ReadonlyListButLast<readonly [1, 2, 3, ...(readonly number[])]>,
    readonly [1, 2, 3, ...(readonly number[])]
  >
>();
