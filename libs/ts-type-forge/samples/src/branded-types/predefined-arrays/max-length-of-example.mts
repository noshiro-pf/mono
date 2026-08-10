import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type MaxLengthArray,
  type MaxLengthOf,
  type MinLengthArray,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

type A = MaxLengthOf<MaxLengthArray<5, string>>; // 5
type B = MaxLengthOf<BoundedLengthArray<2, 5, string>>; // 5
type C = MaxLengthOf<FixedLengthArray<4, string>>; // 4
type D = MaxLengthOf<MinLengthArray<3, string>>; // never
type E = MaxLengthOf<readonly [string, string]>; // never

// embed-sample-code-ignore-below
export type { A, B, C, D, E };
