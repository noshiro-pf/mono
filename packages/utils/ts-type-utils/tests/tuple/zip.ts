import { type Tuple, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<Tuple.Zip<readonly [], readonly []>, readonly []>>();
assertType<TypeEq<Tuple.Zip<readonly [1], readonly []>, readonly []>>();
assertType<TypeEq<Tuple.Zip<readonly [], readonly [1]>, readonly []>>();

assertType<
  TypeEq<
    Tuple.Zip<readonly [1, 2, 3], readonly [4, 5]>,
    readonly [readonly [1, 4], readonly [2, 5]]
  >
>();
