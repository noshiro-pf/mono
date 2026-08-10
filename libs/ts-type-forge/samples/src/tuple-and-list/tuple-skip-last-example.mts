import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type SL1 = Tuple.SkipLast<1, readonly [1, 2, 3]>; // readonly [1, 2]
type SL2 = Tuple.SkipLast<3, readonly [1, 2, 3]>; // readonly []
type SL3 = Tuple.SkipLast<0, readonly [1, 2, 3]>; // readonly [1, 2, 3]
type SL4 = Tuple.SkipLast<1 | 2, readonly [1, 2, 3]>; // readonly (1 | 2 | 3)[]
type SL5 = Tuple.SkipLast<number, readonly [1, 2, 3]>; // readonly (1 | 2 | 3)[]

// embed-sample-code-ignore-below
export type { SL1, SL2, SL3, SL4, SL5 };
