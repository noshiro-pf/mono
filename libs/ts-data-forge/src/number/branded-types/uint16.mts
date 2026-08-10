import { type Uint16 as TtfImported_Uint16 } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type Uint16 = TtfImported_Uint16;

type ElementType = Uint16;

const typeNameInMessage = 'a non-negative integer less than 2^16';

const {
  MAX_VALUE,
  MIN_VALUE,
  add,
  castType,
  div,
  fromNumber,
  is,
  max: max_,
  min: min_,
  mul,
  pow,
  random,
  sub,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  0,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 0,
  MAX_VALUE: 2 ** 16 - 1,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a non-negative integer less than 2^16.
 *
 * Returns `true` for a non-negative integer less than 2^16 — a value with no
 * fractional component.
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-negative integer less than 2^16, `false` otherwise
 */
export const isUint16 = is;

/**
 * Casts a `number` to the `Uint16` branded type.
 *
 * Validates that the value is a non-negative integer less than 2^16 and returns
 * it with the `Uint16` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as an `Uint16`
 * @throws {TypeError} If the value is not a non-negative integer less than 2^16
 */
export const asUint16 = castType;

/**
 * Namespace providing type-safe operations for the `Uint16` branded type.
 *
 * The `Uint16` type represents a non-negative integer less than 2^16. Division
 * (`div`) uses floor division.
 */
export const Uint16 = {
  /**
   * Type guard that checks if a value is a non-negative integer less than 2^16.
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-negative integer less than 2^16, `false` otherwise
   * @see {@link isUint16} for usage examples
   */
  is,

  /**
   * The smallest value representable as `Uint16` (the lower saturation target
   * of `fromNumber`).
   */
  MIN_VALUE,

  /**
   * The largest value representable as `Uint16` (the upper saturation target of
   * `fromNumber`).
   */
  MAX_VALUE,

  /**
   * Returns the smallest of the given non-negative integers.
   *
   * @param values - The non-negative integers to compare (at least one required)
   * @returns The smallest value as an `Uint16`
   */
  min: min_,

  /**
   * Returns the largest of the given non-negative integers.
   *
   * @param values - The non-negative integers to compare (at least one required)
   * @returns The largest value as an `Uint16`
   */
  max: max_,

  /**
   * Converts an arbitrary `number` into an `Uint16`, rounding to the nearest
   * integer and saturating the result into the range `[MIN_VALUE, MAX_VALUE]`.
   *
   * Unlike `asUint16`, this is total: out-of-range inputs are clamped to the
   * nearest representable `Uint16` instead of throwing.
   *
   * @param value - The value to convert
   * @returns The value as an `Uint16`
   */
  fromNumber,

  /**
   * Generates a random `Uint16` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `Uint16` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as an `Uint16` (floored to
   * an integer).
   *
   * @param a - The base non-negative integer
   * @param b - The exponent non-negative integer
   * @returns `a ** b` as an `Uint16`
   */
  pow,

  /**
   * Adds two non-negative integers, returning `a + b` as an `Uint16`.
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The sum of `a` and `b` as an `Uint16`
   */
  add,

  /**
   * Subtracts two non-negative integers, returning `a - b` as an `Uint16`.
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The difference of `a` and `b` as an `Uint16`
   */
  sub,

  /**
   * Multiplies two non-negative integers, returning `a * b` as an `Uint16`.
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The product of `a` and `b` as an `Uint16`
   */
  mul,

  /**
   * Divides two non-negative integers using floor division (`⌊a / b⌋`): the
   * result is `a / b` rounded toward negative infinity, as an `Uint16`.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as an `Uint16`
   */
  div,
} as const;

expectType<
  keyof typeof Uint16,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('=');

expectType<
  typeof Uint16,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('<=');
