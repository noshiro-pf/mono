import { expectType } from '../expect-type.mjs';

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
   * assert(result === 123.45);
   * ```
   *
   * @param n The value to convert.
   * @returns The numeric representation of `n`.
   */
  export const from: (n: unknown) => number = Number;

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
   *   assert(inverted === 0.2);
   * }
   *
   * assert.notOk(Num.isNonZero(0));
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
   *   assert(index === 10);
   * }
   *
   * assert.notOk(Num.isNonNegative(-1));
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
   *   assert.ok(amount > 0);
   * }
   *
   * assert.notOk(Num.isPositive(0));
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
   * assert.ok(isGrade(50));
   *
   * assert.notOk(isGrade(100));
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
   * assert.ok(isPercentage(100));
   *
   * assert.notOk(isPercentage(-1));
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
  type LT = {
    [N in SmallUint]: Index<N>;
  };

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
  type LEQ = {
    [N in SmallUint]: Index<N> | N;
  };

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
   * assert.ok(indexGuard(3));
   *
   * assert.notOk(indexGuard(5));
   *
   * assert.notOk(indexGuard(-1));
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
   * assert.ok(inclusiveGuard(5));
   *
   * assert.notOk(inclusiveGuard(6));
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
   * assert(Num.clamp(150, 0, 100) === 100);
   *
   * assert(Num.clamp(-50, 0, 100) === 0);
   *
   * const clampToPercentage = Num.clamp(0, 100);
   *
   * assert(clampToPercentage(75) === 75);
   *
   * assert(clampToPercentage(150) === 100);
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
   * Performs type-safe division with compile-time zero-check.
   *
   * This function leverages TypeScript's type system to prevent division by
   * zero at compile time. The divisor must be typed as NonZeroNumber or a
   * non-zero numeric literal.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero, enforced by types)
   * @returns The quotient of a / b
   */
  export const div = (a: number, b: NonZeroNumber | SmallInt<'!=0'>): number =>
    // eslint-disable-next-line total-functions/no-partial-division
    a / b;

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
  export const divInt = (
    a: number,
    b: NonZeroNumber | SmallInt<'!=0'>,
  ): number =>
    // eslint-disable-next-line total-functions/no-partial-division
    Math.floor(Math.floor(a) / Math.floor(b));

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
