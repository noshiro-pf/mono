import { type UintRangeInclusive } from 'ts-type-forge';

// embed-sample-code-ignore-above

type RI1 = UintRangeInclusive<3, 7>; // 3 | 4 | 5 | 6 | 7
type RI2 = UintRangeInclusive<0, 4>; // 0 | 1 | 2 | 3 | 4
type RI3 = UintRangeInclusive<5, 5>; // 5

// embed-sample-code-ignore-below
export type { RI1, RI2, RI3 };
