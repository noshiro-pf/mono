import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';

export type TupleButLast<A extends readonly unknown[]> = A extends readonly []
  ? []
  : A extends readonly [...infer R, unknown]
  ? R
  : A;

assertType<TypeEq<TupleButLast<[]>, []>>();
assertType<TypeEq<TupleButLast<[1]>, []>>();
assertType<TypeEq<TupleButLast<[1, 2, 3]>, [1, 2]>>();

export type ReadonlyTupleButLast<A extends readonly unknown[]> =
  A extends readonly []
    ? readonly []
    : A extends readonly [...infer R, unknown]
    ? Readonly<R>
    : Readonly<A>;

assertType<TypeEq<ReadonlyTupleButLast<readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyTupleButLast<readonly [1]>, readonly []>>();
assertType<TypeEq<ReadonlyTupleButLast<readonly [1, 2, 3]>, readonly [1, 2]>>();
