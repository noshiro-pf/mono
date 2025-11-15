import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = Uint16;

const typeNameInMessage = 'a non-negative integer less than 2^16';

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
  0,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 0,
  MAX_VALUE: 2 ** 16 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a Uint16 (16-bit unsigned integer in the range [0,
 * 2^16)).
 *
 * @param value The value to check.
 * @returns `true` if the value is a Uint16, `false` otherwise.
 */
export const isUint16 = is;
/**
 * Casts a number to a Uint16 type.
 *
 * @param value The value to cast.
 * @returns The value as a Uint16 type.
 * @throws {TypeError} If the value is not a non-negative integer less than
 *   2^16.
 */
export const asUint16 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 16-bit unsigned
 * integers.
 *
 * All operations automatically clamp results to the valid Uint16 range [0,
 * 65535]. This ensures that all arithmetic maintains the 16-bit unsigned
 * integer constraint, with negative results clamped to 0 and overflow results
 * clamped to MAX_VALUE.
 */
export const Uint16 = {
  /**
   * Type guard to check if a value is a Uint16.
   *
   * @param value The value to check.
   * @returns `true` if the value is a 16-bit unsigned integer, `false`
   *   otherwise.
   */
  is,

  /**
   * The minimum value for a 16-bit unsigned integer.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 16-bit unsigned integer.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two Uint16 values.
   *
   * @param a The first Uint16.
   * @param b The second Uint16.
   * @returns The minimum value as a Uint16.
   */
  min: min_,

  /**
   * Returns the larger of two Uint16 values.
   *
   * @param a The first Uint16.
   * @param b The second Uint16.
   * @returns The maximum value as a Uint16.
   */
  max: max_,

  /**
   * Clamps a number to the Uint16 range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to [0, 65535] as a Uint16.
   */
  clamp,

  /**
   * Generates a random Uint16 value within the valid range.
   *
   * @returns A random Uint16 between 0 and 65535.
   */
  random,

  /**
   * Raises a Uint16 to the power of another Uint16.
   *
   * @param a The base Uint16.
   * @param b The exponent Uint16.
   * @returns `a ** b` clamped to [0, 65535] as a Uint16.
   */
  pow,

  /**
   * Adds two Uint16 values.
   *
   * @param a The first Uint16.
   * @param b The second Uint16.
   * @returns `a + b` clamped to [0, 65535] as a Uint16.
   */
  add,

  /**
   * Subtracts one Uint16 from another.
   *
   * @param a The minuend Uint16.
   * @param b The subtrahend Uint16.
   * @returns `a - b` clamped to [0, 65535] as a Uint16 (minimum 0).
   */
  sub,

  /**
   * Multiplies two Uint16 values.
   *
   * @param a The first Uint16.
   * @param b The second Uint16.
   * @returns `a * b` clamped to [0, 65535] as a Uint16.
   */
  mul,

  /**
   * Divides one Uint16 by another using floor division.
   *
   * @param a The dividend Uint16.
   * @param b The divisor Uint16.
   * @returns `⌊a / b⌋` clamped to [0, 65535] as a Uint16.
   */
  div,
} as const;

expectType<
  keyof typeof Uint16,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('=');

expectType<
  typeof Uint16,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('<=');
