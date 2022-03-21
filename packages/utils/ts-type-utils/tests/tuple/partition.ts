import type { Tuple, TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<Tuple.Partition<1, readonly []>, readonly []>>();
assertType<
  TypeEq<
    Tuple.Partition<2, readonly [1, 2, 3]>,
    readonly [readonly [1, 2], readonly [3]]
  >
>();
assertType<
  TypeEq<Tuple.Partition<3, readonly [1, 2, 3]>, readonly [readonly [1, 2, 3]]>
>();
assertType<
  TypeEq<
    Tuple.Partition<2, readonly [1, 2, 3, 4]>,
    readonly [readonly [1, 2], readonly [3, 4]]
  >
>();
