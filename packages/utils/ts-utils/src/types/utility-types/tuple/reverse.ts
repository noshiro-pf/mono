import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { TupleHead } from './head';
import type { ReadonlyTupleTail, TupleTail } from './tail';

type TupleReverseImpl<
  L extends readonly unknown[],
  X extends readonly unknown[]
> = L extends readonly []
  ? X
  : TupleReverseImpl<TupleTail<L>, [TupleHead<L>, ...X]>;

export type TupleReverse<L extends readonly unknown[]> = TupleReverseImpl<
  L,
  []
>;

assertType<TypeEq<TupleReverse<[]>, []>>();
assertType<TypeEq<TupleReverse<[1]>, [1]>>();
assertType<TypeEq<TupleReverse<[1, 2, 3]>, [3, 2, 1]>>();

type ReadonlyTupleReverseImpl<
  L extends readonly unknown[],
  X extends readonly unknown[]
> = L extends readonly []
  ? X
  : ReadonlyTupleReverseImpl<
      ReadonlyTupleTail<L>,
      readonly [TupleHead<L>, ...X]
    >;

export type ReadonlyTupleReverse<L extends readonly unknown[]> =
  ReadonlyTupleReverseImpl<L, readonly []>;

assertType<TypeEq<ReadonlyTupleReverse<readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyTupleReverse<readonly [1]>, readonly [1]>>();
assertType<
  TypeEq<ReadonlyTupleReverse<readonly [1, 2, 3]>, readonly [3, 2, 1]>
>();
