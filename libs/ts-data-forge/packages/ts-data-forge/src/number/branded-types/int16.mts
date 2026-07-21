import { type Int16 as TtfImported_Int16 } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type Int16 = TtfImported_Int16;

type ElementType = Int16;

const typeNameInMessage = 'an integer in [-2^15, 2^15)';

const {
  MAX_VALUE,
  MIN_VALUE,
  abs,
  add,
  castType,
  div,
  fromNumber,
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
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: -(2 ** 15),
  MAX_VALUE: 2 ** 15 - 1,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is an integer in [-2^15, 2^15).
 *
 * Returns `true` for an integer in [-2^15, 2^15) — a value with no fractional
 * component.
 *
 * @param value - The value to check
 * @returns `true` if the value is an integer in [-2^15, 2^15), `false` otherwise
 */
export const isInt16 = is;

/**
 * Casts a `number` to the `Int16` branded type.
 *
 * Validates that the value is an integer in [-2^15, 2^15) and returns it with
 * the `Int16` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as an `Int16`
 * @throws {TypeError} If the value is not an integer in [-2^15, 2^15)
 */
export const asInt16 = castType;

/**
 * Namespace providing type-safe operations for the `Int16` branded type.
 *
 * The `Int16` type represents an integer in [-2^15, 2^15). Division (`div`)
 * uses floor division.
 */
export const Int16 = {
  /**
   * Type guard that checks if a value is an integer in [-2^15, 2^15).
   *
   * @param value - The value to check
   * @returns `true` if the value is an integer in [-2^15, 2^15), `false` otherwise
   * @see {@link isInt16} for usage examples
   */
  is,

  /**
   * The smallest value representable as `Int16` (the lower saturation target of
   * `fromNumber`).
   */
  MIN_VALUE,

  /**
   * The largest value representable as `Int16` (the upper saturation target of
   * `fromNumber`).
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of an integer in [-2^15, 2^15).
   *
   * The result is non-negative and keeps the `Int16` brand.
   *
   * @param a - The integer value
   * @returns The absolute value as a non-negative `Int16`
   */
  abs,

  /**
   * Returns the smallest of the given integers.
   *
   * @param values - The integers to compare (at least one required)
   * @returns The smallest value as an `Int16`
   */
  min: min_,

  /**
   * Returns the largest of the given integers.
   *
   * @param values - The integers to compare (at least one required)
   * @returns The largest value as an `Int16`
   */
  max: max_,

  /**
   * Converts an arbitrary `number` into an `Int16`, rounding to the nearest
   * integer and saturating the result into the range `[MIN_VALUE, MAX_VALUE]`.
   *
   * Unlike `asInt16`, this is total: out-of-range inputs are clamped to the
   * nearest representable `Int16` instead of throwing.
   *
   * @param value - The value to convert
   * @returns The value as an `Int16`
   */
  fromNumber,

  /**
   * Generates a random `Int16` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `Int16` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as an `Int16` (floored to
   * an integer).
   *
   * @param a - The base integer
   * @param b - The exponent integer
   * @returns `a ** b` as an `Int16`
   */
  pow,

  /**
   * Adds two integers, returning `a + b` as an `Int16`.
   *
   * @param a - The first integer
   * @param b - The second integer
   * @returns The sum of `a` and `b` as an `Int16`
   */
  add,

  /**
   * Subtracts two integers, returning `a - b` as an `Int16`.
   *
   * @param a - The first integer
   * @param b - The second integer
   * @returns The difference of `a` and `b` as an `Int16`
   */
  sub,

  /**
   * Multiplies two integers, returning `a * b` as an `Int16`.
   *
   * @param a - The first integer
   * @param b - The second integer
   * @returns The product of `a` and `b` as an `Int16`
   */
  mul,

  /**
   * Divides two integers using floor division (`⌊a / b⌋`): the result is `a /
   * b` rounded toward negative infinity, as an `Int16`.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as an `Int16`
   */
  div,
} as const;

expectType<
  keyof typeof Int16,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('=');

expectType<
  typeof Int16,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('<=');
