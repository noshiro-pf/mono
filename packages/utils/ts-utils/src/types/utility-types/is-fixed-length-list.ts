import type { TypeEq } from './test-type';
import { assertType } from './test-type';

export type IsFixedLengthList<T extends readonly unknown[]> =
  number extends T['length'] ? false : true;

export type IsNotFixedLengthList<T extends readonly unknown[]> =
  number extends T['length'] ? true : false;

assertType<TypeEq<IsFixedLengthList<[]>, true>>();
assertType<TypeEq<IsFixedLengthList<[1 | 2, 3]>, true>>();
assertType<TypeEq<IsFixedLengthList<[1, 2, 3]>, true>>();
assertType<TypeEq<IsFixedLengthList<readonly []>, true>>();
assertType<TypeEq<IsFixedLengthList<readonly [1 | 2, 3]>, true>>();
assertType<TypeEq<IsFixedLengthList<readonly [1, 2, 3]>, true>>();

assertType<TypeEq<IsFixedLengthList<number[]>, false>>();
assertType<TypeEq<IsFixedLengthList<readonly number[]>, false>>();
assertType<TypeEq<IsFixedLengthList<[number, 1, 2, ...number[]]>, false>>();
assertType<
  TypeEq<IsFixedLengthList<readonly [number, 1, 2, ...number[]]>, false>
>();
assertType<
  TypeEq<IsFixedLengthList<[number, 1, 2, ...(readonly number[])]>, false>
>();
assertType<
  TypeEq<
    IsFixedLengthList<readonly [number, 1, 2, ...(readonly number[])]>,
    false
  >
>();
