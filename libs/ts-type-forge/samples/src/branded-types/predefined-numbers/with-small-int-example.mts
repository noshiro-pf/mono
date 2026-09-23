import {
  type Int,
  type PositiveInt,
  type Uint,
  type WithSmallInt,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

type Count = WithSmallInt<Uint>;
// Count is 0 | 1 | 2 | ... | 39 | Uint

const increment = (n: Count): Count =>
  // Type narrowing works with literals
  typeof n === 'number' && n < 39
    ? ((n + 1) as Count)
    : (((n as number) + 1) as Count);

// Common patterns:
type SmallInt = WithSmallInt<Int>; // -40 to 39 | Int
type SmallUint = WithSmallInt<Uint>; // 0 to 39 | Uint
type SmallPositiveInt = WithSmallInt<PositiveInt>; // 1 to 39 | PositiveInt

// embed-sample-code-ignore-below
export { increment };
export type { Count, SmallInt, SmallPositiveInt, SmallUint };
