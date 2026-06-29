import {
  type Decrement,
  type FiniteNumber,
  type Increment,
  type Index,
  type Int,
  type Min,
  type NaNType,
  type NegativeIndex,
  type NonNegativeNumber,
  type NonZeroNumber,
  type PositiveNumber,
  type PositiveSafeIntWithSmallInt,
  type RelaxedExclude,
  type SmallInt,
  type SmallUint,
  type UnknownBrand,
} from 'ts-type-forge';
import { expectType } from '../expect-type.mjs';
import { Result } from '../functional/index.mjs';
import { type SmallPositiveInt } from '../types.mjs';
import {
  type AddResult,
  type DivIntResult,
  type DivResult,
  type MulResult,
  type SubResult,
} from './num-arithmetic-types.mjs';

/**
 * Namespace providing utility functions for number manipulation and validation.
 *
 * This namespace offers a comprehensive set of type-safe number utilities
 * including:
 *
 * - Type conversion and validation
 * - Type guards for numeric constraints (non-zero, non-negative, positive)
 * - Range checking and clamping operations
 * - Mathematical operations with type safety
 * - Rounding utilities
 *
 * Many functions in this namespace leverage TypeScript's type system to provide
 * compile-time guarantees about numeric constraints.
 */
export namespace Num {
  /**
   * Converts an unknown value to a number. Alias for the `Number` constructor.
   *
   * @example
   *
   * ```ts
   * const input = '123.45';
   *
   * const result = Num.from(input);
   *
   * assert.isTrue(result === 123.45);
   * ```
   *
   * @param n The value to convert.
   * @returns The numeric representation of `n`.
   */
  export const from: (n: unknown) => number = Number;

  /**
   * Safely parses a base-10 integer from a string, returning a {@link Result}
   * that is `Ok<Int>` for valid input and `Err<Error>` otherwise.
   *
   * This is a stricter alternative to both `parseInt` and `Number`:
   *
   * - Unlike `parseInt('12abc', 10)` (which returns `12`), trailing
   *   non-numeric characters make the whole input invalid and yield `Err`.
   * - Unlike `Number('')` / `Number('   ')` (which return `0`), empty or
   *   whitespace-only input yields `Err`.
   *
   * The empty-string case is rejected by delegating to `parseInt` (which
   * returns `NaN` there) rather than hard-coding a check, while the trailing-
   * garbage case is rejected via `Number`. Valid input is truncated toward
   * zero, so `'12.9'` becomes `12` and `'-3.5'` becomes `-3`.
   *
   * Only base 10 is supported. Use `Result.unwrapOk` (optionally with a
   * `?? Number.NaN` fallback) or `Result.unwrapOkOr` to get a plain number
   * back.
   *
   * @example
   *
   * ```ts
   * assert.strictEqual(
   *   Result.unwrapOkOr(Num.safeParseInt('123'), Number.NaN),
   *   123,
   * );
   *
   * assert.strictEqual(
   *   Result.unwrapOkOr(Num.safeParseInt('12.9'), Number.NaN),
   *   12,
   * );
   *
   * assert.strictEqual(
   *   Result.unwrapOkOr(Num.safeParseInt('-12.9'), Number.NaN),
   *   -12,
   * );
   *
   * assert.strictEqual(Number.parseInt('-12.9', 10), -12);
   *
   * // Native `parseInt` ignores trailing non-numeric characters
   *
   * assert.strictEqual(Number.parseInt('123abc', 10), 123);
   *
   * assert.isTrue(Number.isNaN(Number('123abc')));
   *
   * assert.isTrue(Result.isErr(Num.safeParseInt('123abc')));
   *
   * // Whitespace is not a valid integer, so we return an error instead of coercing to 0.
   *
   * assert.isTrue(Number.isNaN(Number.parseInt('  ', 10)));
   *
   * assert.strictEqual(Number('  '), 0); // Native `Number` coerces whitespace to 0
   *
   * assert.isTrue(Result.isErr(Num.safeParseInt('')));
   *
   * assert.strictEqual(Result.unwrapOk(Num.safeParseInt('  ')), undefined);
   * ```
   *
   * @param s The string to parse.
   * @returns `Result.ok(parsedInt)` for valid input, otherwise `Result.err`
   *   wrapping an `Error` describing the invalid input.
   */
  export const safeParseInt = (s: string): Result<Int, Error> => {
    const viaNumber = Number(s);

    // `Number('')` / `Number('   ')` は 0 を返すが、`parseInt` は NaN を返す。
    // 末尾不正文字 ('12abc' 等) は `Number` 側が NaN にするので、両者が共に
    // 有効な場合のみ採用することで空文字・空白のみ・末尾不正をまとめて弾く。
    return Number.isNaN(viaNumber) || Number.isNaN(Number.parseInt(s, 10))
      ? Result.err(
          new Error(`safeParseInt: "${s}" is not a valid base-10 integer`),
        )
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        Result.ok(Math.trunc(viaNumber) as Int);
  };

