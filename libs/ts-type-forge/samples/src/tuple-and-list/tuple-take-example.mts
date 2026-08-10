import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type TK1 = Tuple.Take<2, readonly [1, 2, 3]>; // readonly [1, 2]
type TK2 = Tuple.Take<5, readonly [1, 2, 3]>; // readonly [1, 2, 3]
type TK3 = Tuple.Take<0, readonly [1, 2, 3]>; // readonly []
type TK4 = Tuple.Take<1 | 2, readonly [1, 2, 3]>; // readonly (1 | 2 | 3)[]
type TK5 = Tuple.Take<number, readonly [1, 2, 3]>; // readonly (1 | 2 | 3)[]

// embed-sample-code-ignore-below
export type { TK1, TK2, TK3, TK4, TK5 };
