import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = NonZeroInt32;

const typeNameInMessage = 'a non-zero integer in [-2^31, 2^31)';

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
  MIN_VALUE: -(2 ** 31),
  MAX_VALUE: 2 ** 31 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a NonZeroInt32 (32-bit non-zero signed integer in the range [-2^31, 2^31) excluding 0).
 * @param value The value to check.
 * @returns `true` if the value is a NonZeroInt32, `false` otherwise.
 */
export const isNonZeroInt32 = is;

/**
 * Casts a number to a NonZeroInt32 type.
 * @param value The value to cast.
 * @returns The value as a NonZeroInt32 type.
 * @throws {TypeError} If the value is not a non-zero integer in [-2^31, 2^31).
 * @example
 * ```typescript
 * const x = asNonZeroInt32(1000); // NonZeroInt32
 * const y = asNonZeroInt32(-1000); // NonZeroInt32
 * // asNonZeroInt32(0); // throws TypeError
 * // asNonZeroInt32(2147483648); // throws TypeError
 * ```
 */
export const asNonZeroInt32 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 32-bit non-zero signed integers.
 *
 * All operations automatically clamp results to the valid NonZeroInt32 range [-2147483648, 2147483647]
 * excluding 0. This ensures that all arithmetic maintains the 32-bit non-zero signed integer
 * constraint, preventing zero results and overflow.
 *
 * @example
 * ```typescript
 * const a = asNonZeroInt32(2000000000);
 * const b = asNonZeroInt32(-500000000);
 *
 * // Arithmetic operations with automatic clamping and non-zero constraint
 * const sum = NonZeroInt32.add(a, b);       // NonZeroInt32 (1500000000)
 * const diff = NonZeroInt32.sub(a, b);      // NonZeroInt32 (2147483647 - clamped to MAX_VALUE)
 * const product = NonZeroInt32.mul(a, b);   // NonZeroInt32 (-2147483648 - clamped to MIN_VALUE)
 *
 * // Utility operations
 * const absolute = NonZeroInt32.abs(b);         // NonZeroInt32 (500000000)
 * const minimum = NonZeroInt32.min(a, b);       // NonZeroInt32 (-500000000)
 * const maximum = NonZeroInt32.max(a, b);       // NonZeroInt32 (2000000000)
 *
 * // Range operations (avoiding zero)
 * const clamped = NonZeroInt32.clamp(0);        // NonZeroInt32 (1 or -1, avoiding zero)
 * const random = NonZeroInt32.random();         // NonZeroInt32 (random non-zero value in range)
 * const power = NonZeroInt32.pow(asNonZeroInt32(2), asNonZeroInt32(20)); // NonZeroInt32 (1048576)
 * ```
 */
export const NonZeroInt32 = {
  /**
   * Type guard to check if a value is a NonZeroInt32.
   * @param value The value to check.
   * @returns `true` if the value is a 32-bit non-zero signed integer, `false` otherwise.
   */
  is,

  /**
   * The minimum value for a 32-bit non-zero signed integer.
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 32-bit non-zero signed integer.
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a 32-bit non-zero signed integer.
   * @param a The NonZeroInt32 value.
   * @returns The absolute value as a NonZeroInt32, clamped to valid range.
   */
  abs,

  /**
   * Returns the smaller of two NonZeroInt32 values.
   * @param a The first NonZeroInt32.
   * @param b The second NonZeroInt32.
   * @returns The minimum value as a NonZeroInt32.
   */
  min: min_,

  /**
   * Returns the larger of two NonZeroInt32 values.
   * @param a The first NonZeroInt32.
   * @param b The second NonZeroInt32.
   * @returns The maximum value as a NonZeroInt32.
   */
  max: max_,

  /**
   * Clamps a number to the NonZeroInt32 range (avoiding zero).
   * @param value The number to clamp.
   * @returns The value clamped to [-2147483648, 2147483647] \ {0} as a NonZeroInt32.
   */
  clamp,

  /**
   * Generates a random NonZeroInt32 value within the valid range.
   * @returns A random NonZeroInt32 between MIN_VALUE and MAX_VALUE (excluding 0).
   */
  random,

  /**
   * Raises a NonZeroInt32 to the power of another NonZeroInt32.
   * @param a The base NonZeroInt32.
   * @param b The exponent NonZeroInt32.
   * @returns `a ** b` clamped to [-2147483648, 2147483647] as a NonZeroInt32.
   */
  pow,

  /**
   * Adds two NonZeroInt32 values.
   * @param a The first NonZeroInt32.
   * @param b The second NonZeroInt32.
   * @returns `a + b` clamped to [-2147483648, 2147483647] as a NonZeroInt32.
   */
  add,

  /**
   * Subtracts one NonZeroInt32 from another.
   * @param a The minuend NonZeroInt32.
   * @param b The subtrahend NonZeroInt32.
   * @returns `a - b` clamped to [-2147483648, 2147483647] as a NonZeroInt32.
   */
  sub,

  /**
   * Multiplies two NonZeroInt32 values.
   * @param a The first NonZeroInt32.
   * @param b The second NonZeroInt32.
   * @returns `a * b` clamped to [-2147483648, 2147483647] as a NonZeroInt32.
   */
  mul,

  /**
   * Divides one NonZeroInt32 by another using floor division.
   * @param a The dividend NonZeroInt32.
   * @param b The divisor NonZeroInt32.
   * @returns `⌊a / b⌋` clamped to [-2147483648, 2147483647] as a NonZeroInt32.
   */
  div,
} as const;

expectType<
  keyof typeof NonZeroInt32,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('=');

expectType<
  typeof NonZeroInt32,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('<=');
