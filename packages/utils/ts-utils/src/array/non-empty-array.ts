export type NonEmptyArray<A> = A[] & { 0: A };
export type ReadonlyNonEmptyArray<A> = Readonly<{ 0: A }> & readonly A[];
