import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type SK1 = Tuple.Skip<1, [1, 2, 3]>; // readonly [2, 3]
type SK2 = Tuple.Skip<3, [1, 2, 3]>; // readonly []
type SK3 = Tuple.Skip<0, [1, 2, 3]>; // readonly [1, 2, 3]
type SK4 = Tuple.Skip<1 | 2, [1, 2, 3]>; // readonly (1 | 2 | 3)[]
type SK5 = Tuple.Skip<number, [1, 2, 3]>; // readonly (1 | 2 | 3)[]

// embed-sample-code-ignore-below
export type { SK1, SK2, SK3, SK4, SK5 };
