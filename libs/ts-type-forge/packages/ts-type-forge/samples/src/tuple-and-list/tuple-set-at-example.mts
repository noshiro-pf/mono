import { type Tuple } from 'ts-type-forge';

// embed-sample-code-ignore-above

type SA1 = Tuple.SetAt<1, 'x', [1, 2, 3]>; // readonly [1, 'x', 3]
type SA2 = Tuple.SetAt<0 | 2, 'x', [1, 2, 3]>; // readonly [1 | 'x', 2, 3 | 'x']
type SA3 = Tuple.SetAt<number, 'x', [1, 2, 3]>; // readonly [1 | 'x', 2 | 'x', 3 | 'x']
type SA4 = Tuple.SetAt<2, 'x', [1, 2]>; // readonly [1, 2] (index out of bounds: unchanged)

// embed-sample-code-ignore-below
export type { SA1, SA2, SA3, SA4 };
