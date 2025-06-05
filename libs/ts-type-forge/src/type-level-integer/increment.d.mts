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
 * type Five = Increment<4>;  // 5
 * type One = Increment<0>;   // 1
 * type Ten = Increment<9>;   // 10
 *
 * // Useful in recursive type computations
 * type CountToN<N extends number, Count extends number = 0> =
 *   Count extends N ? Count : CountToN<N, Increment<Count>>;
 *
 * type UpTo5 = CountToN<5>; // 5
 *
 * // Building sequences
 * type Range<From extends number, To extends number> =
 *   From extends To
 *     ? From
 *     : From | Range<Increment<From>, To>;
 *
 * type OneToFive = Range<1, 5>; // 1 | 2 | 3 | 4 | 5
 * ```
 */
type Increment<N extends number> = (readonly [0, ...MakeTuple<0, N>])['length'];

/**
 * Decrements a positive integer literal type `N` by 1.
 *
 * This utility performs compile-time arithmetic by leveraging TypeScript's tuple manipulation.
 * It creates a tuple of length `N`, removes the first element using `List.Tail`,
 * and returns the new length type. This effectively computes `N - 1` at the type level.
 *
 * Warning: This requires `N` to be positive (>= 1). Attempting to decrement 0 will likely
 * result in compilation errors or unexpected behavior.
 *
 * @template N - A positive integer literal type (must be >= 1) to decrement.
 * @returns The number literal type representing `N - 1`.
 *
 * @example
 * ```ts
 * type Three = Decrement<4>; // 3
 * type Zero = Decrement<1>;  // 0
 * type Four = Decrement<5>;  // 4
 *
 * // type Error = Decrement<0>; // ⚠️ Error: will fail or return unexpected result
 *
 * // Useful in countdown scenarios
 * type Countdown<N extends number> =
 *   N extends 0 ? 0 : N | Countdown<Decrement<N>>;
 *
 * type CountdownFrom3 = Countdown<3>; // 3 | 2 | 1 | 0
 *
 * // Bounds checking
 * type IsPositive<N extends number> =
 *   N extends 0 ? false : N extends Decrement<Increment<N>> ? true : false;
 * ```
 */
type Decrement<N extends number> = List.Tail<MakeTuple<0, N>>['length'];
