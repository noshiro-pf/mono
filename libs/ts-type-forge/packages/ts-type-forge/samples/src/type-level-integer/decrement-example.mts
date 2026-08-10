import { type Decrement, type Increment } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Three = Decrement<4>; // 3
type Zero = Decrement<1>; // 0
type Four = Decrement<5>; // 4

// Note: `Decrement<0>` does not error; it clamps to 0
// (`List.Tail` of an empty tuple is an empty tuple, whose length is 0).
type ClampedAtZero = Decrement<0>; // 0

// Useful in countdown scenarios
type Countdown<N extends number> = N extends 0
  ? 0
  : N | Countdown<Decrement<N>>;

type CountdownFrom3 = Countdown<3>; // 3 | 2 | 1 | 0

// Bounds checking
type IsPositive<N extends number> = N extends 0
  ? false
  : N extends Decrement<Increment<N> & number>
    ? true
    : false;

// embed-sample-code-ignore-below
export type {
  ClampedAtZero,
  Countdown,
  CountdownFrom3,
  Four,
  IsPositive,
  Three,
  Zero,
};
