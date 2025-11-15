import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = Uint32;

const typeNameInMessage = 'a non-negative integer less than 2^32';

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
  MAX_VALUE: 2 ** 32 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a Uint32 (32-bit unsigned integer in the range [0,
 * 2^32)).
 *
 * @param value The value to check.
 * @returns `true` if the value is a Uint32, `false` otherwise.
 */
export const isUint32 = is;

/**
 * Casts a number to a Uint32 type.
 *
 * @param value The value to cast.
 * @returns The value as a Uint32 type.
 * @throws {TypeError} If the value is not a non-negative integer less than
 *   2^32.
 */
export const asUint32 = castType;

/**
 * Utility functions for working with Uint32 (32-bit unsigned integer) branded
 * types. Provides type-safe operations that ensure results remain within the
 * valid range [0, 2^32). All arithmetic operations are clamped to maintain the
 * Uint32 constraint.
 */
export const Uint32 = {
  /**
   * Type guard that checks if a value is a 32-bit unsigned integer.
   *
   * @param value - The value to check
   * @returns `true` if the value is within the range [0, 2^32), `false`
   *   otherwise
   */
  is,

  /**
   * The minimum value for a Uint32.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a Uint32.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the minimum of multiple Uint32 values.
   *
   * @param values - The Uint32 values to compare
   * @returns The smallest value as a Uint32
   */
  min: min_,

  /**
   * Returns the maximum of multiple Uint32 values.
   *
   * @param values - The Uint32 values to compare
   * @returns The largest value as a Uint32
   */
  max: max_,

  /**
   * Clamps a Uint32 to be within the specified range.
   *
   * @param value - The value to clamp
   * @param min - The minimum value
   * @param max - The maximum value
   * @returns The clamped value as a Uint32
   */
  clamp,

  /**
   * Generates a random Uint32 value.
   *
   * @returns A random Uint32 value within [0, 2^32)
   */
  random,

  /**
   * Raises a Uint32 to a power, with result clamped to [0, 2^32).
   *
   * @param a - The base Uint32
   * @param b - The exponent Uint32
   * @returns `a ** b` as a Uint32, clamped to valid range
   */
  pow,

  /**
   * Adds two Uint32 values, with result clamped to [0, 2^32).
   *
   * @param a - First Uint32
   * @param b - Second Uint32
   * @returns `a + b` as a Uint32, clamped to valid range
   */
  add,

  /**
   * Subtracts two Uint32 values, with result clamped to [0, 2^32).
   *
   * @param a - First Uint32
   * @param b - Second Uint32
   * @returns `a - b` as a Uint32, clamped to valid range (minimum 0)
   */
  sub,

  /**
   * Multiplies two Uint32 values, with result clamped to [0, 2^32).
   *
   * @param a - First Uint32
   * @param b - Second Uint32
   * @returns `a * b` as a Uint32, clamped to valid range
   */
  mul,

  /**
   * Divides two Uint32 values using floor division, with result clamped to [0,
   * 2^32).
   *
   * @param a - The dividend Uint32
   * @param b - The divisor Uint32
   * @returns `⌊a / b⌋` as a Uint32, clamped to valid range
   */
  div,
} as const;

expectType<
  keyof typeof Uint32,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('=');

expectType<
  typeof Uint32,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('<=');
