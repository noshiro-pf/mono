import type { uint32 } from '../../types';

export function every<A, B extends A>(
  lst: readonly A[],
  predicate: (value: A, index: uint32) => value is B
): lst is readonly B[];
export function every<A>(
  lst: readonly A[],
  predicate: (value: A, index: uint32) => boolean
): boolean;
export function every<A>(
  lst: readonly A[],
  predicate: (value: A, index: uint32) => boolean
): boolean {
  return lst.every(predicate as (value: A, index: number) => boolean);
}
