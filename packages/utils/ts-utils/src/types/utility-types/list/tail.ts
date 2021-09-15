import { assertType } from '../test-type';
import type { ReadonlyTupleTail, TupleTail } from '../tuple';

export type ListTail<A extends readonly unknown[]> = TupleTail<A>;

assertType<TypeEq<ListTail<[]>, []>>();
assertType<TypeEq<ListTail<[1]>, []>>();
assertType<TypeEq<ListTail<[1, 2, 3]>, [2, 3]>>();
assertType<TypeEq<ListTail<[1, 2, 3, ...number[]]>, [2, 3, ...number[]]>>();

export type ReadonlyListTail<A extends readonly unknown[]> =
  ReadonlyTupleTail<A>;

assertType<TypeEq<ReadonlyListTail<readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyListTail<readonly [1]>, readonly []>>();
assertType<TypeEq<ReadonlyListTail<readonly [1, 2, 3]>, readonly [2, 3]>>();
assertType<
  TypeEq<
    ReadonlyListTail<readonly [1, 2, 3, ...(readonly number[])]>,
    readonly [2, 3, ...(readonly number[])]
  >
>();
