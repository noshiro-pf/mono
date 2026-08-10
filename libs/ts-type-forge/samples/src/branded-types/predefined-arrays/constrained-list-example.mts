import {
  type BoundedLengthArray,
  type ConstrainedList,
  type MinLengthArray,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

type A = ConstrainedList.Take<2, MinLengthArray<5, string>>;
// FixedLengthArray<2, string>

type B = ConstrainedList.Tail<BoundedLengthArray<2, 5, string>>;
// BoundedLengthArray<1, 4, string>

type C = ConstrainedList.Take<2, readonly [1, 2, 3]>; // readonly [1, 2]

// A brand intersected with a tuple keeps both halves.
type Branded = MinLengthArray<3, number> & readonly [1, 2, 3, 4, 5];

type D = ConstrainedList.Tail<Branded>;
// FixedLengthArray<4, 1 | 2 | 3 | 4 | 5> & readonly [2, 3, 4, 5]

type E = ConstrainedList.Last<Branded>; // 5

// embed-sample-code-ignore-below
export type { A, B, C, D, E };
