import { tuple } from '../../others';
import { ArrayElement } from '../../types';
import { seq } from '../create';
import { min } from '../math';

export function zip<A, B>(
  array1: readonly A[],
  array2: readonly B[]
): [A, B][] {
  const len = Math.min(array1.length, array2.length);
  return seq(len).map((i) => tuple(array1[i], array2[i]));
}

type Unwrap<S> = { [P in keyof S]: ArrayElement<S[P]> };

export function zipArrays<
  T extends [
    ReadonlyArray<unknown>,
    ReadonlyArray<unknown>,
    ...(readonly ReadonlyArray<unknown>[])
  ]
>(...arrays: T): Unwrap<T>[] {
  const len = min(arrays.map((a) => a.length));
  if (len === undefined) return [];
  return seq(len).map((i) => tuple(...arrays.map((a) => a[i]))) as Unwrap<T>[];
}
