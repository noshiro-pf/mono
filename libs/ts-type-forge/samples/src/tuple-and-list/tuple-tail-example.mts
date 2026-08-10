import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T1 = Tuple.Tail<[1, 2, 3]>; // readonly [2, 3]
type T2 = Tuple.Tail<[1]>; // readonly []
type T3 = Tuple.Tail<[]>; // readonly []
type T4 = Tuple.Tail<readonly number[]>; // readonly number[]

// embed-sample-code-ignore-below
export type { T1, T2, T3, T4 };
