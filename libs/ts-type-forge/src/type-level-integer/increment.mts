import { type List, type MakeTuple } from '../tuple-and-list/index.mjs';

/**
 * Increments a non-negative integer literal type `N` by 1.
 *
 * This utility performs compile-time arithmetic by leveraging TypeScript's tuple length calculation.
 * It creates a tuple of length `N`, prepends an element, and returns the new length type.
 * This effectively computes `N + 1` at the type level.
 *
 * Note: Due to TypeScript's recursion limits, this works reliably for small to medium integers
 * (typically up to a few hundred, depending on the TypeScript version and configuration).
 *
 * @template N - A non-negative integer literal type to increment.
 * @returns The number literal type representing `N + 1`.
 *
 * @example
 * ```ts
 * type Five = Increment<4>; // 5
 * type One = Increment<0>; // 1
 * type Ten = Increment<9>; // 10
 *
 * // Useful in recursive type computations
 * type CountToN<N extends number, Count extends number = 0> = Count extends N
 *   ? Count
 *   : CountToN<N, Increment<Count> & number>;
 *
 * type UpTo5 = CountToN<5>; // 5
 *
 * // Building sequences
 * type Range<From extends number, To extends number> = From extends To
 *   ? From
 *   : From | Range<Increment<From> & number, To>;
 *
 * type OneToFive = Range<1, 5>; // 1 | 2 | 3 | 4 | 5
 * ```
 */
export type Increment<N extends number> = (readonly [
  0,
  ...MakeTuple<N, 0>,
])['length'];

/**
 * Decrements a positive integer literal type `N` by 1.
 *
 * This utility performs compile-time arithmetic by leveraging TypeScript's tuple manipulation.
 * It creates a tuple of length `N`, removes the first element using `List.Tail`,
 * and returns the new length type. This effectively computes `N - 1` at the type level.
 *
 * Note: `Decrement<0>` does not error; it clamps to `0`, because `List.Tail`
 * of an empty tuple is an empty tuple (whose length is `0`).
 *
 * @template N - A non-negative integer literal type to decrement.
 * @returns The number literal type representing `N - 1` (or `0` for `N = 0`).
 *
 * @example
 * ```ts
 * type Three = Decrement<4>; // 3
 * type Zero = Decrement<1>; // 0
 * type Four = Decrement<5>; // 4
 *
 * // Note: `Decrement<0>` does not error; it clamps to 0
 * // (`List.Tail` of an empty tuple is an empty tuple, whose length is 0).
 * type ClampedAtZero = Decrement<0>; // 0
 *
 * // Useful in countdown scenarios
 * type Countdown<N extends number> = N extends 0
 *   ? 0
 *   : N | Countdown<Decrement<N>>;
 *
 * type CountdownFrom3 = Countdown<3>; // 3 | 2 | 1 | 0
 *
 * // Bounds checking
 * type IsPositive<N extends number> = N extends 0
 *   ? false
 *   : N extends Decrement<Increment<N> & number>
 *     ? true
 *     : false;
 * ```
 */
export type Decrement<N extends number> = List.Tail<MakeTuple<N, 0>>['length'];
