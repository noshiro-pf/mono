import type { IsFiniteList } from '../is-finite-list';
import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { ReadonlyTupleReverse, TupleReverse } from '../tuple';
import type { ListHead } from './head';
import type { ListTail, ReadonlyListTail } from './tail';

export type ListReverse<L extends readonly unknown[]> = L extends readonly []
  ? []
  : IsFiniteList<L> extends true
  ? TupleReverse<L>
  : L extends readonly [unknown, ...(readonly unknown[])]
  ? [...ListReverse<ListTail<L>>, ListHead<L>]
  : L;

assertType<TypeEq<ListReverse<[]>, []>>();
assertType<TypeEq<ListReverse<readonly []>, []>>();
assertType<TypeEq<ListReverse<[1]>, [1]>>();
assertType<TypeEq<ListReverse<[1, 2, 3]>, [3, 2, 1]>>();
assertType<TypeEq<ListReverse<readonly [1, 2, 3]>, [3, 2, 1]>>();

export type ReadonlyListReverse<L extends readonly unknown[]> =
  L extends readonly []
    ? readonly []
    : IsFiniteList<L> extends true
    ? ReadonlyTupleReverse<L>
    : L extends readonly [unknown, ...(readonly unknown[])]
    ? readonly [...ReadonlyListReverse<ReadonlyListTail<L>>, ListHead<L>]
    : Readonly<L>;

assertType<TypeEq<ReadonlyListReverse<readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyListReverse<[]>, readonly []>>();
assertType<TypeEq<ReadonlyListReverse<readonly [1]>, readonly [1]>>();
assertType<
  TypeEq<ReadonlyListReverse<readonly [1, 2, 3]>, readonly [3, 2, 1]>
>();
assertType<TypeEq<ReadonlyListReverse<[1, 2, 3]>, readonly [3, 2, 1]>>();

assertType<TypeEq<ReadonlyListReverse<readonly number[]>, readonly number[]>>();

assertType<
  TypeEq<
    ReadonlyListReverse<readonly [1, 2, ...(readonly number[])]>,
    readonly [...number[], 2, 1]
  >
>();
