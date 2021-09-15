import { assertType } from '../test-type';

export type TupleHead<
  T extends readonly unknown[],
  D = never
> = T extends readonly [infer X, ...(readonly unknown[])] ? X : D;

assertType<TypeEq<TupleHead<[]>, never>>();
assertType<TypeEq<TupleHead<[1]>, 1>>();
assertType<TypeEq<TupleHead<[1, 2], 0>, 1>>();
assertType<TypeEq<TupleHead<[], 1>, 1>>();

assertType<TypeEq<TupleHead<readonly []>, never>>();
assertType<TypeEq<TupleHead<readonly [1]>, 1>>();
assertType<TypeEq<TupleHead<readonly [1, 2], 0>, 1>>();
assertType<TypeEq<TupleHead<readonly [], 1>, 1>>();
