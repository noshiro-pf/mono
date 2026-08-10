import { type NonZeroUint16 as TtfImported_NonZeroUint16 } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type NonZeroUint16 = TtfImported_NonZeroUint16;

type ElementType = NonZeroUint16;

const typeNameInMessage = 'a non-zero integer in [1, 2^16)';

const {
  MAX_VALUE,
  MIN_VALUE,
  add,
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
  1,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  nonZero: true,
  MIN_VALUE: 1,
  MAX_VALUE: 2 ** 16 - 1,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a non-zero integer in [1, 2^16).
 *
 * Returns `true` for a non-zero integer in [1, 2^16) — a value with no
 * fractional component.
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-zero integer in [1, 2^16), `false` otherwise
 */
export const isNonZeroUint16 = is;

/**
 * Casts a `number` to the `NonZeroUint16` branded type.
 *
 * Validates that the value is a non-zero integer in [1, 2^16) and returns it
 * with the `NonZeroUint16` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `NonZeroUint16`
 * @throws {TypeError} If the value is not a non-zero integer in [1, 2^16)
 */
export const asNonZeroUint16 = castType;

/**
 * Namespace providing type-safe operations for the `NonZeroUint16` branded
 * type.
 *
 * The `NonZeroUint16` type represents a non-zero integer in [1, 2^16). Division
 * (`div`) uses floor division.
 */
export const NonZeroUint16 = {
  /**
   * Type guard that checks if a value is a non-zero integer in [1, 2^16).
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-zero integer in [1, 2^16), `false` otherwise
   * @see {@link isNonZeroUint16} for usage examples
   */
  is,

  /**
   * The smallest value representable as `NonZeroUint16` (the lower saturation
   * target of `fromNumber`).
   */
  MIN_VALUE,

  /**
   * The largest value representable as `NonZeroUint16` (the upper saturation
   * target of `fromNumber`).
   */
  MAX_VALUE,

  /**
   * Returns the smallest of the given non-zero integers.
   *
   * @param values - The non-zero integers to compare (at least one required)
   * @returns The smallest value as a `NonZeroUint16`
   */
  min: min_,

  /**
   * Returns the largest of the given non-zero integers.
   *
   * @param values - The non-zero integers to compare (at least one required)
   * @returns The largest value as a `NonZeroUint16`
   */
  max: max_,

  /**
   * Converts an arbitrary `number` into a `NonZeroUint16`, rounding to the
   * nearest integer and saturating the result into the range `[MIN_VALUE,
   * MAX_VALUE]`.
   *
   * Unlike `asNonZeroUint16`, this is total: out-of-range inputs are clamped to
   * the nearest representable `NonZeroUint16` instead of throwing.
   *
   * @param value - The value to convert
   * @returns The value as a `NonZeroUint16`
   */
  fromNumber,

  /**
   * Generates a random `NonZeroUint16` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `NonZeroUint16` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `NonZeroUint16`
   * (floored to an integer).
   *
   * @param a - The base non-zero integer
   * @param b - The exponent non-zero integer
   * @returns `a ** b` as a `NonZeroUint16`
   */
  pow,

  /**
   * Adds two non-zero integers, returning `a + b` as a `NonZeroUint16`.
   *
   * @param a - The first non-zero integer
   * @param b - The second non-zero integer
   * @returns The sum of `a` and `b` as a `NonZeroUint16`
   */
  add,

  /**
   * Multiplies two non-zero integers, returning `a * b` as a `NonZeroUint16`.
   *
   * @param a - The first non-zero integer
   * @param b - The second non-zero integer
   * @returns The product of `a` and `b` as a `NonZeroUint16`
   */
  mul,
} as const;

expectType<
  keyof typeof NonZeroUint16,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range',
    'add' | 'mul'
  >
>('=');

expectType<
  typeof NonZeroUint16,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range',
    'add' | 'mul'
  >
>('<=');
