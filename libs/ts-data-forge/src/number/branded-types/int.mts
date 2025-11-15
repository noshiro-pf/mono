import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

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
 * Returns `true` if the value is any integer (positive, negative, or zero),
 * with no fractional component. This includes values outside the safe integer
 * range, unlike SafeInt.
 *
 * @example
 *
 * ```ts
 * assert.ok(isInt(5));
 *
 * assert.notOk(isInt(5.25));
 *
 * assert.ok(Int.is(-10));
 * ```
 *
 * @param value - The value to check
 * @returns `true` if the value is an integer, `false` otherwise
 */
export const isInt = is;
/**
 * Casts a number to an Int branded type.
 *
 * This function validates that the input is an integer and returns it with the
 * Int brand. Throws a TypeError if the value has a fractional component or is
 * not a finite number.
 *
 * @example
 *
 * ```ts
 * const branded = asInt(42);
 *
 * assert(branded === 42);
 *
 * assert.ok(Int.is(branded));
 * ```
 *
 * @param value - The value to cast
 * @returns The value as an Int branded type
 * @throws {TypeError} If the value is not an integer
 */
export const asInt = castType;

/**
 * Namespace providing type-safe operations for Int branded types.
 *
 * The Int type represents any integer value (no fractional component) without
 * range restrictions. All operations preserve the integer constraint, using
 * floor division for division operations.
 *
 * Unlike SafeInt, Int allows values outside the safe integer range (±2^53 - 1),
 * but be aware that very large integers may lose precision in JavaScript's
 * number type.
 */
export const Int = {
  /**
   * Type guard that checks if a value is an integer.
   *
   * @example
   *
   * ```ts
   * assert.ok(isInt(5));
   *
   * assert.notOk(isInt(5.25));
   *
   * assert.ok(Int.is(-10));
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
   * The result is always non-negative and maintains the Int brand. Note that
   * Math.abs(Number.MIN_SAFE_INTEGER) exceeds Number.MAX_SAFE_INTEGER, so use
   * SafeInt for guaranteed precision.
   *
   * @example
   *
   * ```ts
   * const negative = asInt(-12);
   *
   * const absolute = Int.abs(negative);
   *
   * assert(absolute === 12);
   *
   * assert.ok(Int.is(absolute));
   * ```
   *
   * @param a - The integer value
   * @returns The absolute value as a non-negative Int
   */
  abs,

  /**
   * Returns the minimum value from a list of integers.
   *
   * @example
   *
   * ```ts
   * const smallest = Int.min(asInt(7), asInt(-3), asInt(2));
   *
   * assert(smallest === -3);
   * ```
   *
   * @param values - The integers to compare (at least one required)
   * @returns The smallest value as an Int
   */
  min: min_,

  /**
   * Returns the maximum value from a list of integers.
   *
   * @example
   *
   * ```ts
   * const largest = Int.max(asInt(7), asInt(-3), asInt(2));
   *
   * assert(largest === 7);
   * ```
   *
   * @param values - The integers to compare (at least one required)
   * @returns The largest value as an Int
   */
  max: max_,

  /**
   * Generates a random integer within the specified range (inclusive).
   *
   * The range is inclusive on both ends, so random(1, 6) can return any of: 1,
   * 2, 3, 4, 5, or 6.
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
   * assert.ok(Int.is(randomValue));
   *
   * assert.ok(randomValue >= 1 && randomValue <= 6);
   * ```
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random Int in the range [min, max]
   */
  random,

  /**
   * Raises an integer to a power.
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
   * assert(power === 32);
   * ```
   *
   * @param a - The base integer
   * @param b - The exponent integer
   * @returns `a ** b` as an Int
   */
  pow,

  /**
   * Adds two integers.
   *
   * @example
   *
   * ```ts
   * const sum = Int.add(asInt(12), asInt(8));
   *
   * assert(sum === 20);
   * ```
   *
   * @param a - First integer
   * @param b - Second integer
   * @returns `a + b` as an Int
   */
  add,

  /**
   * Subtracts two integers.
   *
   * @example
   *
   * ```ts
   * const difference = Int.sub(asInt(12), asInt(8));
   *
   * assert(difference === 4);
   * ```
   *
   * @param a - First integer
   * @param b - Second integer
   * @returns `a - b` as an Int
   */
  sub,

  /**
   * Multiplies two integers.
   *
   * @example
   *
   * ```ts
   * const product = Int.mul(asInt(-4), asInt(6));
   *
   * assert(product === -24);
   * ```
   *
   * @param a - First integer
   * @param b - Second integer
   * @returns `a * b` as an Int
   */
  mul,

  /**
   * Divides two integers using floor division.
   *
   * Performs mathematical floor division: `⌊a / b⌋`. The result is always an
   * integer, rounding toward negative infinity.
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
   * assert(quotient === 3);
   * ```
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The integer quotient as an Int
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
