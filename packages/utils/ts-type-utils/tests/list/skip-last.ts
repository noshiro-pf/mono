import type { ListType, TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<ListType.SkipLast<0, readonly []>, readonly []>>();
assertType<TypeEq<ListType.SkipLast<1, readonly []>, readonly []>>();
assertType<
  TypeEq<ListType.SkipLast<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>
>();
assertType<TypeEq<ListType.SkipLast<1, readonly [1, 2, 3]>, readonly [1, 2]>>();
assertType<TypeEq<ListType.SkipLast<5, readonly [1, 2, 3]>, readonly []>>();
assertType<
  TypeEq<ListType.SkipLast<5, readonly number[]>, readonly number[]>
>();
