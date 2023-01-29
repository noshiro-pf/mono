import { type IsFixedLengthList, type TypeEq } from '../src';
import { assertType } from './assert-type';

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
