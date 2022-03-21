import type { ListType, TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<ListType.Take<2, readonly []>, readonly []>>();
assertType<TypeEq<ListType.Take<2, readonly [1, 2]>, readonly [1, 2]>>();
assertType<TypeEq<ListType.Take<2, readonly [1, 2, 3]>, readonly [1, 2]>>();
assertType<TypeEq<ListType.Take<0, readonly [1, 2, 3]>, readonly []>>();
assertType<TypeEq<ListType.Take<2, readonly number[]>, readonly number[]>>();
assertType<TypeEq<ListType.Take<0, readonly number[]>, readonly number[]>>();
