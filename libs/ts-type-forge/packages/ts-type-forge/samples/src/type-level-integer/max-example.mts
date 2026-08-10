import { type Max } from 'ts-type-forge';

// embed-sample-code-ignore-above

type U2 = 0 | 1 | 2;
type Result = Max<U2>; // 2
type ResultSingle = Max<5>; // 5
// type ResultFull = Max<Uint10>; // 1023

// embed-sample-code-ignore-below
export type { Result, ResultSingle, U2 };
