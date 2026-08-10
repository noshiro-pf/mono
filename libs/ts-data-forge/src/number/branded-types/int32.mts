import { type Int32 as TtfImported_Int32 } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type Int32 = TtfImported_Int32;

type ElementType = Int32;

const typeNameInMessage = 'an integer in [-2^31, 2^31)';

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
  MIN_VALUE: -(2 ** 31),
  MAX_VALUE: 2 ** 31 - 1,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is an integer in [-2^31, 2^31).
 *
 * Returns `true` for an integer in [-2^31, 2^31) — a value with no fractional
 * component.
 *
 * @param value - The value to check
 * @returns `true` if the value is an integer in [-2^31, 2^31), `false` otherwise
 */
export const isInt32 = is;

/**
 * Casts a `number` to the `Int32` branded type.
 *
 * Validates that the value is an integer in [-2^31, 2^31) and returns it with
 * the `Int32` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as an `Int32`
 * @throws {TypeError} If the value is not an integer in [-2^31, 2^31)
 */
export const asInt32 = castType;

/**
 * Namespace providing type-safe operations for the `Int32` branded type.
 *
 * The `Int32` type represents an integer in [-2^31, 2^31). Division (`div`)
 * uses floor division.
 */
export const Int32 = {
  /**
   * Type guard that checks if a value is an integer in [-2^31, 2^31).
   *
   * @param value - The value to check
   * @returns `true` if the value is an integer in [-2^31, 2^31), `false` otherwise
   * @see {@link isInt32} for usage examples
   */
  is,

  /**
   * The smallest value representable as `Int32` (the lower saturation target of
   * `fromNumber`).
   */
  MIN_VALUE,

  /**
   * The largest value representable as `Int32` (the upper saturation target of
   * `fromNumber`).
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of an integer in [-2^31, 2^31).
   *
   * The result is non-negative and keeps the `Int32` brand.
   *
   * @param a - The integer value
   * @returns The absolute value as a non-negative `Int32`
   */
  abs,

  /**
   * Returns the smallest of the given integers.
   *
   * @param values - The integers to compare (at least one required)
   * @returns The smallest value as an `Int32`
   */
  min: min_,

  /**
   * Returns the largest of the given integers.
   *
   * @param values - The integers to compare (at least one required)
   * @returns The largest value as an `Int32`
   */
  max: max_,

  /**
   * Converts an arbitrary `number` into an `Int32`, rounding to the nearest
   * integer and saturating the result into the range `[MIN_VALUE, MAX_VALUE]`.
   *
   * Unlike `asInt32`, this is total: out-of-range inputs are clamped to the
   * nearest representable `Int32` instead of throwing.
   *
   * @param value - The value to convert
   * @returns The value as an `Int32`
   */
  fromNumber,

  /**
   * Generates a random `Int32` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `Int32` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as an `Int32` (floored to
   * an integer).
   *
   * @param a - The base integer
   * @param b - The exponent integer
   * @returns `a ** b` as an `Int32`
   */
  pow,

  /**
   * Adds two integers, returning `a + b` as an `Int32`.
   *
   * @param a - The first integer
   * @param b - The second integer
   * @returns The sum of `a` and `b` as an `Int32`
   */
  add,

  /**
   * Subtracts two integers, returning `a - b` as an `Int32`.
   *
   * @param a - The first integer
   * @param b - The second integer
   * @returns The difference of `a` and `b` as an `Int32`
   */
  sub,

  /**
   * Multiplies two integers, returning `a * b` as an `Int32`.
   *
   * @param a - The first integer
   * @param b - The second integer
   * @returns The product of `a` and `b` as an `Int32`
   */
  mul,

  /**
   * Divides two integers using floor division (`⌊a / b⌋`): the result is `a /
   * b` rounded toward negative infinity, as an `Int32`.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as an `Int32`
   */
  div,
} as const;

expectType<
  keyof typeof Int32,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('=');

expectType<
  typeof Int32,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('<=');
