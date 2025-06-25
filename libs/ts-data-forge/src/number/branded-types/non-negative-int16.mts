import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = NonNegativeInt16;

const typeNameInMessage = 'a non-negative integer in [0, 2^15)';

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
  0,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 0,
  MAX_VALUE: 2 ** 15 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a NonNegativeInt16 (16-bit non-negative signed integer in the range [0, 2^15)).
 * @param value The value to check.
 * @returns `true` if the value is a NonNegativeInt16, `false` otherwise.
 */
export const isNonNegativeInt16 = is;

/**
 * Casts a number to a NonNegativeInt16 type.
 * @param value The value to cast.
 * @returns The value as a NonNegativeInt16 type.
 * @throws {TypeError} If the value is not a non-negative integer in [0, 2^15).
 * @example
 * ```typescript
 * const x = asNonNegativeInt16(1000); // NonNegativeInt16
 * const y = asNonNegativeInt16(0); // NonNegativeInt16
 * // asNonNegativeInt16(-1); // throws TypeError
 * // asNonNegativeInt16(32768); // throws TypeError
 * ```
 */
export const asNonNegativeInt16 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 16-bit non-negative integers.
 *
 * All operations automatically clamp results to the valid NonNegativeInt16 range [0, 32767].
 * This ensures that all arithmetic maintains the 16-bit non-negative integer constraint,
 * with negative results clamped to 0 and overflow results clamped to MAX_VALUE.
 *
 * @example
 * ```typescript
 * const a = asNonNegativeInt16(30000);
 * const b = asNonNegativeInt16(5000);
 *
 * // Arithmetic operations with automatic clamping
 * const sum = NonNegativeInt16.add(a, b);       // NonNegativeInt16 (32767 - clamped to MAX_VALUE)
 * const diff = NonNegativeInt16.sub(a, b);      // NonNegativeInt16 (25000)
 * const reverseDiff = NonNegativeInt16.sub(b, a); // NonNegativeInt16 (0 - clamped to MIN_VALUE)
 * const product = NonNegativeInt16.mul(a, b);   // NonNegativeInt16 (32767 - clamped due to overflow)
 *
 * // Range operations
 * const clamped = NonNegativeInt16.clamp(-100);     // NonNegativeInt16 (0)
 * const minimum = NonNegativeInt16.min(a, b);       // NonNegativeInt16 (5000)
 * const maximum = NonNegativeInt16.max(a, b);       // NonNegativeInt16 (30000)
 *
 * // Utility operations
 * const random = NonNegativeInt16.random();         // NonNegativeInt16 (random value in [0, 32767])
 * const power = NonNegativeInt16.pow(asNonNegativeInt16(2), asNonNegativeInt16(10)); // NonNegativeInt16 (1024)
 * ```
 */
export const NonNegativeInt16 = {
  /**
   * Type guard to check if a value is a NonNegativeInt16.
   * @param value The value to check.
   * @returns `true` if the value is a 16-bit non-negative integer, `false` otherwise.
   */
  is,

  /**
   * The minimum value for a 16-bit non-negative integer.
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 16-bit non-negative integer.
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two NonNegativeInt16 values.
   * @param a The first NonNegativeInt16.
   * @param b The second NonNegativeInt16.
   * @returns The minimum value as a NonNegativeInt16.
   */
  min: min_,

  /**
   * Returns the larger of two NonNegativeInt16 values.
   * @param a The first NonNegativeInt16.
   * @param b The second NonNegativeInt16.
   * @returns The maximum value as a NonNegativeInt16.
   */
  max: max_,

  /**
   * Clamps a number to the NonNegativeInt16 range.
   * @param value The number to clamp.
   * @returns The value clamped to [0, 32767] as a NonNegativeInt16.
   */
  clamp,

  /**
   * Generates a random NonNegativeInt16 value within the valid range.
   * @returns A random NonNegativeInt16 between 0 and 32767.
   */
  random,

  /**
   * Raises a NonNegativeInt16 to the power of another NonNegativeInt16.
   * @param a The base NonNegativeInt16.
   * @param b The exponent NonNegativeInt16.
   * @returns `a ** b` clamped to [0, 32767] as a NonNegativeInt16.
   */
  pow,

  /**
   * Adds two NonNegativeInt16 values.
   * @param a The first NonNegativeInt16.
   * @param b The second NonNegativeInt16.
   * @returns `a + b` clamped to [0, 32767] as a NonNegativeInt16.
   */
  add,

  /**
   * Subtracts one NonNegativeInt16 from another.
   * @param a The minuend NonNegativeInt16.
   * @param b The subtrahend NonNegativeInt16.
   * @returns `a - b` clamped to [0, 32767] as a NonNegativeInt16 (minimum 0).
   */
  sub,

  /**
   * Multiplies two NonNegativeInt16 values.
   * @param a The first NonNegativeInt16.
   * @param b The second NonNegativeInt16.
   * @returns `a * b` clamped to [0, 32767] as a NonNegativeInt16.
   */
  mul,

  /**
   * Divides one NonNegativeInt16 by another using floor division.
   * @param a The dividend NonNegativeInt16.
   * @param b The divisor NonNegativeInt16.
   * @returns `⌊a / b⌋` clamped to [0, 32767] as a NonNegativeInt16.
   */
  div,
} as const;

expectType<
  keyof typeof NonNegativeInt16,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('=');

expectType<
  typeof NonNegativeInt16,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('<=');
