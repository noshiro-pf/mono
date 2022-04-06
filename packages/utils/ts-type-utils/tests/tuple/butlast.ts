import type { Tuple, TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<Tuple.ButLast<readonly []>, readonly []>>();
assertType<TypeEq<Tuple.ButLast<readonly [1]>, readonly []>>();
assertType<TypeEq<Tuple.ButLast<readonly [1, 2, 3]>, readonly [1, 2]>>();
