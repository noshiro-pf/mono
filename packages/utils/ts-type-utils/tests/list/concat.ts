import type { ListType, TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<ListType.Concat<readonly [], readonly []>, readonly []>>();
assertType<
  TypeEq<ListType.Concat<readonly [1, 2], readonly []>, readonly [1, 2]>
>();
assertType<
  TypeEq<ListType.Concat<readonly [], readonly [1, 2]>, readonly [1, 2]>
>();
assertType<
  TypeEq<
    ListType.Concat<readonly [1, 2], readonly [3, 4, 5]>,
    readonly [1, 2, 3, 4, 5]
  >
>();
