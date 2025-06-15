import { expectType } from '../../expect-type.mjs';
import { TsVerifiedInternals } from '../refined-number-utils.mjs';

type ElementType = NonNegativeInt32;

const typeNameInMessage = 'a non-negative integer in [0, 2^31)';

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
  0,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 0,
  MAX_VALUE: 2 ** 31 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a NonNegativeInt32 (32-bit non-negative signed integer in the range [0, 2^31)).
 * @param value The value to check.
 * @returns `true` if the value is a NonNegativeInt32, `false` otherwise.
 */
export const isNonNegativeInt32 = is;

/**
 * Casts a number to a NonNegativeInt32 type.
 * @param value The value to cast.
 * @returns The value as a NonNegativeInt32 type.
 * @throws {TypeError} If the value is not a non-negative integer in [0, 2^31).
 * @example
 * ```typescript
 * const x = asNonNegativeInt32(1000); // NonNegativeInt32
 * const y = asNonNegativeInt32(0); // NonNegativeInt32
 * // asNonNegativeInt32(-1); // throws TypeError
 * // asNonNegativeInt32(2147483648); // throws TypeError
 * ```
 */
export const asNonNegativeInt32 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 32-bit non-negative integers.
 *
 * All operations automatically clamp results to the valid NonNegativeInt32 range [0, 2147483647].
 * This ensures that all arithmetic maintains the 32-bit non-negative integer constraint,
 * with negative results clamped to 0 and overflow results clamped to MAX_VALUE.
 *
 * @example
 * ```typescript
 * const a = asNonNegativeInt32(2000000000);
 * const b = asNonNegativeInt32(500000000);
 *
 * // Arithmetic operations with automatic clamping
 * const sum = NonNegativeInt32.add(a, b);       // NonNegativeInt32 (2147483647 - clamped to MAX_VALUE)
 * const diff = NonNegativeInt32.sub(a, b);      // NonNegativeInt32 (1500000000)
 * const reverseDiff = NonNegativeInt32.sub(b, a); // NonNegativeInt32 (0 - clamped to MIN_VALUE)
 * const product = NonNegativeInt32.mul(a, b);   // NonNegativeInt32 (2147483647 - clamped due to overflow)
 *
 * // Range operations
 * const clamped = NonNegativeInt32.clamp(-1000);     // NonNegativeInt32 (0)
 * const minimum = NonNegativeInt32.min(a, b);        // NonNegativeInt32 (500000000)
 * const maximum = NonNegativeInt32.max(a, b);        // NonNegativeInt32 (2000000000)
 *
 * // Utility operations
 * const random = NonNegativeInt32.random();          // NonNegativeInt32 (random value in [0, 2147483647])
 * const power = NonNegativeInt32.pow(asNonNegativeInt32(2), asNonNegativeInt32(20)); // NonNegativeInt32 (1048576)
 * ```
 */
export const NonNegativeInt32 = {
  /**
   * Type guard to check if a value is a NonNegativeInt32.
   * @param value The value to check.
   * @returns `true` if the value is a 32-bit non-negative integer, `false` otherwise.
   */
  is,

  /**
   * The minimum value for a 32-bit non-negative integer.
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 32-bit non-negative integer.
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two NonNegativeInt32 values.
   * @param a The first NonNegativeInt32.
   * @param b The second NonNegativeInt32.
   * @returns The minimum value as a NonNegativeInt32.
   */
  min: min_,

  /**
   * Returns the larger of two NonNegativeInt32 values.
   * @param a The first NonNegativeInt32.
   * @param b The second NonNegativeInt32.
   * @returns The maximum value as a NonNegativeInt32.
   */
  max: max_,

  /**
   * Clamps a number to the NonNegativeInt32 range.
   * @param value The number to clamp.
   * @returns The value clamped to [0, 2147483647] as a NonNegativeInt32.
   */
  clamp,

  /**
   * Generates a random NonNegativeInt32 value within the valid range.
   * @returns A random NonNegativeInt32 between 0 and 2147483647.
   */
  random,

  /**
   * Raises a NonNegativeInt32 to the power of another NonNegativeInt32.
   * @param a The base NonNegativeInt32.
   * @param b The exponent NonNegativeInt32.
   * @returns `a ** b` clamped to [0, 2147483647] as a NonNegativeInt32.
   */
  pow,

  /**
   * Adds two NonNegativeInt32 values.
   * @param a The first NonNegativeInt32.
   * @param b The second NonNegativeInt32.
   * @returns `a + b` clamped to [0, 2147483647] as a NonNegativeInt32.
   */
  add,

  /**
   * Subtracts one NonNegativeInt32 from another.
   * @param a The minuend NonNegativeInt32.
   * @param b The subtrahend NonNegativeInt32.
   * @returns `a - b` clamped to [0, 2147483647] as a NonNegativeInt32 (minimum 0).
   */
  sub,

  /**
   * Multiplies two NonNegativeInt32 values.
   * @param a The first NonNegativeInt32.
   * @param b The second NonNegativeInt32.
   * @returns `a * b` clamped to [0, 2147483647] as a NonNegativeInt32.
   */
  mul,

  /**
   * Divides one NonNegativeInt32 by another using floor division.
   * @param a The dividend NonNegativeInt32.
   * @param b The divisor NonNegativeInt32.
   * @returns `⌊a / b⌋` clamped to [0, 2147483647] as a NonNegativeInt32.
   */
  div,
} as const;

expectType<
  keyof typeof NonNegativeInt32,
  keyof TsVerifiedInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('=');

expectType<
  typeof NonNegativeInt32,
  TsVerifiedInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('<=');
