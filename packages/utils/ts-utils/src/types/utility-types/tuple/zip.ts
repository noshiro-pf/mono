import { assertType } from '../test-type';
import type { TupleHead } from './head';
import type { ReadonlyTupleTail, TupleTail } from './tail';

export type TupleZip<
  A extends readonly unknown[],
  B extends readonly unknown[]
> = {
  0: [];
  1: [[TupleHead<A>, TupleHead<B>], ...TupleZip<TupleTail<A>, TupleTail<B>>];
}[A extends readonly [] ? 0 : B extends readonly [] ? 0 : 1];

assertType<TypeEq<TupleZip<[], []>, []>>();
assertType<TypeEq<TupleZip<[1], []>, []>>();
assertType<TypeEq<TupleZip<[], [1]>, []>>();
assertType<TypeEq<TupleZip<[1, 2, 3], [4, 5]>, [[1, 4], [2, 5]]>>();

export type ReadonlyTupleZip<
  A extends readonly unknown[],
  B extends readonly unknown[]
> = {
  0: readonly [];
  1: readonly [
    readonly [TupleHead<A>, TupleHead<B>],
    ...ReadonlyTupleZip<ReadonlyTupleTail<A>, ReadonlyTupleTail<B>>
  ];
}[A extends readonly [] ? 0 : B extends readonly [] ? 0 : 1];

assertType<TypeEq<ReadonlyTupleZip<readonly [], readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyTupleZip<readonly [1], readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyTupleZip<readonly [], readonly [1]>, readonly []>>();

assertType<
  TypeEq<
    ReadonlyTupleZip<readonly [1, 2, 3], readonly [4, 5]>,
    readonly [readonly [1, 4], readonly [2, 5]]
  >
>();
