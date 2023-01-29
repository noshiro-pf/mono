import { type Tuple, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<Tuple.Skip<0, readonly []>, readonly []>>();
assertType<TypeEq<Tuple.Skip<1, readonly []>, readonly []>>();
assertType<TypeEq<Tuple.Skip<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>>();
assertType<TypeEq<Tuple.Skip<1, readonly [1, 2, 3]>, readonly [2, 3]>>();
assertType<TypeEq<Tuple.Skip<5, readonly [1, 2, 3]>, readonly []>>();