  /**
   * Safely parses a finite floating-point number from a string, returning a
   * {@link Result} that is `Ok<FiniteNumber>` for valid input and `Err<Error>`
   * otherwise.
   *
   * This is a stricter alternative to both `parseFloat` and `Number`:
   *
   * - Unlike `parseFloat('12abc')` (which returns `12`), trailing non-numeric
   *   characters make the whole input invalid and yield `Err`.
   * - Unlike `Number('')` / `Number('   ')` (which return `0`), empty or
   *   whitespace-only input yields `Err`.
   * - Unlike `Number('Infinity')` (which returns `Infinity`), non-finite values
   *   yield `Err`.
   *
   * The empty-string case is rejected by delegating to `parseFloat` (which
   * returns `NaN` there) rather than hard-coding a check, while the trailing-
   * garbage case is rejected via `Number`. Decimal values are preserved as-is,
   * so `'12.9'` stays `12.9`.
   *
   * Use `Result.unwrapOk` (optionally with a `?? Number.NaN` fallback) or
   * `Result.unwrapOkOr` to get a plain number back.
   *
   * @example
   *
   * ```ts
   * assert.strictEqual(
   *   Result.unwrapOkOr(Num.safeParseFloat('12.9'), Number.NaN),
   *   12.9,
   * );
   *
   * assert.strictEqual(
   *   Result.unwrapOkOr(Num.safeParseFloat('-3.5'), Number.NaN),
   *   -3.5,
   * );
   *
   * assert.strictEqual(
   *   Result.unwrapOkOr(Num.safeParseFloat('1e3'), Number.NaN),
   *   1000,
   * );
   *
   * // Native `parseFloat` ignores trailing non-numeric characters
   *
   * assert.strictEqual(Number.parseFloat('12px'), 12);
   *
   * assert.isTrue(Result.isErr(Num.safeParseFloat('12px')));
   *
   * // Whitespace is not a valid number, so we return an error instead of coercing to 0.
   *
   * assert.isTrue(Result.isErr(Num.safeParseFloat('')));
   *
   * assert.isTrue(Result.isErr(Num.safeParseFloat('   ')));
   *
   * // Infinity and NaN are not finite, so they are rejected.
   *
   * assert.isTrue(Result.isErr(Num.safeParseFloat('Infinity')));
   *
   * assert.isTrue(Result.isErr(Num.safeParseFloat('NaN')));
   * ```
   *
   * @param s The string to parse.
   * @returns `Result.ok(parsedFloat)` for valid finite input, otherwise
   *   `Result.err` wrapping an `Error` describing the invalid input.
   */
  export const safeParseFloat = (s: string): Result<FiniteNumber, Error> => {
    const viaNumber = Number(s);

    // `Number('')` / `Number('   ')` は 0 を返すが、`parseFloat` は NaN を返す。
    // 末尾不正文字 ('12abc' 等) は `Number` 側が NaN にするので、両者が共に
    // 非 NaN かつ有限の場合のみ採用することで空文字・空白のみ・末尾不正・
    // Infinity をまとめて弾く。
    return Number.isNaN(viaNumber) ||
      !Number.isFinite(viaNumber) ||
      Number.isNaN(Number.parseFloat(s))
      ? Result.err(
          new Error(`safeParseFloat: "${s}" is not a valid finite number`),
        )
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        Result.ok(viaNumber as FiniteNumber);
  };

