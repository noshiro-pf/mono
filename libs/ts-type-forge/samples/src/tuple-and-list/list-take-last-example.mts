import { type List } from 'ts-type-forge';

// embed-sample-code-ignore-above

type TL1 = List.TakeLast<2, readonly [1, 2, 3]>; // readonly [2, 3]
type TL2 = List.TakeLast<5, readonly [1, 2, 3]>; // readonly [1, 2, 3]
type TL3 = List.TakeLast<2, readonly string[]>; // readonly string[]

// embed-sample-code-ignore-below
export type { TL1, TL2, TL3 };
