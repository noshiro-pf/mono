import { type List } from 'ts-type-forge';

// embed-sample-code-ignore-above

type C1 = List.Concat<[1, 2], [3, 4]>; // readonly [1, 2, 3, 4]
type C2 = List.Concat<readonly number[], readonly string[]>; // readonly (string | number)[]
type C3 = List.Concat<[1], readonly number[]>; // readonly [1, ...number[]]

// embed-sample-code-ignore-below
export type { C1, C2, C3 };
