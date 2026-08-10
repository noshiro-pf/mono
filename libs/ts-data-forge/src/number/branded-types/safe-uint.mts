import { type SafeUint as TtfImported_SafeUint } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type SafeUint = TtfImported_SafeUint;

type ElementType = SafeUint;

const typeNameInMessage = 'a non-negative safe integer';

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
  SafeUint
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 0,
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion, math/prefer-number-max-safe-integer
  MAX_VALUE: Number.MAX_SAFE_INTEGER as SafeUint,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a non-negative safe integer.
 *
 * Returns `true` for a non-negative safe integer — a value with no fractional
 * component.
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-negative safe integer, `false` otherwise
 */
export const isSafeUint = is;

/**
 * Casts a `number` to the `SafeUint` branded type.
 *
 * Validates that the value is a non-negative safe integer and returns it with
 * the `SafeUint` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `SafeUint`
 * @throws {TypeError} If the value is not a non-negative safe integer
 */
export const asSafeUint = castType;

/**
 * Namespace providing type-safe operations for the `SafeUint` branded type.
 *
 * The `SafeUint` type represents a non-negative safe integer. Division (`div`)
 * uses floor division.
 */
export const SafeUint = {
  /**
   * Type guard that checks if a value is a non-negative safe integer.
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-negative safe integer, `false` otherwise
   * @see {@link isSafeUint} for usage examples
   */
  is,

  /**
   * The smallest value representable as `SafeUint` (the lower saturation target
   * of `fromNumber`).
   */
  MIN_VALUE,

  /**
   * The largest value representable as `SafeUint` (the upper saturation target
   * of `fromNumber`).
   */
  MAX_VALUE,

  /**
   * Returns the smallest of the given non-negative safe integers.
   *
   * @param values - The non-negative safe integers to compare (at least one required)
   * @returns The smallest value as a `SafeUint`
   */
  min: min_,

  /**
   * Returns the largest of the given non-negative safe integers.
   *
   * @param values - The non-negative safe integers to compare (at least one required)
   * @returns The largest value as a `SafeUint`
   */
  max: max_,

  /**
   * Converts an arbitrary `number` into a `SafeUint`, rounding to the nearest
   * integer and saturating the result into the range `[MIN_VALUE, MAX_VALUE]`.
   *
   * Unlike `asSafeUint`, this is total: out-of-range inputs are clamped to the
   * nearest representable `SafeUint` instead of throwing.
   *
   * @param value - The value to convert
   * @returns The value as a `SafeUint`
   */
  fromNumber,

  /**
   * Generates a random `SafeUint` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `SafeUint` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `SafeUint` (floored to
   * an integer).
   *
   * @param a - The base non-negative safe integer
   * @param b - The exponent non-negative safe integer
   * @returns `a ** b` as a `SafeUint`
   */
  pow,

  /**
   * Adds two non-negative safe integers, returning `a + b` as a `SafeUint`.
   *
   * @param a - The first non-negative safe integer
   * @param b - The second non-negative safe integer
   * @returns The sum of `a` and `b` as a `SafeUint`
   */
  add,

  /**
   * Subtracts two non-negative safe integers, returning `a - b` as a
   * `SafeUint`.
   *
   * @param a - The first non-negative safe integer
   * @param b - The second non-negative safe integer
   * @returns The difference of `a` and `b` as a `SafeUint`
   */
  sub,

  /**
   * Multiplies two non-negative safe integers, returning `a * b` as a
   * `SafeUint`.
   *
   * @param a - The first non-negative safe integer
   * @param b - The second non-negative safe integer
   * @returns The product of `a` and `b` as a `SafeUint`
   */
  mul,

  /**
   * Divides two non-negative safe integers using floor division (`⌊a / b⌋`):
   * the result is `a / b` rounded toward negative infinity, as a `SafeUint`.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as a `SafeUint`
   */
  div,
} as const;

expectType<
  keyof typeof SafeUint,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('=');

expectType<
  typeof SafeUint,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('<=');
