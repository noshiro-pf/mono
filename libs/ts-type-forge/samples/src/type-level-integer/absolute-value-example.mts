import { type AbsoluteValue } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Pos = AbsoluteValue<10>; // 10
type Neg = AbsoluteValue<-5>; // 5
type Zero = AbsoluteValue<0>; // 0
type Union = AbsoluteValue<-1 | 2>; // 1 | 2

// embed-sample-code-ignore-below
export type { Neg, Pos, Union, Zero };
