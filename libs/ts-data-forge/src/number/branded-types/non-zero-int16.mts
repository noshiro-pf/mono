import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = NonZeroInt16;

const typeNameInMessage = 'a non-zero integer in [-2^15, 2^15)';

const {
  MIN_VALUE,
  MAX_VALUE,
  abs,
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
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  number,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  nonZero: true,
  MIN_VALUE: -(2 ** 15),
  MAX_VALUE: 2 ** 15 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a NonZeroInt16 (16-bit non-zero signed integer in the range [-2^15, 2^15) excluding 0).
 * @param value The value to check.
 * @returns `true` if the value is a NonZeroInt16, `false` otherwise.
 */
export const isNonZeroInt16 = is;

/**
 * Casts a number to a NonZeroInt16 type.
 * @param value The value to cast.
 * @returns The value as a NonZeroInt16 type.
 * @throws {TypeError} If the value is not a non-zero integer in [-2^15, 2^15).
 * @example
 * ```typescript
 * const x = asNonZeroInt16(1000); // NonZeroInt16
 * const y = asNonZeroInt16(-1000); // NonZeroInt16
 * // asNonZeroInt16(0); // throws TypeError
 * // asNonZeroInt16(32768); // throws TypeError
 * ```
 */
export const asNonZeroInt16 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 16-bit non-zero signed integers.
 *
 * All operations automatically clamp results to the valid NonZeroInt16 range [-32768, 32767]
 * excluding 0. This ensures that all arithmetic maintains the 16-bit non-zero signed integer
 * constraint, preventing zero results and overflow.
 *
 * @example
 * ```typescript
 * const a = asNonZeroInt16(30000);
 * const b = asNonZeroInt16(-10000);
 *
 * // Arithmetic operations with automatic clamping and non-zero constraint
 * const sum = NonZeroInt16.add(a, b);       // NonZeroInt16 (20000)
 * const diff = NonZeroInt16.sub(a, b);      // NonZeroInt16 (32767 - clamped to MAX_VALUE)
 * const product = NonZeroInt16.mul(a, b);   // NonZeroInt16 (-32768 - clamped to MIN_VALUE)
 *
 * // Utility operations
 * const absolute = NonZeroInt16.abs(b);         // NonZeroInt16 (10000)
 * const minimum = NonZeroInt16.min(a, b);       // NonZeroInt16 (-10000)
 * const maximum = NonZeroInt16.max(a, b);       // NonZeroInt16 (30000)
 *
 * // Range operations (avoiding zero)
 * const clamped = NonZeroInt16.clamp(0);        // NonZeroInt16 (1 or -1, avoiding zero)
 * const random = NonZeroInt16.random();         // NonZeroInt16 (random non-zero value in range)
 * const power = NonZeroInt16.pow(asNonZeroInt16(2), asNonZeroInt16(10)); // NonZeroInt16 (1024)
 * ```
 */
export const NonZeroInt16 = {
  /**
   * Type guard to check if a value is a NonZeroInt16.
   * @param value The value to check.
   * @returns `true` if the value is a 16-bit non-zero signed integer, `false` otherwise.
   */
  is,

  /**
   * The minimum value for a 16-bit non-zero signed integer.
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 16-bit non-zero signed integer.
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a 16-bit non-zero signed integer.
   * @param a The NonZeroInt16 value.
   * @returns The absolute value as a NonZeroInt16, clamped to valid range.
   */
  abs,

  /**
   * Returns the smaller of two NonZeroInt16 values.
   * @param a The first NonZeroInt16.
   * @param b The second NonZeroInt16.
   * @returns The minimum value as a NonZeroInt16.
   */
  min: min_,

  /**
   * Returns the larger of two NonZeroInt16 values.
   * @param a The first NonZeroInt16.
   * @param b The second NonZeroInt16.
   * @returns The maximum value as a NonZeroInt16.
   */
  max: max_,

  /**
   * Clamps a number to the NonZeroInt16 range (avoiding zero).
   * @param value The number to clamp.
   * @returns The value clamped to [-32768, 32767] \ {0} as a NonZeroInt16.
   */
  clamp,

  /**
   * Generates a random NonZeroInt16 value within the valid range.
   * @returns A random NonZeroInt16 between MIN_VALUE and MAX_VALUE (excluding 0).
   */
  random,

  /**
   * Raises a NonZeroInt16 to the power of another NonZeroInt16.
   * @param a The base NonZeroInt16.
   * @param b The exponent NonZeroInt16.
   * @returns `a ** b` clamped to [-32768, 32767] as a NonZeroInt16.
   */
  pow,

  /**
   * Adds two NonZeroInt16 values.
   * @param a The first NonZeroInt16.
   * @param b The second NonZeroInt16.
   * @returns `a + b` clamped to [-32768, 32767] as a NonZeroInt16.
   */
  add,

  /**
   * Subtracts one NonZeroInt16 from another.
   * @param a The minuend NonZeroInt16.
   * @param b The subtrahend NonZeroInt16.
   * @returns `a - b` clamped to [-32768, 32767] as a NonZeroInt16.
   */
  sub,

  /**
   * Multiplies two NonZeroInt16 values.
   * @param a The first NonZeroInt16.
   * @param b The second NonZeroInt16.
   * @returns `a * b` clamped to [-32768, 32767] as a NonZeroInt16.
   */
  mul,

  /**
   * Divides one NonZeroInt16 by another using floor division.
   * @param a The dividend NonZeroInt16.
   * @param b The divisor NonZeroInt16.
   * @returns `⌊a / b⌋` clamped to [-32768, 32767] as a NonZeroInt16.
   */
  div,
} as const;

expectType<
  keyof typeof NonZeroInt16,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('=');

expectType<
  typeof NonZeroInt16,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('<=');
