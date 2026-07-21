import {
  type SafeInt,
  type SafeUint,
  type NonZeroSafeInt as TtfImported_NonZeroSafeInt,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type NonZeroSafeInt = TtfImported_NonZeroSafeInt;

type ElementType = NonZeroSafeInt;

const typeNameInMessage = 'a non-zero safe integer';

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
  SafeInt,
  SafeUint
>({
  integerOrSafeInteger: 'SafeInteger',
  nonZero: true,
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion, math/prefer-number-min-safe-integer
  MIN_VALUE: Number.MIN_SAFE_INTEGER as SafeInt,
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion, math/prefer-number-max-safe-integer
  MAX_VALUE: Number.MAX_SAFE_INTEGER as SafeUint,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a non-zero safe integer.
 *
 * Returns `true` for a non-zero safe integer — a value with no fractional
 * component.
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-zero safe integer, `false` otherwise
 */
export const isNonZeroSafeInt = is;

/**
 * Casts a `number` to the `NonZeroSafeInt` branded type.
 *
 * Validates that the value is a non-zero safe integer and returns it with the
 * `NonZeroSafeInt` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `NonZeroSafeInt`
 * @throws {TypeError} If the value is not a non-zero safe integer
 */
export const asNonZeroSafeInt = castType;

/**
 * Namespace providing type-safe operations for the `NonZeroSafeInt` branded
 * type.
 *
 * The `NonZeroSafeInt` type represents a non-zero safe integer. Division
 * (`div`) uses floor division.
 */
export const NonZeroSafeInt = {
  /**
   * Type guard that checks if a value is a non-zero safe integer.
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-zero safe integer, `false` otherwise
   * @see {@link isNonZeroSafeInt} for usage examples
   */
  is,

  /**
   * The smallest value representable as `NonZeroSafeInt` (the lower saturation
   * target of `fromNumber`).
   */
  MIN_VALUE,

  /**
   * The largest value representable as `NonZeroSafeInt` (the upper saturation
   * target of `fromNumber`).
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a non-zero safe integer.
   *
   * The result is non-negative and keeps the `NonZeroSafeInt` brand.
   *
   * @param a - The non-zero safe integer value
   * @returns The absolute value as a non-negative `NonZeroSafeInt`
   */
  abs,

  /**
   * Returns the smallest of the given non-zero safe integers.
   *
   * @param values - The non-zero safe integers to compare (at least one required)
   * @returns The smallest value as a `NonZeroSafeInt`
   */
  min: min_,

  /**
   * Returns the largest of the given non-zero safe integers.
   *
   * @param values - The non-zero safe integers to compare (at least one required)
   * @returns The largest value as a `NonZeroSafeInt`
   */
  max: max_,

  /**
   * Converts an arbitrary `number` into a `NonZeroSafeInt`, rounding to the
   * nearest integer and saturating the result into the range `[MIN_VALUE,
   * MAX_VALUE]`.
   *
   * Unlike `asNonZeroSafeInt`, this is total: out-of-range inputs are clamped
   * to the nearest representable `NonZeroSafeInt` instead of throwing.
   *
   * @param value - The value to convert
   * @returns The value as a `NonZeroSafeInt`
   */
  fromNumber,

  /**
   * Generates a random `NonZeroSafeInt` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `NonZeroSafeInt` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `NonZeroSafeInt`
   * (floored to an integer).
   *
   * @param a - The base non-zero safe integer
   * @param b - The exponent non-zero safe integer
   * @returns `a ** b` as a `NonZeroSafeInt`
   */
  pow,

  /**
   * Multiplies two non-zero safe integers, returning `a * b` as a
   * `NonZeroSafeInt`.
   *
   * @param a - The first non-zero safe integer
   * @param b - The second non-zero safe integer
   * @returns The product of `a` and `b` as a `NonZeroSafeInt`
   */
  mul,
} as const;

expectType<
  keyof typeof NonZeroSafeInt,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range',
    'mul'
  >
>('=');

expectType<
  typeof NonZeroSafeInt,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range',
    'mul'
  >
>('<=');
