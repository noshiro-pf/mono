import { type NonZeroInt as TtfImported_NonZeroInt } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type NonZeroInt = TtfImported_NonZeroInt;

type ElementType = NonZeroInt;

const typeNameInMessage = 'a non-zero integer';

const {
  abs,
  castType,
  is,
  max: max_,
  min: min_,
  mul,
  pow,
  randomNonZero: random,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  number,
  number
>({
  integerOrSafeInteger: 'Integer',
  nonZero: true,
  MIN_VALUE: -Number.MAX_VALUE,
  MAX_VALUE: Number.MAX_VALUE,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a non-zero integer.
 *
 * Returns `true` for a non-zero integer — a value with no fractional component,
 * including values outside the safe integer range (unlike `SafeInt`).
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-zero integer, `false` otherwise
 */
export const isNonZeroInt = is;

/**
 * Casts a `number` to the `NonZeroInt` branded type.
 *
 * Validates that the value is a non-zero integer and returns it with the
 * `NonZeroInt` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `NonZeroInt`
 * @throws {TypeError} If the value is not a non-zero integer
 */
export const asNonZeroInt = castType;

/**
 * Namespace providing type-safe operations for the `NonZeroInt` branded type.
 *
 * The `NonZeroInt` type represents a non-zero integer. Division (`div`) uses
 * floor division.
 *
 * Unlike `SafeInt`, `NonZeroInt` allows values outside the safe integer range
 * (±2^53 − 1), so very large magnitudes may lose precision in JavaScript's
 * `number` type.
 */
export const NonZeroInt = {
  /**
   * Type guard that checks if a value is a non-zero integer.
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-zero integer, `false` otherwise
   * @see {@link isNonZeroInt} for usage examples
   */
  is,

  /**
   * Returns the absolute value of a non-zero integer.
   *
   * The result is non-negative and keeps the `NonZeroInt` brand. Note that
   * `Math.abs(Number.MIN_SAFE_INTEGER)` exceeds `Number.MAX_SAFE_INTEGER`, so
   * use `SafeInt` for guaranteed precision.
   *
   * @param a - The non-zero integer value
   * @returns The absolute value as a non-negative `NonZeroInt`
   */
  abs,

  /**
   * Returns the smallest of the given non-zero integers.
   *
   * @param values - The non-zero integers to compare (at least one required)
   * @returns The smallest value as a `NonZeroInt`
   */
  min: min_,

  /**
   * Returns the largest of the given non-zero integers.
   *
   * @param values - The non-zero integers to compare (at least one required)
   * @returns The largest value as a `NonZeroInt`
   */
  max: max_,

  /**
   * Generates a random `NonZeroInt` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `NonZeroInt` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `NonZeroInt` (floored
   * to an integer).
   *
   * @param a - The base non-zero integer
   * @param b - The exponent non-zero integer
   * @returns `a ** b` as a `NonZeroInt`
   */
  pow,

  /**
   * Multiplies two non-zero integers, returning `a * b` as a `NonZeroInt`.
   *
   * @param a - The first non-zero integer
   * @param b - The second non-zero integer
   * @returns The product of `a` and `b` as a `NonZeroInt`
   */
  mul,
} as const;

expectType<
  keyof typeof NonZeroInt,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int',
    'mul'
  >
>('=');

expectType<
  typeof NonZeroInt,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<ElementType, 'int', 'mul'>
>('<=');
