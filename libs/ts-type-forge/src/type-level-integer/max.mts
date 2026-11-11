import type { IsNever } from '../condition/index.mjs';
import type { Uint10 } from '../constants/index.mjs';
import type { MakeTuple } from '../tuple-and-list/index.mjs';

/**
 * Calculates the maximum value within a union of non-negative integer literals `N` (which must extend `Uint10`).
 *
 * @template N - A union of non-negative integer literals up to 1023 (`Uint10`).
 * @returns The largest integer literal present in the union `N`.
 * @example
 * ```ts
 * type U2 = 0 | 1 | 2;
 *
 * expectType<Max<U2>, 2>('=');
 *
 * expectType<Max<5>, 5>('=');
 *
 * expectType<Max<Uint10>, 1023>('=');
 * ```
 */
export type Max<N extends Uint10> =
  // `Max<never>` is `never`. Without this guard, `[never] extends [UpTo<[]>]` holds and the result would be `0`.
  IsNever<N> extends true ? never : MaxCoarse<N, []>;

// https://zenn.dev/noshiro_piko/articles/typescript-type-level-min

/**
 * @internal
 * Grows the tuple `T` {@link Step} at a time until no member of `N` is greater than its length, then hands over to {@link MaxFine}.
 * A step of one would recurse once per integer, and TypeScript stops a tail-recursive type at 1000 steps, so `Max<1000>` failed with TS2589;
 * {@link Step} at a time it is at most 32 steps here and 32 in {@link MaxFine} for all of `Uint10`.
 * @template N - The union of numbers to check against; it is passed through unchanged.
 * @template T - An accumulator tuple whose length is a multiple of 32.
 */
type MaxCoarse<N extends Uint10, T extends readonly unknown[]> =
  // `[N] extends [UpTo<T>]` checks that every member of N is at most T['length'].
  [N] extends [UpTo<T>] ? MaxFine<N, T> : MaxCoarse<N, [...T, ...Step]>;

/**
 * @internal
 * Shrinks the tuple `T` one at a time from a length no member of `N` exceeds; the first length that is a member of `N` is `max(N)`.
 * Called with a length less than 32 above `max(N)`, so it recurses at most 32 times.
 */
type MaxFine<
  N extends Uint10,
  T extends readonly unknown[],
> = T['length'] extends N
  ? T['length']
  : T extends readonly [unknown, ...infer Rest]
    ? MaxFine<N, Rest>
    : never;

/**
 * @internal
 * `0 | 1 | ... | T['length']` (inclusive): `Partial<T>` makes every element optional, so its length is any of them.
 */
type UpTo<T extends readonly unknown[]> = Partial<T>['length'];

/** @internal How far {@link MaxCoarse} grows its tuple at a time. */
type Step = MakeTuple<32, 0>;
