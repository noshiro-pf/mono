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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return seq(len).map((i) => tuple(array1[i]!, array2[i]!));
}

export function neaZip<A, B>(
  array1: ReadonlyNonEmptyArray<A>,
  array2: ReadonlyNonEmptyArray<B>
): NonEmptyArray<[A, B]> {
  const len = Math.min(array1.length, array2.length);
  return pipe(
    (seq(len) as unknown) as ReadonlyNonEmptyArray<number>,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    neaMap((i) => tuple(array1[i]!, array2[i]!))
  );
}

type Unwrap<S> = { [P in keyof S]: ArrayElement<S[P]> };

export function zipArrays<
  T extends [
    readonly unknown[],
    readonly unknown[],
    ...(readonly (readonly unknown[])[])
  ]
>(...arrays: T): Unwrap<T>[] {
  const len = min(arrays.map((a) => a.length));
  if (len === undefined) return [];
  return seq(len).map((i) => tuple(...arrays.map((a) => a[i]))) as Unwrap<T>[];
}
