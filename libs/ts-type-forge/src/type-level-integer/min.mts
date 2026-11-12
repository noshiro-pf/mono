import type { IsNever } from '../condition/index.mjs';
import type { Uint10 } from '../constants/index.mjs';
import type { RelaxedExtract } from '../others/index.mjs';
import type { MakeTuple } from '../tuple-and-list/index.mjs';

/**
 * Calculates the minimum value within a union of non-negative integer literals `N` (which must extend `Uint10`).
 *
 * @template N - A union of non-negative integer literals up to 1023 (`Uint10`).
 * @returns The smallest integer literal present in the union `N`.
 * @example
 * ```ts
 * type U = 2 | 5 | 1;
 *
 * expectType<Min<U>, 1>('=');
 *
 * expectType<Min<5>, 5>('=');
 *
 * expectType<Min<0 | 10>, 0>('=');
 *
 * expectType<Min<1000 | 1023>, 1000>('=');
 * ```
 */
export type Min<N extends Uint10> =
  // `Min<never>` is `never`. The guard is load-bearing: without it, no length is ever a member of `never` and the recursion runs into TS2589.
  IsNever<N> extends true ? never : MinCoarse<N, []>;

// https://zenn.dev/noshiro_piko/articles/typescript-type-level-min

/**
 * @internal
 * Grows the tuple `T` {@link Step} at a time while no member of `N` is at most its length plus 32, then hands over to {@link MinFine}.
 * A step of one would recurse once per integer, and TypeScript stops a tail-recursive type at 1000 steps, so `Min<1000>` failed with TS2589;
 * {@link Step} at a time it is at most 32 steps here and 32 in {@link MinFine} for all of `Uint10`.
 * @template N - The union of numbers to check against.
 * @template T - An accumulator tuple whose length is a multiple of 32, and at most `min(N)`.
 */
type MinCoarse<N extends Uint10, T extends readonly unknown[]> =
  IsNever<RelaxedExtract<N, UpTo<[...T, ...Step]>>> extends true
    ? MinCoarse<N, [...T, ...Step]>
    : MinFine<N, T>;

/**
 * @internal
 * Grows the tuple `T` one at a time from a length no greater than `min(N)`; the first length that is a member of `N` is `min(N)`.
 * Called with a length at most 32 below `min(N)`, so it recurses at most 32 times.
 */
type MinFine<
  N extends Uint10,
  T extends readonly unknown[],
> = T['length'] extends N ? T['length'] : MinFine<N, [0, ...T]>;

/**
 * @internal
 * `0 | 1 | ... | T['length']` (inclusive): `Partial<T>` makes every element optional, so its length is any of them.
 */
type UpTo<T extends readonly unknown[]> = Partial<T>['length'];

/** @internal How far {@link MinCoarse} grows its tuple at a time. */
type Step = MakeTuple<32, 0>;
