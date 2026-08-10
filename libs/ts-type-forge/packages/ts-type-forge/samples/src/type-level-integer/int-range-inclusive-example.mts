import { type IntRangeInclusive } from 'ts-type-forge';

// embed-sample-code-ignore-above

type RI1 = IntRangeInclusive<1, 5>; // 1 | 2 | 3 | 4 | 5
type RI2 = IntRangeInclusive<-3, 3>; // -3 | -2 | -1 | 0 | 1 | 2 | 3
type RI3 = IntRangeInclusive<-5, -1>; // -5 | -4 | -3 | -2 | -1
type RI4 = IntRangeInclusive<3, -3>; // never
type RI5 = IntRangeInclusive<5, 5>; // 5

// embed-sample-code-ignore-below
export type { RI1, RI2, RI3, RI4, RI5 };
