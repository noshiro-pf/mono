import { type ListType, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<ListType.Skip<0, readonly []>, readonly []>>();
assertType<TypeEq<ListType.Skip<1, readonly []>, readonly []>>();
assertType<TypeEq<ListType.Skip<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>>();
assertType<TypeEq<ListType.Skip<1, readonly [1, 2, 3]>, readonly [2, 3]>>();
assertType<TypeEq<ListType.Skip<5, readonly [1, 2, 3]>, readonly []>>();
assertType<TypeEq<ListType.Skip<5, readonly number[]>, readonly number[]>>();
