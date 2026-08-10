import { type List } from 'ts-type-forge';

// embed-sample-code-ignore-above

type L1 = List.Last<readonly [1, 2, 3]>; // 3
type L2 = List.Last<readonly string[]>; // string
type L3 = List.Last<readonly []>; // never
type L4 = List.Last<readonly [1]>; // 1

// embed-sample-code-ignore-below
export type { L1, L2, L3, L4 };
