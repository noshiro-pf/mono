import { tuple } from '../../others';
import { ArrayElement } from '../../types';
import { seq } from '../create';
import { min } from '../math';

type Unwrap<S> = { [P in keyof S]: ArrayElement<S[P]> };

export function zip<
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
