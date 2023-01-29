import { type ListType, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<ListType.ButLast<readonly []>, readonly []>>();
assertType<TypeEq<ListType.ButLast<readonly [1]>, readonly []>>();
assertType<TypeEq<ListType.ButLast<readonly [1, 2, 3]>, readonly [1, 2]>>();
assertType<
  TypeEq<
    ListType.ButLast<readonly [1, 2, 3, ...(readonly number[])]>,
    readonly [1, 2, 3, ...(readonly number[])]
  >
>();
