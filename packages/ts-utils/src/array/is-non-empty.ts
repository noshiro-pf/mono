export const isNonEmpty = <A>(array: readonly A[]): array is NonEmptyArray<A> =>
  array.length > 0;

export type NonEmptyArray<A> = A[] & { 0: A };
