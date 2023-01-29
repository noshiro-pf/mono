import { type Tuple, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<Tuple.Concat<readonly [], readonly []>, readonly []>>();
assertType<
  TypeEq<Tuple.Concat<readonly [1, 2], readonly []>, readonly [1, 2]>
>();
assertType<
  TypeEq<Tuple.Concat<readonly [], readonly [1, 2]>, readonly [1, 2]>
>();
assertType<
  TypeEq<
    Tuple.Concat<readonly [1, 2], readonly [3, 4, 5]>,
    readonly [1, 2, 3, 4, 5]
  >
>();
