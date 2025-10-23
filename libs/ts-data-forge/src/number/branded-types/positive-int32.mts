import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = PositiveInt32;

const typeNameInMessage = 'a positive integer in [1, 2^31)';

const {
  MAX_VALUE,
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
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 1,
  MAX_VALUE: 2 ** 31 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a PositiveInt32 (32-bit positive signed integer in the
 * range [1, 2^31)).
 *
 * @param value The value to check.
 * @returns `true` if the value is a PositiveInt32, `false` otherwise.
 */
export const isPositiveInt32 = is;

/**
 * Casts a number to a PositiveInt32 type.
 *
 * @param value The value to cast.
 * @returns The value as a PositiveInt32 type.
 * @throws {TypeError} If the value is not a positive integer in [1, 2^31).
 */
export const asPositiveInt32 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 32-bit positive
 * integers.
 *
 * All operations automatically clamp results to the valid PositiveInt32 range
 * [1, 2147483647]. This ensures that all arithmetic maintains the 32-bit
 * positive integer constraint, with results below 1 clamped to MIN_VALUE and
 * overflow results clamped to MAX_VALUE.
 */
export const PositiveInt32 = {
  /**
   * Type guard to check if a value is a PositiveInt32.
   *
   * @param value The value to check.
   * @returns `true` if the value is a 32-bit positive integer, `false`
   *   otherwise.
   */
  is,

  /**
   * The minimum value for a 32-bit positive integer.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 32-bit positive integer.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two PositiveInt32 values.
   *
   * @param a The first PositiveInt32.
   * @param b The second PositiveInt32.
   * @returns The minimum value as a PositiveInt32.
   */
  min: min_,

  /**
   * Returns the larger of two PositiveInt32 values.
   *
   * @param a The first PositiveInt32.
   * @param b The second PositiveInt32.
   * @returns The maximum value as a PositiveInt32.
   */
  max: max_,

  /**
   * Clamps a number to the PositiveInt32 range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to [1, 2147483647] as a PositiveInt32.
   */
  clamp,

  /**
   * Generates a random PositiveInt32 value within the valid range.
   *
   * @returns A random PositiveInt32 between 1 and 2147483647.
   */
  random,

  /**
   * Raises a PositiveInt32 to the power of another PositiveInt32.
   *
   * @param a The base PositiveInt32.
   * @param b The exponent PositiveInt32.
   * @returns `a ** b` clamped to [1, 2147483647] as a PositiveInt32.
   */
  pow,

  /**
   * Adds two PositiveInt32 values.
   *
   * @param a The first PositiveInt32.
   * @param b The second PositiveInt32.
   * @returns `a + b` clamped to [1, 2147483647] as a PositiveInt32.
   */
  add,

  /**
   * Subtracts one PositiveInt32 from another.
   *
   * @param a The minuend PositiveInt32.
   * @param b The subtrahend PositiveInt32.
   * @returns `a - b` clamped to [1, 2147483647] as a PositiveInt32 (minimum 1).
   */
  sub,

  /**
   * Multiplies two PositiveInt32 values.
   *
   * @param a The first PositiveInt32.
   * @param b The second PositiveInt32.
   * @returns `a * b` clamped to [1, 2147483647] as a PositiveInt32.
   */
  mul,

  /**
   * Divides one PositiveInt32 by another using floor division.
   *
   * @param a The dividend PositiveInt32.
   * @param b The divisor PositiveInt32.
   * @returns `⌊a / b⌋` clamped to [1, 2147483647] as a PositiveInt32.
   */
  div,
} as const;

expectType<
  keyof typeof PositiveInt32,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('=');

expectType<
  typeof PositiveInt32,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('<=');
