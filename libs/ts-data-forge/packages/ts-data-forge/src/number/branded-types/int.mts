import { type Int as TtfImported_Int } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type Int = TtfImported_Int;

type ElementType = Int;

const typeNameInMessage = 'an integer';

const {
  abs,
  add,
  castType,
  div,
  is,
  max: max_,
  min: min_,
  mul,
  pow,
  random,
  sub,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  number,
  number
>({
  integerOrSafeInteger: 'Integer',
  MIN_VALUE: -Number.MAX_VALUE,
  MAX_VALUE: Number.MAX_VALUE,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is an integer.
 *
 * Returns `true` for an integer — a value with no fractional component,
 * including values outside the safe integer range (unlike `SafeInt`).
 *
 * @example
 *
 * ```ts
 * assert.isTrue(isInt(5));
 *
 * assert.isFalse(isInt(5.25));
 *
 * assert.isTrue(Int.is(-10));
 * ```
 *
 * @param value - The value to check
 * @returns `true` if the value is an integer, `false` otherwise
 */
export const isInt = is;

/**
 * Casts a `number` to the `Int` branded type.
 *
 * Validates that the value is an integer and returns it with the `Int` brand.
 * Throws a `TypeError` otherwise.
 *
 * @example
 *
 * ```ts
 * const branded = asInt(42);
 *
 * assert.isTrue(branded === 42);
 *
 * assert.isTrue(Int.is(branded));
 * ```
 *
 * @param value - The value to cast
 * @returns The value as an `Int`
 * @throws {TypeError} If the value is not an integer
 */
export const asInt = castType;

/**
 * Namespace providing type-safe operations for the `Int` branded type.
 *
 * The `Int` type represents an integer. Division (`div`) uses floor division.
 *
 * Unlike `SafeInt`, `Int` allows values outside the safe integer range (±2^53 −
 * 1), so very large magnitudes may lose precision in JavaScript's `number`
 * type.
 */
export const Int = {
  /**
   * Type guard that checks if a value is an integer.
   *
   * @example
   *
   * ```ts
   * assert.isTrue(isInt(5));
   *
   * assert.isFalse(isInt(5.25));
   *
   * assert.isTrue(Int.is(-10));
   * ```
   *
   * @param value - The value to check
   * @returns `true` if the value is an integer, `false` otherwise
   * @see {@link isInt} for usage examples
   */
  is,

  /**
   * Returns the absolute value of an integer.
   *
   * The result is non-negative and keeps the `Int` brand. Note that
   * `Math.abs(Number.MIN_SAFE_INTEGER)` exceeds `Number.MAX_SAFE_INTEGER`, so
   * use `SafeInt` for guaranteed precision.
   *
   * @example
   *
   * ```ts
   * const negative = asInt(-12);
   *
   * const absolute = Int.abs(negative);
   *
   * assert.isTrue(absolute === 12);
   *
   * assert.isTrue(Int.is(absolute));
   * ```
   *
   * @param a - The integer value
   * @returns The absolute value as a non-negative `Int`
   */
  abs,

  /**
   * Returns the smallest of the given integers.
   *
   * @example
   *
   * ```ts
   * const smallest = Int.min(asInt(7), asInt(-3), asInt(2));
   *
   * assert.isTrue(smallest === -3);
   * ```
   *
   * @param values - The integers to compare (at least one required)
   * @returns The smallest value as an `Int`
   */
  min: min_,

  /**
   * Returns the largest of the given integers.
   *
   * @example
   *
   * ```ts
   * const largest = Int.max(asInt(7), asInt(-3), asInt(2));
   *
   * assert.isTrue(largest === 7);
   * ```
   *
   * @param values - The integers to compare (at least one required)
   * @returns The largest value as an `Int`
   */
  max: max_,

  /**
   * Generates a random `Int` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @example
   *
   * ```ts
   * const min = asInt(1);
   *
   * const max = asInt(6);
   *
   * const randomValue = Int.random(min, max);
   *
   * assert.isTrue(Int.is(randomValue));
   *
   * assert.isTrue(randomValue >= 1 && randomValue <= 6);
   * ```
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `Int` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as an `Int` (floored to an
   * integer).
   *
   * @example
   *
   * ```ts
   * const base = asInt(2);
   *
   * const exponent = asInt(5);
   *
   * const power = Int.pow(base, exponent);
   *
   * assert.isTrue(power === 32);
   * ```
   *
   * @param a - The base integer
   * @param b - The exponent integer
   * @returns `a ** b` as an `Int`
   */
  pow,

  /**
   * Adds two integers, returning `a + b` as an `Int`.
   *
   * @example
   *
   * ```ts
   * const sum = Int.add(asInt(12), asInt(8));
   *
   * assert.isTrue(sum === 20);
   * ```
   *
   * @param a - The first integer
   * @param b - The second integer
   * @returns The sum of `a` and `b` as an `Int`
   */
  add,

  /**
   * Subtracts two integers, returning `a - b` as an `Int`.
   *
   * @example
   *
   * ```ts
   * const difference = Int.sub(asInt(12), asInt(8));
   *
   * assert.isTrue(difference === 4);
   * ```
   *
   * @param a - The first integer
   * @param b - The second integer
   * @returns The difference of `a` and `b` as an `Int`
   */
  sub,

  /**
   * Multiplies two integers, returning `a * b` as an `Int`.
   *
   * @example
   *
   * ```ts
   * const product = Int.mul(asInt(-4), asInt(6));
   *
   * assert.isTrue(product === -24);
   * ```
   *
   * @param a - The first integer
   * @param b - The second integer
   * @returns The product of `a` and `b` as an `Int`
   */
  mul,

  /**
   * Divides two integers using floor division (`⌊a / b⌋`): the result is `a /
   * b` rounded toward negative infinity, as an `Int`.
   *
   * @example
   *
   * ```ts
   * const dividend = asInt(17);
   *
   * const divisor = asInt(5);
   *
   * const quotient = Int.div(dividend, divisor);
   *
   * assert.isTrue(quotient === 3);
   * ```
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as an `Int`
   */
  div,
} as const;

expectType<
  keyof typeof Int,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<ElementType, 'int'>
>('=');

expectType<
  typeof Int,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<ElementType, 'int'>
>('<=');
