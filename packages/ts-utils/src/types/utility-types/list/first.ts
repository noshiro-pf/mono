import { assertType, TypeEq } from '../test-type';

export type First<T extends any[], D = never> = T extends [infer X, ...any[]]
  ? X
  : D;

assertType<TypeEq<First<[]>, never>>();
assertType<TypeEq<First<[1]>, 1>>();
assertType<TypeEq<First<[1, 2], 0>, 1>>();
assertType<TypeEq<First<[], 1>, 1>>();
