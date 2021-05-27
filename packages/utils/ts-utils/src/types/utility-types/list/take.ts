import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { ReadonlyTupleTake, TupleTake } from '../tuple';

export type ListTake<N extends number, T extends readonly unknown[]> =
  TupleTake<N, T>;

assertType<TypeEq<ListTake<2, []>, []>>();
assertType<TypeEq<ListTake<2, [1, 2]>, [1, 2]>>();
assertType<TypeEq<ListTake<2, [1, 2, 3]>, [1, 2]>>();
assertType<TypeEq<ListTake<0, [1, 2, 3]>, []>>();

export type ReadonlyListTake<N extends number, T extends readonly unknown[]> =
  ReadonlyTupleTake<N, T>;

assertType<TypeEq<ReadonlyListTake<2, readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyListTake<2, readonly [1, 2]>, readonly [1, 2]>>();
assertType<TypeEq<ReadonlyListTake<2, readonly [1, 2, 3]>, readonly [1, 2]>>();
assertType<TypeEq<ReadonlyListTake<0, readonly [1, 2, 3]>, readonly []>>();
