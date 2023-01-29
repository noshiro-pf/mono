import { type ListType, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<ListType.Reverse<readonly []>, readonly []>>();
assertType<TypeEq<ListType.Reverse<[]>, readonly []>>();
assertType<TypeEq<ListType.Reverse<readonly [1]>, readonly [1]>>();
assertType<TypeEq<ListType.Reverse<readonly [1, 2, 3]>, readonly [3, 2, 1]>>();
assertType<TypeEq<ListType.Reverse<[1, 2, 3]>, readonly [3, 2, 1]>>();

assertType<TypeEq<ListType.Reverse<readonly number[]>, readonly number[]>>();

assertType<
  TypeEq<
    ListType.Reverse<readonly [1, 2, ...(readonly number[])]>,
    readonly [...number[], 2, 1]
  >
>();
