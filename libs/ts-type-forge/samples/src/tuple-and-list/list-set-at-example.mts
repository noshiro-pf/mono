import { type List } from 'ts-type-forge';

// embed-sample-code-ignore-above

type SA1 = List.SetAt<1, 'x', [1, 2, 3]>; // readonly [1, 'x', 3]
type SA2 = List.SetAt<1, 'x', readonly number[]>; // readonly (string | number)[]
// type SA3 = List.SetAt<2, 'x', [1, 2]>; // Error if I is out of bounds for tuple

// embed-sample-code-ignore-below
export type { SA1, SA2 };
