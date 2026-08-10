import { type NonNegativeInt32 as TtfImported_NonNegativeInt32 } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type NonNegativeInt32 = TtfImported_NonNegativeInt32;

type ElementType = NonNegativeInt32;

const typeNameInMessage = 'a non-negative integer in [0, 2^31)';

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
  0,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 0,
  MAX_VALUE: 2 ** 31 - 1,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a non-negative integer in [0, 2^31).
 *
 * Returns `true` for a non-negative integer in [0, 2^31) — a value with no
 * fractional component.
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-negative integer in [0, 2^31), `false` otherwise
 */
export const isNonNegativeInt32 = is;

/**
 * Casts a `number` to the `NonNegativeInt32` branded type.
 *
 * Validates that the value is a non-negative integer in [0, 2^31) and returns
 * it with the `NonNegativeInt32` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `NonNegativeInt32`
 * @throws {TypeError} If the value is not a non-negative integer in [0, 2^31)
 */
export const asNonNegativeInt32 = castType;

/**
 * Namespace providing type-safe operations for the `NonNegativeInt32` branded
 * type.
 *
 * The `NonNegativeInt32` type represents a non-negative integer in [0, 2^31).
 * Division (`div`) uses floor division.
 */
export const NonNegativeInt32 = {
  /**
   * Type guard that checks if a value is a non-negative integer in [0, 2^31).
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-negative integer in [0, 2^31), `false` otherwise
   * @see {@link isNonNegativeInt32} for usage examples
   */
  is,

  /**
   * The smallest value representable as `NonNegativeInt32` (the lower
   * saturation target of `fromNumber`).
   */
  MIN_VALUE,

  /**
   * The largest value representable as `NonNegativeInt32` (the upper saturation
   * target of `fromNumber`).
   */
  MAX_VALUE,

  /**
   * Returns the smallest of the given non-negative integers.
   *
   * @param values - The non-negative integers to compare (at least one required)
   * @returns The smallest value as a `NonNegativeInt32`
   */
  min: min_,

  /**
   * Returns the largest of the given non-negative integers.
   *
   * @param values - The non-negative integers to compare (at least one required)
   * @returns The largest value as a `NonNegativeInt32`
   */
  max: max_,

  /**
   * Converts an arbitrary `number` into a `NonNegativeInt32`, rounding to the
   * nearest integer and saturating the result into the range `[MIN_VALUE,
   * MAX_VALUE]`.
   *
   * Unlike `asNonNegativeInt32`, this is total: out-of-range inputs are clamped
   * to the nearest representable `NonNegativeInt32` instead of throwing.
   *
   * @param value - The value to convert
   * @returns The value as a `NonNegativeInt32`
   */
  fromNumber,

  /**
   * Generates a random `NonNegativeInt32` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `NonNegativeInt32` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `NonNegativeInt32`
   * (floored to an integer).
   *
   * @param a - The base non-negative integer
   * @param b - The exponent non-negative integer
   * @returns `a ** b` as a `NonNegativeInt32`
   */
  pow,

  /**
   * Adds two non-negative integers, returning `a + b` as a `NonNegativeInt32`.
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The sum of `a` and `b` as a `NonNegativeInt32`
   */
  add,

  /**
   * Subtracts two non-negative integers, returning `a - b` as a
   * `NonNegativeInt32`.
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The difference of `a` and `b` as a `NonNegativeInt32`
   */
  sub,

  /**
   * Multiplies two non-negative integers, returning `a * b` as a
   * `NonNegativeInt32`.
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The product of `a` and `b` as a `NonNegativeInt32`
   */
  mul,

  /**
   * Divides two non-negative integers using floor division (`⌊a / b⌋`): the
   * result is `a / b` rounded toward negative infinity, as a
   * `NonNegativeInt32`.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as a `NonNegativeInt32`
   */
  div,
} as const;

expectType<
  keyof typeof NonNegativeInt32,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('=');

expectType<
  typeof NonNegativeInt32,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('<=');
