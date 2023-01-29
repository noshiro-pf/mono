import { type DeepReadonly, type Tuple, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<Tuple.Flatten<DeepReadonly<[]>>, readonly []>>();
assertType<TypeEq<Tuple.Flatten<DeepReadonly<[[]]>>, readonly []>>();
assertType<
  TypeEq<Tuple.Flatten<DeepReadonly<[[1, 2], [], [3]]>>, readonly [1, 2, 3]>
>();
assertType<
  TypeEq<Tuple.Flatten<DeepReadonly<[[1, 2], [3]]>>, readonly [1, 2, 3]>
>();
assertType<
  TypeEq<Tuple.Flatten<DeepReadonly<[[1, 2], [3], []]>>, readonly [1, 2, 3]>
>();
assertType<
  TypeEq<Tuple.Flatten<DeepReadonly<[[], [1, 2], [3]]>>, readonly [1, 2, 3]>
>();
