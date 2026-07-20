import {
  type SafeUint,
  type SafeInt as TtfImported_SafeInt,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type SafeInt = TtfImported_SafeInt;

type ElementType = SafeInt;

const typeNameInMessage = 'a safe integer';

const {
  MAX_VALUE,
  MIN_VALUE,
  abs,
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
  SafeInt,
  SafeUint
>({
  integerOrSafeInteger: 'SafeInteger',
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion, math/prefer-number-min-safe-integer
  MIN_VALUE: Number.MIN_SAFE_INTEGER as SafeInt,
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion, math/prefer-number-max-safe-integer
  MAX_VALUE: Number.MAX_SAFE_INTEGER as SafeUint,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a safe integer.
 *
 * Returns `true` for a safe integer — a value with no fractional component.
 *
 * @example
 *
 * ```ts
 * assert.isTrue(isSafeInt(Number.MAX_SAFE_INTEGER));
 *
 * assert.isFalse(isSafeInt(Number.MAX_SAFE_INTEGER + 0.5));
 *
 * assert.isTrue(SafeInt.is(Number.MIN_SAFE_INTEGER));
 * ```
 *
 * @param value - The value to check
 * @returns `true` if the value is a safe integer, `false` otherwise
 */
export const isSafeInt = is;

/**
 * Casts a `number` to the `SafeInt` branded type.
 *
 * Validates that the value is a safe integer and returns it with the `SafeInt`
 * brand. Throws a `TypeError` otherwise.
 *
 * @example
 *
 * ```ts
 * const branded = asSafeInt(123);
 *
 * assert.isTrue(branded === 123);
 *
 * assert.isTrue(SafeInt.is(branded));
 * ```
 *
 * @param value - The value to cast
 * @returns The value as a `SafeInt`
 * @throws {TypeError} If the value is not a safe integer
 */
export const asSafeInt = castType;

/**
 * Namespace providing type-safe operations for the `SafeInt` branded type.
 *
 * The `SafeInt` type represents a safe integer. Division (`div`) uses floor
 * division.
 */
export const SafeInt = {
  /**
   * Type guard that checks if a value is a safe integer.
   *
   * @example
   *
   * ```ts
   * assert.isTrue(isSafeInt(Number.MAX_SAFE_INTEGER));
   *
   * assert.isFalse(isSafeInt(Number.MAX_SAFE_INTEGER + 0.5));
   *
   * assert.isTrue(SafeInt.is(Number.MIN_SAFE_INTEGER));
   * ```
   *
   * @param value - The value to check
   * @returns `true` if the value is a safe integer, `false` otherwise
   * @see {@link isSafeInt} for usage examples
   */
  is,

  /**
   * The smallest value representable as `SafeInt`.
   */
  MIN_VALUE,

  /**
   * The largest value representable as `SafeInt`.
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a safe integer.
   *
   * The result is non-negative and keeps the `SafeInt` brand.
   *
   * @example
   *
   * ```ts
   * const negative = asSafeInt(-900);
   *
   * const absolute = SafeInt.abs(negative);
   *
   * assert.isTrue(absolute === 900);
   *
   * assert.isTrue(SafeInt.is(absolute));
   * ```
   *
   * @param a - The safe integer value
   * @returns The absolute value as a non-negative `SafeInt`
   */
  abs,

  /**
   * Returns the smallest of the given safe integers.
   *
   * @example
   *
   * ```ts
   * const smallest = SafeInt.min(asSafeInt(25), asSafeInt(-14), asSafeInt(99));
   *
   * assert.isTrue(smallest === -14);
   * ```
   *
   * @param values - The safe integers to compare (at least one required)
   * @returns The smallest value as a `SafeInt`
   */
  min: min_,

  /**
   * Returns the largest of the given safe integers.
   *
   * @example
   *
   * ```ts
   * const largest = SafeInt.max(asSafeInt(25), asSafeInt(-14), asSafeInt(99));
   *
   * assert.isTrue(largest === 99);
   * ```
   *
   * @param values - The safe integers to compare (at least one required)
   * @returns The largest value as a `SafeInt`
   */
  max: max_,

  /**
   * Clamps a `number` into the `SafeInt` range, rounding to the nearest integer
   * and constraining the result to `[MIN_VALUE, MAX_VALUE]`.
   *
   * @example
   *
   * ```ts
   * const aboveRange = SafeInt.clamp(1e20);
   *
   * const withinRange = SafeInt.clamp(123);
   *
   * const belowRange = SafeInt.clamp(-1e20);
   *
   * assert.isTrue(aboveRange === Number.MAX_SAFE_INTEGER);
   *
   * assert.isTrue(withinRange === 123);
   *
   * assert.isTrue(belowRange === Number.MIN_SAFE_INTEGER);
   * ```
   *
   * @param value - The value to clamp
   * @returns The clamped value as a `SafeInt`
   */
  clamp,

  /**
   * Generates a random `SafeInt` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @example
   *
   * ```ts
   * const min = asSafeInt(-10);
   *
   * const max = asSafeInt(10);
   *
   * const randomValue = SafeInt.random(min, max);
   *
   * assert.isTrue(SafeInt.is(randomValue));
   *
   * assert.isTrue(randomValue >= -10 && randomValue <= 10);
   * ```
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `SafeInt` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `SafeInt` (floored to
   * an integer).
   *
   * @example
   *
   * ```ts
   * const base = asSafeInt(3);
   *
   * const exponent = asSafeInt(5);
   *
   * const power = SafeInt.pow(base, exponent);
   *
   * assert.isTrue(power === 243);
   *
   * assert.isTrue(SafeInt.is(power));
   * ```
   *
   * @param a - The base safe integer
   * @param b - The exponent safe integer
   * @returns `a ** b` as a `SafeInt`
   */
  pow,

  /**
   * Adds two safe integers, returning `a + b` as a `SafeInt`.
   *
   * @example
   *
   * ```ts
   * const sum = SafeInt.add(asSafeInt(9), asSafeInt(4));
   *
   * assert.isTrue(sum === 13);
   *
   * assert.isTrue(SafeInt.is(sum));
   * ```
   *
   * @param a - The first safe integer
   * @param b - The second safe integer
   * @returns The sum of `a` and `b` as a `SafeInt`
   */
  add,

  /**
   * Subtracts two safe integers, returning `a - b` as a `SafeInt`.
   *
   * @example
   *
   * ```ts
   * const difference = SafeInt.sub(asSafeInt(9), asSafeInt(14));
   *
   * assert.isTrue(difference === -5);
   *
   * assert.isTrue(SafeInt.is(difference));
   * ```
   *
   * @param a - The first safe integer
   * @param b - The second safe integer
   * @returns The difference of `a` and `b` as a `SafeInt`
   */
  sub,

  /**
   * Multiplies two safe integers, returning `a * b` as a `SafeInt`.
   *
   * @example
   *
   * ```ts
   * const product = SafeInt.mul(asSafeInt(-8), asSafeInt(7));
   *
   * assert.isTrue(product === -56);
   *
   * assert.isTrue(SafeInt.is(product));
   * ```
   *
   * @param a - The first safe integer
   * @param b - The second safe integer
   * @returns The product of `a` and `b` as a `SafeInt`
   */
  mul,

  /**
   * Divides two safe integers using floor division (`⌊a / b⌋`): the result is
   * `a / b` rounded toward negative infinity, as a `SafeInt`.
   *
   * @example
   *
   * ```ts
   * const quotient = SafeInt.div(asSafeInt(-17), asSafeInt(5));
   *
   * assert.isTrue(quotient === -4);
   *
   * assert.isTrue(SafeInt.is(quotient));
   * ```
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as a `SafeInt`
   */
  div,
} as const;

expectType<
  keyof typeof SafeInt,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('=');

expectType<
  typeof SafeInt,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('<=');
