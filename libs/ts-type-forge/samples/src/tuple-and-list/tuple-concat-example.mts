import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type C1 = Tuple.Concat<[1, 2], [3, 4]>; // readonly [1, 2, 3, 4]
type C2 = Tuple.Concat<[], [1]>; // readonly [1]
type C3 = Tuple.Concat<[1], []>; // readonly [1]
type C4 = Tuple.Concat<readonly number[], readonly string[]>; // readonly (number | string)[]
type C5 = Tuple.Concat<[1], readonly number[]>; // readonly [1, ...number[]]

// embed-sample-code-ignore-below
export type { C1, C2, C3, C4, C5 };
