import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = PositiveUint32;

const typeNameInMessage = 'a positive integer in [1, 2^32)';

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
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 1,
  MAX_VALUE: 2 ** 32 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a PositiveUint32 (32-bit positive unsigned integer in
 * the range [1, 2^32)).
 *
 * @param value The value to check.
 * @returns `true` if the value is a PositiveUint32, `false` otherwise.
 */
export const isPositiveUint32 = is;

/**
 * Casts a number to a PositiveUint32 type.
 *
 * @param value The value to cast.
 * @returns The value as a PositiveUint32 type.
 * @throws {TypeError} If the value is not a positive integer in [1, 2^32).
 */
export const asPositiveUint32 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 32-bit positive
 * unsigned integers.
 *
 * All operations automatically clamp results to the valid PositiveUint32 range
 * [1, 4294967295]. This ensures that all arithmetic maintains the 32-bit
 * positive unsigned integer constraint, with results below 1 clamped to
 * MIN_VALUE and overflow results clamped to MAX_VALUE.
 */
export const PositiveUint32 = {
  /**
   * Type guard to check if a value is a PositiveUint32.
   *
   * @param value The value to check.
   * @returns `true` if the value is a 32-bit positive unsigned integer, `false`
   *   otherwise.
   */
  is,

  /**
   * The minimum value for a 32-bit positive unsigned integer.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 32-bit positive unsigned integer.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two PositiveUint32 values.
   *
   * @param a The first PositiveUint32.
   * @param b The second PositiveUint32.
   * @returns The minimum value as a PositiveUint32.
   */
  min: min_,

  /**
   * Returns the larger of two PositiveUint32 values.
   *
   * @param a The first PositiveUint32.
   * @param b The second PositiveUint32.
   * @returns The maximum value as a PositiveUint32.
   */
  max: max_,

  /**
   * Clamps a number to the PositiveUint32 range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to [1, 4294967295] as a PositiveUint32.
   */
  clamp,

  /**
   * Generates a random PositiveUint32 value within the valid range.
   *
   * @returns A random PositiveUint32 between 1 and 4294967295.
   */
  random,

  /**
   * Raises a PositiveUint32 to the power of another PositiveUint32.
   *
   * @param a The base PositiveUint32.
   * @param b The exponent PositiveUint32.
   * @returns `a ** b` clamped to [1, 4294967295] as a PositiveUint32.
   */
  pow,

  /**
   * Adds two PositiveUint32 values.
   *
   * @param a The first PositiveUint32.
   * @param b The second PositiveUint32.
   * @returns `a + b` clamped to [1, 4294967295] as a PositiveUint32.
   */
  add,

  /**
   * Subtracts one PositiveUint32 from another.
   *
   * @param a The minuend PositiveUint32.
   * @param b The subtrahend PositiveUint32.
   * @returns `a - b` clamped to [1, 4294967295] as a PositiveUint32 (minimum
   *   1).
   */
  sub,

  /**
   * Multiplies two PositiveUint32 values.
   *
   * @param a The first PositiveUint32.
   * @param b The second PositiveUint32.
   * @returns `a * b` clamped to [1, 4294967295] as a PositiveUint32.
   */
  mul,

  /**
   * Divides one PositiveUint32 by another using floor division.
   *
   * @param a The dividend PositiveUint32.
   * @param b The divisor PositiveUint32.
   * @returns `⌊a / b⌋` clamped to [1, 4294967295] as a PositiveUint32.
   */
  div,
} as const;

expectType<
  keyof typeof PositiveUint32,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('=');

expectType<
  typeof PositiveUint32,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('<=');
