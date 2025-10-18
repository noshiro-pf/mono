import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = SafeUint;

const typeNameInMessage = 'a non-negative safe integer';

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
  SafeUint
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 0,
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  MAX_VALUE: Number.MAX_SAFE_INTEGER as SafeUint,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a SafeUint.
 *
 * @param value The value to check.
 * @returns `true` if the value is a SafeUint, `false` otherwise.
 */
export const isSafeUint = is;

/**
 * Casts a number to a SafeUint type.
 *
 * @param value The value to cast.
 * @returns The value as a SafeUint type.
 * @throws {TypeError} If the value is not a non-negative safe integer.
 */
export const asSafeUint = castType;

/**
 * Namespace providing type-safe arithmetic operations for safe unsigned
 * integers.
 *
 * All operations automatically clamp results to the safe unsigned integer range
 * [0, MAX_SAFE_INTEGER]. This ensures that all arithmetic maintains both the
 * non-negative constraint and IEEE 754 precision guarantees, preventing
 * precision loss while ensuring results are never negative.
 */
export const SafeUint = {
  /**
   * Type guard to check if a value is a SafeUint.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-negative safe integer, `false`
   *   otherwise.
   */
  is,

  /**
   * The minimum value for a safe unsigned integer.
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
   * Returns the smaller of two SafeUint values.
   *
   * @param a The first SafeUint.
   * @param b The second SafeUint.
   * @returns The minimum value as a SafeUint.
   */
  min: min_,

  /**
   * Returns the larger of two SafeUint values.
   *
   * @param a The first SafeUint.
   * @param b The second SafeUint.
   * @returns The maximum value as a SafeUint.
   */
  max: max_,

  /**
   * Clamps a number to the safe unsigned integer range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.
   */
  clamp,

  /**
   * Generates a random SafeUint value within the valid range.
   *
   * @returns A random SafeUint between 0 and MAX_SAFE_INTEGER.
   */
  random,

  /**
   * Raises a SafeUint to the power of another SafeUint.
   *
   * @param a The base SafeUint.
   * @param b The exponent SafeUint.
   * @returns `a ** b` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.
   */
  pow,

  /**
   * Adds two SafeUint values.
   *
   * @param a The first SafeUint.
   * @param b The second SafeUint.
   * @returns `a + b` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.
   */
  add,

  /**
   * Subtracts one SafeUint from another.
   *
   * @param a The minuend SafeUint.
   * @param b The subtrahend SafeUint.
   * @returns `a - b` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint (minimum
   *   0).
   */
  sub,

  /**
   * Multiplies two SafeUint values.
   *
   * @param a The first SafeUint.
   * @param b The second SafeUint.
   * @returns `a * b` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.
   */
  mul,

  /**
   * Divides one SafeUint by another using floor division.
   *
   * @param a The dividend SafeUint.
   * @param b The divisor SafeUint.
   * @returns `⌊a / b⌋` clamped to [0, MAX_SAFE_INTEGER] as a SafeUint.
   */
  div,
} as const;

expectType<
  keyof typeof SafeUint,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('=');

expectType<
  typeof SafeUint,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('<=');
