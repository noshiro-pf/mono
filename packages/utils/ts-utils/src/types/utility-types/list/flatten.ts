import { assertType } from '../test-type';
import type { ReadonlyTupleFlatten, TupleFlatten } from '../tuple';

export type ListFlatten<T extends readonly (readonly unknown[])[]> =
  TupleFlatten<T>;

assertType<TypeEq<ListFlatten<[]>, []>>();
assertType<TypeEq<ListFlatten<[[]]>, []>>();
assertType<TypeEq<ListFlatten<[[1, 2], [], [3]]>, [1, 2, 3]>>();
assertType<TypeEq<ListFlatten<[[1, 2], [3]]>, [1, 2, 3]>>();
assertType<TypeEq<ListFlatten<[[1, 2], [3], []]>, [1, 2, 3]>>();
assertType<TypeEq<ListFlatten<[[], [1, 2], [3]]>, [1, 2, 3]>>();

export type ReadonlyListFlatten<T extends readonly (readonly unknown[])[]> =
  ReadonlyTupleFlatten<T>;

assertType<TypeEq<ReadonlyListFlatten<DeepReadonly<[]>>, readonly []>>();
assertType<TypeEq<ReadonlyListFlatten<DeepReadonly<[[]]>>, readonly []>>();
assertType<
  TypeEq<
    ReadonlyListFlatten<DeepReadonly<[[1, 2], [], [3]]>>,
    readonly [1, 2, 3]
  >
>();
assertType<
  TypeEq<ReadonlyListFlatten<DeepReadonly<[[1, 2], [3]]>>, readonly [1, 2, 3]>
>();
assertType<
  TypeEq<
    ReadonlyListFlatten<DeepReadonly<[[1, 2], [3], []]>>,
    readonly [1, 2, 3]
  >
>();
assertType<
  TypeEq<
    ReadonlyListFlatten<DeepReadonly<[[], [1, 2], [3]]>>,
    readonly [1, 2, 3]
  >
>();