  /**
   * Type guard that checks if a number is non-zero.
   *
   * When this function returns `true`, TypeScript narrows the type to exclude
   * zero, providing compile-time safety for division operations and other
   * calculations that require non-zero values.
   *
   * @example
   *
   * ```ts
   * const value: number = 5;
   *
   * if (Num.isNonZero(value)) {
   *   // Safe to divide now that we know value is non-zero
   *   // eslint-disable-next-line total-functions/no-partial-division
   *   const inverted = 1 / value;
   *
   *   assert.isTrue(inverted === 0.2);
   * }
   *
   * assert.isFalse(Num.isNonZero(0));
   * ```
   *
   * @template N - The numeric literal type or number type to check
   * @param num - The number to check
   * @returns `true` if the number is not zero, `false` otherwise
   */
  export const isNonZero = <N extends number>(
    num: N,
  ): num is NonZeroNumber & RelaxedExclude<N, 0> => num !== 0;

  expectType<NonZeroNumber & RelaxedExclude<123, 0>, UnknownBrand>('<=');

  /**
   * Type guard that checks if a number is non-negative (greater than or equal
   * to zero).
   *
   * When this function returns `true`, TypeScript narrows the type to exclude
   * negative values, which is useful for operations that require non-negative
   * inputs like array indices or measurements.
   *
   * @example
   *
   * ```ts
   * const candidate = 10;
   *
   * if (Num.isNonNegative(candidate)) {
   *   const index: number = candidate;
   *
   *   assert.isTrue(index === 10);
   * }
   *
   * assert.isFalse(Num.isNonNegative(-1));
   * ```
   *
   * @template N - The numeric literal type or number type to check
   * @param num - The number to check
   * @returns `true` if the number is >= 0, `false` otherwise
   */
  export const isNonNegative = <N extends number>(
    num: N,
  ): num is NonNegativeNumber & RelaxedExclude<N, NegativeIndex<1024>> =>
    num >= 0;

  /**
   * Type guard that checks if a number is positive (greater than zero).
   *
   * When this function returns `true`, TypeScript narrows the type to exclude
   * zero and negative values. This is particularly useful for validating inputs
   * that must be strictly positive, such as dimensions, counts, or rates.
   *
   * @example
   *
   * ```ts
   * const amount = 42;
   *
   * if (Num.isPositive(amount)) {
   *   assert.isTrue(amount > 0);
   * }
   *
   * assert.isFalse(Num.isPositive(0));
   * ```
   *
   * @template N - The numeric literal type or number type to check
   * @param num - The number to check
   * @returns `true` if the number is > 0, `false` otherwise
   */
  export const isPositive = <N extends number>(
    num: N,
  ): num is PositiveNumber & RelaxedExclude<N, NegativeIndex<1024> | 0> =>
    num > 0;

  /**
   * Creates a function that checks if a number `x` is within the range
   * `lowerBound <= x < upperBound`.
   *
   * @example
   *
   * ```ts
   * const isGrade = Num.isInRange(0, 100);
   *
   * assert.isTrue(isGrade(50));
   *
   * assert.isFalse(isGrade(100));
   * ```
   *
   * @param lowerBound The lower bound (inclusive).
   * @param upperBound The upper bound (exclusive).
   * @returns A function that takes a number `x` and returns `true` if `x` is in
   *   the range, `false` otherwise.
   */
  export const isInRange =
    (lowerBound: number, upperBound: number) =>
    (x: number): boolean =>
      lowerBound <= x && x < upperBound;

  /**
   * Creates a function that checks if a number `x` is within the range
   * `lowerBound <= x <= upperBound`.
   *
   * @example
   *
   * ```ts
   * const isPercentage = Num.isInRangeInclusive(0, 100);
   *
   * assert.isTrue(isPercentage(100));
   *
   * assert.isFalse(isPercentage(-1));
   * ```
   *
   * @param lowerBound The lower bound (inclusive).
   * @param upperBound The upper bound (inclusive).
   * @returns A function that takes a number `x` and returns `true` if `x` is in
   *   the range, `false` otherwise.
   */
  export const isInRangeInclusive =
    (lowerBound: number, upperBound: number) =>
    (x: number): boolean =>
      lowerBound <= x && x <= upperBound;

