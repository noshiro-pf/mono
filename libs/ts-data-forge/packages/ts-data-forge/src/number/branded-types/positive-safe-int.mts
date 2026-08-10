import {
  type SafeUint,
  type PositiveSafeInt as TtfImported_PositiveSafeInt,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type PositiveSafeInt = TtfImported_PositiveSafeInt;

type ElementType = PositiveSafeInt;

const typeNameInMessage = 'a positive safe integer';

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
  1,
  SafeUint
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 1,
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion, math/prefer-number-max-safe-integer
  MAX_VALUE: Number.MAX_SAFE_INTEGER as SafeUint,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a positive safe integer.
 *
 * Returns `true` for a positive safe integer — a value with no fractional
 * component.
 *
 * @example
 *
 * ```ts
 * assert.isTrue(isPositiveSafeInt(1));
 *
 * assert.isTrue(isPositiveSafeInt(Number.MAX_SAFE_INTEGER));
 *
 * assert.isFalse(isPositiveSafeInt(0));
 *
 * assert.isTrue(PositiveSafeInt.is(42));
 * ```
 *
 * @param value - The value to check
 * @returns `true` if the value is a positive safe integer, `false` otherwise
 */
export const isPositiveSafeInt = is;

/**
 * Casts a `number` to the `PositiveSafeInt` branded type.
 *
 * Validates that the value is a positive safe integer and returns it with the
 * `PositiveSafeInt` brand. Throws a `TypeError` otherwise.
 *
 * @example
 *
 * ```ts
 * const branded = asPositiveSafeInt(128);
 *
 * assert.isTrue(branded === 128);
 *
 * assert.isTrue(PositiveSafeInt.is(branded));
 * ```
 *
 * @param value - The value to cast
 * @returns The value as a `PositiveSafeInt`
 * @throws {TypeError} If the value is not a positive safe integer
 */
export const asPositiveSafeInt = castType;

/**
 * Namespace providing type-safe operations for the `PositiveSafeInt` branded
 * type.
 *
 * The `PositiveSafeInt` type represents a positive safe integer. Division
 * (`div`) uses floor division.
 */
export const PositiveSafeInt = {
  /**
   * Type guard that checks if a value is a positive safe integer.
   *
   * @example
   *
   * ```ts
   * assert.isTrue(isPositiveSafeInt(1));
   *
   * assert.isTrue(isPositiveSafeInt(Number.MAX_SAFE_INTEGER));
   *
   * assert.isFalse(isPositiveSafeInt(0));
   *
   * assert.isTrue(PositiveSafeInt.is(42));
   * ```
   *
   * @param value - The value to check
   * @returns `true` if the value is a positive safe integer, `false` otherwise
   * @see {@link isPositiveSafeInt} for usage examples
   */
  is,

  /**
   * The smallest value representable as `PositiveSafeInt` (the lower saturation
   * target of `fromNumber`).
   */
  MIN_VALUE,

  /**
   * The largest value representable as `PositiveSafeInt` (the upper saturation
   * target of `fromNumber`).
   */
  MAX_VALUE,

  /**
   * Returns the smallest of the given positive safe integers.
   *
   * @example
   *
   * ```ts
   * const smallest = PositiveSafeInt.min(
   *   asPositiveSafeInt(10),
   *   asPositiveSafeInt(5),
   * );
   *
   * assert.isTrue(smallest === 5);
   * ```
   *
   * @param values - The positive safe integers to compare (at least one required)
   * @returns The smallest value as a `PositiveSafeInt`
   */
  min: min_,

  /**
   * Returns the largest of the given positive safe integers.
   *
   * @example
   *
   * ```ts
   * const largest = PositiveSafeInt.max(
   *   asPositiveSafeInt(10),
   *   asPositiveSafeInt(5),
   * );
   *
   * assert.isTrue(largest === 10);
   * ```
   *
   * @param values - The positive safe integers to compare (at least one required)
   * @returns The largest value as a `PositiveSafeInt`
   */
  max: max_,

  /**
   * Converts an arbitrary `number` into a `PositiveSafeInt`, rounding to the
   * nearest integer and saturating the result into the range `[MIN_VALUE,
   * MAX_VALUE]`.
   *
   * Unlike `asPositiveSafeInt`, this is total: out-of-range inputs are clamped
   * to the nearest representable `PositiveSafeInt` instead of throwing.
   *
   * @example
   *
   * ```ts
   * const belowRange = PositiveSafeInt.fromNumber(0);
   *
   * const withinRange = PositiveSafeInt.fromNumber(123);
   *
   * const aboveRange = PositiveSafeInt.fromNumber(Number.MAX_SAFE_INTEGER + 10);
   *
   * assert.isTrue(belowRange === 1);
   *
   * assert.isTrue(withinRange === 123);
   *
   * assert.isTrue(aboveRange === Number.MAX_SAFE_INTEGER);
   * ```
   *
   * @param value - The value to convert
   * @returns The value as a `PositiveSafeInt`
   */
  fromNumber,

  /**
   * Generates a random `PositiveSafeInt` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @example
   *
   * ```ts
   * const min = asPositiveSafeInt(1);
   *
   * const max = asPositiveSafeInt(6);
   *
   * const randomValue = PositiveSafeInt.random(min, max);
   *
   * assert.isTrue(PositiveSafeInt.is(randomValue));
   *
   * assert.isTrue(randomValue >= 1 && randomValue <= 6);
   * ```
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `PositiveSafeInt` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `PositiveSafeInt`
   * (floored to an integer).
   *
   * @example
   *
   * ```ts
   * const base = asPositiveSafeInt(3);
   *
   * const exponent = asPositiveSafeInt(3);
   *
   * const power = PositiveSafeInt.pow(base, exponent);
   *
   * assert.isTrue(power === 27);
   * ```
   *
   * @param a - The base positive safe integer
   * @param b - The exponent positive safe integer
   * @returns `a ** b` as a `PositiveSafeInt`
   */
  pow,

  /**
   * Adds two positive safe integers, returning `a + b` as a `PositiveSafeInt`.
   *
   * @example
   *
   * ```ts
   * const sum = PositiveSafeInt.add(
   *   asPositiveSafeInt(1000),
   *   asPositiveSafeInt(2048),
   * );
   *
   * assert.isTrue(sum === 3048);
   *
   * assert.isTrue(PositiveSafeInt.is(sum));
   * ```
   *
   * @param a - The first positive safe integer
   * @param b - The second positive safe integer
   * @returns The sum of `a` and `b` as a `PositiveSafeInt`
   */
  add,

  /**
   * Subtracts two positive safe integers, returning `a - b` as a
   * `PositiveSafeInt`.
   *
   * @example
   *
   * ```ts
   * const difference = PositiveSafeInt.sub(
   *   asPositiveSafeInt(10),
   *   asPositiveSafeInt(20),
   * );
   *
   * assert.isTrue(difference === 1);
   *
   * assert.isTrue(PositiveSafeInt.is(difference));
   * ```
   *
   * @param a - The first positive safe integer
   * @param b - The second positive safe integer
   * @returns The difference of `a` and `b` as a `PositiveSafeInt`
   */
  sub,

  /**
   * Multiplies two positive safe integers, returning `a * b` as a
   * `PositiveSafeInt`.
   *
   * @example
   *
   * ```ts
   * const product = PositiveSafeInt.mul(
   *   asPositiveSafeInt(50),
   *   asPositiveSafeInt(20),
   * );
   *
   * assert.isTrue(product === 1000);
   *
   * assert.isTrue(PositiveSafeInt.is(product));
   * ```
   *
   * @param a - The first positive safe integer
   * @param b - The second positive safe integer
   * @returns The product of `a` and `b` as a `PositiveSafeInt`
   */
  mul,

  /**
   * Divides two positive safe integers using floor division (`⌊a / b⌋`): the
   * result is `a / b` rounded toward negative infinity, as a `PositiveSafeInt`.
   *
   * @example
   *
   * ```ts
   * const quotient = PositiveSafeInt.div(
   *   asPositiveSafeInt(25),
   *   asPositiveSafeInt(4),
   * );
   *
   * const clamped = PositiveSafeInt.div(
   *   asPositiveSafeInt(5),
   *   asPositiveSafeInt(50),
   * );
   *
   * assert.isTrue(quotient === 6);
   *
   * assert.isTrue(clamped === 1);
   * ```
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as a `PositiveSafeInt`
   */
  div,
} as const;

expectType<
  keyof typeof PositiveSafeInt,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('=');

expectType<
  typeof PositiveSafeInt,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('<=');
