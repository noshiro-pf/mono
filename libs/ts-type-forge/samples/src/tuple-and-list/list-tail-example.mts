import type { List } from 'ts-type-forge';

// embed-sample-code-ignore-above

type T1 = List.Tail<[1, 2, 3]>; // readonly [2, 3]
type T2 = List.Tail<readonly string[]>; // readonly string[] (unchanged for general arrays)
type T3 = List.Tail<[1]>; // readonly []
type T4 = List.Tail<[]>; // readonly []
type T5 = List.Tail<readonly [...string[], 1]>; // readonly (string | 1)[]

// embed-sample-code-ignore-below
export type { T1, T2, T3, T4, T5 };
