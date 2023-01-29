import { type Tuple, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<Tuple.Head<[]>, never>>();
assertType<TypeEq<Tuple.Head<[1]>, 1>>();
assertType<TypeEq<Tuple.Head<[1, 2], 0>, 1>>();
assertType<TypeEq<Tuple.Head<[], 1>, 1>>();

assertType<TypeEq<Tuple.Head<readonly []>, never>>();
assertType<TypeEq<Tuple.Head<readonly [1]>, 1>>();
assertType<TypeEq<Tuple.Head<readonly [1, 2], 0>, 1>>();
assertType<TypeEq<Tuple.Head<readonly [], 1>, 1>>();
