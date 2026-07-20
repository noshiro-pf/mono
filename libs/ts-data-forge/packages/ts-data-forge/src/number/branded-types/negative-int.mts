import {
  type NegativeInt as TtfImported_NegativeInt,
  type WithSmallInt,
} from 'ts-type-forge';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';
import { PositiveInt } from './positive-int.mjs';

export type NegativeInt = TtfImported_NegativeInt;

type ElementType = NegativeInt;

const typeNameInMessage = 'a negative integer';

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
  -1
>({
  integerOrSafeInteger: 'Integer',
  nonZero: true,
  MIN_VALUE: -Number.MAX_VALUE,
  MAX_VALUE: -1,
  typeNameInMessage,
} as const);

const abs = (x: WithSmallInt<ElementType>): PositiveInt =>
  PositiveInt.clamp(Math.abs(x));

/**
 * Type guard that checks if a value is a negative integer.
 *
 * Returns `true` for a negative integer — a value with no fractional component,
 * including values outside the safe integer range (unlike `SafeInt`).
 *
 * @param value - The value to check
 * @returns `true` if the value is a negative integer, `false` otherwise
 */
export const isNegativeInt = is;

/**
 * Casts a `number` to the `NegativeInt` branded type.
 *
 * Validates that the value is a negative integer and returns it with the
 * `NegativeInt` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `NegativeInt`
 * @throws {TypeError} If the value is not a negative integer
 */
export const asNegativeInt = castType;

/**
 * Namespace providing type-safe operations for the `NegativeInt` branded type.
 *
 * The `NegativeInt` type represents a negative integer. Division (`div`) uses
 * floor division.
 *
 * Unlike `SafeInt`, `NegativeInt` allows values outside the safe integer range
 * (±2^53 − 1), so very large magnitudes may lose precision in JavaScript's
 * `number` type.
 */
export const NegativeInt = {
  /**
   * Type guard that checks if a value is a negative integer.
   *
   * @param value - The value to check
   * @returns `true` if the value is a negative integer, `false` otherwise
   * @see {@link isNegativeInt} for usage examples
   */
  is,

  /**
   * The largest value representable as `NegativeInt`.
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a negative integer.
   *
   * The result is non-negative and keeps the `NegativeInt` brand. Note that
   * `Math.abs(Number.MIN_SAFE_INTEGER)` exceeds `Number.MAX_SAFE_INTEGER`, so
   * use `SafeInt` for guaranteed precision.
   *
   * @param a - The negative integer value
   * @returns The absolute value as a non-negative `NegativeInt`
   */
  abs,

  /**
   * Returns the smallest of the given negative integers.
   *
   * @param values - The negative integers to compare (at least one required)
   * @returns The smallest value as a `NegativeInt`
   */
  min: min_,

  /**
   * Returns the largest of the given negative integers.
   *
   * @param values - The negative integers to compare (at least one required)
   * @returns The largest value as a `NegativeInt`
   */
  max: max_,

  /**
   * Clamps a `number` into the `NegativeInt` range, rounding to the nearest
   * integer and constraining the result to `[MIN_VALUE, MAX_VALUE]`.
   *
   * @param value - The value to clamp
   * @returns The clamped value as a `NegativeInt`
   */
  clamp,

  /**
   * Generates a random `NegativeInt` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `NegativeInt` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `NegativeInt` (floored
   * to an integer).
   *
   * @param a - The base negative integer
   * @param b - The exponent negative integer
   * @returns `a ** b` as a `NegativeInt`
   */
  pow,

  /**
   * Adds two negative integers, returning `a + b` as a `NegativeInt`.
   *
   * @param a - The first negative integer
   * @param b - The second negative integer
   * @returns The sum of `a` and `b` as a `NegativeInt`
   */
  add,

  /**
   * Subtracts two negative integers, returning `a - b` as a `NegativeInt`.
   *
   * @param a - The first negative integer
   * @param b - The second negative integer
   * @returns The difference of `a` and `b` as a `NegativeInt`
   */
  sub,
} as const;
