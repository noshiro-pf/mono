import { expectType } from '../../expect-type.mjs';
import { TsVerifiedInternals } from '../refined-number-utils.mjs';

type ElementType = Uint32;

const typeNameInMessage = 'a non-negative integer less than 2^32';

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
  MAX_VALUE: 2 ** 32 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a Uint32 (32-bit unsigned integer in the range [0, 2^32)).
 * @param value The value to check.
 * @returns `true` if the value is a Uint32, `false` otherwise.
 */
export const isUint32 = is;

/**
 * Casts a number to a Uint32 type.
 * @param value The value to cast.
 * @returns The value as a Uint32 type.
 * @throws {TypeError} If the value is not a non-negative integer less than 2^32.
 * @example
 * ```typescript
 * const x = asUint32(1000000); // Uint32
 * const y = asUint32(0); // Uint32
 * // asUint32(-1); // throws TypeError
 * // asUint32(5000000000); // throws TypeError
 * ```
 */
export const asUint32 = castType;

/**
 * Utility functions for working with Uint32 (32-bit unsigned integer) branded types.
 * Provides type-safe operations that ensure results remain within the valid range [0, 2^32).
 * All arithmetic operations are clamped to maintain the Uint32 constraint.
 *
 * @example
 * ```typescript
 * // Type checking
 * Uint32.is(1000000); // true
 * Uint32.is(-1); // false
 * Uint32.is(5000000000); // false (exceeds 2^32)
 *
 * // Constants
 * console.log(Uint32.MIN_VALUE); // 0
 * console.log(Uint32.MAX_VALUE); // 4294967295 (2^32 - 1)
 *
 * // Arithmetic operations (all results clamped to [0, 2^32))
 * const a = asUint32(1000000);
 * const b = asUint32(500000);
 *
 * Uint32.add(a, b); // Uint32 (1500000)
 * Uint32.sub(a, b); // Uint32 (500000)
 * Uint32.mul(a, b); // Uint32 (clamped if overflow)
 * Uint32.div(a, b); // Uint32 (2)
 * Uint32.pow(asUint32(2), asUint32(10)); // Uint32 (1024)
 *
 * // Utility functions
 * Uint32.min(a, b); // Uint32 (500000)
 * Uint32.max(a, b); // Uint32 (1000000)
 * Uint32.clamp(asUint32(5000000000), Uint32.MIN_VALUE, Uint32.MAX_VALUE); // Uint32 (MAX_VALUE)
 * Uint32.random(); // Random Uint32
 * ```
 */
export const Uint32 = {
  /**
   * Type guard that checks if a value is a 32-bit unsigned integer.
   * @param value - The value to check
   * @returns `true` if the value is within the range [0, 2^32), `false` otherwise
   */
  is,

  /**
   * The minimum value for a Uint32.
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a Uint32.
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the minimum of multiple Uint32 values.
   * @param values - The Uint32 values to compare
   * @returns The smallest value as a Uint32
   */
  min: min_,

  /**
   * Returns the maximum of multiple Uint32 values.
   * @param values - The Uint32 values to compare
   * @returns The largest value as a Uint32
   */
  max: max_,

  /**
   * Clamps a Uint32 to be within the specified range.
   * @param value - The value to clamp
   * @param min - The minimum value
   * @param max - The maximum value
   * @returns The clamped value as a Uint32
   * @example
   * ```typescript
   * Uint32.clamp(asUint32(5000000000), Uint32.MIN_VALUE, asUint32(1000)); // Uint32 (1000)
   * ```
   */
  clamp,

  /**
   * Generates a random Uint32 value.
   * @returns A random Uint32 value within [0, 2^32)
   */
  random,

  /**
   * Raises a Uint32 to a power, with result clamped to [0, 2^32).
   * @param a - The base Uint32
   * @param b - The exponent Uint32
   * @returns `a ** b` as a Uint32, clamped to valid range
   * @example
   * ```typescript
   * Uint32.pow(asUint32(2), asUint32(10)); // Uint32 (1024)
   * ```
   */
  pow,

  /**
   * Adds two Uint32 values, with result clamped to [0, 2^32).
   * @param a - First Uint32
   * @param b - Second Uint32
   * @returns `a + b` as a Uint32, clamped to valid range
   * @example
   * ```typescript
   * Uint32.add(asUint32(1000000), asUint32(500000)); // Uint32 (1500000)
   * ```
   */
  add,

  /**
   * Subtracts two Uint32 values, with result clamped to [0, 2^32).
   * @param a - First Uint32
   * @param b - Second Uint32
   * @returns `a - b` as a Uint32, clamped to valid range (minimum 0)
   * @example
   * ```typescript
   * Uint32.sub(asUint32(1000000), asUint32(500000)); // Uint32 (500000)
   * Uint32.sub(asUint32(100), asUint32(500)); // Uint32 (0) - clamped
   * ```
   */
  sub,

  /**
   * Multiplies two Uint32 values, with result clamped to [0, 2^32).
   * @param a - First Uint32
   * @param b - Second Uint32
   * @returns `a * b` as a Uint32, clamped to valid range
   * @example
   * ```typescript
   * Uint32.mul(asUint32(1000), asUint32(500)); // Uint32 (500000)
   * ```
   */
  mul,

  /**
   * Divides two Uint32 values using floor division, with result clamped to [0, 2^32).
   * @param a - The dividend Uint32
   * @param b - The divisor Uint32
   * @returns `⌊a / b⌋` as a Uint32, clamped to valid range
   * @example
   * ```typescript
   * Uint32.div(asUint32(1000000), asUint32(500000)); // Uint32 (2)
   * Uint32.div(asUint32(7), asUint32(3)); // Uint32 (2) - floor division
   * ```
   */
  div,
} as const;

expectType<
  keyof typeof Uint32,
  keyof TsVerifiedInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('=');

expectType<
  typeof Uint32,
  TsVerifiedInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('<=');
