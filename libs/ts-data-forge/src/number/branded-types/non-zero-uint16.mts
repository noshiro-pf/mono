import { expectType } from '../../expect-type.mjs';
import { TsVerifiedInternals } from '../refined-number-utils.mjs';

type ElementType = NonZeroUint16;

const typeNameInMessage = 'a non-zero integer in [1, 2^16)';

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
  randomNonZero: random,
  is,
  castType,
  clamp,
} = TsVerifiedInternals.RefinedNumberUtils.operatorsForInteger<
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
 * Checks if a number is a NonZeroUint16 (16-bit non-zero unsigned integer in the range [1, 2^16)).
 * @param value The value to check.
 * @returns `true` if the value is a NonZeroUint16, `false` otherwise.
 */
export const isNonZeroUint16 = is;

/**
 * Casts a number to a NonZeroUint16 type.
 * @param value The value to cast.
 * @returns The value as a NonZeroUint16 type.
 * @throws {TypeError} If the value is not a non-zero integer in [1, 2^16).
 * @example
 * ```typescript
 * const x = asNonZeroUint16(1000); // NonZeroUint16
 * const y = asNonZeroUint16(65535); // NonZeroUint16
 * // asNonZeroUint16(0); // throws TypeError
 * // asNonZeroUint16(-1); // throws TypeError
 * // asNonZeroUint16(65536); // throws TypeError
 * ```
 */
export const asNonZeroUint16 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 16-bit non-zero unsigned integers.
 *
 * All operations automatically clamp results to the valid NonZeroUint16 range [1, 65535].
 * This ensures that all arithmetic maintains the 16-bit non-zero unsigned integer constraint,
 * with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.
 *
 * @example
 * ```typescript
 * const a = asNonZeroUint16(60000);
 * const b = asNonZeroUint16(10000);
 *
 * // Arithmetic operations with automatic clamping and non-zero constraint
 * const sum = NonZeroUint16.add(a, b);       // NonZeroUint16 (65535 - clamped to MAX_VALUE)
 * const diff = NonZeroUint16.sub(a, b);      // NonZeroUint16 (50000)
 * const reverseDiff = NonZeroUint16.sub(b, a); // NonZeroUint16 (1 - clamped to MIN_VALUE)
 * const product = NonZeroUint16.mul(a, b);   // NonZeroUint16 (65535 - clamped due to overflow)
 *
 * // Range operations (maintaining non-zero constraint)
 * const clamped = NonZeroUint16.clamp(-100);     // NonZeroUint16 (1)
 * const minimum = NonZeroUint16.min(a, b);       // NonZeroUint16 (10000)
 * const maximum = NonZeroUint16.max(a, b);       // NonZeroUint16 (60000)
 *
 * // Utility operations
 * const random = NonZeroUint16.random();         // NonZeroUint16 (random value in [1, 65535])
 * const power = NonZeroUint16.pow(asNonZeroUint16(2), asNonZeroUint16(10)); // NonZeroUint16 (1024)
 * ```
 */
export const NonZeroUint16 = {
  /**
   * Type guard to check if a value is a NonZeroUint16.
   * @param value The value to check.
   * @returns `true` if the value is a 16-bit non-zero unsigned integer, `false` otherwise.
   */
  is,

  /**
   * The minimum value for a 16-bit non-zero unsigned integer.
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 16-bit non-zero unsigned integer.
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two NonZeroUint16 values.
   * @param a The first NonZeroUint16.
   * @param b The second NonZeroUint16.
   * @returns The minimum value as a NonZeroUint16.
   */
  min: min_,

  /**
   * Returns the larger of two NonZeroUint16 values.
   * @param a The first NonZeroUint16.
   * @param b The second NonZeroUint16.
   * @returns The maximum value as a NonZeroUint16.
   */
  max: max_,

  /**
   * Clamps a number to the NonZeroUint16 range.
   * @param value The number to clamp.
   * @returns The value clamped to [1, 65535] as a NonZeroUint16.
   */
  clamp,

  /**
   * Generates a random NonZeroUint16 value within the valid range.
   * @returns A random NonZeroUint16 between 1 and 65535.
   */
  random,

  /**
   * Raises a NonZeroUint16 to the power of another NonZeroUint16.
   * @param a The base NonZeroUint16.
   * @param b The exponent NonZeroUint16.
   * @returns `a ** b` clamped to [1, 65535] as a NonZeroUint16.
   */
  pow,

  /**
   * Adds two NonZeroUint16 values.
   * @param a The first NonZeroUint16.
   * @param b The second NonZeroUint16.
   * @returns `a + b` clamped to [1, 65535] as a NonZeroUint16.
   */
  add,

  /**
   * Subtracts one NonZeroUint16 from another.
   * @param a The minuend NonZeroUint16.
   * @param b The subtrahend NonZeroUint16.
   * @returns `a - b` clamped to [1, 65535] as a NonZeroUint16 (minimum 1).
   */
  sub,

  /**
   * Multiplies two NonZeroUint16 values.
   * @param a The first NonZeroUint16.
   * @param b The second NonZeroUint16.
   * @returns `a * b` clamped to [1, 65535] as a NonZeroUint16.
   */
  mul,

  /**
   * Divides one NonZeroUint16 by another using floor division.
   * @param a The dividend NonZeroUint16.
   * @param b The divisor NonZeroUint16.
   * @returns `⌊a / b⌋` clamped to [1, 65535] as a NonZeroUint16.
   */
  div,
} as const;

expectType<
  keyof typeof NonZeroUint16,
  keyof TsVerifiedInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('=');

expectType<
  typeof NonZeroUint16,
  TsVerifiedInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('<=');
