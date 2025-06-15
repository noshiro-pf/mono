import { expectType } from '../../expect-type.mjs';
import { TsVerifiedInternals } from '../refined-number-utils.mjs';

type ElementType = PositiveUint16;

const typeNameInMessage = 'a positive integer in [1, 2^16)';

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
  MAX_VALUE: 2 ** 16 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a PositiveUint16 (16-bit positive unsigned integer in the range [1, 2^16)).
 * @param value The value to check.
 * @returns `true` if the value is a PositiveUint16, `false` otherwise.
 */
export const isPositiveUint16 = is;

/**
 * Casts a number to a PositiveUint16 type.
 * @param value The value to cast.
 * @returns The value as a PositiveUint16 type.
 * @throws {TypeError} If the value is not a positive integer in [1, 2^16).
 * @example
 * ```typescript
 * const x = asPositiveUint16(1000); // PositiveUint16
 * const y = asPositiveUint16(65535); // PositiveUint16
 * // asPositiveUint16(0); // throws TypeError
 * // asPositiveUint16(-1); // throws TypeError
 * // asPositiveUint16(65536); // throws TypeError
 * ```
 */
export const asPositiveUint16 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 16-bit positive unsigned integers.
 *
 * All operations automatically clamp results to the valid PositiveUint16 range [1, 65535].
 * This ensures that all arithmetic maintains the 16-bit positive unsigned integer constraint,
 * with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.
 *
 * @example
 * ```typescript
 * const a = asPositiveUint16(60000);
 * const b = asPositiveUint16(10000);
 *
 * // Arithmetic operations with automatic clamping and positive constraint
 * const sum = PositiveUint16.add(a, b);       // PositiveUint16 (65535 - clamped to MAX_VALUE)
 * const diff = PositiveUint16.sub(a, b);      // PositiveUint16 (50000)
 * const reverseDiff = PositiveUint16.sub(b, a); // PositiveUint16 (1 - clamped to MIN_VALUE)
 * const product = PositiveUint16.mul(a, b);   // PositiveUint16 (65535 - clamped due to overflow)
 *
 * // Range operations (maintaining positive constraint)
 * const clamped = PositiveUint16.clamp(-100);     // PositiveUint16 (1)
 * const minimum = PositiveUint16.min(a, b);       // PositiveUint16 (10000)
 * const maximum = PositiveUint16.max(a, b);       // PositiveUint16 (60000)
 *
 * // Utility operations
 * const random = PositiveUint16.random();         // PositiveUint16 (random value in [1, 65535])
 * const power = PositiveUint16.pow(asPositiveUint16(2), asPositiveUint16(10)); // PositiveUint16 (1024)
 * ```
 */
export const PositiveUint16 = {
  /**
   * Type guard to check if a value is a PositiveUint16.
   * @param value The value to check.
   * @returns `true` if the value is a 16-bit positive unsigned integer, `false` otherwise.
   */
  is,

  /**
   * The minimum value for a 16-bit positive unsigned integer.
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 16-bit positive unsigned integer.
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two PositiveUint16 values.
   * @param a The first PositiveUint16.
   * @param b The second PositiveUint16.
   * @returns The minimum value as a PositiveUint16.
   */
  min: min_,

  /**
   * Returns the larger of two PositiveUint16 values.
   * @param a The first PositiveUint16.
   * @param b The second PositiveUint16.
   * @returns The maximum value as a PositiveUint16.
   */
  max: max_,

  /**
   * Clamps a number to the PositiveUint16 range.
   * @param value The number to clamp.
   * @returns The value clamped to [1, 65535] as a PositiveUint16.
   */
  clamp,

  /**
   * Generates a random PositiveUint16 value within the valid range.
   * @returns A random PositiveUint16 between 1 and 65535.
   */
  random,

  /**
   * Raises a PositiveUint16 to the power of another PositiveUint16.
   * @param a The base PositiveUint16.
   * @param b The exponent PositiveUint16.
   * @returns `a ** b` clamped to [1, 65535] as a PositiveUint16.
   */
  pow,

  /**
   * Adds two PositiveUint16 values.
   * @param a The first PositiveUint16.
   * @param b The second PositiveUint16.
   * @returns `a + b` clamped to [1, 65535] as a PositiveUint16.
   */
  add,

  /**
   * Subtracts one PositiveUint16 from another.
   * @param a The minuend PositiveUint16.
   * @param b The subtrahend PositiveUint16.
   * @returns `a - b` clamped to [1, 65535] as a PositiveUint16 (minimum 1).
   */
  sub,

  /**
   * Multiplies two PositiveUint16 values.
   * @param a The first PositiveUint16.
   * @param b The second PositiveUint16.
   * @returns `a * b` clamped to [1, 65535] as a PositiveUint16.
   */
  mul,

  /**
   * Divides one PositiveUint16 by another using floor division.
   * @param a The dividend PositiveUint16.
   * @param b The divisor PositiveUint16.
   * @returns `⌊a / b⌋` clamped to [1, 65535] as a PositiveUint16.
   */
  div,
} as const;

expectType<
  keyof typeof PositiveUint16,
  keyof TsVerifiedInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('=');

expectType<
  typeof PositiveUint16,
  TsVerifiedInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('<=');
