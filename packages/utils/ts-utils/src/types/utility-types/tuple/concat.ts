import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { TupleHead } from './head';
import type { ReadonlyTupleReverse, TupleReverse } from './reverse';
import type { ReadonlyTupleTail, TupleTail } from './tail';

type TupleConcatImpl<
  A extends unknown[],
  B extends unknown[],
  R extends unknown[]
> = {
  0: TupleReverse<R>;
  1: TupleConcatImpl<TupleTail<A>, B, [TupleHead<A>, ...R]>;
  2: TupleConcatImpl<A, TupleTail<B>, [TupleHead<B>, ...R]>;
}[A extends readonly [] ? (B extends readonly [] ? 0 : 2) : 1];

export type TupleConcat<
  A extends unknown[],
  B extends unknown[]
> = TupleConcatImpl<A, B, []>;

assertType<TypeEq<TupleConcat<[], []>, []>>();
assertType<TypeEq<TupleConcat<[1, 2], []>, [1, 2]>>();
assertType<TypeEq<TupleConcat<[], [1, 2]>, [1, 2]>>();
assertType<TypeEq<TupleConcat<[1, 2], [3, 4, 5]>, [1, 2, 3, 4, 5]>>();

type ReadonlyTupleConcatImpl<
  A extends readonly unknown[],
  B extends readonly unknown[],
  R extends readonly unknown[]
> = {
  0: ReadonlyTupleReverse<R>;
  1: ReadonlyTupleConcatImpl<
    ReadonlyTupleTail<A>,
    B,
    readonly [TupleHead<A>, ...R]
  >;
  2: ReadonlyTupleConcatImpl<
    A,
    ReadonlyTupleTail<B>,
    readonly [TupleHead<B>, ...R]
  >;
}[A extends readonly [] ? (B extends readonly [] ? 0 : 2) : 1];

export type ReadonlyTupleConcat<
  A extends readonly unknown[],
  B extends readonly unknown[]
> = ReadonlyTupleConcatImpl<A, B, readonly []>;

assertType<
  TypeEq<ReadonlyTupleConcat<readonly [], readonly []>, readonly []>
>();
assertType<
  TypeEq<ReadonlyTupleConcat<readonly [1, 2], readonly []>, readonly [1, 2]>
>();
assertType<
  TypeEq<ReadonlyTupleConcat<readonly [], readonly [1, 2]>, readonly [1, 2]>
>();
assertType<
  TypeEq<
    ReadonlyTupleConcat<readonly [1, 2], readonly [3, 4, 5]>,
    readonly [1, 2, 3, 4, 5]
  >
>();