  /**
   * @template N - A SmallUint representing the exclusive upper bound
   * @internal
   * Helper type mapping each SmallUint N to the union of integers from 0 to N-1.
   * Used internally for type-safe range operations.
   *
   * For example:
   * - LT[3] = 0 | 1 | 2
   * - LT[5] = 0 | 1 | 2 | 3 | 4
   */
  type LT = Readonly<{ [N in SmallUint]: Index<N> }>;

  /**
   * @template N - A SmallUint representing the inclusive upper bound
   * @internal
   * Helper type mapping each SmallUint N to the union of integers from 0 to N (inclusive).
   * Used internally for type-safe range operations with inclusive upper bounds.
   *
   * For example:
   * - LEQ[3] = 0 | 1 | 2 | 3
   * - LEQ[5] = 0 | 1 | 2 | 3 | 4 | 5
   */
  type LEQ = Readonly<{ [N in SmallUint]: Index<N> | N }>;

  /**
   * Creates a type guard that checks if a number is an unsigned integer within
   * a specified range.
   *
   * This function returns a predicate that validates whether a number is:
   *
   * - A safe integer (no floating point)
   * - Within the range [lowerBound, upperBound)
   *
   * The returned type guard provides precise type narrowing when the bounds are
   * SmallUint literals, making it ideal for array index validation.
   *
   * @example
   *
   * ```ts
   * const indexGuard = Num.isUintInRange(0, 5);
   *
   * assert.isTrue(indexGuard(3));
   *
   * assert.isFalse(indexGuard(5));
   *
   * assert.isFalse(indexGuard(-1));
   * ```
   *
   * @template L - The lower bound as a SmallUint literal type
   * @template U - The upper bound as a SmallUint literal type
   * @param lowerBound - The minimum value (inclusive)
   * @param upperBound - The maximum value (exclusive)
   * @returns A type guard function that validates and narrows number types
   */
  export const isUintInRange =
    <L extends SmallUint, U extends SmallUint>(lowerBound: L, upperBound: U) =>
    (x: number): x is RelaxedExclude<LT[U], LT[Min<L>]> =>
      Number.isSafeInteger(x) && lowerBound <= x && x < upperBound;

  /**
   * Creates a type guard that checks if a number is an unsigned integer within
   * a specified inclusive range.
   *
   * This function returns a predicate that validates whether a number is:
   *
   * - A safe integer (no floating point)
   * - Within the range [lowerBound, upperBound] (both bounds inclusive)
   *
   * The returned type guard provides precise type narrowing when the bounds are
   * SmallUint literals, useful for validating scores, percentages, or other
   * bounded values.
   *
   * @example
   *
   * ```ts
   * const inclusiveGuard = Num.isUintInRangeInclusive(0, 5);
   *
   * assert.isTrue(inclusiveGuard(5));
   *
   * assert.isFalse(inclusiveGuard(6));
   * ```
   *
   * @template L - The lower bound as a SmallUint literal type
   * @template U - The upper bound as a SmallUint literal type
   * @param lowerBound - The minimum value (inclusive)
   * @param upperBound - The maximum value (inclusive)
   * @returns A type guard function that validates and narrows number types
   */
  export const isUintInRangeInclusive =
    <L extends SmallUint, U extends SmallUint>(lowerBound: L, upperBound: U) =>
    (x: number): x is RelaxedExclude<LEQ[U], LT[Min<L>]> =>
      Number.isSafeInteger(x) && lowerBound <= x && x <= upperBound;

