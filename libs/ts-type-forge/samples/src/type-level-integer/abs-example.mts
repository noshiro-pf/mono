import { type Abs } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Pos = Abs<10>; // 10
type Neg = Abs<-5>; // 5

// embed-sample-code-ignore-below
export type { Neg, Pos };
