import { type List } from 'ts-type-forge';

// embed-sample-code-ignore-above

type BL1 = List.ButLast<readonly [1, 2, 3]>; // readonly [1, 2]
type BL2 = List.ButLast<readonly string[]>; // readonly string[] (unchanged for general arrays)
type BL3 = List.ButLast<readonly [1]>; // readonly []
type BL4 = List.ButLast<readonly []>; // readonly []

// embed-sample-code-ignore-below
export type { BL1, BL2, BL3, BL4 };
