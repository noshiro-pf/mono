import type { Tuple, TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<Tuple.Tail<readonly []>, readonly []>>();
assertType<TypeEq<Tuple.Tail<readonly [1]>, readonly []>>();
assertType<TypeEq<Tuple.Tail<readonly [1, 2, 3]>, readonly [2, 3]>>();
