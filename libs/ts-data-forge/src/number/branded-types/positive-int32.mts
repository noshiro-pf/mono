import { expectType } from '../../expect-type.mjs';
import { TsVerifiedInternals } from '../refined-number-utils.mjs';

type ElementType = PositiveInt32;

const typeNameInMessage = 'a positive integer in [1, 2^31)';

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
  MAX_VALUE: 2 ** 31 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a PositiveInt32 (32-bit positive signed integer in the range [1, 2^31)).
 * @param value The value to check.
 * @returns `true` if the value is a PositiveInt32, `false` otherwise.
 */
export const isPositiveInt32 = is;

/**
 * Casts a number to a PositiveInt32 type.
 * @param value The value to cast.
 * @returns The value as a PositiveInt32 type.
 * @throws {TypeError} If the value is not a positive integer in [1, 2^31).
 * @example
 * ```typescript
 * const x = asPositiveInt32(1000); // PositiveInt32
 * const y = asPositiveInt32(2147483647); // PositiveInt32
 * // asPositiveInt32(0); // throws TypeError
 * // asPositiveInt32(-1); // throws TypeError
 * // asPositiveInt32(2147483648); // throws TypeError
 * ```
 */
export const asPositiveInt32 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 32-bit positive integers.
 *
 * All operations automatically clamp results to the valid PositiveInt32 range [1, 2147483647].
 * This ensures that all arithmetic maintains the 32-bit positive integer constraint,
 * with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.
 *
 * @example
 * ```typescript
 * const a = asPositiveInt32(2000000000);
 * const b = asPositiveInt32(500000000);
 *
 * // Arithmetic operations with automatic clamping and positive constraint
 * const sum = PositiveInt32.add(a, b);       // PositiveInt32 (2147483647 - clamped to MAX_VALUE)
 * const diff = PositiveInt32.sub(a, b);      // PositiveInt32 (1500000000)
 * const reverseDiff = PositiveInt32.sub(b, a); // PositiveInt32 (1 - clamped to MIN_VALUE)
 * const product = PositiveInt32.mul(a, b);   // PositiveInt32 (2147483647 - clamped due to overflow)
 *
 * // Range operations (maintaining positive constraint)
 * const clamped = PositiveInt32.clamp(-1000);     // PositiveInt32 (1)
 * const minimum = PositiveInt32.min(a, b);        // PositiveInt32 (500000000)
 * const maximum = PositiveInt32.max(a, b);        // PositiveInt32 (2000000000)
 *
 * // Utility operations
 * const random = PositiveInt32.random();          // PositiveInt32 (random value in [1, 2147483647])
 * const power = PositiveInt32.pow(asPositiveInt32(2), asPositiveInt32(20)); // PositiveInt32 (1048576)
 * ```
 */
export const PositiveInt32 = {
  /**
   * Type guard to check if a value is a PositiveInt32.
   * @param value The value to check.
   * @returns `true` if the value is a 32-bit positive integer, `false` otherwise.
   */
  is,

  /**
   * The minimum value for a 32-bit positive integer.
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 32-bit positive integer.
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two PositiveInt32 values.
   * @param a The first PositiveInt32.
   * @param b The second PositiveInt32.
   * @returns The minimum value as a PositiveInt32.
   */
  min: min_,

  /**
   * Returns the larger of two PositiveInt32 values.
   * @param a The first PositiveInt32.
   * @param b The second PositiveInt32.
   * @returns The maximum value as a PositiveInt32.
   */
  max: max_,

  /**
   * Clamps a number to the PositiveInt32 range.
   * @param value The number to clamp.
   * @returns The value clamped to [1, 2147483647] as a PositiveInt32.
   */
  clamp,

  /**
   * Generates a random PositiveInt32 value within the valid range.
   * @returns A random PositiveInt32 between 1 and 2147483647.
   */
  random,

  /**
   * Raises a PositiveInt32 to the power of another PositiveInt32.
   * @param a The base PositiveInt32.
   * @param b The exponent PositiveInt32.
   * @returns `a ** b` clamped to [1, 2147483647] as a PositiveInt32.
   */
  pow,

  /**
   * Adds two PositiveInt32 values.
   * @param a The first PositiveInt32.
   * @param b The second PositiveInt32.
   * @returns `a + b` clamped to [1, 2147483647] as a PositiveInt32.
   */
  add,

  /**
   * Subtracts one PositiveInt32 from another.
   * @param a The minuend PositiveInt32.
   * @param b The subtrahend PositiveInt32.
   * @returns `a - b` clamped to [1, 2147483647] as a PositiveInt32 (minimum 1).
   */
  sub,

  /**
   * Multiplies two PositiveInt32 values.
   * @param a The first PositiveInt32.
   * @param b The second PositiveInt32.
   * @returns `a * b` clamped to [1, 2147483647] as a PositiveInt32.
   */
  mul,

  /**
   * Divides one PositiveInt32 by another using floor division.
   * @param a The dividend PositiveInt32.
   * @param b The divisor PositiveInt32.
   * @returns `⌊a / b⌋` clamped to [1, 2147483647] as a PositiveInt32.
   */
  div,
} as const;

expectType<
  keyof typeof PositiveInt32,
  keyof TsVerifiedInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('=');

expectType<
  typeof PositiveInt32,
  TsVerifiedInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('<=');
