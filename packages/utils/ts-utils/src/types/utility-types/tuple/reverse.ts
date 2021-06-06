import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { TupleHead } from './head';
import type { ReadonlyTupleTail, TupleTail } from './tail';

type _TupleReverse<L extends readonly unknown[], X extends readonly unknown[]> =
  L extends readonly [] ? X : _TupleReverse<TupleTail<L>, [TupleHead<L>, ...X]>;

export type TupleReverse<L extends readonly unknown[]> = _TupleReverse<L, []>;

assertType<TypeEq<TupleReverse<[]>, []>>();
assertType<TypeEq<TupleReverse<[1]>, [1]>>();
assertType<TypeEq<TupleReverse<[1, 2, 3]>, [3, 2, 1]>>();

type _ReadonlyTupleReverse<
  L extends readonly unknown[],
  X extends readonly unknown[]
> = L extends readonly []
  ? X
  : _ReadonlyTupleReverse<ReadonlyTupleTail<L>, readonly [TupleHead<L>, ...X]>;

export type ReadonlyTupleReverse<L extends readonly unknown[]> =
  _ReadonlyTupleReverse<L, readonly []>;

assertType<TypeEq<ReadonlyTupleReverse<readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyTupleReverse<readonly [1]>, readonly [1]>>();
assertType<
  TypeEq<ReadonlyTupleReverse<readonly [1, 2, 3]>, readonly [3, 2, 1]>
>();
