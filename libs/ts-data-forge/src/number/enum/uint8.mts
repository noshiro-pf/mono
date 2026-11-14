import type {
  StrictExclude,
  Uint8 as TtfImported_Uint8,
  Uint16,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import {
  MAX_VALUE,
  MIN_VALUE,
  castType as castTypeImpl,
  fromNumber as fromNumberImpl,
  random as randomImpl,
} from '../operators/uint8.mjs';
import type { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type Uint8 = TtfImported_Uint8;

const typeNameInMessage = 'an non-negative integer less than 256';

/**
 * Type guard that checks if a value is an non-negative integer less than 256.
 *
 * Returns `true` for an non-negative integer less than 256 — a value with no
 * fractional component.
 *
 * @param value - The value to check
 * @returns `true` if the value is an non-negative integer less than 256, `false` otherwise
 */
export const isUint8 = (value: number): value is Uint8 =>
  Number.isSafeInteger(value) && 0 <= value && value <= 255;

/**
 * Casts a `number` to the `Uint8` branded type.
 *
 * Validates that the value is an non-negative integer less than 256 and returns
 * it with the `Uint8` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as an `Uint8`
 * @throws {TypeError} If the value is not an non-negative integer less than 256
 */
export const asUint8 = (value: number): Uint8 => {
  if (!isUint8(value)) {
    throw new TypeError(`Expected ${typeNameInMessage}, got: ${value}`);
  }

  return value;
};

const fromNumber = (a: number): Uint8 => asUint8(fromNumberImpl(a));

const min_ = (...values: readonly Uint8[]): Uint8 =>
  asUint8(Math.min(...values));

const max_ = (...values: readonly Uint8[]): Uint8 =>
  asUint8(Math.max(...values));

const pow = (x: Uint8, y: Uint8): Uint8 => fromNumber(x ** y);

const add = (x: Uint8, y: Uint8): Uint8 => fromNumber(x + y);

const sub = (x: Uint8, y: Uint8): Uint8 => fromNumber(x - y);

const mul = (x: Uint8, y: Uint8): Uint8 => fromNumber(x * y);

const div = (x: Uint8, y: StrictExclude<Uint8, 0>): Uint8 =>
  fromNumber(Math.floor(x / y));

const random = (min: Uint8, max: Uint8): Uint8 =>
  asUint8(randomImpl(castTypeImpl(min), castTypeImpl(max)));

/**
 * Namespace providing type-safe operations for the `Uint8` branded type.
 *
 * The `Uint8` type represents an non-negative integer less than 256. Division
 * (`div`) uses floor division.
 */
export const Uint8 = {
  /**
   * Type guard that checks if a value is an non-negative integer less than 256.
   *
   * @param value - The value to check
   * @returns `true` if the value is an non-negative integer less than 256, `false` otherwise
   * @see {@link isUint8} for usage examples
   */
  is: isUint8,

  /**
   * The smallest value representable as `Uint8` (the lower saturation target of
   * `fromNumber`).
   */
  MIN_VALUE,

  /**
   * The largest value representable as `Uint8` (the upper saturation target of
   * `fromNumber`).
   */
  MAX_VALUE,

  /**
   * Returns the largest of the given non-negative integers.
   *
   * @param values - The non-negative integers to compare (at least one required)
   * @returns The largest value as an `Uint8`
   */
  max: max_,

  /**
   * Returns the smallest of the given non-negative integers.
   *
   * @param values - The non-negative integers to compare (at least one required)
   * @returns The smallest value as an `Uint8`
   */
  min: min_,

  /**
   * Converts an arbitrary `number` into an `Uint8`, rounding to the nearest
   * integer and saturating the result into the range `[MIN_VALUE, MAX_VALUE]`.
   *
   * Unlike `asUint8`, this is total: out-of-range inputs are clamped to the
   * nearest representable `Uint8` instead of throwing, `NaN` included, which
   * becomes `MIN_VALUE`.
   *
   * @param value - The value to convert
   * @returns The value as an `Uint8`
   */
  fromNumber,

  /**
   * Generates a random `Uint8` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `Uint8` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as an `Uint8` (floored to
   * an integer).
   *
   * @param a - The base non-negative integer
   * @param b - The exponent non-negative integer
   * @returns `a ** b` as an `Uint8`
   */
  pow,

  /**
   * Adds two non-negative integers, returning `a + b` as an `Uint8`.
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The sum of `a` and `b` as an `Uint8`
   */
  add,

  /**
   * Subtracts two non-negative integers, returning `a - b` as an `Uint8`.
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The difference of `a` and `b` as an `Uint8`
   */
  sub,

  /**
   * Multiplies two non-negative integers, returning `a * b` as an `Uint8`.
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The product of `a` and `b` as an `Uint8`
   */
  mul,

  /**
   * Divides two non-negative integers using floor division (`⌊a / b⌋`): the
   * result is `a / b` rounded toward negative infinity, as an `Uint8`.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as an `Uint8`
   */
  div,
} as const;

expectType<
  keyof typeof Uint8,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    Uint16,
    'int' | 'non-negative' | 'range'
  >
>('=');
