import { type DeepReadonly, type ListType, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<ListType.Flatten<DeepReadonly<[]>>, readonly []>>();
assertType<TypeEq<ListType.Flatten<DeepReadonly<[[]]>>, readonly []>>();
assertType<
  TypeEq<ListType.Flatten<DeepReadonly<[[1, 2], [], [3]]>>, readonly [1, 2, 3]>
>();
assertType<
  TypeEq<ListType.Flatten<DeepReadonly<[[1, 2], [3]]>>, readonly [1, 2, 3]>
>();
assertType<
  TypeEq<ListType.Flatten<DeepReadonly<[[1, 2], [3], []]>>, readonly [1, 2, 3]>
>();
assertType<
  TypeEq<ListType.Flatten<DeepReadonly<[[], [1, 2], [3]]>>, readonly [1, 2, 3]>
>();
