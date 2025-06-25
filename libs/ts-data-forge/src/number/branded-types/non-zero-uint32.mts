import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = NonZeroUint32;

const typeNameInMessage = 'a non-zero integer in [1, 2^32)';

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
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  1,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  nonZero: true,
  MIN_VALUE: 1,
  MAX_VALUE: 2 ** 32 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a NonZeroUint32 (32-bit non-zero unsigned integer in the range [1, 2^32)).
 * @param value The value to check.
 * @returns `true` if the value is a NonZeroUint32, `false` otherwise.
 */
export const isNonZeroUint32 = is;

/**
 * Casts a number to a NonZeroUint32 type.
 * @param value The value to cast.
 * @returns The value as a NonZeroUint32 type.
 * @throws {TypeError} If the value is not a non-zero integer in [1, 2^32).
 * @example
 * ```typescript
 * const x = asNonZeroUint32(1000); // NonZeroUint32
 * const y = asNonZeroUint32(4294967295); // NonZeroUint32
 * // asNonZeroUint32(0); // throws TypeError
 * // asNonZeroUint32(-1); // throws TypeError
 * // asNonZeroUint32(4294967296); // throws TypeError
 * ```
 */
export const asNonZeroUint32 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 32-bit non-zero unsigned integers.
 *
 * All operations automatically clamp results to the valid NonZeroUint32 range [1, 4294967295].
 * This ensures that all arithmetic maintains the 32-bit non-zero unsigned integer constraint,
 * with results below 1 clamped to MIN_VALUE and overflow results clamped to MAX_VALUE.
 *
 * @example
 * ```typescript
 * const a = asNonZeroUint32(4000000000);
 * const b = asNonZeroUint32(1000000000);
 *
 * // Arithmetic operations with automatic clamping and non-zero constraint
 * const sum = NonZeroUint32.add(a, b);       // NonZeroUint32 (4294967295 - clamped to MAX_VALUE)
 * const diff = NonZeroUint32.sub(a, b);      // NonZeroUint32 (3000000000)
 * const reverseDiff = NonZeroUint32.sub(b, a); // NonZeroUint32 (1 - clamped to MIN_VALUE)
 * const product = NonZeroUint32.mul(a, b);   // NonZeroUint32 (4294967295 - clamped due to overflow)
 *
 * // Range operations (maintaining non-zero constraint)
 * const clamped = NonZeroUint32.clamp(-100);     // NonZeroUint32 (1)
 * const minimum = NonZeroUint32.min(a, b);       // NonZeroUint32 (1000000000)
 * const maximum = NonZeroUint32.max(a, b);       // NonZeroUint32 (4000000000)
 *
 * // Utility operations
 * const random = NonZeroUint32.random();         // NonZeroUint32 (random value in [1, 4294967295])
 * const power = NonZeroUint32.pow(asNonZeroUint32(2), asNonZeroUint32(20)); // NonZeroUint32 (1048576)
 * ```
 */
export const NonZeroUint32 = {
  /**
   * Type guard to check if a value is a NonZeroUint32.
   * @param value The value to check.
   * @returns `true` if the value is a 32-bit non-zero unsigned integer, `false` otherwise.
   */
  is,

  /**
   * The minimum value for a 32-bit non-zero unsigned integer.
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 32-bit non-zero unsigned integer.
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two NonZeroUint32 values.
   * @param a The first NonZeroUint32.
   * @param b The second NonZeroUint32.
   * @returns The minimum value as a NonZeroUint32.
   */
  min: min_,

  /**
   * Returns the larger of two NonZeroUint32 values.
   * @param a The first NonZeroUint32.
   * @param b The second NonZeroUint32.
   * @returns The maximum value as a NonZeroUint32.
   */
  max: max_,

  /**
   * Clamps a number to the NonZeroUint32 range.
   * @param value The number to clamp.
   * @returns The value clamped to [1, 4294967295] as a NonZeroUint32.
   */
  clamp,

  /**
   * Generates a random NonZeroUint32 value within the valid range.
   * @returns A random NonZeroUint32 between 1 and 4294967295.
   */
  random,

  /**
   * Raises a NonZeroUint32 to the power of another NonZeroUint32.
   * @param a The base NonZeroUint32.
   * @param b The exponent NonZeroUint32.
   * @returns `a ** b` clamped to [1, 4294967295] as a NonZeroUint32.
   */
  pow,

  /**
   * Adds two NonZeroUint32 values.
   * @param a The first NonZeroUint32.
   * @param b The second NonZeroUint32.
   * @returns `a + b` clamped to [1, 4294967295] as a NonZeroUint32.
   */
  add,

  /**
   * Subtracts one NonZeroUint32 from another.
   * @param a The minuend NonZeroUint32.
   * @param b The subtrahend NonZeroUint32.
   * @returns `a - b` clamped to [1, 4294967295] as a NonZeroUint32 (minimum 1).
   */
  sub,

  /**
   * Multiplies two NonZeroUint32 values.
   * @param a The first NonZeroUint32.
   * @param b The second NonZeroUint32.
   * @returns `a * b` clamped to [1, 4294967295] as a NonZeroUint32.
   */
  mul,

  /**
   * Divides one NonZeroUint32 by another using floor division.
   * @param a The dividend NonZeroUint32.
   * @param b The divisor NonZeroUint32.
   * @returns `⌊a / b⌋` clamped to [1, 4294967295] as a NonZeroUint32.
   */
  div,
} as const;

expectType<
  keyof typeof NonZeroUint32,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('=');

expectType<
  typeof NonZeroUint32,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range'
  >
>('<=');
