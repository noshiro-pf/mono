import { type List } from 'ts-type-forge';

// embed-sample-code-ignore-above

type R1 = List.Reverse<readonly [1, 2, 3]>; // readonly [3, 2, 1]
type R2 = List.Reverse<readonly string[]>; // readonly string[]
type R3 = List.Reverse<readonly []>; // readonly []

// embed-sample-code-ignore-below
export type { R1, R2, R3 };
