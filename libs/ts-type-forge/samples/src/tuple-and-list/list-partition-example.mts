import { type List } from 'ts-type-forge';

// embed-sample-code-ignore-above

type P1 = List.Partition<2, readonly [1, 2, 3, 4, 5]>; // readonly [[1, 2], [3, 4], [5]]
type P2 = List.Partition<3, readonly [1, 2, 3, 4, 5, 6]>; // readonly [[1, 2, 3], [4, 5, 6]]
type P4 = List.Partition<number, readonly [1, 2]>; // readonly (readonly (1 | 2)[])[]
type P3 = List.Partition<1, readonly [1, 2]>; // readonly [[1], [2]]

// embed-sample-code-ignore-below
export type { P1, P2, P3, P4 };
