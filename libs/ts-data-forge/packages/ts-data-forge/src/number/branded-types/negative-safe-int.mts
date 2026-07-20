import {
  type NegativeSafeInt as TtfImported_NegativeSafeInt,
  type WithSmallInt,
} from 'ts-type-forge';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';
import { PositiveSafeInt } from './positive-safe-int.mjs';

export type NegativeSafeInt = TtfImported_NegativeSafeInt;

type ElementType = NegativeSafeInt;

const typeNameInMessage = 'a negative safe integer';

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
  -1
>({
  integerOrSafeInteger: 'SafeInteger',
  nonZero: true,
  MIN_VALUE: Number.MIN_SAFE_INTEGER,
  MAX_VALUE: -1,
  typeNameInMessage,
} as const);

const abs = (x: WithSmallInt<ElementType>): PositiveSafeInt =>
  PositiveSafeInt.clamp(Math.abs(x));

/**
 * Type guard that checks if a value is a negative safe integer.
 *
 * Returns `true` for a negative safe integer — a value with no fractional
 * component.
 *
 * @param value - The value to check
 * @returns `true` if the value is a negative safe integer, `false` otherwise
 */
export const isNegativeSafeInt = is;

/**
 * Casts a `number` to the `NegativeSafeInt` branded type.
 *
 * Validates that the value is a negative safe integer and returns it with the
 * `NegativeSafeInt` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `NegativeSafeInt`
 * @throws {TypeError} If the value is not a negative safe integer
 */
export const asNegativeSafeInt = castType;

/**
 * Namespace providing type-safe operations for the `NegativeSafeInt` branded
 * type.
 *
 * The `NegativeSafeInt` type represents a negative safe integer. Division
 * (`div`) uses floor division.
 */
export const NegativeSafeInt = {
  /**
   * Type guard that checks if a value is a negative safe integer.
   *
   * @param value - The value to check
   * @returns `true` if the value is a negative safe integer, `false` otherwise
   * @see {@link isNegativeSafeInt} for usage examples
   */
  is,

  /**
   * The smallest value representable as `NegativeSafeInt`.
   */
  MIN_VALUE,

  /**
   * The largest value representable as `NegativeSafeInt`.
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a negative safe integer.
   *
   * The result is non-negative and keeps the `NegativeSafeInt` brand.
   *
   * @param a - The negative safe integer value
   * @returns The absolute value as a non-negative `NegativeSafeInt`
   */
  abs,

  /**
   * Returns the smallest of the given negative safe integers.
   *
   * @param values - The negative safe integers to compare (at least one required)
   * @returns The smallest value as a `NegativeSafeInt`
   */
  min: min_,

  /**
   * Returns the largest of the given negative safe integers.
   *
   * @param values - The negative safe integers to compare (at least one required)
   * @returns The largest value as a `NegativeSafeInt`
   */
  max: max_,

  /**
   * Clamps a `number` into the `NegativeSafeInt` range, rounding to the nearest
   * integer and constraining the result to `[MIN_VALUE, MAX_VALUE]`.
   *
   * @param value - The value to clamp
   * @returns The clamped value as a `NegativeSafeInt`
   */
  clamp,

  /**
   * Generates a random `NegativeSafeInt` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `NegativeSafeInt` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `NegativeSafeInt`
   * (floored to an integer).
   *
   * @param a - The base negative safe integer
   * @param b - The exponent negative safe integer
   * @returns `a ** b` as a `NegativeSafeInt`
   */
  pow,

  /**
   * Adds two negative safe integers, returning `a + b` as a `NegativeSafeInt`.
   *
   * @param a - The first negative safe integer
   * @param b - The second negative safe integer
   * @returns The sum of `a` and `b` as a `NegativeSafeInt`
   */
  add,

  /**
   * Subtracts two negative safe integers, returning `a - b` as a
   * `NegativeSafeInt`.
   *
   * @param a - The first negative safe integer
   * @param b - The second negative safe integer
   * @returns The difference of `a` and `b` as a `NegativeSafeInt`
   */
  sub,
} as const;
