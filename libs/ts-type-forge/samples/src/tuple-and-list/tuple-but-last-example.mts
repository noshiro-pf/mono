import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type BL1 = Tuple.ButLast<readonly [1, 2, 3]>; // readonly [1, 2]
type BL2 = Tuple.ButLast<readonly [1]>; // readonly []
type BL3 = Tuple.ButLast<readonly []>; // readonly []
type BL4 = Tuple.ButLast<readonly number[]>; // readonly number[]

// embed-sample-code-ignore-below
export type { BL1, BL2, BL3, BL4 };
