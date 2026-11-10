import type {
  AbsoluteValue,
  Int16,
  StrictExclude,
  Int8 as TtfImported_Int8,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import {
  MAX_VALUE,
  MIN_VALUE,
  castType as castTypeImpl,
  fromNumber as fromNumberImpl,
  random as randomImpl,
} from '../operators/int8.mjs';
import type { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type Int8 = TtfImported_Int8;

const typeNameInMessage = 'an integer in [-128, 127]';

/**
 * Type guard that checks if a value is an integer in [-128, 127].
 *
 * Returns `true` for an integer in [-128, 127] — a value with no fractional
 * component.
 *
 * @param value - The value to check
 * @returns `true` if the value is an integer in [-128, 127], `false` otherwise
 */
export const isInt8 = (value: number): value is Int8 =>
  Number.isSafeInteger(value) && -128 <= value && value <= 127;

/**
 * Casts a `number` to the `Int8` branded type.
 *
 * Validates that the value is an integer in [-128, 127] and returns it with the
 * `Int8` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as an `Int8`
 * @throws {TypeError} If the value is not an integer in [-128, 127]
 */
export const asInt8 = (value: number): Int8 => {
  if (!isInt8(value)) {
    throw new TypeError(`Expected ${typeNameInMessage}, got: ${value}`);
  }

  return value;
};

const fromNumber = (a: number): Int8 => asInt8(fromNumberImpl(a));

const abs = <N extends Int8>(x: N): AbsoluteValue<N> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- unnecessary only under the strict standard library; the stock one types `Math.abs` as returning `number`
  Math.abs(x) as unknown as AbsoluteValue<N>;

const min_ = (...values: readonly Int8[]): Int8 => asInt8(Math.min(...values));

const max_ = (...values: readonly Int8[]): Int8 => asInt8(Math.max(...values));

const pow = (x: Int8, y: Int8): Int8 => fromNumber(x ** y);

const add = (x: Int8, y: Int8): Int8 => fromNumber(x + y);

const sub = (x: Int8, y: Int8): Int8 => fromNumber(x - y);

const mul = (x: Int8, y: Int8): Int8 => fromNumber(x * y);

const div = (x: Int8, y: StrictExclude<Int8, 0>): Int8 =>
  fromNumber(Math.floor(x / y));

const random = (min: Int8, max: Int8): Int8 =>
  asInt8(randomImpl(castTypeImpl(min), castTypeImpl(max)));

/**
 * Namespace providing type-safe operations for the `Int8` branded type.
 *
 * The `Int8` type represents an integer in [-128, 127]. Division (`div`) uses
 * floor division.
 */
export const Int8 = {
  /**
   * Type guard that checks if a value is an integer in [-128, 127].
   *
   * @param value - The value to check
   * @returns `true` if the value is an integer in [-128, 127], `false` otherwise
   * @see {@link isInt8} for usage examples
   */
  is: isInt8,

  /**
   * The smallest value representable as `Int8` (the lower saturation target of
   * `fromNumber`).
   */
  MIN_VALUE,

  /**
   * The largest value representable as `Int8` (the upper saturation target of
   * `fromNumber`).
   */
  MAX_VALUE,

  /**
   * Returns the smallest of the given integers.
   *
   * @param values - The integers to compare (at least one required)
   * @returns The smallest value as an `Int8`
   */
  min: min_,

  /**
   * Returns the largest of the given integers.
   *
   * @param values - The integers to compare (at least one required)
   * @returns The largest value as an `Int8`
   */
  max: max_,

  /**
   * Converts an arbitrary `number` into an `Int8`, rounding to the nearest
   * integer and saturating the result into the range `[MIN_VALUE, MAX_VALUE]`.
   *
   * Unlike `asInt8`, this is total: out-of-range inputs are clamped to the
   * nearest representable `Int8` instead of throwing.
   *
   * @param value - The value to convert
   * @returns The value as an `Int8`
   */
  fromNumber,

  /**
   * Returns the absolute value of an integer in [-128, 127].
   *
   * The result is typed `AbsoluteValue<N>`, not `Int8`: the range is
   * asymmetric, and `abs(MIN_VALUE)` is `MAX_VALUE + 1`, which is not an
   * `Int8`.
   *
   * @param a - The integer value
   * @returns The absolute value as an `AbsoluteValue<N>`
   */
  abs,

  /**
   * Generates a random `Int8` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `Int8` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as an `Int8` (floored to an
   * integer).
   *
   * @param a - The base integer
   * @param b - The exponent integer
   * @returns `a ** b` as an `Int8`
   */
  pow,

  /**
   * Adds two integers, returning `a + b` as an `Int8`.
   *
   * @param a - The first integer
   * @param b - The second integer
   * @returns The sum of `a` and `b` as an `Int8`
   */
  add,

  /**
   * Subtracts two integers, returning `a - b` as an `Int8`.
   *
   * @param a - The first integer
   * @param b - The second integer
   * @returns The difference of `a` and `b` as an `Int8`
   */
  sub,

  /**
   * Multiplies two integers, returning `a * b` as an `Int8`.
   *
   * @param a - The first integer
   * @param b - The second integer
   * @returns The product of `a` and `b` as an `Int8`
   */
  mul,

  /**
   * Divides two integers using floor division (`⌊a / b⌋`): the result is `a /
   * b` rounded toward negative infinity, as an `Int8`.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as an `Int8`
   */
  div,
} as const;

expectType<
  keyof typeof Int8,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    Int16,
    'int' | 'range'
  >
>('=');
