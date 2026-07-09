import { type ArrayAtLeastLen } from '../../tuple-and-list/index.mjs';
import { type UintRangeInclusive } from '../../type-level-integer/index.mjs';
import { type TSTypeForgeInternals_BrandEncapsulated } from '../_internals.mjs';

/**
 * Branded string type for strings with at most `MaxLength` characters.
 *
 * The brand is encoded so that the natural subtyping relation between length
 * constraints is preserved: if `M <= N`, then `MaxLengthString<M>` is
 * assignable to `MaxLengthString<N>` (a string of at most `M` characters is
 * also a string of at most `N` characters). This is achieved by branding with
 * the union of allowed lengths (`0 | 1 | ... | MaxLength`), which shrinks as
 * the constraint gets stricter.
 *
 * @template MaxLength - The maximum number of characters (inclusive). Must be
 *   a non-negative integer literal.
 *
 * @example
 * ```ts
 * const isMaxLengthString = <N extends number>(
 *   s: string,
 *   maxLength: N,
 * ): s is MaxLengthString<N> => s.length <= maxLength;
 *
 * const userName = 'noshiro' as MaxLengthString<32>;
 *
 * const short: MaxLengthString<64> = userName; // OK (32 <= 64)
 * // const tooLong: MaxLengthString<16> = userName; // Error! (32 > 16)
 * ```
 */
export type MaxLengthString<MaxLength extends number> = string &
  TSTypeForgeInternals_BrandEncapsulated<
    Readonly<{
      MaxLength: UintRangeInclusive<0, MaxLength>;
    }>
  >;

/**
 * Branded string type for strings with at least `MinLength` characters.
 *
 * The brand is encoded so that the natural subtyping relation between length
 * constraints is preserved: if `M >= N`, then `MinLengthString<M>` is
 * assignable to `MinLengthString<N>` (a string of at least `M` characters is
 * also a string of at least `N` characters). This is achieved by branding with
 * a readonly tuple type that requires at least `MinLength` elements, which
 * becomes a narrower type as the constraint gets stricter.
 *
 * @template MinLength - The minimum number of characters (inclusive). Must be
 *   a non-negative integer literal.
 *
 * @example
 * ```ts
 * const isMinLengthString = <N extends number>(
 *   s: string,
 *   minLength: N,
 * ): s is MinLengthString<N> => s.length >= minLength;
 *
 * const password = 'very-secret-password' as MinLengthString<12>;
 *
 * const nonEmpty: MinLengthString<1> = password; // OK (12 >= 1)
 * // const longer: MinLengthString<16> = password; // Error! (12 < 16)
 * ```
 */
export type MinLengthString<MinLength extends number> = string &
  TSTypeForgeInternals_BrandEncapsulated<
    Readonly<{
      MinLength: ArrayAtLeastLen<MinLength, 0>;
    }>
  >;

/**
 * Branded string type for strings whose length is between `MinLength` and
 * `MaxLength` characters (both inclusive).
 * Defined as the intersection of {@link MinLengthString} and
 * {@link MaxLengthString}, so both bounds can be weakened independently:
 * `BoundedLengthString<M1, M2>` is assignable to `BoundedLengthString<N1, N2>`
 * if `M1 >= N1` and `M2 <= N2`.
 *
 * @template MinLength - The minimum number of characters (inclusive). Must be
 *   a non-negative integer literal.
 * @template MaxLength - The maximum number of characters (inclusive). Must be
 *   a non-negative integer literal.
 *
 * @example
 * ```ts
 * const userId = 'user-12345678' as BoundedLengthString<8, 16>;
 *
 * const relaxed: BoundedLengthString<1, 255> = userId; // OK ([8, 16] ⊆ [1, 255])
 * const atLeast8: MinLengthString<8> = userId; // OK
 * const atMost16: MaxLengthString<16> = userId; // OK
 * // const strict: BoundedLengthString<10, 16> = userId; // Error! (8 < 10)
 * ```
 */
export type BoundedLengthString<
  MinLength extends number,
  MaxLength extends number,
> = MaxLengthString<MaxLength> & MinLengthString<MinLength>;

/**
 * Branded string type for strings with exactly `Length` characters.
 * Alias for `BoundedLengthString<Length, Length>`.
 *
 * @template Length - The exact number of characters. Must be a non-negative
 *   integer literal.
 *
 * @example
 * ```ts
 * const countryCode = 'JP' as FixedLengthString<2>;
 *
 * const atMost5: MaxLengthString<5> = countryCode; // OK (2 <= 5)
 * const nonEmpty: MinLengthString<1> = countryCode; // OK (2 >= 1)
 * // const threeChars: FixedLengthString<3> = countryCode; // Error!
 * ```
 */
export type FixedLengthString<Length extends number> = BoundedLengthString<
  Length,
  Length
>;
