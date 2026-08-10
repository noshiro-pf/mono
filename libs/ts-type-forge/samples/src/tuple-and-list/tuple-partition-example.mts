import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type P1 = Tuple.Partition<2, [1, 2, 3, 4, 5]>; // readonly [readonly [1, 2], readonly [3, 4], readonly [5]]
type P2 = Tuple.Partition<3, [1, 2, 3, 4, 5, 6]>; // readonly [readonly [1, 2, 3], readonly [4, 5, 6]]
type P3 = Tuple.Partition<1, [1, 2]>; // readonly [readonly [1], readonly [2]]
type P4 = Tuple.Partition<5, [1, 2]>; // readonly [readonly [1, 2]]
type P5 = Tuple.Partition<number, [1, 2]>; // readonly (readonly (1 | 2)[])[]

// embed-sample-code-ignore-below
export type { P1, P2, P3, P4, P5 };
