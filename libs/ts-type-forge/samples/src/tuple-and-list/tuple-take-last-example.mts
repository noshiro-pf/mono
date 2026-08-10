import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type TL1 = Tuple.TakeLast<2, readonly [1, 2, 3]>; // readonly [2, 3]
type TL2 = Tuple.TakeLast<5, readonly [1, 2, 3]>; // readonly [1, 2, 3]
type TL3 = Tuple.TakeLast<0, readonly [1, 2, 3]>; // readonly []
type TL4 = Tuple.TakeLast<1 | 2, readonly [1, 2, 3]>; // readonly (1 | 2 | 3)[]
type TL5 = Tuple.TakeLast<number, readonly [1, 2, 3]>; // readonly (1 | 2 | 3)[]

// embed-sample-code-ignore-below
export type { TL1, TL2, TL3, TL4, TL5 };
