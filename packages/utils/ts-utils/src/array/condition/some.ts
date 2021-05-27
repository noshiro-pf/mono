import type { uint32 } from '../../types';

export function some<A>(
  lst: readonly A[],
  predicate: (value: A, index: uint32) => boolean
): boolean {
  return lst.some(predicate as (value: A, index: number) => boolean);
}
