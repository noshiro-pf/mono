import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type R1 = Tuple.Reverse<readonly [1, 2, 3]>; // readonly [3, 2, 1]
type R2 = Tuple.Reverse<readonly []>; // readonly []

// embed-sample-code-ignore-below
export type { R1, R2 };
