import type { IsNever } from '../condition/index.mjs';
import type { Uint10 } from '../constants/index.mjs';

/**
 * Calculates the maximum value within a union of non-negative integer literals `N` (which must extend `Uint10`).
 *
 * @template N - A union of non-negative integer literals up to 1023 (`Uint10`).
 * @returns The largest integer literal present in the union `N`.
 * @example
 * ```ts
 * type U2 = 0 | 1 | 2;
 * type Result = Max<U2>; // 2
 * type ResultSingle = Max<5>; // 5
 * // type ResultFull = Max<Uint10>; // 1023
 * ```
 */
export type Max<N extends Uint10> = MaxImpl<N, []>;

// https://zenn.dev/noshiro_piko/articles/typescript-type-level-min

/**
 * @internal
 * Recursive implementation for `Max`. It builds a tuple `T` until its length is not less than any number in the union `N`.
 * @template N - The union of numbers to check against; it is passed through unchanged.
 * @template T - An accumulator tuple whose length represents the current candidate for `max(N)`.
 */
type MaxImpl<N extends Uint10, T extends readonly unknown[]> =
  // `Max<never>` is `never`. Without this guard, `[never] extends [Partial<[]>['length']]` holds and the result would be `0`.
  IsNever<N> extends true
    ? never
    : // Check if no number in the union N is greater than the current tuple length T['length'].
      // `Partial<T>['length']` creates a union 0 | 1 | ... | T['length'] (inclusive).
      // `[N] extends [Partial<T>['length']]` checks if N is a subset of numbers not greater than T['length'].
      [N] extends [Partial<T>['length']]
      ? T['length'] // If yes, T['length'] is the smallest number not less than any in N, i.e. max(N).
      : // Recursive step: Increment the tuple length and check again.
        MaxImpl<N, [0, ...T]>;
