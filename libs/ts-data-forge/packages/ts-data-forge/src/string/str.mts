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
   * Supports a curried overload: calling it with only `minLength` returns a
   * function that casts a string, which is convenient for `pipe`/`map`.
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
   * // curried version
   * const asPassword = Str.asMinLengthString(12);
   *
   * assert.strictEqual(asPassword('another-secret'), 'another-secret');
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
  export function asMinLengthString<
    S extends string,
    MinLength extends SupportedLength,
  >(s: S, minLength: MinLength): MinLengthString<MinLength> & S;

  // Curried version
  export function asMinLengthString<MinLength extends SupportedLength>(
    minLength: MinLength,
  ): <S extends string>(s: S) => MinLengthString<MinLength> & S;

  export function asMinLengthString(
    ...args:
      | readonly [s: string, minLength: SupportedLength]
      | readonly [minLength: SupportedLength]
  ): string | ((s: string) => string) {
    switch (args.length) {
      case 2: {
        const [s, minLength] = args;

        if (!isMinLengthString(s, minLength)) {
          throw new TypeError(
            `Expected a string of length >= ${minLength}, got a string of length ${s.length}`,
          );
        }

        return s;
      }

      case 1: {
        const [minLength] = args;

        return (s) => asMinLengthString(s, minLength);
      }
    }
  }

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
   * const userName = Str.asMaxLengthString('noshiro', 32);
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
  export function asMaxLengthString<
    S extends string,
    MaxLength extends SupportedLength,
  >(s: S, maxLength: MaxLength): MaxLengthString<MaxLength> & S;

  // Curried version
  export function asMaxLengthString<MaxLength extends SupportedLength>(
    maxLength: MaxLength,
  ): <S extends string>(s: S) => MaxLengthString<MaxLength> & S;

  export function asMaxLengthString(
    ...args:
      | readonly [s: string, maxLength: SupportedLength]
      | readonly [maxLength: SupportedLength]
  ): string | ((s: string) => string) {
    switch (args.length) {
      case 2: {
        const [s, maxLength] = args;

        if (!isMaxLengthString(s, maxLength)) {
          throw new TypeError(
            `Expected a string of length <= ${maxLength}, got a string of length ${s.length}`,
          );
        }

        return s;
      }

      case 1: {
        const [maxLength] = args;

        return (s) => asMaxLengthString(s, maxLength);
      }
    }
  }

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
   * const userId = Str.asBoundedLengthString('user-12345678', 8, 16);
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
  export function asBoundedLengthString<
    S extends string,
    MinLength extends SupportedLength,
    MaxLength extends SupportedLength,
  >(
    s: S,
    minLength: MinLength,
    maxLength: MaxLength,
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
          s: string,
          minLength: SupportedLength,
          maxLength: SupportedLength,
        ]
      | readonly [minLength: SupportedLength, maxLength: SupportedLength]
  ): string | ((s: string) => string) {
    switch (args.length) {
      case 3: {
        const [s, minLength, maxLength] = args;

        if (!isBoundedLengthString(s, minLength, maxLength)) {
          throw new TypeError(
            `Expected a string of length in [${minLength}, ${maxLength}], got a string of length ${s.length}`,
          );
        }

        return s;
      }

      case 2: {
        const [minLength, maxLength] = args;

        return (s) => asBoundedLengthString(s, minLength, maxLength);
      }
    }
  }

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
   * const countryCode = Str.asFixedLengthString('JP', 2);
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
  export function asFixedLengthString<
    S extends string,
    Length extends SupportedLength,
  >(s: S, length: Length): FixedLengthString<Length> & S;

  // Curried version
  export function asFixedLengthString<Length extends SupportedLength>(
    length: Length,
  ): <S extends string>(s: S) => FixedLengthString<Length> & S;

  export function asFixedLengthString(
    ...args:
      | readonly [s: string, length: SupportedLength]
      | readonly [length: SupportedLength]
  ): string | ((s: string) => string) {
    switch (args.length) {
      case 2: {
        const [s, length] = args;

        if (!isFixedLengthString(s, length)) {
          throw new TypeError(
            `Expected a string of length ${length}, got a string of length ${s.length}`,
          );
        }

        return s;
      }

      case 1: {
        const [length] = args;

        return (s) => asFixedLengthString(s, length);
      }
    }
  }

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
    if (!isMinLengthString(s, 1)) {
      throw new TypeError('Expected a non-empty string, got an empty string');
    }

    return s;
  };
}
