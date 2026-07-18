import {
  type BoundedLengthString,
  type FixedLengthString,
  type MaxLengthString,
  type MinLengthString,
  type SupportedLength,
} from 'ts-type-forge';

/**
 * Type guard that checks if a string has at least `minLength` characters.
 *
 * The length is measured in UTF-16 code units (the same unit as
 * `String.prototype.length`), so characters outside the Basic Multilingual
 * Plane (e.g. emoji) count as 2.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows the input to `MinLengthString<MinLength>` while preserving the
 *   original string type (e.g. literal types) via intersection.
 * - The result participates in the length-constraint subtyping relation: for
 *   example, a value narrowed to `MinLengthString<3>` is assignable to
 *   `MinLengthString<1>` (= `NonEmptyString`).
 *
 * @example
 *
 * ```ts
 * const input: string = 'very-secret-password';
 *
 * assert.isTrue(isMinLengthString(input, 12));
 *
 * assert.isFalse(isMinLengthString('short', 12));
 *
 * if (isMinLengthString(input, 12)) {
 *   const password: MinLengthString<12> = input;
 *
 *   const nonEmpty: NonEmptyString = input; // OK (12 >= 1)
 * }
 * ```
 *
 * @template S - The input string type (literal types are preserved).
 * @template MinLength - The minimum number of characters (inclusive).
 * @param s - The string to check.
 * @param minLength - The minimum number of characters (inclusive).
 * @returns `true` if `s.length >= minLength`, `false` otherwise. When `true`,
 *   TypeScript narrows `s` to `MinLengthString<MinLength> & S`.
 */
export const isMinLengthString = <
  S extends string,
  MinLength extends SupportedLength,
>(
  s: S,
  minLength: MinLength,
): s is MinLengthString<MinLength> & S => s.length >= minLength;

/**
 * Type guard that checks if a string has at most `maxLength` characters.
 *
 * The length is measured in UTF-16 code units (the same unit as
 * `String.prototype.length`), so characters outside the Basic Multilingual
 * Plane (e.g. emoji) count as 2.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows the input to `MaxLengthString<MaxLength>` while preserving the
 *   original string type (e.g. literal types) via intersection.
 * - The result participates in the length-constraint subtyping relation: for
 *   example, a value narrowed to `MaxLengthString<16>` is assignable to
 *   `MaxLengthString<32>`.
 *
 * @example
 *
 * ```ts
 * const input: string = 'noshiro';
 *
 * assert.isTrue(isMaxLengthString(input, 32));
 *
 * assert.isFalse(isMaxLengthString(input, 3));
 *
 * if (isMaxLengthString(input, 32)) {
 *   const userName: MaxLengthString<32> = input;
 *
 *   const relaxed: MaxLengthString<64> = input; // OK (32 <= 64)
 * }
 * ```
 *
 * @template S - The input string type (literal types are preserved).
 * @template MaxLength - The maximum number of characters (inclusive).
 * @param s - The string to check.
 * @param maxLength - The maximum number of characters (inclusive).
 * @returns `true` if `s.length <= maxLength`, `false` otherwise. When `true`,
 *   TypeScript narrows `s` to `MaxLengthString<MaxLength> & S`.
 */
export const isMaxLengthString = <
  S extends string,
  MaxLength extends SupportedLength,
>(
  s: S,
  maxLength: MaxLength,
): s is MaxLengthString<MaxLength> & S => s.length <= maxLength;

/**
 * Type guard that checks if a string's length is within the inclusive range
 * `[minLength, maxLength]`.
 *
 * The length is measured in UTF-16 code units (the same unit as
 * `String.prototype.length`), so characters outside the Basic Multilingual
 * Plane (e.g. emoji) count as 2.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows the input to `BoundedLengthString<MinLength, MaxLength>` while
 *   preserving the original string type (e.g. literal types) via intersection.
 * - Since `BoundedLengthString` is the intersection of `MinLengthString` and
 *   `MaxLengthString`, the narrowed value is assignable to both, and both
 *   bounds can be weakened independently.
 *
 * @example
 *
 * ```ts
 * const input: string = 'user-12345678';
 *
 * assert.isTrue(isBoundedLengthString(input, 8, 16));
 *
 * assert.isFalse(isBoundedLengthString('user', 8, 16));
 *
 * if (isBoundedLengthString(input, 8, 16)) {
 *   const userId: BoundedLengthString<8, 16> = input;
 *
 *   const relaxed: BoundedLengthString<1, 255> = input; // OK ([8, 16] ⊆ [1, 255])
 * }
 * ```
 *
 * @template S - The input string type (literal types are preserved).
 * @template MinLength - The minimum number of characters (inclusive).
 * @template MaxLength - The maximum number of characters (inclusive).
 * @param s - The string to check.
 * @param minLength - The minimum number of characters (inclusive).
 * @param maxLength - The maximum number of characters (inclusive).
 * @returns `true` if `minLength <= s.length && s.length <= maxLength`, `false`
 *   otherwise. When `true`, TypeScript narrows `s` to
 *   `BoundedLengthString<MinLength, MaxLength> & S`.
 */
export const isBoundedLengthString = <
  S extends string,
  MinLength extends SupportedLength,
  MaxLength extends SupportedLength,
>(
  s: S,
  minLength: MinLength,
  maxLength: MaxLength,
): s is BoundedLengthString<MinLength, MaxLength> & S =>
  s.length >= minLength && s.length <= maxLength;

/**
 * Type guard that checks if a string has exactly `length` characters.
 *
 * The length is measured in UTF-16 code units (the same unit as
 * `String.prototype.length`), so characters outside the Basic Multilingual
 * Plane (e.g. emoji) count as 2.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows the input to `FixedLengthString<Length>` while preserving the
 *   original string type (e.g. literal types) via intersection.
 * - Since `FixedLengthString<Length>` is defined as
 *   `BoundedLengthString<Length, Length>`, the narrowed value is assignable to
 *   any `MinLengthString<N>` with `N <= Length` and any `MaxLengthString<N>`
 *   with `N >= Length`.
 *
 * @example
 *
 * ```ts
 * const input: string = 'JP';
 *
 * assert.isTrue(isFixedLengthString(input, 2));
 *
 * assert.isFalse(isFixedLengthString(input, 3));
 *
 * if (isFixedLengthString(input, 2)) {
 *   const countryCode: FixedLengthString<2> = input;
 *
 *   const atMost5: MaxLengthString<5> = input; // OK (2 <= 5)
 * }
 * ```
 *
 * @template S - The input string type (literal types are preserved).
 * @template Length - The exact number of characters.
 * @param s - The string to check.
 * @param length - The exact number of characters.
 * @returns `true` if `s.length === length`, `false` otherwise. When `true`,
 *   TypeScript narrows `s` to `FixedLengthString<Length> & S`.
 */
export const isFixedLengthString = <
  S extends string,
  Length extends SupportedLength,
>(
  s: S,
  length: Length,
): s is FixedLengthString<Length> & S => s.length === length;
