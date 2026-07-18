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
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: Number.MIN_SAFE_INTEGER,
  MAX_VALUE: 0,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a NonPositiveSafeInt (non-positive safe integer in the
 * range [Number.MIN_SAFE_INTEGER, 0]).
 *
 * @param value The value to check.
 * @returns `true` if the value is a NonPositiveSafeInt, `false` otherwise.
 */
export const isNonPositiveSafeInt = is;

/**
 * Casts a number to a NonPositiveSafeInt type.
 *
 * @param value The value to cast.
 * @returns The value as a NonPositiveSafeInt type.
 * @throws {TypeError} If the value is not a non-positive safe integer.
 */
export const asNonPositiveSafeInt = castType;

/**
 * Namespace providing type-safe arithmetic operations for non-positive
 * safe integers.
 *
 * All operations automatically clamp results to the valid NonPositiveSafeInt
 * range [Number.MIN_SAFE_INTEGER, 0]. This ensures that all arithmetic
 * maintains the non-positive safe integer constraint, with positive results
 * clamped to 0 and underflow results clamped to MIN_VALUE.
 */
export const NonPositiveSafeInt = {
  /**
   * Type guard to check if a value is a NonPositiveSafeInt.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-positive safe integer, `false`
   *   otherwise.
   */
  is,

  /**
   * The minimum value for a non-positive safe integer.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a non-positive safe integer.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two NonPositiveSafeInt values.
   *
   * @param a The first NonPositiveSafeInt.
   * @param b The second NonPositiveSafeInt.
   * @returns The minimum value as a NonPositiveSafeInt.
   */
  min: min_,

  /**
   * Returns the larger of two NonPositiveSafeInt values.
   *
   * @param a The first NonPositiveSafeInt.
   * @param b The second NonPositiveSafeInt.
   * @returns The maximum value as a NonPositiveSafeInt.
   */
  max: max_,

  /**
   * Clamps a number to the NonPositiveSafeInt range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to [Number.MIN_SAFE_INTEGER, 0] as a
   *   NonPositiveSafeInt.
   */
  clamp,

  /**
   * Generates a random NonPositiveSafeInt value within the valid range.
   *
   * @returns A random NonPositiveSafeInt between Number.MIN_SAFE_INTEGER and 0.
   */
  random,

  /**
   * Raises a NonPositiveSafeInt to the power of another NonPositiveSafeInt.
   *
   * @param a The base NonPositiveSafeInt.
   * @param b The exponent NonPositiveSafeInt.
   * @returns `a ** b` clamped to [Number.MIN_SAFE_INTEGER, 0] as a
   *   NonPositiveSafeInt.
   */
  pow,

  /**
   * Adds two NonPositiveSafeInt values.
   *
   * @param a The first NonPositiveSafeInt.
   * @param b The second NonPositiveSafeInt.
   * @returns `a + b` clamped to [Number.MIN_SAFE_INTEGER, 0] as a
   *   NonPositiveSafeInt.
   */
  add,

  /**
   * Subtracts one NonPositiveSafeInt from another.
   *
   * @param a The minuend NonPositiveSafeInt.
   * @param b The subtrahend NonPositiveSafeInt.
   * @returns `a - b` clamped to [Number.MIN_SAFE_INTEGER, 0] as a
   *   NonPositiveSafeInt (maximum 0).
   */
  sub,
} as const;
