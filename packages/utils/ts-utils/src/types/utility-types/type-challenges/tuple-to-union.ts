import { assertType } from '../test-type';

export type TupleToUnion<A extends readonly unknown[]> = A[number];

type Arr = readonly ['1', '2', 3];
assertType<TypeEq<TupleToUnion<Arr>, '1' | '2' | 3>>();
