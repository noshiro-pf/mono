import { type NonPositiveInt as TtfImported_NonPositiveInt } from 'ts-type-forge';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type NonPositiveInt = TtfImported_NonPositiveInt;

type ElementType = NonPositiveInt;

const typeNameInMessage = 'a non-positive integer';

const {
  MAX_VALUE,
  add,
  castType,
  clamp,
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
  integerOrSafeInteger: 'Integer',
  MIN_VALUE: -Number.MAX_VALUE,
  MAX_VALUE: 0,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a non-positive integer.
 *
 * Returns `true` for a non-positive integer — a value with no fractional
 * component, including values outside the safe integer range (unlike
 * `SafeInt`).
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-positive integer, `false` otherwise
 */
export const isNonPositiveInt = is;

/**
 * Casts a `number` to the `NonPositiveInt` branded type.
 *
 * Validates that the value is a non-positive integer and returns it with the
 * `NonPositiveInt` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `NonPositiveInt`
 * @throws {TypeError} If the value is not a non-positive integer
 */
export const asNonPositiveInt = castType;

/**
 * Namespace providing type-safe operations for the `NonPositiveInt` branded
 * type.
 *
 * The `NonPositiveInt` type represents a non-positive integer. Division (`div`)
 * uses floor division.
 *
 * Unlike `SafeInt`, `NonPositiveInt` allows values outside the safe integer
 * range (±2^53 − 1), so very large magnitudes may lose precision in
 * JavaScript's `number` type.
 */
export const NonPositiveInt = {
  /**
   * Type guard that checks if a value is a non-positive integer.
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-positive integer, `false` otherwise
   * @see {@link isNonPositiveInt} for usage examples
   */
  is,

  /**
   * The largest value representable as `NonPositiveInt`.
   */
  MAX_VALUE,

  /**
   * Returns the smallest of the given non-positive integers.
   *
   * @param values - The non-positive integers to compare (at least one required)
   * @returns The smallest value as a `NonPositiveInt`
   */
  min: min_,

  /**
   * Returns the largest of the given non-positive integers.
   *
   * @param values - The non-positive integers to compare (at least one required)
   * @returns The largest value as a `NonPositiveInt`
   */
  max: max_,

  /**
   * Clamps a `number` into the `NonPositiveInt` range, rounding to the nearest
   * integer and constraining the result to `[MIN_VALUE, MAX_VALUE]`.
   *
   * @param value - The value to clamp
   * @returns The clamped value as a `NonPositiveInt`
   */
  clamp,

  /**
   * Generates a random `NonPositiveInt` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `NonPositiveInt` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `NonPositiveInt`
   * (floored to an integer).
   *
   * @param a - The base non-positive integer
   * @param b - The exponent non-positive integer
   * @returns `a ** b` as a `NonPositiveInt`
   */
  pow,

  /**
   * Adds two non-positive integers, returning `a + b` as a `NonPositiveInt`.
   *
   * @param a - The first non-positive integer
   * @param b - The second non-positive integer
   * @returns The sum of `a` and `b` as a `NonPositiveInt`
   */
  add,

  /**
   * Subtracts two non-positive integers, returning `a - b` as a
   * `NonPositiveInt`.
   *
   * @param a - The first non-positive integer
   * @param b - The second non-positive integer
   * @returns The difference of `a` and `b` as a `NonPositiveInt`
   */
  sub,
} as const;
