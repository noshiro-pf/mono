import { type ListType, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<ListType.Tail<readonly []>, readonly []>>();
assertType<TypeEq<ListType.Tail<readonly [1]>, readonly []>>();
assertType<TypeEq<ListType.Tail<readonly [1, 2, 3]>, readonly [2, 3]>>();
assertType<
  TypeEq<
    ListType.Tail<readonly [1, 2, 3, ...(readonly number[])]>,
    readonly [2, 3, ...(readonly number[])]
  >
>();
