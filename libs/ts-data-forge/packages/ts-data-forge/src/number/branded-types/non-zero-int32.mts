import { type NonZeroInt32 as TtfImported_NonZeroInt32 } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type NonZeroInt32 = TtfImported_NonZeroInt32;

type ElementType = NonZeroInt32;

const typeNameInMessage = 'a non-zero integer in [-2^31, 2^31)';

const {
  MAX_VALUE,
  MIN_VALUE,
  abs,
  castType,
  fromNumber,
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
  integerOrSafeInteger: 'SafeInteger',
  nonZero: true,
  MIN_VALUE: -(2 ** 31),
  MAX_VALUE: 2 ** 31 - 1,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a non-zero integer in [-2^31, 2^31).
 *
 * Returns `true` for a non-zero integer in [-2^31, 2^31) — a value with no
 * fractional component.
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-zero integer in [-2^31, 2^31), `false` otherwise
 */
export const isNonZeroInt32 = is;

/**
 * Casts a `number` to the `NonZeroInt32` branded type.
 *
 * Validates that the value is a non-zero integer in [-2^31, 2^31) and returns
 * it with the `NonZeroInt32` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `NonZeroInt32`
 * @throws {TypeError} If the value is not a non-zero integer in [-2^31, 2^31)
 */
export const asNonZeroInt32 = castType;

/**
 * Namespace providing type-safe operations for the `NonZeroInt32` branded type.
 *
 * The `NonZeroInt32` type represents a non-zero integer in [-2^31, 2^31).
 * Division (`div`) uses floor division.
 */
export const NonZeroInt32 = {
  /**
   * Type guard that checks if a value is a non-zero integer in [-2^31, 2^31).
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-zero integer in [-2^31, 2^31), `false` otherwise
   * @see {@link isNonZeroInt32} for usage examples
   */
  is,

  /**
   * The smallest value representable as `NonZeroInt32` (the lower saturation
   * target of `fromNumber`).
   */
  MIN_VALUE,

  /**
   * The largest value representable as `NonZeroInt32` (the upper saturation
   * target of `fromNumber`).
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a non-zero integer in [-2^31, 2^31).
   *
   * The result is non-negative and keeps the `NonZeroInt32` brand.
   *
   * @param a - The non-zero integer value
   * @returns The absolute value as a non-negative `NonZeroInt32`
   */
  abs,

  /**
   * Returns the smallest of the given non-zero integers.
   *
   * @param values - The non-zero integers to compare (at least one required)
   * @returns The smallest value as a `NonZeroInt32`
   */
  min: min_,

  /**
   * Returns the largest of the given non-zero integers.
   *
   * @param values - The non-zero integers to compare (at least one required)
   * @returns The largest value as a `NonZeroInt32`
   */
  max: max_,

  /**
   * Converts an arbitrary `number` into a `NonZeroInt32`, rounding to the
   * nearest integer and saturating the result into the range `[MIN_VALUE,
   * MAX_VALUE]`.
   *
   * Unlike `asNonZeroInt32`, this is total: out-of-range inputs are clamped to
   * the nearest representable `NonZeroInt32` instead of throwing.
   *
   * @param value - The value to convert
   * @returns The value as a `NonZeroInt32`
   */
  fromNumber,

  /**
   * Generates a random `NonZeroInt32` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `NonZeroInt32` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `NonZeroInt32`
   * (floored to an integer).
   *
   * @param a - The base non-zero integer
   * @param b - The exponent non-zero integer
   * @returns `a ** b` as a `NonZeroInt32`
   */
  pow,

  /**
   * Multiplies two non-zero integers, returning `a * b` as a `NonZeroInt32`.
   *
   * @param a - The first non-zero integer
   * @param b - The second non-zero integer
   * @returns The product of `a` and `b` as a `NonZeroInt32`
   */
  mul,
} as const;

expectType<
  keyof typeof NonZeroInt32,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range',
    'mul'
  >
>('=');

expectType<
  typeof NonZeroInt32,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range',
    'mul'
  >
>('<=');
