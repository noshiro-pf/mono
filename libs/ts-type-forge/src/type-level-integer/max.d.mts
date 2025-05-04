/**
 * Calculates the smallest integer `M` such that all numbers in the union `N` (which must extend `Uint10`) are less than `M`.
 * Effectively, this calculates `max(N)`.
 *
 * @template N - A union of non-negative integer literals up to 1023 (`Uint10`).
 * @returns The smallest integer literal greater than all numbers in `N`.
 * @example
 * type U2 = 0 | 1 | 2;
 * type Result = Max<U2>; // 2
 * type ResultSingle = Max<5>; // 5
 * // type ResultFull = Max<Uint10>; // 1023
 */
type Max<N extends Uint10> = TSTypeForgeInternals.MaxImpl<N, []>;

/** @internal Contains internal implementation details. */
declare namespace TSTypeForgeInternals {
  // https://zenn.dev/noshiro_piko/articles/typescript-type-level-min

  /**
   * @internal
   * Recursive implementation for `Max`. It builds a tuple `T` until its length is greater than all numbers in the union `N`.
   * @template N - The remaining union of numbers to check.
   * @template T - An accumulator tuple whose length represents the current candidate for `max(N)`.
   */
  type MaxImpl<N extends Uint10, T extends readonly unknown[]> =
    // Base case: If N becomes never (shouldn't happen with Uint10 input unless IsNever is involved elsewhere).
    IsNever<N> extends true
      ? never
      : // Check if all numbers in the union N are less than the current tuple length T['length'].
        // `Partial<T>['length']` creates a union 0 | 1 | ... | (T['length'] - 1).
        // `[N] extends [Partial<T>['length']]` checks if N is a subset of numbers less than T['length'].
        [N] extends [Partial<T>['length']]
        ? T['length'] // If yes, T['length'] is the smallest number greater than all in N.
        : // Recursive step: Increment the tuple length and check again.
          MaxImpl<N, [0, ...T]>;
}
