import { type Min } from 'ts-type-forge';

// embed-sample-code-ignore-above

type U = 2 | 5 | 1;
type Result = Min<U>; // 1
type ResultSingle = Min<5>; // 5
type ResultZero = Min<0 | 10>; // 0

// embed-sample-code-ignore-below
export type { Result, ResultSingle, ResultZero, U };
