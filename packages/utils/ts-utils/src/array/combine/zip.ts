import { pipe } from '../../functional';
import { tuple } from '../../others';
import { ArrayElement } from '../../types';
import { seq } from '../create';
import { min } from '../math';
import { NonEmptyArray, ReadonlyNonEmptyArray } from '../non-empty-array';
import { neaMap } from '../transform';

export function zip<A, B>(
  array1: readonly A[],
  array2: readonly B[]
): [A, B][] {
  const len = Math.min(array1.length, array2.length);
  return seq(len).map((i) => tuple(array1[i] as A, array2[i] as B));
}

export function neaZip<A, B>(
  array1: ReadonlyNonEmptyArray<A>,
  array2: ReadonlyNonEmptyArray<B>
): NonEmptyArray<[A, B]> {
  const len = Math.min(array1.length, array2.length);
  return pipe(
    (seq(len) as unknown) as ReadonlyNonEmptyArray<number>,
    neaMap((i) => tuple(array1[i] as A, array2[i] as B))
  );
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
