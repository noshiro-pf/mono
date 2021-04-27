import { assertNotType, assertType, TypeExtends } from '../types';

export type NonEmptyArray<A> = [A, ...A[]];
export type ReadonlyNonEmptyArray<A> = readonly [A, ...(readonly A[])];

const array0: [] = [];
assertNotType<TypeExtends<typeof array0, NonEmptyArray<number>>>();

const array1: [1, 2, 3] = [1, 2, 3];
assertType<TypeExtends<typeof array1, NonEmptyArray<number>>>();

const roarray0 = [] as const;
assertNotType<TypeExtends<typeof roarray0, ReadonlyNonEmptyArray<number>>>();

const roarray1 = [1, 2, 3] as const;
assertType<TypeExtends<typeof roarray1, ReadonlyNonEmptyArray<number>>>();
