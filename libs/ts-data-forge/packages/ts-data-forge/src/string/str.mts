import {
  type BoundedLengthString,
  type FixedLengthString,
  type MaxLengthString,
  type MinLengthString,
  type SupportedLength,
} from 'ts-type-forge';

/**
 * Namespace providing type guards and runtime-checked casts for the branded
 * length-constrained string types (`MinLengthString`, `MaxLengthString`,
 * `BoundedLengthString`, `FixedLengthString`).
 *
 * Lengths are measured in UTF-16 code units (the same unit as
 * `String.prototype.length`), so characters outside the Basic Multilingual
 * Plane (e.g. emoji) count as 2.
 */
export namespace Str {
  /**
   * Type guard that checks if a string has at least `minLength` characters.
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
   * assert.isTrue(Str.isMinLengthString(input, 12));
   *
   * assert.isFalse(Str.isMinLengthString('short', 12));
   *
   * if (Str.isMinLengthString(input, 12)) {
   *   const nonEmpty: NonEmptyString = input; // OK (12 >= 1)
   *
   *   assert.isTrue(nonEmpty.length >= 12);
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
   * assert.isTrue(Str.isMaxLengthString(input, 32));
   *
   * assert.isFalse(Str.isMaxLengthString(input, 3));
   *
   * if (Str.isMaxLengthString(input, 32)) {
   *   const relaxed: MaxLengthString<64> = input; // OK (32 <= 64)
   *
   *   assert.isTrue(relaxed.length <= 32);
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
   * assert.isTrue(Str.isBoundedLengthString(input, 8, 16));
   *
   * assert.isFalse(Str.isBoundedLengthString('user', 8, 16));
   *
   * if (Str.isBoundedLengthString(input, 8, 16)) {
   *   const userId: BoundedLengthString<1, 255> = input; // OK ([8, 16] ⊆ [1, 255])
   *
   *   assert.isTrue(userId.length >= 8 && userId.length <= 16);
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
   * assert.isTrue(Str.isFixedLengthString(input, 2));
   *
   * assert.isFalse(Str.isFixedLengthString(input, 3));
   *
   * if (Str.isFixedLengthString(input, 2)) {
   *   const atMost5: MaxLengthString<5> = input; // OK (2 <= 5)
   *
   *   assert.isTrue(atMost5.length === 2);
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

  /**
   * Casts a string to `MinLengthString<MinLength>` after checking that it has
   * at least `minLength` characters.
   *
   * Use this instead of writing `s as unknown as MinLengthString<N>`: the
   * length is verified at runtime, and the original string type (e.g. literal
   * types) is preserved via intersection.
   *
   * @example
   *
   * ```ts
   * const password = Str.asMinLengthString('very-secret-password', 12);
   *
   * const nonEmpty: NonEmptyString = password; // OK (>= 1)
   *
   * assert.isTrue(nonEmpty.length >= 12);
   *
   * assert.throws(() => Str.asMinLengthString('short', 12)); // length 5 < 12
   * ```
   *
   * @template S - The input string type (literal types are preserved).
   * @template MinLength - The minimum number of characters (inclusive).
   * @param s - The string to cast.
   * @param minLength - The minimum number of characters (inclusive).
   * @returns `s` typed as `MinLengthString<MinLength> & S`.
   * @throws {TypeError} If `s.length < minLength`.
   */
  export const asMinLengthString = <
    S extends string,
    MinLength extends SupportedLength,
  >(
    s: S,
    minLength: MinLength,
  ): MinLengthString<MinLength> & S => {
    if (!isMinLengthString(s, minLength)) {
      throw new TypeError(
        `Expected a string of length >= ${minLength}, got a string of length ${s.length}`,
      );
    }

    return s;
  };

