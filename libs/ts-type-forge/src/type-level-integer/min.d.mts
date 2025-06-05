/**
 * Calculates the minimum value within a union of non-negative integer literals `N` (which must extend `Uint10`).
 *
 * @template N - A union of non-negative integer literals up to 1023 (`Uint10`).
 * @returns The smallest integer literal present in the union `N`.
 * @example
 * type U = 2 | 5 | 1;
 * type Result = Min<U>; // 1
 * type ResultSingle = Min<5>; // 5
 * type ResultZero = Min<0 | 10>; // 0
 */
type Min<N extends Uint10> = TSTypeForgeInternals.MinImpl<N, []>;

declare namespace TSTypeForgeInternals {
  // https://zenn.dev/noshiro_piko/articles/typescript-type-level-min

  /**
   * @internal
   * Recursive implementation for `Min`. It increments a counter (represented by tuple length `T['length']`) starting from 0 until it finds a number present in the union `N`.
   * @template N - The union of numbers to check against.
   * @template T - An accumulator tuple whose length represents the current number being checked.
   */
  type MinImpl<N extends Uint10, T extends readonly unknown[]> =
    // Base case: If N becomes never (shouldn't happen with Uint10 input unless IsNever is involved elsewhere).
    IsNever<N> extends true
      ? never
      : // Check if the current tuple length T['length'] is present in the union N.
        T['length'] extends N
        ? T['length'] // If yes, this is the smallest number found so far, return it.
        : // Recursive step: Increment the tuple length (counter) and check again.
          MinImpl<N, [0, ...T]>;
}
