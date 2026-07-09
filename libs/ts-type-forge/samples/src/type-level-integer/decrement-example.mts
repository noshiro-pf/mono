import { type Decrement, type Increment } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Three = Decrement<4>; // 3
type Zero = Decrement<1>; // 0
type Four = Decrement<5>; // 4

// type Error = Decrement<0>; // ⚠️ Error: will fail or return unexpected result

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
export type { Countdown, CountdownFrom3, Four, IsPositive, Three, Zero };
