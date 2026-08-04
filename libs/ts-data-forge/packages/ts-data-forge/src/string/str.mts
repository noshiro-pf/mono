import {
  type BoundedLengthString,
  type FixedLengthString,
  type MaxLengthString,
  type MinLengthString,
  type NonEmptyString,
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
   * assert.isTrue(Str.isMinLengthString(12, input));
   *
   * assert.isFalse(Str.isMinLengthString(12, 'short'));
   *
   * if (Str.isMinLengthString(12, input)) {
   *   const nonEmpty: NonEmptyString = input; // OK (12 >= 1)
   *
   *   assert.isTrue(nonEmpty.length >= 12);
   * }
   * ```
   *
   * @template MinLength - The minimum number of characters (inclusive).
   * @template S - The input string type (literal types are preserved).
   * @param minLength - The minimum number of characters (inclusive).
   * @param s - The string to check.
   * @returns `true` if `s.length >= minLength`, `false` otherwise. When `true`,
   *   TypeScript narrows `s` to `MinLengthString<MinLength> & S`.
   */
  export const isMinLengthString = <
    MinLength extends SupportedLength,
    S extends string,
  >(
    minLength: MinLength,
    s: S,
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
   * assert.isTrue(Str.isMaxLengthString(32, input));
   *
   * assert.isFalse(Str.isMaxLengthString(3, input));
   *
   * if (Str.isMaxLengthString(32, input)) {
   *   const relaxed: MaxLengthString<64> = input; // OK (32 <= 64)
   *
   *   assert.isTrue(relaxed.length <= 32);
   * }
   * ```
   *
   * @template MaxLength - The maximum number of characters (inclusive).
   * @template S - The input string type (literal types are preserved).
   * @param maxLength - The maximum number of characters (inclusive).
   * @param s - The string to check.
   * @returns `true` if `s.length <= maxLength`, `false` otherwise. When `true`,
   *   TypeScript narrows `s` to `MaxLengthString<MaxLength> & S`.
   */
  export const isMaxLengthString = <
    MaxLength extends SupportedLength,
    S extends string,
  >(
    maxLength: MaxLength,
    s: S,
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
   * assert.isTrue(Str.isBoundedLengthString(8, 16, input));
   *
   * assert.isFalse(Str.isBoundedLengthString(8, 16, 'user'));
   *
   * if (Str.isBoundedLengthString(8, 16, input)) {
   *   const userId: BoundedLengthString<1, 255> = input; // OK ([8, 16] ⊆ [1, 255])
   *
   *   assert.isTrue(userId.length >= 8 && userId.length <= 16);
   * }
   * ```
   *
   * @template MinLength - The minimum number of characters (inclusive).
   * @template MaxLength - The maximum number of characters (inclusive).
   * @template S - The input string type (literal types are preserved).
   * @param minLength - The minimum number of characters (inclusive).
   * @param maxLength - The maximum number of characters (inclusive).
   * @param s - The string to check.
   * @returns `true` if `minLength <= s.length && s.length <= maxLength`, `false`
   *   otherwise. When `true`, TypeScript narrows `s` to
   *   `BoundedLengthString<MinLength, MaxLength> & S`.
   */
  export const isBoundedLengthString = <
    MinLength extends SupportedLength,
    MaxLength extends SupportedLength,
    S extends string,
  >(
    minLength: MinLength,
    maxLength: MaxLength,
    s: S,
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
   * assert.isTrue(Str.isFixedLengthString(2, input));
   *
   * assert.isFalse(Str.isFixedLengthString(3, input));
   *
   * if (Str.isFixedLengthString(2, input)) {
   *   const atMost5: MaxLengthString<5> = input; // OK (2 <= 5)
   *
   *   assert.isTrue(atMost5.length === 2);
   * }
   * ```
   *
   * @template Length - The exact number of characters.
   * @template S - The input string type (literal types are preserved).
   * @param length - The exact number of characters.
   * @param s - The string to check.
   * @returns `true` if `s.length === length`, `false` otherwise. When `true`,
   *   TypeScript narrows `s` to `FixedLengthString<Length> & S`.
   */
  export const isFixedLengthString = <
    Length extends SupportedLength,
    S extends string,
  >(
    length: Length,
    s: S,
  ): s is FixedLengthString<Length> & S => s.length === length;

  /**
   * Casts a string to `MinLengthString<MinLength>` after checking that it has
   * at least `minLength` characters.
   *
   * Use this instead of writing `s as unknown as MinLengthString<N>`: the
   * length is verified at runtime, and the original string type (e.g. literal
   * types) is preserved via intersection.
   *
   * Supports a curried overload: calling it with only `minLength` returns a
   * function that casts a string, which is convenient for `pipe`/`map`.
   *
   * @example
   *
   * ```ts
   * const password = Str.asMinLengthString(12, 'very-secret-password');
   *
   * const nonEmpty: NonEmptyString = password; // OK (>= 1)
   *
   * assert.isTrue(nonEmpty.length >= 12);
   *
   * // curried version
   * const asPassword = Str.asMinLengthString(12);
   *
   * assert.strictEqual(asPassword('another-secret'), 'another-secret');
   *
   * assert.throws(() => Str.asMinLengthString(12, 'short')); // length 5 < 12
   * ```
   *
   * @template MinLength - The minimum number of characters (inclusive).
   * @template S - The input string type (literal types are preserved).
   * @param minLength - The minimum number of characters (inclusive).
   * @param s - The string to cast.
   * @returns `s` typed as `MinLengthString<MinLength> & S`.
   * @throws {TypeError} If `s.length < minLength`.
   */
  export function asMinLengthString<
    MinLength extends SupportedLength,
    S extends string,
  >(minLength: MinLength, s: S): MinLengthString<MinLength> & S;

  // Curried version
  export function asMinLengthString<MinLength extends SupportedLength>(
    minLength: MinLength,
  ): <S extends string>(s: S) => MinLengthString<MinLength> & S;

  export function asMinLengthString(
    ...args:
      | readonly [minLength: SupportedLength, s: string]
      | readonly [minLength: SupportedLength]
  ): string | ((s: string) => string) {
    switch (args.length) {
      case 2:
        return asMinLengthStringImpl(...args);

      case 1:
        return (s) => asMinLengthStringImpl(args[0], s);
    }
  }

  const asMinLengthStringImpl = (
    minLength: SupportedLength,
    s: string,
  ): string => {
    const actualLength = s.length;

    if (!isMinLengthString(minLength, s)) {
      throw new TypeError(
        `Expected a string of length >= ${minLength}, got a string of length ${actualLength}`,
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
   * Supports a curried overload: calling it with only `maxLength` returns a
   * function that casts a string, which is convenient for `pipe`/`map`.
   *
   * @example
   *
   * ```ts
   * const userName = Str.asMaxLengthString(32, 'noshiro');
   *
   * const relaxed: MaxLengthString<64> = userName; // OK (32 <= 64)
   *
   * assert.isTrue(relaxed.length <= 32);
   *
   * // curried version
   * const asUserName = Str.asMaxLengthString(32);
   *
   * assert.strictEqual(asUserName('another-user'), 'another-user');
   *
   * assert.throws(() => Str.asMaxLengthString(3, 'noshiro')); // length 7 > 3
   * ```
   *
   * @template MaxLength - The maximum number of characters (inclusive).
   * @template S - The input string type (literal types are preserved).
   * @param maxLength - The maximum number of characters (inclusive).
   * @param s - The string to cast.
   * @returns `s` typed as `MaxLengthString<MaxLength> & S`.
   * @throws {TypeError} If `s.length > maxLength`.
   */
  export function asMaxLengthString<
    MaxLength extends SupportedLength,
    S extends string,
  >(maxLength: MaxLength, s: S): MaxLengthString<MaxLength> & S;

  // Curried version
  export function asMaxLengthString<MaxLength extends SupportedLength>(
    maxLength: MaxLength,
  ): <S extends string>(s: S) => MaxLengthString<MaxLength> & S;

  export function asMaxLengthString(
    ...args:
      | readonly [maxLength: SupportedLength, s: string]
      | readonly [maxLength: SupportedLength]
  ): string | ((s: string) => string) {
    switch (args.length) {
      case 2:
        return asMaxLengthStringImpl(...args);

      case 1:
        return (s) => asMaxLengthStringImpl(args[0], s);
    }
  }

  const asMaxLengthStringImpl = (
    maxLength: SupportedLength,
    s: string,
  ): string => {
    const actualLength = s.length;

    if (!isMaxLengthString(maxLength, s)) {
      throw new TypeError(
        `Expected a string of length <= ${maxLength}, got a string of length ${actualLength}`,
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
   * Supports a curried overload: calling it with only `minLength` and
   * `maxLength` returns a function that casts a string, which is convenient for
   * `pipe`/`map`.
   *
   * @example
   *
   * ```ts
   * const userId = Str.asBoundedLengthString(8, 16, 'user-12345678');
   *
   * const relaxed: BoundedLengthString<1, 255> = userId; // OK ([8, 16] ⊆ [1, 255])
   *
   * assert.isTrue(relaxed.length >= 8 && relaxed.length <= 16);
   *
   * // curried version
   * const asUserId = Str.asBoundedLengthString(8, 16);
   *
   * assert.strictEqual(asUserId('user-87654321'), 'user-87654321');
   *
   * assert.throws(() => Str.asBoundedLengthString(8, 16, 'user')); // length 4 < 8
   * ```
   *
   * @template MinLength - The minimum number of characters (inclusive).
   * @template MaxLength - The maximum number of characters (inclusive).
   * @template S - The input string type (literal types are preserved).
   * @param minLength - The minimum number of characters (inclusive).
   * @param maxLength - The maximum number of characters (inclusive).
   * @param s - The string to cast.
   * @returns `s` typed as `BoundedLengthString<MinLength, MaxLength> & S`.
   * @throws {TypeError} If `s.length < minLength` or `s.length > maxLength`.
   */
  export function asBoundedLengthString<
    MinLength extends SupportedLength,
    MaxLength extends SupportedLength,
    S extends string,
  >(
    minLength: MinLength,
    maxLength: MaxLength,
    s: S,
  ): BoundedLengthString<MinLength, MaxLength> & S;

  // Curried version
  export function asBoundedLengthString<
    MinLength extends SupportedLength,
    MaxLength extends SupportedLength,
  >(
    minLength: MinLength,
    maxLength: MaxLength,
  ): <S extends string>(s: S) => BoundedLengthString<MinLength, MaxLength> & S;

  export function asBoundedLengthString(
    ...args:
      | readonly [
          minLength: SupportedLength,
          maxLength: SupportedLength,
          s: string,
        ]
      | readonly [minLength: SupportedLength, maxLength: SupportedLength]
  ): string | ((s: string) => string) {
    switch (args.length) {
      case 3:
        return asBoundedLengthStringImpl(...args);

      case 2:
        return (s) => asBoundedLengthStringImpl(...args, s);
    }
  }

  const asBoundedLengthStringImpl = (
    minLength: SupportedLength,
    maxLength: SupportedLength,
    s: string,
  ): string => {
    const actualLength = s.length;

    if (!isBoundedLengthString(minLength, maxLength, s)) {
      throw new TypeError(
        `Expected a string of length in [${minLength}, ${maxLength}], got a string of length ${actualLength}`,
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
   * Supports a curried overload: calling it with only `length` returns a
   * function that casts a string, which is convenient for `pipe`/`map`.
   *
   * @example
   *
   * ```ts
   * const countryCode = Str.asFixedLengthString(2, 'JP');
   *
   * const atMost5: MaxLengthString<5> = countryCode; // OK (2 <= 5)
   *
   * assert.isTrue(atMost5.length === 2);
   *
   * // curried version
   * const asCountryCode = Str.asFixedLengthString(2);
   *
   * assert.strictEqual(asCountryCode('US'), 'US');
   *
   * assert.throws(() => Str.asFixedLengthString(3, 'JP')); // length 2 !== 3
   * ```
   *
   * @template Length - The exact number of characters.
   * @template S - The input string type (literal types are preserved).
   * @param length - The exact number of characters.
   * @param s - The string to cast.
   * @returns `s` typed as `FixedLengthString<Length> & S`.
   * @throws {TypeError} If `s.length !== length`.
   */
  export function asFixedLengthString<
    Length extends SupportedLength,
    S extends string,
  >(length: Length, s: S): FixedLengthString<Length> & S;

  // Curried version
  export function asFixedLengthString<Length extends SupportedLength>(
    length: Length,
  ): <S extends string>(s: S) => FixedLengthString<Length> & S;

  export function asFixedLengthString(
    ...args:
      | readonly [length: SupportedLength, s: string]
      | readonly [length: SupportedLength]
  ): string | ((s: string) => string) {
    switch (args.length) {
      case 2:
        return asFixedLengthStringImpl(...args);

      case 1:
        return (s) => asFixedLengthStringImpl(args[0], s);
    }
  }

  const asFixedLengthStringImpl = (
    length: SupportedLength,
    s: string,
  ): string => {
    const actualLength = s.length;

    if (!isFixedLengthString(length, s)) {
      throw new TypeError(
        `Expected a string of length ${length}, got a string of length ${actualLength}`,
      );
    }

    return s;
  };

  /**
   * Casts a string to `NonEmptyString` after checking that it has at least one
   * character.
   *
   * `NonEmptyString` is an alias of `MinLengthString<1>`, so this is the
   * length-1 specialization of {@link asMinLengthString}. Use this instead of
   * writing `s as unknown as NonEmptyString`: the length is verified at
   * runtime, and the original string type (e.g. literal types) is preserved
   * via intersection.
   *
   * @example
   *
   * ```ts
   * const name = Str.asNonEmptyString('noshiro');
   *
   * const nonEmpty: NonEmptyString = name; // OK
   *
   * assert.isTrue(nonEmpty.length >= 1);
   *
   * assert.throws(() => Str.asNonEmptyString('')); // length 0 < 1
   * ```
   *
   * @template S - The input string type (literal types are preserved).
   * @param s - The string to cast.
   * @returns `s` typed as `NonEmptyString & S`.
   * @throws {TypeError} If `s` is empty.
   */
  export const asNonEmptyString = <S extends string>(
    s: S,
  ): NonEmptyString & S => {
    if (!isMinLengthString(1, s)) {
      throw new TypeError('Expected a non-empty string, got an empty string');
    }

    return s;
  };
}
