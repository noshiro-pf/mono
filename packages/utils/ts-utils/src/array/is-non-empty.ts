import type { NonEmptyArray } from './non-empty-array';

export const isNonEmpty = <A>(array: readonly A[]): array is NonEmptyArray<A> =>
  array.length > 0;
