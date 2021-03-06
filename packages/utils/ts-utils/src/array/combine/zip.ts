import { tuple } from '../../others';
import type { ArrayElement, uint32 } from '../../types';
import { seq } from '../create';
import { arraySize } from '../length';
import { min } from '../math';
import type { NonEmptyArray, ReadonlyNonEmptyArray } from '../non-empty-array';

export function zip<A, B>(
  array1: ReadonlyNonEmptyArray<A>,
  array2: ReadonlyNonEmptyArray<B>
): NonEmptyArray<[A, B]>;

export function zip<A, B>(array1: readonly A[], array2: readonly B[]): [A, B][];

export function zip<A, B>(
  array1: ReadonlyNonEmptyArray<A> | readonly A[],
  array2: ReadonlyNonEmptyArray<B> | readonly B[]
): [A, B][] {
  const len = Math.min(array1.length, array2.length) as uint32;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return seq(len).map((i) => tuple(array1[i]!, array2[i]!));
}

type Unwrap<S> = { [P in keyof S]: ArrayElement<S[P]> };

export function zipArrays<
  T extends [
    readonly unknown[],
    readonly unknown[],
    ...(readonly (readonly unknown[])[])
  ]
>(...arrays: T): Unwrap<T>[] {
  const len = min(arrays.map(arraySize));
  if (len === undefined) return [];
  return seq(len).map((i) => arrays.map((a) => a[i])) as Unwrap<T>[];
}
