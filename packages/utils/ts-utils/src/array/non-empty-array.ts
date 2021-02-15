export type NonEmptyArray<A> = A[] & { 0: A };
export type ReadonlyNonEmptyArray<A> = readonly A[] & Readonly<{ 0: A }>;
