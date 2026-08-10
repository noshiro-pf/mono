import { type UintRange } from 'ts-type-forge';

// embed-sample-code-ignore-above

type R1 = UintRange<3, 7>; // 3 | 4 | 5 | 6
type R2 = UintRange<0, 4>; // 0 | 1 | 2 | 3
type R3 = UintRange<5, 5>; // never

// embed-sample-code-ignore-below
export type { R1, R2, R3 };
