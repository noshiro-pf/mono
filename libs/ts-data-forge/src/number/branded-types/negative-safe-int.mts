import type {
  NegativeSafeInt as TtfImported_NegativeSafeInt,
  WithSmallInt,
} from 'ts-type-forge';
import {
  MAX_VALUE,
  MIN_VALUE,
  add,
  fromNumber,
  max as max_,
  min as min_,
  pow,
  random,
  sub,
} from '../operators/negative-safe-int.mjs';
import { PositiveSafeInt } from './positive-safe-int.mjs';

export type NegativeSafeInt = TtfImported_NegativeSafeInt;

type ElementType = NegativeSafeInt;

const typeNameInMessage = 'a negative safe integer';

const abs = (x: WithSmallInt<ElementType>): PositiveSafeInt =>
  PositiveSafeInt.fromNumber(Math.abs(x));

/**
 * Type guard that checks if a value is a negative safe integer.
 *
 * Returns `true` for a negative safe integer — a value with no fractional
 * component.
 *
 * @param value - The value to check
 * @returns `true` if the value is a negative safe integer, `false` otherwise
 */
export const isNegativeSafeInt = (value: number): value is NegativeSafeInt =>
  Number.isSafeInteger(value) && value <= -1;

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
export const asNegativeSafeInt = <N extends number>(
  value: N,
): NegativeSafeInt & N => {
  if (!isNegativeSafeInt(value)) {
    throw new TypeError(`Expected ${typeNameInMessage}, got: ${value}`);
  }

  return value;
};

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
  is: isNegativeSafeInt,

  /**
   * The smallest value representable as `NegativeSafeInt` (the lower saturation
   * target of `fromNumber`).
   */
  MIN_VALUE,

  /**
   * The largest value representable as `NegativeSafeInt` (the upper saturation
   * target of `fromNumber`).
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a negative safe integer.
   *
   * The result is typed `PositiveSafeInt`, not `NegativeSafeInt`: the absolute
   * value of a negative number is positive.
   *
   * @param a - The negative safe integer value
   * @returns The absolute value as a `PositiveSafeInt`
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
   * Converts an arbitrary `number` into a `NegativeSafeInt`, rounding to the
   * nearest integer and saturating the result into the range `[MIN_VALUE,
   * MAX_VALUE]`.
   *
   * Unlike `asNegativeSafeInt`, this is total: out-of-range inputs are clamped
   * to the nearest representable `NegativeSafeInt` instead of throwing, `NaN`
   * included, which becomes `MIN_VALUE`.
   *
   * @param value - The value to convert
   * @returns The value as a `NegativeSafeInt`
   */
  fromNumber,

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
