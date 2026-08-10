import { type IntRange } from 'ts-type-forge';

// embed-sample-code-ignore-above

type R1 = IntRange<1, 5>; // 1 | 2 | 3 | 4
type R2 = IntRange<-3, 3>; // -3 | -2 | -1 | 0 | 1 | 2
type R3 = IntRange<-5, -1>; // -5 | -4 | -3 | -2
type R4 = IntRange<3, -3>; // never
type R5 = IntRange<5, 5>; // never

// embed-sample-code-ignore-below
export type { R1, R2, R3, R4, R5 };
