import { type NonPositiveSafeInt as TtfImported_NonPositiveSafeInt } from 'ts-type-forge';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type NonPositiveSafeInt = TtfImported_NonPositiveSafeInt;

type ElementType = NonPositiveSafeInt;

const typeNameInMessage = 'a non-positive safe integer';

const {
  MAX_VALUE,
  MIN_VALUE,
  add,
  castType,
  fromNumber,
  is,
  max: max_,
  min: min_,
  pow,
  random,
  sub,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  number,
  0
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: Number.MIN_SAFE_INTEGER,
  MAX_VALUE: 0,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a non-positive safe integer.
 *
 * Returns `true` for a non-positive safe integer — a value with no fractional
 * component.
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-positive safe integer, `false` otherwise
 */
export const isNonPositiveSafeInt = is;

/**
 * Casts a `number` to the `NonPositiveSafeInt` branded type.
 *
 * Validates that the value is a non-positive safe integer and returns it with
 * the `NonPositiveSafeInt` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `NonPositiveSafeInt`
 * @throws {TypeError} If the value is not a non-positive safe integer
 */
export const asNonPositiveSafeInt = castType;

/**
 * Namespace providing type-safe operations for the `NonPositiveSafeInt` branded
 * type.
 *
 * The `NonPositiveSafeInt` type represents a non-positive safe integer.
 * Division (`div`) uses floor division.
 */
export const NonPositiveSafeInt = {
  /**
   * Type guard that checks if a value is a non-positive safe integer.
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-positive safe integer, `false` otherwise
   * @see {@link isNonPositiveSafeInt} for usage examples
   */
  is,

  /**
   * The smallest value representable as `NonPositiveSafeInt` (the lower
   * saturation target of `fromNumber`).
   */
  MIN_VALUE,

  /**
   * The largest value representable as `NonPositiveSafeInt` (the upper
   * saturation target of `fromNumber`).
   */
  MAX_VALUE,

  /**
   * Returns the smallest of the given non-positive safe integers.
   *
   * @param values - The non-positive safe integers to compare (at least one required)
   * @returns The smallest value as a `NonPositiveSafeInt`
   */
  min: min_,

  /**
   * Returns the largest of the given non-positive safe integers.
   *
   * @param values - The non-positive safe integers to compare (at least one required)
   * @returns The largest value as a `NonPositiveSafeInt`
   */
  max: max_,

  /**
   * Converts an arbitrary `number` into a `NonPositiveSafeInt`, rounding to the
   * nearest integer and saturating the result into the range `[MIN_VALUE,
   * MAX_VALUE]`.
   *
   * Unlike `asNonPositiveSafeInt`, this is total: out-of-range inputs are
   * clamped to the nearest representable `NonPositiveSafeInt` instead of
   * throwing.
   *
   * @param value - The value to convert
   * @returns The value as a `NonPositiveSafeInt`
   */
  fromNumber,

  /**
   * Generates a random `NonPositiveSafeInt` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `NonPositiveSafeInt` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `NonPositiveSafeInt`
   * (floored to an integer).
   *
   * @param a - The base non-positive safe integer
   * @param b - The exponent non-positive safe integer
   * @returns `a ** b` as a `NonPositiveSafeInt`
   */
  pow,

  /**
   * Adds two non-positive safe integers, returning `a + b` as a
   * `NonPositiveSafeInt`.
   *
   * @param a - The first non-positive safe integer
   * @param b - The second non-positive safe integer
   * @returns The sum of `a` and `b` as a `NonPositiveSafeInt`
   */
  add,

  /**
   * Subtracts two non-positive safe integers, returning `a - b` as a
   * `NonPositiveSafeInt`.
   *
   * @param a - The first non-positive safe integer
   * @param b - The second non-positive safe integer
   * @returns The difference of `a` and `b` as a `NonPositiveSafeInt`
   */
  sub,
} as const;
