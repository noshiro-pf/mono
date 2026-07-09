import {
  type Int,
  type PositiveInt,
  type Uint,
  type WithSmallInt,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

type Count = WithSmallInt<Uint>;
// Count is 0 | 1 | 2 | ... | 39 | Uint

const increment = (n: Count): Count => {
  if (typeof n === 'number' && n < 39) {
    return (n + 1) as Count; // Type narrowing works with literals
  }
  return ((n as number) + 1) as Count;
};

// Common patterns:
type SmallInt = WithSmallInt<Int>; // -40 to 39 | Int
type SmallUint = WithSmallInt<Uint>; // 0 to 39 | Uint
type SmallPositiveInt = WithSmallInt<PositiveInt>; // 1 to 39 | PositiveInt

// embed-sample-code-ignore-below
export { increment };
export type { Count, SmallInt, SmallPositiveInt, SmallUint };
