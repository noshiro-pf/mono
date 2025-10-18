import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = Int32;

const typeNameInMessage = 'an integer in [-2^31, 2^31)';

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
  MIN_VALUE: -(2 ** 31),
  MAX_VALUE: 2 ** 31 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is an Int32 (32-bit signed integer in the range [-2^31,
 * 2^31)).
 *
 * @param value The value to check.
 * @returns `true` if the value is an Int32, `false` otherwise.
 */
export const isInt32 = is;

/**
 * Casts a number to an Int32 type.
 *
 * @param value The value to cast.
 * @returns The value as an Int32 type.
 * @throws {TypeError} If the value is not an integer in [-2^31, 2^31).
 */
export const asInt32 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 32-bit signed
 * integers.
 *
 * All operations automatically clamp results to the valid Int32 range
 * [-2147483648, 2147483647]. This ensures that all arithmetic maintains the
 * 32-bit signed integer constraint, preventing overflow.
 */
export const Int32 = {
  /**
   * Type guard to check if a value is an Int32.
   *
   * @param value The value to check.
   * @returns `true` if the value is a 32-bit signed integer, `false` otherwise.
   */
  is,

  /**
   * The minimum value for a 32-bit signed integer.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 32-bit signed integer.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a 32-bit signed integer.
   *
   * @param a The Int32 value.
   * @returns The absolute value as an Int32, clamped to valid range.
   */
  abs,

  /**
   * Returns the smaller of two Int32 values.
   *
   * @param a The first Int32.
   * @param b The second Int32.
   * @returns The minimum value as an Int32.
   */
  min: min_,

  /**
   * Returns the larger of two Int32 values.
   *
   * @param a The first Int32.
   * @param b The second Int32.
   * @returns The maximum value as an Int32.
   */
  max: max_,

  /**
   * Clamps a number to the Int32 range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to [-2147483648, 2147483647] as an Int32.
   */
  clamp,

  /**
   * Generates a random Int32 value within the valid range.
   *
   * @returns A random Int32 between MIN_VALUE and MAX_VALUE.
   */
  random,

  /**
   * Raises an Int32 to the power of another Int32.
   *
   * @param a The base Int32.
   * @param b The exponent Int32.
   * @returns `a ** b` clamped to [-2147483648, 2147483647] as an Int32.
   */
  pow,

  /**
   * Adds two Int32 values.
   *
   * @param a The first Int32.
   * @param b The second Int32.
   * @returns `a + b` clamped to [-2147483648, 2147483647] as an Int32.
   */
  add,

  /**
   * Subtracts one Int32 from another.
   *
   * @param a The minuend Int32.
   * @param b The subtrahend Int32.
   * @returns `a - b` clamped to [-2147483648, 2147483647] as an Int32.
   */
  sub,

  /**
   * Multiplies two Int32 values.
   *
   * @param a The first Int32.
   * @param b The second Int32.
   * @returns `a * b` clamped to [-2147483648, 2147483647] as an Int32.
   */
  mul,

  /**
   * Divides one Int32 by another using floor division.
   *
   * @param a The dividend Int32.
   * @param b The divisor Int32.
   * @returns `⌊a / b⌋` clamped to [-2147483648, 2147483647] as an Int32.
   */
  div,
} as const;

expectType<
  keyof typeof Int32,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('=');

expectType<
  typeof Int32,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('<=');
