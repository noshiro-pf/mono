import { type List } from 'ts-type-forge';

// embed-sample-code-ignore-above

type SL1 = List.SkipLast<1, readonly [1, 2, 3]>; // readonly [1, 2]
type SL2 = List.SkipLast<3, readonly [1, 2, 3]>; // readonly []
type SL3 = List.SkipLast<1, readonly string[]>; // readonly string[]

// embed-sample-code-ignore-below
export type { SL1, SL2, SL3 };
