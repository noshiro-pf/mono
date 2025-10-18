import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = PositiveSafeInt;

const typeNameInMessage = 'a positive safe integer';

const {
  MIN_VALUE,
  MAX_VALUE,
  min: min_,
  max: max_,
  pow,
  add,
  sub,
  mul,
  div,
  random,
  is,
  castType,
  clamp,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  1,
  SafeUint
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 1,
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  MAX_VALUE: Number.MAX_SAFE_INTEGER as SafeUint,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a PositiveSafeInt (a positive safe integer in the range
 * [1, MAX_SAFE_INTEGER]).
 *
 * @example
 *
 * ```ts
 * assert.ok(isPositiveSafeInt(1));
 * assert.ok(isPositiveSafeInt(Number.MAX_SAFE_INTEGER));
 * assert.notOk(isPositiveSafeInt(0));
 * assert.ok(PositiveSafeInt.is(42));
 * ```
 *
 * @param value The value to check.
 * @returns `true` if the value is a PositiveSafeInt, `false` otherwise.
 */
export const isPositiveSafeInt = is;

/**
 * Casts a number to a PositiveSafeInt type.
 *
 * @example
 *
 * ```ts
 * const branded = asPositiveSafeInt(128);
 *
 * assert(branded === 128);
 * assert.ok(PositiveSafeInt.is(branded));
 * ```
 *
 * @param value The value to cast.
 * @returns The value as a PositiveSafeInt type.
 * @throws {TypeError} If the value is not a positive safe integer.
 */
export const asPositiveSafeInt = castType;

/**
 * Namespace providing type-safe arithmetic operations for positive safe
 * integers.
 *
 * All operations automatically clamp results to the positive safe integer range
 * [1, MAX_SAFE_INTEGER]. This ensures that all arithmetic maintains both the
 * positive constraint and IEEE 754 precision guarantees, preventing precision
 * loss and ensuring results are always positive.
 */
export const PositiveSafeInt = {
  /**
   * Type guard to check if a value is a PositiveSafeInt.
   *
   * @example
   *
   * ```ts
   * assert.ok(isPositiveSafeInt(1));
   * assert.ok(isPositiveSafeInt(Number.MAX_SAFE_INTEGER));
   * assert.notOk(isPositiveSafeInt(0));
   * assert.ok(PositiveSafeInt.is(42));
   * ```
   *
   * @param value The value to check.
   * @returns `true` if the value is a positive safe integer, `false` otherwise.
   * @see {@link isPositiveSafeInt} for usage examples
   */
  is,

  /**
   * The minimum value for a positive safe integer.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum safe integer value (2^53 - 1).
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two PositiveSafeInt values.
   *
   * @example
   *
   * ```ts
   * const smallest = PositiveSafeInt.min(
   *   asPositiveSafeInt(10),
   *   asPositiveSafeInt(5),
   * );
   *
   * assert(smallest === 5);
   * ```
   *
   * @param a The first PositiveSafeInt.
   * @param b The second PositiveSafeInt.
   * @returns The minimum value as a PositiveSafeInt.
   */
  min: min_,

  /**
   * Returns the larger of two PositiveSafeInt values.
   *
   * @example
   *
   * ```ts
   * const largest = PositiveSafeInt.max(
   *   asPositiveSafeInt(10),
   *   asPositiveSafeInt(5),
   * );
   *
   * assert(largest === 10);
   * ```
   *
   * @param a The first PositiveSafeInt.
   * @param b The second PositiveSafeInt.
   * @returns The maximum value as a PositiveSafeInt.
   */
  max: max_,

  /**
   * Clamps a number to the positive safe integer range.
   *
   * @example
   *
   * ```ts
   * const belowRange = PositiveSafeInt.clamp(0);
   * const withinRange = PositiveSafeInt.clamp(123);
   * const aboveRange = PositiveSafeInt.clamp(Number.MAX_SAFE_INTEGER + 10);
   *
   * assert(belowRange === 1);
   * assert(withinRange === 123);
   * assert(aboveRange === Number.MAX_SAFE_INTEGER);
   * ```
   *
   * @param value The number to clamp.
   * @returns The value clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.
   */
  clamp,

  /**
   * Generates a random PositiveSafeInt value within the valid range.
   *
   * @example
   *
   * ```ts
   * const min = asPositiveSafeInt(1);
   * const max = asPositiveSafeInt(6);
   * const randomValue = PositiveSafeInt.random(min, max);
   *
   * assert.ok(PositiveSafeInt.is(randomValue));
   * assert.ok(randomValue >= 1 && randomValue <= 6);
   * ```
   *
   * @returns A random PositiveSafeInt between 1 and MAX_SAFE_INTEGER.
   */
  random,

  /**
   * Raises a PositiveSafeInt to the power of another PositiveSafeInt.
   *
   * @example
   *
   * ```ts
   * const base = asPositiveSafeInt(3);
   * const exponent = asPositiveSafeInt(3);
   * const power = PositiveSafeInt.pow(base, exponent);
   *
   * assert(power === 27);
   * ```
   *
   * @param a The base PositiveSafeInt.
   * @param b The exponent PositiveSafeInt.
   * @returns `a ** b` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.
   */
  pow,

  /**
   * Adds two PositiveSafeInt values.
   *
   * @example
   *
   * ```ts
   * const sum = PositiveSafeInt.add(
   *   asPositiveSafeInt(1000),
   *   asPositiveSafeInt(2048),
   * );
   *
   * assert(sum === 3048);
   * assert.ok(PositiveSafeInt.is(sum));
   * ```
   *
   * @param a The first PositiveSafeInt.
   * @param b The second PositiveSafeInt.
   * @returns `a + b` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.
   */
  add,

  /**
   * Subtracts one PositiveSafeInt from another.
   *
   * @example
   *
   * ```ts
   * const difference = PositiveSafeInt.sub(
   *   asPositiveSafeInt(10),
   *   asPositiveSafeInt(20),
   * );
   *
   * assert(difference === 1);
   * assert.ok(PositiveSafeInt.is(difference));
   * ```
   *
   * @param a The minuend PositiveSafeInt.
   * @param b The subtrahend PositiveSafeInt.
   * @returns `a - b` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt
   *   (minimum 1).
   */
  sub,

  /**
   * Multiplies two PositiveSafeInt values.
   *
   * @example
   *
   * ```ts
   * const product = PositiveSafeInt.mul(
   *   asPositiveSafeInt(50),
   *   asPositiveSafeInt(20),
   * );
   *
   * assert(product === 1000);
   * assert.ok(PositiveSafeInt.is(product));
   * ```
   *
   * @param a The first PositiveSafeInt.
   * @param b The second PositiveSafeInt.
   * @returns `a * b` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.
   */
  mul,

  /**
   * Divides one PositiveSafeInt by another using floor division.
   *
   * @example
   *
   * ```ts
   * const quotient = PositiveSafeInt.div(
   *   asPositiveSafeInt(25),
   *   asPositiveSafeInt(4),
   * );
   * const clamped = PositiveSafeInt.div(
   *   asPositiveSafeInt(5),
   *   asPositiveSafeInt(50),
   * );
   *
   * assert(quotient === 6);
   * assert(clamped === 1);
   * ```
   *
   * @param a The dividend PositiveSafeInt.
   * @param b The divisor PositiveSafeInt.
   * @returns `⌊a / b⌋` clamped to [1, MAX_SAFE_INTEGER] as a PositiveSafeInt.
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
