import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
  type MinLengthOf,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

type A = MinLengthOf<MinLengthArray<3, string>>; // 3
type B = MinLengthOf<BoundedLengthArray<2, 5, string>>; // 2
type C = MinLengthOf<FixedLengthArray<4, string>>; // 4
type D = MinLengthOf<MaxLengthArray<5, string>>; // 0
type E = MinLengthOf<readonly [string, string]>; // 0

// embed-sample-code-ignore-below
export type { A, B, C, D, E };
