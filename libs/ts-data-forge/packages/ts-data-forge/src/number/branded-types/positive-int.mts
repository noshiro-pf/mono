import { type PositiveInt as TtfImported_PositiveInt } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type PositiveInt = TtfImported_PositiveInt;

type ElementType = PositiveInt;

const typeNameInMessage = 'a positive integer';

const {
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
  integerOrSafeInteger: 'Integer',
  MIN_VALUE: 1,
  MAX_VALUE: Number.MAX_VALUE,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a positive integer.
 *
 * Returns `true` for a positive integer — a value with no fractional component,
 * including values outside the safe integer range (unlike `SafeInt`).
 *
 * @example
 *
 * ```ts
 * assert.isTrue(isPositiveInt(5));
 *
 * assert.isFalse(isPositiveInt(0));
 *
 * assert.isTrue(PositiveInt.is(10));
 * ```
 *
 * @param value - The value to check
 * @returns `true` if the value is a positive integer, `false` otherwise
 */
export const isPositiveInt = is;

/**
 * Casts a `number` to the `PositiveInt` branded type.
 *
 * Validates that the value is a positive integer and returns it with the
 * `PositiveInt` brand. Throws a `TypeError` otherwise.
 *
 * @example
 *
 * ```ts
 * const branded = asPositiveInt(7);
 *
 * assert.isTrue(branded === 7);
 *
 * assert.isTrue(PositiveInt.is(branded));
 * ```
 *
 * @param value - The value to cast
 * @returns The value as a `PositiveInt`
 * @throws {TypeError} If the value is not a positive integer
 */
export const asPositiveInt = castType;

/**
 * Namespace providing type-safe operations for the `PositiveInt` branded type.
 *
 * The `PositiveInt` type represents a positive integer. Division (`div`) uses
 * floor division.
 *
 * Unlike `SafeInt`, `PositiveInt` allows values outside the safe integer range
 * (±2^53 − 1), so very large magnitudes may lose precision in JavaScript's
 * `number` type.
 */
export const PositiveInt = {
  /**
   * Type guard that checks if a value is a positive integer.
   *
   * @example
   *
   * ```ts
   * assert.isTrue(isPositiveInt(5));
   *
   * assert.isFalse(isPositiveInt(0));
   *
   * assert.isTrue(PositiveInt.is(10));
   * ```
   *
   * @param value - The value to check
   * @returns `true` if the value is a positive integer, `false` otherwise
   * @see {@link isPositiveInt} for usage examples
   */
  is,

  /**
   * The smallest value representable as `PositiveInt`.
   */
  MIN_VALUE,

  /**
   * Returns the smallest of the given positive integers.
   *
   * @example
   *
   * ```ts
   * const smallest = PositiveInt.min(
   *   asPositiveInt(9),
   *   asPositiveInt(3),
   *   asPositiveInt(12),
   * );
   *
   * assert.isTrue(smallest === 3);
   * ```
   *
   * @param values - The positive integers to compare (at least one required)
   * @returns The smallest value as a `PositiveInt`
   */
  min: min_,

  /**
   * Returns the largest of the given positive integers.
   *
   * @example
   *
   * ```ts
   * const largest = PositiveInt.max(
   *   asPositiveInt(9),
   *   asPositiveInt(3),
   *   asPositiveInt(12),
   * );
   *
   * assert.isTrue(largest === 12);
   * ```
   *
   * @param values - The positive integers to compare (at least one required)
   * @returns The largest value as a `PositiveInt`
   */
  max: max_,

  /**
   * Clamps a `number` into the `PositiveInt` range, rounding to the nearest
   * integer and constraining the result to `[MIN_VALUE, MAX_VALUE]`.
   *
   * @example
   *
   * ```ts
   * const belowRange = PositiveInt.clamp(0);
   *
   * const withinRange = PositiveInt.clamp(10);
   *
   * assert.isTrue(belowRange === 1);
   *
   * assert.isTrue(withinRange === 10);
   * ```
   *
   * @param value - The value to clamp
   * @returns The clamped value as a `PositiveInt`
   */
  clamp,

  /**
   * Generates a random `PositiveInt` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @example
   *
   * ```ts
   * const min = asPositiveInt(3);
   *
   * const max = asPositiveInt(6);
   *
   * const randomValue = PositiveInt.random(min, max);
   *
   * assert.isTrue(PositiveInt.is(randomValue));
   *
   * assert.isTrue(randomValue >= 3 && randomValue <= 6);
   * ```
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `PositiveInt` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `PositiveInt` (floored
   * to an integer).
   *
   * @example
   *
   * ```ts
   * const base = asPositiveInt(2);
   *
   * const exponent = asPositiveInt(4);
   *
   * const power = PositiveInt.pow(base, exponent);
   *
   * assert.isTrue(power === 16);
   * ```
   *
   * @param a - The base positive integer
   * @param b - The exponent positive integer
   * @returns `a ** b` as a `PositiveInt`
   */
  pow,

  /**
   * Adds two positive integers, returning `a + b` as a `PositiveInt`.
   *
   * @example
   *
   * ```ts
   * const sum = PositiveInt.add(asPositiveInt(4), asPositiveInt(5));
   *
   * assert.isTrue(sum === 9);
   * ```
   *
   * @param a - The first positive integer
   * @param b - The second positive integer
   * @returns The sum of `a` and `b` as a `PositiveInt`
   */
  add,

  /**
   * Subtracts two positive integers, returning `a - b` as a `PositiveInt`.
   *
   * @example
   *
   * ```ts
   * const difference = PositiveInt.sub(asPositiveInt(5), asPositiveInt(7));
   *
   * assert.isTrue(difference === 1);
   * ```
   *
   * @param a - The first positive integer
   * @param b - The second positive integer
   * @returns The difference of `a` and `b` as a `PositiveInt`
   */
  sub,

  /**
   * Multiplies two positive integers, returning `a * b` as a `PositiveInt`.
   *
   * @example
   *
   * ```ts
   * const product = PositiveInt.mul(asPositiveInt(3), asPositiveInt(7));
   *
   * assert.isTrue(product === 21);
   * ```
   *
   * @param a - The first positive integer
   * @param b - The second positive integer
   * @returns The product of `a` and `b` as a `PositiveInt`
   */
  mul,

  /**
   * Divides two positive integers using floor division (`⌊a / b⌋`): the result
   * is `a / b` rounded toward negative infinity, as a `PositiveInt`.
   *
   * @example
   *
   * ```ts
   * const quotient = PositiveInt.div(asPositiveInt(9), asPositiveInt(2));
   *
   * const clamped = PositiveInt.div(asPositiveInt(3), asPositiveInt(10));
   *
   * assert.isTrue(quotient === 4);
   *
   * assert.isTrue(clamped === 1);
   * ```
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as a `PositiveInt`
   */
  div,
} as const;

expectType<
  keyof typeof PositiveInt,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive'
  >
>('=');

expectType<
  typeof PositiveInt,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive'
  >
>('<=');
