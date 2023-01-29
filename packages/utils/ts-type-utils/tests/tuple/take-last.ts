import { type Tuple, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<Tuple.TakeLast<2, readonly []>, readonly []>>();
assertType<TypeEq<Tuple.TakeLast<2, readonly [1, 2]>, readonly [1, 2]>>();
assertType<TypeEq<Tuple.TakeLast<2, readonly [1, 2, 3]>, readonly [2, 3]>>();
assertType<TypeEq<Tuple.TakeLast<0, readonly [1, 2, 3]>, readonly []>>();
