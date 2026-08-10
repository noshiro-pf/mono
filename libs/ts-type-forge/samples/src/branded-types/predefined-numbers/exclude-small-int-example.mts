import {
  type ExcludeSmallInt,
  type Uint,
  type WithSmallInt,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

type Count = WithSmallInt<Uint>; // 0 | 1 | ... | 39 | Uint
type PureCount = ExcludeSmallInt<Count>; // Uint

const toLargeCount = (n: Count): ExcludeSmallInt<Count> => {
  if (typeof n === 'number') {
    return (n + 1000) as Uint; // Convert small to large
  }
  return n;
};

// embed-sample-code-ignore-below
export { toLargeCount };
export type { Count, PureCount };
