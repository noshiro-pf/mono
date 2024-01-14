import { expectType } from '@noshiro/ts-utils';

export type TupleToUnion<A extends readonly unknown[]> = A[number];

type Arr = readonly ['1', '2', 3];
expectType<TupleToUnion<Arr>, '1' | '2' | 3>('=');
