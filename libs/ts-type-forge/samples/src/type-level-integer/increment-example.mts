import { type Increment } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Five = Increment<4>; // 5
type One = Increment<0>; // 1
type Ten = Increment<9>; // 10

// Useful in recursive type computations
type CountToN<N extends number, Count extends number = 0> = Count extends N
  ? Count
  : CountToN<N, Increment<Count> & number>;

type UpTo5 = CountToN<5>; // 5

// Building sequences
type Range<From extends number, To extends number> = From extends To
  ? From
  : From | Range<Increment<From> & number, To>;

type OneToFive = Range<1, 5>; // 1 | 2 | 3 | 4 | 5

// embed-sample-code-ignore-below
export type { CountToN, Five, One, OneToFive, Range, Ten, UpTo5 };