  /**
   * Clamps a value within the given range. If the target value is invalid (not
   * finite), returns the lower bound.
   *
   * Provides two usage patterns for maximum flexibility:
   *
   * - **Direct usage**: Pass all three arguments to get the clamped value
   *   immediately
   * - **Curried usage**: Pass bounds to get a reusable clamping function
   *
   * @example
   *
   * ```ts
   * assert.isTrue(Num.clamp(150, 0, 100) === 100);
   *
   * assert.isTrue(Num.clamp(-50, 0, 100) === 0);
   *
   * const clampToPercentage = Num.clamp(0, 100);
   *
   * assert.isTrue(clampToPercentage(75) === 75);
   *
   * assert.isTrue(clampToPercentage(150) === 100);
   * ```
   */
  export function clamp(
    target: number,
    lowerBound: number,
    upperBound: number,
  ): number;

  // Curried version
  export function clamp(
    lowerBound: number,
    upperBound: number,
  ): (target: number) => number;

  export function clamp(
    ...args:
      | readonly [target: number, lowerBound: number, upperBound: number]
      | readonly [lowerBound: number, upperBound: number]
  ): number | ((target: number) => number) {
    switch (args.length) {
      case 3: {
        const [target, lowerBound, upperBound] = args;

        return !Number.isFinite(target)
          ? lowerBound
          : Math.max(lowerBound, Math.min(upperBound, target));
      }

      case 2: {
        const [lowerBound, upperBound] = args;

        return (target: number): number =>
          clamp(target, lowerBound, upperBound);
      }
    }
  }

  /**
   * Adds two numbers, returning the tightest sound branded result type.
   *
   * The sign of the result is computed exactly (e.g. a non-negative plus a
   * non-negative is non-negative); the integer/finite level is preserved, with
   * `SafeInt` operands widening to `Int` because the sum may exceed the safe
   * range. No clamping is performed — for a result that stays inside a bounded
   * type, use that type's branded `add` instead.
   *
   * @param a - The first addend.
   * @param b - The second addend.
   * @returns `a + b`, typed as the tightest branded type guaranteed to contain
   *   it.
   */
  export const add = <A extends number, B extends number>(
    a: A,
    b: B,
  ): AddResult<A, B> =>
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    (a + b) as AddResult<A, B>;

  /**
   * Subtracts `b` from `a`, returning the tightest sound branded result type.
   *
   * The sign is computed exactly; the level is preserved (with `SafeInt`
   * widening to `Int`). No clamping — for saturating subtraction that stays in a
   * bounded type (e.g. `Uint.sub` clamping at `0`), use that type's branded
   * `sub`.
   *
   * @param a - The minuend.
   * @param b - The subtrahend.
   * @returns `a - b`, typed as the tightest branded type guaranteed to contain
   *   it.
   */
  export const sub = <A extends number, B extends number>(
    a: A,
    b: B,
  ): SubResult<A, B> =>
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    (a - b) as SubResult<A, B>;

  /**
   * Multiplies two numbers, returning the tightest sound branded result type.
   *
   * The sign follows the usual product rule (e.g. negative times negative is
   * positive); the level is preserved (with `SafeInt` widening to `Int`). No
   * clamping.
   *
   * @param a - The first factor.
   * @param b - The second factor.
   * @returns `a * b`, typed as the tightest branded type guaranteed to contain
   *   it.
   */
  export const mul = <A extends number, B extends number>(
    a: A,
    b: B,
  ): MulResult<A, B> =>
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    (a * b) as MulResult<A, B>;

  /**
   * Performs type-safe exact division with a compile-time zero-check.
   *
   * The divisor must be typed as `NonZeroNumber` or a non-zero numeric literal.
   * The result sign follows the quotient rule; because exact division can be
   * fractional, the level is `finite` (or `number`).
   *
   * @param a - The dividend.
   * @param b - The divisor (must be non-zero, enforced by types).
   * @returns `a / b`, typed as the tightest branded type guaranteed to contain
   *   it.
   */
  export const div = <
    A extends number,
    B extends NonZeroNumber | SmallInt<'!=0'>,
  >(
    a: A,
    b: B,
  ): DivResult<A, B> =>
    // eslint-disable-next-line total-functions/no-partial-division, total-functions/no-unsafe-type-assertion
    (a / b) as DivResult<A, B>;

