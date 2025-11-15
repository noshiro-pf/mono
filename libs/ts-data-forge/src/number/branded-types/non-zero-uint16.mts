import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = NonZeroUint16;

const typeNameInMessage = 'a non-zero integer in [1, 2^16)';

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
  randomNonZero: random,
  sub,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  1,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  nonZero: true,
  MIN_VALUE: 1,
  MAX_VALUE: 2 ** 16 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a NonZeroUint16 (16-bit non-zero unsigned integer in
 * the range [1, 2^16)).
 *
 * @param value The value to check.
 * @returns `true` if the value is a NonZeroUint16, `false` otherwise.
 */
export const isNonZeroUint16 = is;
/**
 * Casts a number to a NonZeroUint16 type.
 *
 * @param value The value to cast.
 * @returns The value as a NonZeroUint16 type.
 * @throws {TypeError} If the value is not a non-zero integer in [1, 2^16).
 */
export const asNonZeroUint16 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 16-bit non-zero
 * unsigned integers.
 *
 * All operations automatically clamp results to the valid NonZeroUint16 range
 * [1, 65535]. This ensures that all arithmetic maintains the 16-bit non-zero
 * unsigned integer constraint, with results below 1 clamped to MIN_VALUE and
 * overflow results clamped to MAX_VALUE.
 */
export const NonZeroUint16 = {
  /**
   * Type guard to check if a value is a NonZeroUint16.
   *
   * @param value The value to check.
   * @returns `true` if the value is a 16-bit non-zero unsigned integer, `false`
   *   otherwise.
   */
  is,

  /**
   * The minimum value for a 16-bit non-zero unsigned integer.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 16-bit non-zero unsigned integer.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two NonZeroUint16 values.
   *
   * @param a The first NonZeroUint16.
   * @param b The second NonZeroUint16.
   * @returns The minimum value as a NonZeroUint16.
   */
  min: min_,

  /**
   * Returns the larger of two NonZeroUint16 values.
   *
   * @param a The first NonZeroUint16.
   * @param b The second NonZeroUint16.
   * @returns The maximum value as a NonZeroUint16.
   */
  max: max_,

  /**
   * Clamps a number to the NonZeroUint16 range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to [1, 65535] as a NonZeroUint16.
   */
  clamp,

  /**
   * Generates a random NonZeroUint16 value within the valid range.
   *
   * @returns A random NonZeroUint16 between 1 and 65535.
   */
  random,

  /**
   * Raises a NonZeroUint16 to the power of another NonZeroUint16.
   *
   * @param a The base NonZeroUint16.
   * @param b The exponent NonZeroUint16.
   * @returns `a ** b` clamped to [1, 65535] as a NonZeroUint16.
   */
  pow,

  /**
   * Adds two NonZeroUint16 values.
   *
   * @param a The first NonZeroUint16.
   * @param b The second NonZeroUint16.
   * @returns `a + b` clamped to [1, 65535] as a NonZeroUint16.
   */
  add,

  /**
   * Subtracts one NonZeroUint16 from another.
   *
   * @param a The minuend NonZeroUint16.
   * @param b The subtrahend NonZeroUint16.
   * @returns `a - b` clamped to [1, 65535] as a NonZeroUint16 (minimum 1).
   */
  sub,

  /**
   * Multiplies two NonZeroUint16 values.
   *
   * @param a The first NonZeroUint16.
   * @param b The second NonZeroUint16.
   * @returns `a * b` clamped to [1, 65535] as a NonZeroUint16.
   */
  mul,

  /**
   * Divides one NonZeroUint16 by another using floor division.
   *
   * @param a The dividend NonZeroUint16.
   * @param b The divisor NonZeroUint16.
   * @returns `⌊a / b⌋` clamped to [1, 65535] as a NonZeroUint16.
   */
  div,
} as const;

expectType<
  keyof typeof NonZeroUint16,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('=');

expectType<
  typeof NonZeroUint16,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('<=');