  /**
   * Casts a string to `MaxLengthString<MaxLength>` after checking that it has
   * at most `maxLength` characters.
   *
   * Use this instead of writing `s as unknown as MaxLengthString<N>`: the
   * length is verified at runtime, and the original string type (e.g. literal
   * types) is preserved via intersection.
   *
   * @example
   *
   * ```ts
   * const userName = Str.asMaxLengthString('noshiro', 32);
   *
   * const relaxed: MaxLengthString<64> = userName; // OK (32 <= 64)
   *
   * assert.isTrue(relaxed.length <= 32);
   *
   * assert.throws(() => Str.asMaxLengthString('noshiro', 3)); // length 7 > 3
   * ```
   *
   * @template S - The input string type (literal types are preserved).
   * @template MaxLength - The maximum number of characters (inclusive).
   * @param s - The string to cast.
   * @param maxLength - The maximum number of characters (inclusive).
   * @returns `s` typed as `MaxLengthString<MaxLength> & S`.
   * @throws {TypeError} If `s.length > maxLength`.
   */
  export const asMaxLengthString = <
    S extends string,
    MaxLength extends SupportedLength,
  >(
    s: S,
    maxLength: MaxLength,
  ): MaxLengthString<MaxLength> & S => {
    if (!isMaxLengthString(s, maxLength)) {
      throw new TypeError(
        `Expected a string of length <= ${maxLength}, got a string of length ${s.length}`,
      );
    }

    return s;
  };

  /**
   * Casts a string to `BoundedLengthString<MinLength, MaxLength>` after
   * checking that its length is within the inclusive range
   * `[minLength, maxLength]`.
   *
   * Use this instead of writing `s as unknown as BoundedLengthString<M, N>`:
   * the length is verified at runtime, and the original string type (e.g.
   * literal types) is preserved via intersection.
   *
   * @example
   *
   * ```ts
   * const userId = Str.asBoundedLengthString('user-12345678', 8, 16);
   *
   * const relaxed: BoundedLengthString<1, 255> = userId; // OK ([8, 16] ⊆ [1, 255])
   *
   * assert.isTrue(relaxed.length >= 8 && relaxed.length <= 16);
   *
   * assert.throws(() => Str.asBoundedLengthString('user', 8, 16)); // length 4 < 8
   * ```
   *
   * @template S - The input string type (literal types are preserved).
   * @template MinLength - The minimum number of characters (inclusive).
   * @template MaxLength - The maximum number of characters (inclusive).
   * @param s - The string to cast.
   * @param minLength - The minimum number of characters (inclusive).
   * @param maxLength - The maximum number of characters (inclusive).
   * @returns `s` typed as `BoundedLengthString<MinLength, MaxLength> & S`.
   * @throws {TypeError} If `s.length < minLength` or `s.length > maxLength`.
   */
  export const asBoundedLengthString = <
    S extends string,
    MinLength extends SupportedLength,
    MaxLength extends SupportedLength,
  >(
    s: S,
    minLength: MinLength,
    maxLength: MaxLength,
  ): BoundedLengthString<MinLength, MaxLength> & S => {
    if (!isBoundedLengthString(s, minLength, maxLength)) {
      throw new TypeError(
        `Expected a string of length in [${minLength}, ${maxLength}], got a string of length ${s.length}`,
      );
    }

    return s;
  };

  /**
   * Casts a string to `FixedLengthString<Length>` after checking that it has
   * exactly `length` characters.
   *
   * Use this instead of writing `s as unknown as FixedLengthString<N>`: the
   * length is verified at runtime, and the original string type (e.g. literal
   * types) is preserved via intersection.
   *
   * @example
   *
   * ```ts
   * const countryCode = Str.asFixedLengthString('JP', 2);
   *
   * const atMost5: MaxLengthString<5> = countryCode; // OK (2 <= 5)
   *
   * assert.isTrue(atMost5.length === 2);
   *
   * assert.throws(() => Str.asFixedLengthString('JP', 3)); // length 2 !== 3
   * ```
   *
   * @template S - The input string type (literal types are preserved).
   * @template Length - The exact number of characters.
   * @param s - The string to cast.
   * @param length - The exact number of characters.
   * @returns `s` typed as `FixedLengthString<Length> & S`.
   * @throws {TypeError} If `s.length !== length`.
   */
  export const asFixedLengthString = <
    S extends string,
    Length extends SupportedLength,
  >(
    s: S,
    length: Length,
  ): FixedLengthString<Length> & S => {
    if (!isFixedLengthString(s, length)) {
      throw new TypeError(
        `Expected a string of length ${length}, got a string of length ${s.length}`,
      );
    }

    return s;
  };
}
