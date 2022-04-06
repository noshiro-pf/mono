import type { Tuple, TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<Tuple.Take<2, readonly []>, readonly []>>();
assertType<TypeEq<Tuple.Take<2, readonly [1, 2]>, readonly [1, 2]>>();
assertType<TypeEq<Tuple.Take<2, readonly [1, 2, 3]>, readonly [1, 2]>>();
assertType<TypeEq<Tuple.Take<0, readonly [1, 2, 3]>, readonly []>>();
