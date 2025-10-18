import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = SafeInt;

const typeNameInMessage = 'a safe integer';

const {
  MIN_VALUE,
  MAX_VALUE,
  abs,
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
  SafeInt,
  SafeUint
>({
  integerOrSafeInteger: 'SafeInteger',
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  MIN_VALUE: Number.MIN_SAFE_INTEGER as SafeInt,
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  MAX_VALUE: Number.MAX_SAFE_INTEGER as SafeUint,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a safe integer.
 *
 * A safe integer is an integer that can be exactly represented in JavaScript
 * without precision loss. The range is [±(2^53 - 1)].
 *
 * @example
 *
 * ```ts
 * assert.ok(isSafeInt(Number.MAX_SAFE_INTEGER));
 * assert.notOk(isSafeInt(Number.MAX_SAFE_INTEGER + 0.5));
 * assert.ok(SafeInt.is(Number.MIN_SAFE_INTEGER));
 * ```
 *
 * @param value - The value to check
 * @returns `true` if the value is a safe integer, `false` otherwise
 */
export const isSafeInt = is;

/**
 * Casts a number to a SafeInt branded type.
 *
 * This function validates that the input is a safe integer (within ±(2^53 - 1))
 * and returns it with the SafeInt brand. This ensures type safety for
 * operations that require precise integer arithmetic.
 *
 * @example
 *
 * ```ts
 * const branded = asSafeInt(123);
 *
 * assert(branded === 123);
 * assert.ok(SafeInt.is(branded));
 * ```
 *
 * @param value - The value to cast
 * @returns The value as a SafeInt branded type
 * @throws {TypeError} If the value is not a safe integer
 */
export const asSafeInt = castType;

/**
 * Namespace providing type-safe operations for SafeInt branded types.
 *
 * SafeInt represents integers that can be exactly represented in JavaScript's
 * number type without precision loss. The range is [±(2^53 - 1)], which covers
 * approximately ±9 quadrillion.
 *
 * All operations automatically clamp results to stay within the safe range,
 * preventing precision loss that occurs with larger integers. This makes
 * SafeInt ideal for:
 *
 * - Financial calculations requiring exact cents
 * - Database IDs and counters
 * - Array indices and sizes
 * - Any integer arithmetic requiring precision guarantees
 */
export const SafeInt = {
  /**
   * Type guard that checks if a value is a safe integer.
   *
   * @example
   *
   * ```ts
   * assert.ok(isSafeInt(Number.MAX_SAFE_INTEGER));
   * assert.notOk(isSafeInt(Number.MAX_SAFE_INTEGER + 0.5));
   * assert.ok(SafeInt.is(Number.MIN_SAFE_INTEGER));
   * ```
   *
   * @param value - The value to check
   * @returns `true` if the value is a safe integer, `false` otherwise
   * @see {@link isSafeInt} for usage examples
   */
  is,

  /**
   * The minimum safe integer value (-(2^53 - 1)).
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
   * Returns the absolute value of a safe integer.
   *
   * Note: `Math.abs(MIN_SAFE_INTEGER)` would exceed `MAX_SAFE_INTEGER`, so this
   * function clamps the result to maintain the safe integer guarantee.
   *
   * @example
   *
   * ```ts
   * const negative = asSafeInt(-900);
   * const absolute = SafeInt.abs(negative);
   *
   * assert(absolute === 900);
   * assert.ok(SafeInt.is(absolute));
   * ```
   *
   * @param a - The safe integer value
   * @returns The absolute value as a SafeInt, clamped if necessary
   */
  abs,

  /**
   * Returns the minimum value from a list of safe integers.
   *
   * @example
   *
   * ```ts
   * const smallest = SafeInt.min(asSafeInt(25), asSafeInt(-14), asSafeInt(99));
   *
   * assert(smallest === -14);
   * ```
   *
   * @param values - The safe integers to compare (at least one required)
   * @returns The smallest value as a SafeInt
   */
  min: min_,

  /**
   * Returns the maximum value from a list of safe integers.
   *
   * @example
   *
   * ```ts
   * const largest = SafeInt.max(asSafeInt(25), asSafeInt(-14), asSafeInt(99));
   *
   * assert(largest === 99);
   * ```
   *
   * @param values - The safe integers to compare (at least one required)
   * @returns The largest value as a SafeInt
   */
  max: max_,

  /**
   * Clamps a number to the safe integer range.
   *
   * @example
   *
   * ```ts
   * const aboveRange = SafeInt.clamp(1e20);
   * const withinRange = SafeInt.clamp(123);
   * const belowRange = SafeInt.clamp(-1e20);
   *
   * assert(aboveRange === Number.MAX_SAFE_INTEGER);
   * assert(withinRange === 123);
   * assert(belowRange === Number.MIN_SAFE_INTEGER);
   * ```
   *
   * @param value The number to clamp.
   * @returns The value clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] as a
   *   SafeInt.
   */
  clamp,

  /**
   * Generates a random safe integer within the specified range (inclusive).
   *
   * The range is inclusive on both ends. If min > max, they are automatically
   * swapped.
   *
   * @example
   *
   * ```ts
   * const min = asSafeInt(-10);
   * const max = asSafeInt(10);
   * const randomValue = SafeInt.random(min, max);
   *
   * assert.ok(SafeInt.is(randomValue));
   * assert.ok(randomValue >= -10 && randomValue <= 10);
   * ```
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random SafeInt in the range [min, max]
   */
  random,

  /**
   * Raises a SafeInt to the power of another SafeInt.
   *
   * @example
   *
   * ```ts
   * const base = asSafeInt(3);
   * const exponent = asSafeInt(5);
   * const power = SafeInt.pow(base, exponent);
   *
   * assert(power === 243);
   * assert.ok(SafeInt.is(power));
   * ```
   *
   * @param a The base SafeInt.
   * @param b The exponent SafeInt.
   * @returns `a ** b` clamped to safe integer range as a SafeInt.
   */
  pow,

  /**
   * Adds two SafeInt values.
   *
   * @example
   *
   * ```ts
   * const sum = SafeInt.add(asSafeInt(9), asSafeInt(4));
   *
   * assert(sum === 13);
   * assert.ok(SafeInt.is(sum));
   * ```
   *
   * @param a The first SafeInt.
   * @param b The second SafeInt.
   * @returns `a + b` clamped to safe integer range as a SafeInt.
   */
  add,

  /**
   * Subtracts one SafeInt from another.
   *
   * @example
   *
   * ```ts
   * const difference = SafeInt.sub(asSafeInt(9), asSafeInt(14));
   *
   * assert(difference === -5);
   * assert.ok(SafeInt.is(difference));
   * ```
   *
   * @param a The minuend SafeInt.
   * @param b The subtrahend SafeInt.
   * @returns `a - b` clamped to safe integer range as a SafeInt.
   */
  sub,

  /**
   * Multiplies two SafeInt values.
   *
   * @example
   *
   * ```ts
   * const product = SafeInt.mul(asSafeInt(-8), asSafeInt(7));
   *
   * assert(product === -56);
   * assert.ok(SafeInt.is(product));
   * ```
   *
   * @param a The first SafeInt.
   * @param b The second SafeInt.
   * @returns `a * b` clamped to safe integer range as a SafeInt.
   */
  mul,

  /**
   * Divides one SafeInt by another using floor division.
   *
   * Performs mathematical floor division: `⌊a / b⌋`. The divisor must be
   * non-zero (enforced by type constraints).
   *
   * @example
   *
   * ```ts
   * const quotient = SafeInt.div(asSafeInt(-17), asSafeInt(5));
   *
   * assert(quotient === -4);
   * assert.ok(SafeInt.is(quotient));
   * ```
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The integer quotient as a SafeInt
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
