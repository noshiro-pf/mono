import type { TypeEq } from './test-type';
import { assertType } from './test-type';

export type IsFiniteList<Tuple extends readonly unknown[]> =
  Tuple extends readonly []
    ? true
    : Tuple extends readonly (infer Elem)[]
    ? readonly Elem[] extends Tuple
      ? false
      : Elem[] extends Tuple
      ? false
      : Tuple extends readonly [unknown, ...infer Rest]
      ? IsFiniteList<Rest>
      : false
    : false;

assertType<TypeEq<IsFiniteList<[]>, true>>();
assertType<TypeEq<IsFiniteList<[1 | 2, 3]>, true>>();
assertType<TypeEq<IsFiniteList<[1, 2, 3]>, true>>();
assertType<TypeEq<IsFiniteList<readonly []>, true>>();
assertType<TypeEq<IsFiniteList<readonly [1 | 2, 3]>, true>>();
assertType<TypeEq<IsFiniteList<readonly [1, 2, 3]>, true>>();

assertType<TypeEq<IsFiniteList<number[]>, false>>();
assertType<TypeEq<IsFiniteList<readonly number[]>, false>>();
assertType<TypeEq<IsFiniteList<[number, 1, 2, ...number[]]>, false>>();
assertType<TypeEq<IsFiniteList<readonly [number, 1, 2, ...number[]]>, false>>();
assertType<
  TypeEq<IsFiniteList<[number, 1, 2, ...(readonly number[])]>, false>
>();
assertType<
  TypeEq<IsFiniteList<readonly [number, 1, 2, ...(readonly number[])]>, false>
>();
