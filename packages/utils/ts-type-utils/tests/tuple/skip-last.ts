import { type Tuple, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<Tuple.SkipLast<0, readonly []>, readonly []>>();
assertType<TypeEq<Tuple.SkipLast<1, readonly []>, readonly []>>();
assertType<TypeEq<Tuple.SkipLast<0, readonly [1, 2, 3]>, readonly [1, 2, 3]>>();
assertType<TypeEq<Tuple.SkipLast<1, readonly [1, 2, 3]>, readonly [1, 2]>>();
assertType<TypeEq<Tuple.SkipLast<5, readonly [1, 2, 3]>, readonly []>>();
