import { type List } from 'ts-type-forge';

// embed-sample-code-ignore-above

type SK1 = List.Skip<1, readonly [1, 2, 3]>; // readonly [2, 3]
type SK2 = List.Skip<3, readonly [1, 2, 3]>; // readonly []
type SK3 = List.Skip<1, readonly string[]>; // readonly string[]

// embed-sample-code-ignore-below
export type { SK1, SK2, SK3 };
