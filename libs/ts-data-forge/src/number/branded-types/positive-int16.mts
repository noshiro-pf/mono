import { expectType } from '../../expect-type.mjs';
import { TsVerifiedInternals } from '../refined-number-utils.mjs';

type ElementType = PositiveInt16;

const typeNameInMessage = 'a positive integer in [1, 2^15)';

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
} = TsVerifiedInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  1,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 1,
  MAX_VALUE: 2 ** 15 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a PositiveInt16 (16-bit positive signed integer in the range [1, 2^15)).
 * @param value The value to check.
 * @returns `true` if the value is a PositiveInt16, `false` otherwise.
 */
export const isPositiveInt16 = is;

/**
 * Casts a number to a PositiveInt16 type.
 * @param value The value to cast.
 * @returns The value as a PositiveInt16 type.
 * @throws {TypeError} If the value is not a positive integer in [1, 2^15).
 * @example
 * ```typescript
 * const x = asPositiveInt16(1000); // PositiveInt16
 * const y = asPositiveInt16(32767); // PositiveInt16
 * // asPositiveInt16(0); // throws TypeError
 * // asPositiveInt16(-1); // throws TypeError
 * // asPositiveInt16(32768); // throws TypeError
 * ```
 */
export const asPositiveInt16 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 16-bit positive integers.
 *
 * All operations automatically clamp results to the valid PositiveInt16 range [1, 32767].
 * This ensures that all arithmetic maintains the 16-bit positive integer constraint,
 * with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.
 *
 * @example
 * ```typescript
 * const a = asPositiveInt16(30000);
 * const b = asPositiveInt16(5000);
 *
 * // Arithmetic operations with automatic clamping
 * const sum = PositiveInt16.add(a, b);       // PositiveInt16 (32767 - clamped to MAX_VALUE)
 * const diff = PositiveInt16.sub(a, b);      // PositiveInt16 (25000)
 * const reverseDiff = PositiveInt16.sub(b, a); // PositiveInt16 (1 - clamped to MIN_VALUE)
 * const product = PositiveInt16.mul(a, b);   // PositiveInt16 (32767 - clamped due to overflow)
 *
 * // Range operations
 * const clamped = PositiveInt16.clamp(0);        // PositiveInt16 (1)
 * const minimum = PositiveInt16.min(a, b);       // PositiveInt16 (5000)
 * const maximum = PositiveInt16.max(a, b);       // PositiveInt16 (30000)
 *
 * // Utility operations
 * const random = PositiveInt16.random();         // PositiveInt16 (random value in [1, 32767])
 * const power = PositiveInt16.pow(asPositiveInt16(2), asPositiveInt16(10)); // PositiveInt16 (1024)
 * ```
 */
export const PositiveInt16 = {
  /**
   * Type guard to check if a value is a PositiveInt16.
   * @param value The value to check.
   * @returns `true` if the value is a 16-bit positive integer, `false` otherwise.
   */
  is,

  /**
   * The minimum value for a 16-bit positive integer.
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 16-bit positive integer.
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two PositiveInt16 values.
   * @param a The first PositiveInt16.
   * @param b The second PositiveInt16.
   * @returns The minimum value as a PositiveInt16.
   */
  min: min_,

  /**
   * Returns the larger of two PositiveInt16 values.
   * @param a The first PositiveInt16.
   * @param b The second PositiveInt16.
   * @returns The maximum value as a PositiveInt16.
   */
  max: max_,

  /**
   * Clamps a number to the PositiveInt16 range.
   * @param value The number to clamp.
   * @returns The value clamped to [1, 32767] as a PositiveInt16.
   */
  clamp,

  /**
   * Generates a random PositiveInt16 value within the valid range.
   * @returns A random PositiveInt16 between 1 and 32767.
   */
  random,

  /**
   * Raises a PositiveInt16 to the power of another PositiveInt16.
   * @param a The base PositiveInt16.
   * @param b The exponent PositiveInt16.
   * @returns `a ** b` clamped to [1, 32767] as a PositiveInt16.
   */
  pow,

  /**
   * Adds two PositiveInt16 values.
   * @param a The first PositiveInt16.
   * @param b The second PositiveInt16.
   * @returns `a + b` clamped to [1, 32767] as a PositiveInt16.
   */
  add,

  /**
   * Subtracts one PositiveInt16 from another.
   * @param a The minuend PositiveInt16.
   * @param b The subtrahend PositiveInt16.
   * @returns `a - b` clamped to [1, 32767] as a PositiveInt16 (minimum 1).
   */
  sub,

  /**
   * Multiplies two PositiveInt16 values.
   * @param a The first PositiveInt16.
   * @param b The second PositiveInt16.
   * @returns `a * b` clamped to [1, 32767] as a PositiveInt16.
   */
  mul,

  /**
   * Divides one PositiveInt16 by another using floor division.
   * @param a The dividend PositiveInt16.
   * @param b The divisor PositiveInt16.
   * @returns `⌊a / b⌋` clamped to [1, 32767] as a PositiveInt16.
   */
  div,
} as const;

expectType<
  keyof typeof PositiveInt16,
  keyof TsVerifiedInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('=');

expectType<
  typeof PositiveInt16,
  TsVerifiedInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('<=');
