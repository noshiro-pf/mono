import { type ListType, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<ListType.TakeLast<2, readonly []>, readonly []>>();
assertType<TypeEq<ListType.TakeLast<2, readonly [1, 2]>, readonly [1, 2]>>();
assertType<TypeEq<ListType.TakeLast<2, readonly [1, 2, 3]>, readonly [2, 3]>>();
assertType<TypeEq<ListType.TakeLast<0, readonly [1, 2, 3]>, readonly []>>();
assertType<
  TypeEq<ListType.TakeLast<2, readonly number[]>, readonly number[]>
>();
assertType<
  TypeEq<ListType.TakeLast<0, readonly number[]>, readonly number[]>
>();
