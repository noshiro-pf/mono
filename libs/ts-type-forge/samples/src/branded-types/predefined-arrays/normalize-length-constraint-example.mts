import {
  type BoundedLengthArray,
  type ConstrainedList,
  type List,
  type NormalizeLengthConstraint,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

type Naive = BoundedLengthArray<2, 5, number> & readonly [3, 2, 1];
// readonly number[] & MinLengthTuple<2, number> & <brand> & readonly [3, 2, 1]

type Normal = NormalizeLengthConstraint<Naive>;
// readonly [3, 2, 1] & <brand>

type Branded = BoundedLengthArray<2, 5, number> & readonly [1, 2, 3];

// The same type, reached two ways — identical once both are normalized.
type Direct = NormalizeLengthConstraint<ConstrainedList.Reverse<Branded>>;

type Separately = NormalizeLengthConstraint<
  ConstrainedList.Reverse<BoundedLengthArray<2, 5, number>> &
    List.Reverse<readonly [1, 2, 3]>
>;

// embed-sample-code-ignore-below
export type { Branded, Direct, Naive, Normal, Separately };
