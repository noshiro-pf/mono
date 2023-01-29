import { type Tuple, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<Tuple.SetAt<readonly [], 2, 999>, readonly []>>();
assertType<TypeEq<Tuple.SetAt<readonly [1, 2], 2, 999>, readonly [1, 2]>>();
assertType<
  TypeEq<Tuple.SetAt<readonly [1, 2, 3], 1, 999>, readonly [1, 999, 3]>
>();
assertType<
  TypeEq<Tuple.SetAt<readonly [1, 2, 3], 0, 999>, readonly [999, 2, 3]>
>();
