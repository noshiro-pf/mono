import { type PositiveUint16 as TtfImported_PositiveUint16 } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type PositiveUint16 = TtfImported_PositiveUint16;

type ElementType = PositiveUint16;

const typeNameInMessage = 'a positive integer in [1, 2^16)';

const {
  MAX_VALUE,
  MIN_VALUE,
  add,
  castType,
  clamp,
  div,
  is,
  max: max_,
  min: min_,
  mul,
  pow,
  random,
  sub,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  1,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 1,
  MAX_VALUE: 2 ** 16 - 1,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a positive integer in [1, 2^16).
 *
 * Returns `true` for a positive integer in [1, 2^16) — a value with no
 * fractional component.
 *
 * @param value - The value to check
 * @returns `true` if the value is a positive integer in [1, 2^16), `false` otherwise
 */
export const isPositiveUint16 = is;

/**
 * Casts a `number` to the `PositiveUint16` branded type.
 *
 * Validates that the value is a positive integer in [1, 2^16) and returns it
 * with the `PositiveUint16` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `PositiveUint16`
 * @throws {TypeError} If the value is not a positive integer in [1, 2^16)
 */
export const asPositiveUint16 = castType;

/**
 * Namespace providing type-safe operations for the `PositiveUint16` branded
 * type.
 *
 * The `PositiveUint16` type represents a positive integer in [1, 2^16).
 * Division (`div`) uses floor division.
 */
export const PositiveUint16 = {
  /**
   * Type guard that checks if a value is a positive integer in [1, 2^16).
   *
   * @param value - The value to check
   * @returns `true` if the value is a positive integer in [1, 2^16), `false` otherwise
   * @see {@link isPositiveUint16} for usage examples
   */
  is,

  /**
   * The smallest value representable as `PositiveUint16`.
   */
  MIN_VALUE,

  /**
   * The largest value representable as `PositiveUint16`.
   */
  MAX_VALUE,

  /**
   * Returns the smallest of the given positive integers.
   *
   * @param values - The positive integers to compare (at least one required)
   * @returns The smallest value as a `PositiveUint16`
   */
  min: min_,

  /**
   * Returns the largest of the given positive integers.
   *
   * @param values - The positive integers to compare (at least one required)
   * @returns The largest value as a `PositiveUint16`
   */
  max: max_,

  /**
   * Clamps a `number` into the `PositiveUint16` range, rounding to the nearest
   * integer and constraining the result to `[MIN_VALUE, MAX_VALUE]`.
   *
   * @param value - The value to clamp
   * @returns The clamped value as a `PositiveUint16`
   */
  clamp,

  /**
   * Generates a random `PositiveUint16` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `PositiveUint16` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `PositiveUint16`
   * (floored to an integer).
   *
   * @param a - The base positive integer
   * @param b - The exponent positive integer
   * @returns `a ** b` as a `PositiveUint16`
   */
  pow,

  /**
   * Adds two positive integers, returning `a + b` as a `PositiveUint16`.
   *
   * @param a - The first positive integer
   * @param b - The second positive integer
   * @returns The sum of `a` and `b` as a `PositiveUint16`
   */
  add,

  /**
   * Subtracts two positive integers, returning `a - b` as a `PositiveUint16`.
   *
   * @param a - The first positive integer
   * @param b - The second positive integer
   * @returns The difference of `a` and `b` as a `PositiveUint16`
   */
  sub,

  /**
   * Multiplies two positive integers, returning `a * b` as a `PositiveUint16`.
   *
   * @param a - The first positive integer
   * @param b - The second positive integer
   * @returns The product of `a` and `b` as a `PositiveUint16`
   */
  mul,

  /**
   * Divides two positive integers using floor division (`⌊a / b⌋`): the result
   * is `a / b` rounded toward negative infinity, as a `PositiveUint16`.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as a `PositiveUint16`
   */
  div,
} as const;

expectType<
  keyof typeof PositiveUint16,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('=');

expectType<
  typeof PositiveUint16,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('<=');
