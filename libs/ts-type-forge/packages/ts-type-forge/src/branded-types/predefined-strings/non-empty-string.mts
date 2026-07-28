import { type MinLengthString } from './length-constrained-string.mjs';

/**
 * Branded string type for non-empty strings (strings with at least one
 * character).
 *
 * Defined as an alias of {@link MinLengthString}`<1>`, so it participates in
 * the length-constraint subtyping relation: a `NonEmptyString` is assignable
 * to `MinLengthString<0>`, and any `MinLengthString<N>` with `N >= 1` (or
 * `FixedLengthString<N>` with `N >= 1`) is assignable to `NonEmptyString`.
 *
 * @example
 * ```ts
 * const isNonEmptyString = (s: string): s is NonEmptyString => s.length > 0;
 *
 * const greeting = 'hello' as NonEmptyString;
 *
 * const atLeastOne: MinLengthString<0> = greeting; // OK
 * ```
 */
export type NonEmptyString = MinLengthString<1>;
