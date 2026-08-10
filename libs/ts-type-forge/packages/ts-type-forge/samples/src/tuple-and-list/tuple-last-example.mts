import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type L1 = Tuple.Last<[1, 2, 3]>; // 3
type L2 = Tuple.Last<[]>; // never
type L3 = Tuple.Last<[1]>; // 1
type L4 = Tuple.Last<readonly string[]>; // string
type L5 = Tuple.Last<[...string[], 1]>; // 1
type L6 = Tuple.Last<[1, ...string[]]>; // 1 | string

// embed-sample-code-ignore-below
export type { L1, L2, L3, L4, L5, L6 };
