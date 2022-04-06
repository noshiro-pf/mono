import type { Tuple, TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<Tuple.Last<[]>, never>>();
assertType<TypeEq<Tuple.Last<[1]>, 1>>();
assertType<TypeEq<Tuple.Last<[1, 2, 3]>, 3>>();

assertType<TypeEq<Tuple.Last<readonly []>, never>>();
assertType<TypeEq<Tuple.Last<readonly [1]>, 1>>();
assertType<TypeEq<Tuple.Last<readonly [1, 2, 3]>, 3>>();
