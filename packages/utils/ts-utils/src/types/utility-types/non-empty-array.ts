import type { TypeExtends } from './test-type';
import { assertNotType, assertType } from './test-type';

export type NonEmptyArray<A> = [A, ...A[]];
export type ReadonlyNonEmptyArray<A> = readonly [A, ...(readonly A[])];

const array0: [] = [];
assertNotType<TypeExtends<typeof array0, NonEmptyArray<number>>>();

const array1: [1, 2, 3] = [1, 2, 3];
assertType<TypeExtends<typeof array1, NonEmptyArray<number>>>();

const roArray0 = [] as const;
assertNotType<TypeExtends<typeof roArray0, ReadonlyNonEmptyArray<number>>>();

const roArray1 = [1, 2, 3] as const;
assertType<TypeExtends<typeof roArray1, ReadonlyNonEmptyArray<number>>>();