  /**
   * Performs integer division using floor division.
   *
   * Computes `⌊a / b⌋` by flooring both operands before division and then
   * flooring the result. This ensures integer arithmetic semantics.
   *
   * Note: Unlike `div`, this function does not enforce non-zero divisor at
   * compile time. Division by zero returns `NaN`.
   *
   * @param a - The dividend
   * @param b - The divisor
   * @returns The integer quotient, or `NaN` if b is zero
   */
  export const divInt = <
    A extends number,
    B extends NonZeroNumber | SmallInt<'!=0'>,
  >(
    a: A,
    b: B,
  ): DivIntResult<A, B> => {
    // eslint-disable-next-line total-functions/no-partial-division
    const quotient = Math.floor(Math.floor(a) / Math.floor(b));

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return quotient as DivIntResult<A, B>;
  };

  /**
   * Rounds a number to a specified number of decimal places.
   *
   * Uses the standard rounding algorithm (round half up) to round the number to
   * the given precision. The precision must be a positive safe integer.
   *
   * @param num - The number to round
   * @param precision - The number of decimal places (must be positive)
   * @returns The rounded number
   */
  export const roundAt = (
    num: number,
    precision: PositiveSafeIntWithSmallInt,
  ): number => {
    const digit = 10 ** precision;

    // eslint-disable-next-line total-functions/no-partial-division
    return Math.round(num * digit) / digit;
  };

  /**
   * Rounds a number to the nearest integer using bitwise operations.
   *
   * This function uses a bitwise OR trick for potentially faster rounding.
   * Note: This implementation rounds half up for positive numbers but may
   * behave differently for negative numbers compared to Math.round.
   *
   * @param num - The number to round
   * @returns The rounded integer as an Int branded type
   */
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  export const roundToInt = (num: number): Int => Math.trunc(num + 0.5) as Int;

  /**
   * Creates a reusable rounding function with a fixed precision.
   *
   * This is a curried version of roundAt that returns a function configured to
   * always round to the specified number of decimal places. Useful for creating
   * consistent rounding behavior across multiple values.
   *
   * @param digit - The number of decimal places for rounding
   * @returns A function that rounds numbers to the specified precision
   */
  export const round = (
    digit: PositiveSafeIntWithSmallInt,
  ): ((num: number) => number) => {
    const powAmount = 10 ** digit;

    return (target: number) =>
      // eslint-disable-next-line total-functions/no-partial-division
      roundToInt(powAmount * target) / powAmount;
  };

  /**
   * Converts NaN values to undefined while preserving all other numbers.
   *
   * This function is useful for handling potentially invalid numeric operations
   * in a type-safe way, converting NaN results to undefined for easier handling
   * with optional chaining or nullish coalescing.
   *
   * @template N - The numeric type (literal or number)
   * @param num - The number to check
   * @returns The original number if not NaN, otherwise undefined
   */
  export const mapNaN2Undefined = <N extends number>(
    num: N,
  ): RelaxedExclude<N, NaNType> | undefined =>
    Number.isNaN(num)
      ? undefined
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (num as RelaxedExclude<N, NaNType>);

  /**
   * Type-safe increment operation for SmallUint values.
   *
   * Increments a SmallUint (0-40) by 1 with the result type computed at compile
   * time. This provides type-level arithmetic for small unsigned integers,
   * useful for type-safe counter operations.
   *
   * @template N - A SmallUint literal type (0-40)
   * @param n - The SmallUint value to increment
   * @returns The incremented value with type Increment<N>
   */
  export const increment = <N extends SmallUint>(n: N): Increment<N> =>
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    (n + 1) as Increment<N>;

  /**
   * Type-safe decrement operation for positive SmallInt values.
   *
   * Decrements a positive SmallInt (1-40) by 1 with the result type computed at
   * compile time. This provides type-level arithmetic for small positive
   * integers, useful for type-safe countdown operations.
   *
   * @template N - A positive SmallInt literal type (1-40)
   * @param n - The positive SmallInt value to decrement
   * @returns The decremented value with type Decrement<N>
   */
  export const decrement = <N extends SmallPositiveInt>(n: N): Decrement<N> =>
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    (n - 1) as Decrement<N>;
}
