import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = Int16;

const typeNameInMessage = 'an integer in [-2^15, 2^15)';

const {
  MIN_VALUE,
  MAX_VALUE,
  min: min_,
  max: max_,
  abs,
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
  number,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: -(2 ** 15),
  MAX_VALUE: 2 ** 15 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is an Int16 (16-bit signed integer in the range [-2^15, 2^15)).
 * @param value The value to check.
 * @returns `true` if the value is an Int16, `false` otherwise.
 */
export const isInt16 = is;

/**
 * Casts a number to an Int16 type.
 * @param value The value to cast.
 * @returns The value as an Int16 type.
 * @throws {TypeError} If the value is not an integer in [-2^15, 2^15).
 * @example
 * ```typescript
 * const x = asInt16(1000); // Int16
 * const y = asInt16(-5000); // Int16
 * // asInt16(50000); // throws TypeError
 * // asInt16(1.5); // throws TypeError
 * ```
 */
export const asInt16 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 16-bit signed integers.
 *
 * All operations automatically clamp results to the valid Int16 range [-32768, 32767].
 * This ensures that all arithmetic maintains the 16-bit signed integer constraint.
 *
 * @example
 * ```typescript
 * const a = asInt16(30000);
 * const b = asInt16(5000);
 *
 * // Arithmetic operations with automatic clamping
 * const sum = Int16.add(a, b);      // Int16 (32767 - clamped to MAX_VALUE)
 * const diff = Int16.sub(a, b);     // Int16 (25000)
 * const product = Int16.mul(a, b);  // Int16 (32767 - clamped due to overflow)
 *
 * // Range operations
 * const clamped = Int16.clamp(100000);    // Int16 (32767)
 * const minimum = Int16.min(a, b);        // Int16 (5000)
 * const maximum = Int16.max(a, b);        // Int16 (30000)
 *
 * // Range constants
 * const range = Int16.MAX_VALUE - Int16.MIN_VALUE + 1; // 65536
 * ```
 */
export const Int16 = {
  /**
   * Type guard to check if a value is an Int16.
   * @param value The value to check.
   * @returns `true` if the value is a 16-bit signed integer, `false` otherwise.
   */
  is,

  /**
   * The minimum value for a 16-bit signed integer.
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 16-bit signed integer.
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a 16-bit signed integer.
   * @param a The Int16 value.
   * @returns The absolute value as an Int16, clamped to valid range.
   */
  abs,

  /**
   * Returns the smaller of two Int16 values.
   * @param a The first Int16.
   * @param b The second Int16.
   * @returns The minimum value as an Int16.
   */
  min: min_,

  /**
   * Returns the larger of two Int16 values.
   * @param a The first Int16.
   * @param b The second Int16.
   * @returns The maximum value as an Int16.
   */
  max: max_,

  /**
   * Clamps a number to the Int16 range.
   * @param value The number to clamp.
   * @returns The value clamped to [-32768, 32767] as an Int16.
   */
  clamp,

  /**
   * Generates a random Int16 value within the valid range.
   * @returns A random Int16 between MIN_VALUE and MAX_VALUE.
   */
  random,

  /**
   * Raises an Int16 to the power of another Int16.
   * @param a The base Int16.
   * @param b The exponent Int16.
   * @returns `a ** b` clamped to [-32768, 32767] as an Int16.
   */
  pow,

  /**
   * Adds two Int16 values.
   * @param a The first Int16.
   * @param b The second Int16.
   * @returns `a + b` clamped to [-32768, 32767] as an Int16.
   */
  add,

  /**
   * Subtracts one Int16 from another.
   * @param a The minuend Int16.
   * @param b The subtrahend Int16.
   * @returns `a - b` clamped to [-32768, 32767] as an Int16.
   */
  sub,

  /**
   * Multiplies two Int16 values.
   * @param a The first Int16.
   * @param b The second Int16.
   * @returns `a * b` clamped to [-32768, 32767] as an Int16.
   */
  mul,

  /**
   * Divides one Int16 by another using floor division.
   * @param a The dividend Int16.
   * @param b The divisor Int16.
   * @returns `⌊a / b⌋` clamped to [-32768, 32767] as an Int16.
   */
  div,
} as const;

expectType<
  keyof typeof Int16,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('=');

expectType<
  typeof Int16,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('<=');
