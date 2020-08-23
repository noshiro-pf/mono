import { ReadonlyNonEmptyArray } from './non-empty-array';

export const isNonEmpty = <A>(
  array: readonly A[]
): array is ReadonlyNonEmptyArray<A> => array.length > 0;
