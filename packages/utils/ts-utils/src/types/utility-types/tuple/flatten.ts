import { assertType } from '../test-type';
import type { TupleHead } from './head';
import type { ReadonlyTupleReverse, TupleReverse } from './reverse';
import type { ReadonlyTupleTail, TupleTail } from './tail';

type TupleFlattenImpl<
  T extends readonly (readonly unknown[])[],
  R1 extends readonly unknown[],
  R2 extends readonly unknown[]
> = {
  0: TupleReverse<R2>;
  1: TupleFlattenImpl<TupleTail<T>, TupleHead<T, []>, R2>;
  2: TupleFlattenImpl<T, TupleTail<R1>, [TupleHead<R1>, ...R2]>;
}[T extends readonly []
  ? R1 extends readonly []
    ? 0
    : 2
  : R1 extends readonly []
  ? 1
  : 2];

export type TupleFlatten<T extends readonly (readonly unknown[])[]> =
  TupleFlattenImpl<T, [], []>;

assertType<TypeEq<TupleFlatten<[]>, []>>();
assertType<TypeEq<TupleFlatten<[[]]>, []>>();
assertType<TypeEq<TupleFlatten<[[1, 2], [], [3]]>, [1, 2, 3]>>();
assertType<TypeEq<TupleFlatten<[[1, 2], [3]]>, [1, 2, 3]>>();
assertType<TypeEq<TupleFlatten<[[1, 2], [3], []]>, [1, 2, 3]>>();
assertType<TypeEq<TupleFlatten<[[], [1, 2], [3]]>, [1, 2, 3]>>();

type ReadonlyTupleFlattenImpl<
  T extends readonly (readonly unknown[])[],
  R1 extends readonly unknown[],
  R2 extends readonly unknown[]
> = {
  0: ReadonlyTupleReverse<R2>;
  1: ReadonlyTupleFlattenImpl<ReadonlyTupleTail<T>, TupleHead<T, []>, R2>;
  2: ReadonlyTupleFlattenImpl<
    T,
    ReadonlyTupleTail<R1>,
    readonly [TupleHead<R1>, ...R2]
  >;
}[T extends readonly []
  ? R1 extends readonly []
    ? 0
    : 2
  : R1 extends readonly []
  ? 1
  : 2];

export type ReadonlyTupleFlatten<T extends readonly (readonly unknown[])[]> =
  ReadonlyTupleFlattenImpl<T, readonly [], readonly []>;

assertType<TypeEq<ReadonlyTupleFlatten<DeepReadonly<[]>>, readonly []>>();
assertType<TypeEq<ReadonlyTupleFlatten<DeepReadonly<[[]]>>, readonly []>>();
assertType<
  TypeEq<
    ReadonlyTupleFlatten<DeepReadonly<[[1, 2], [], [3]]>>,
    readonly [1, 2, 3]
  >
>();
assertType<
  TypeEq<ReadonlyTupleFlatten<DeepReadonly<[[1, 2], [3]]>>, readonly [1, 2, 3]>
>();
assertType<
  TypeEq<
    ReadonlyTupleFlatten<DeepReadonly<[[1, 2], [3], []]>>,
    readonly [1, 2, 3]
  >
>();
assertType<
  TypeEq<
    ReadonlyTupleFlatten<DeepReadonly<[[], [1, 2], [3]]>>,
    readonly [1, 2, 3]
  >
>();
