export type NonEmptyArray<A> = A[] & { 0: A };
export type ReadonlyNonEmptyArray<A> = readonly A[] & { 0: A };
