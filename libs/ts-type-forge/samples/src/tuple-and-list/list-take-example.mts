import { type List } from 'ts-type-forge';

// embed-sample-code-ignore-above

type TK1 = List.Take<2, readonly [1, 2, 3]>; // readonly [1, 2]
type TK2 = List.Take<5, readonly [1, 2, 3]>; // readonly [1, 2, 3]
type TK3 = List.Take<2, readonly string[]>; // readonly string[]

// embed-sample-code-ignore-below
export type { TK1, TK2, TK3 };
