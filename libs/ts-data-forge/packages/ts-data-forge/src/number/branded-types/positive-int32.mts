import { type PositiveInt32 as TtfImported_PositiveInt32 } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type PositiveInt32 = TtfImported_PositiveInt32;

type ElementType = PositiveInt32;

const typeNameInMessage = 'a positive integer in [1, 2^31)';

const {
  MAX_VALUE,
  MIN_VALUE,
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
  1,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 1,
  MAX_VALUE: 2 ** 31 - 1,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a positive integer in [1, 2^31).
 *
 * Returns `true` for a positive integer in [1, 2^31) — a value with no
 * fractional component.
 *
 * @param value - The value to check
 * @returns `true` if the value is a positive integer in [1, 2^31), `false` otherwise
 */
export const isPositiveInt32 = is;

/**
 * Casts a `number` to the `PositiveInt32` branded type.
 *
 * Validates that the value is a positive integer in [1, 2^31) and returns it
 * with the `PositiveInt32` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `PositiveInt32`
 * @throws {TypeError} If the value is not a positive integer in [1, 2^31)
 */
export const asPositiveInt32 = castType;

/**
 * Namespace providing type-safe operations for the `PositiveInt32` branded
 * type.
 *
 * The `PositiveInt32` type represents a positive integer in [1, 2^31). Division
 * (`div`) uses floor division.
 */
export const PositiveInt32 = {
  /**
   * Type guard that checks if a value is a positive integer in [1, 2^31).
   *
   * @param value - The value to check
   * @returns `true` if the value is a positive integer in [1, 2^31), `false` otherwise
   * @see {@link isPositiveInt32} for usage examples
   */
  is,

  /**
   * The smallest value representable as `PositiveInt32` (the lower saturation
   * target of `fromNumber`).
   */
  MIN_VALUE,

  /**
   * The largest value representable as `PositiveInt32` (the upper saturation
   * target of `fromNumber`).
   */
  MAX_VALUE,

  /**
   * Returns the smallest of the given positive integers.
   *
   * @param values - The positive integers to compare (at least one required)
   * @returns The smallest value as a `PositiveInt32`
   */
  min: min_,

  /**
   * Returns the largest of the given positive integers.
   *
   * @param values - The positive integers to compare (at least one required)
   * @returns The largest value as a `PositiveInt32`
   */
  max: max_,

  /**
   * Converts an arbitrary `number` into a `PositiveInt32`, rounding to the
   * nearest integer and saturating the result into the range `[MIN_VALUE,
   * MAX_VALUE]`.
   *
   * Unlike `asPositiveInt32`, this is total: out-of-range inputs are clamped to
   * the nearest representable `PositiveInt32` instead of throwing.
   *
   * @param value - The value to convert
   * @returns The value as a `PositiveInt32`
   */
  fromNumber,

  /**
   * Generates a random `PositiveInt32` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `PositiveInt32` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `PositiveInt32`
   * (floored to an integer).
   *
   * @param a - The base positive integer
   * @param b - The exponent positive integer
   * @returns `a ** b` as a `PositiveInt32`
   */
  pow,

  /**
   * Adds two positive integers, returning `a + b` as a `PositiveInt32`.
   *
   * @param a - The first positive integer
   * @param b - The second positive integer
   * @returns The sum of `a` and `b` as a `PositiveInt32`
   */
  add,

  /**
   * Subtracts two positive integers, returning `a - b` as a `PositiveInt32`.
   *
   * @param a - The first positive integer
   * @param b - The second positive integer
   * @returns The difference of `a` and `b` as a `PositiveInt32`
   */
  sub,

  /**
   * Multiplies two positive integers, returning `a * b` as a `PositiveInt32`.
   *
   * @param a - The first positive integer
   * @param b - The second positive integer
   * @returns The product of `a` and `b` as a `PositiveInt32`
   */
  mul,

  /**
   * Divides two positive integers using floor division (`⌊a / b⌋`): the result
   * is `a / b` rounded toward negative infinity, as a `PositiveInt32`.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as a `PositiveInt32`
   */
  div,
} as const;

expectType<
  keyof typeof PositiveInt32,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('=');

expectType<
  typeof PositiveInt32,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('<=');
