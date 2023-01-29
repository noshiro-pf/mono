import { type Tuple, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<Tuple.Reverse<readonly []>, readonly []>>();
assertType<TypeEq<Tuple.Reverse<readonly [1]>, readonly [1]>>();
assertType<TypeEq<Tuple.Reverse<readonly [1, 2, 3]>, readonly [3, 2, 1]>>();
