import { expectType } from '../../expect-type.mjs';
import { TsVerifiedInternals } from '../refined-number-utils.mjs';

const typeNameInMessage = 'an integer in [-128, 127]';

const {
  MIN_VALUE,
  MAX_VALUE,
  random: randomImpl,
  is: isImpl,
  castType: castTypeImpl,
  clamp: clampImpl,
} = TsVerifiedInternals.RefinedNumberUtils.operatorsForInteger<
  Int16,
  -128,
  127
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: -128,
  MAX_VALUE: 127,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a valid Int8 (integer in [-128, 127]).
 * @param x - The number to check
 * @returns True if x is a valid Int8
 */
const is = (x: number): x is Int8 => isImpl(x);

/**
 * Converts a number to Int8, throwing an error if invalid.
 * @param x - The number to convert
 * @returns The number as Int8
 * @throws TypeError if x is not a valid Int8
 */
const castType = (x: number): Int8 =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  castTypeImpl(x) as Int8;

/**
 * Clamps a number to the Int8 range [-128, 127].
 * @param a - The number to clamp
 * @returns The clamped value as Int8
 */
const clamp = (a: number): Int8 => castType(clampImpl(a));

/**
 * Returns the absolute value of an Int8.
 * @param x - The Int8 value
 * @returns The absolute value
 */
const abs = <N extends Int8>(x: N): AbsoluteValue<N> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  Math.abs(x) as unknown as AbsoluteValue<N>;

/**
 * Returns the minimum of the given Int8 values.
 * @param values - The Int8 values to compare
 * @returns The minimum value
 */
const min_ = (...values: readonly Int8[]): Int8 =>
  castType(Math.min(...values));

/**
 * Returns the maximum of the given Int8 values.
 * @param values - The Int8 values to compare
 * @returns The maximum value
 */
const max_ = (...values: readonly Int8[]): Int8 =>
  castType(Math.max(...values));

/**
 * Raises x to the power of y, clamped to Int8 range.
 * @param x - The base
 * @param y - The exponent
 * @returns x^y clamped to [-128, 127]
 */
const pow = (x: Int8, y: Int8): Int8 => clamp(x ** y);

/**
 * Adds two Int8 values, clamped to Int8 range.
 * @param x - First operand
 * @param y - Second operand
 * @returns x + y clamped to [-128, 127]
 */
const add = (x: Int8, y: Int8): Int8 => clamp(x + y);

/**
 * Subtracts two Int8 values, clamped to Int8 range.
 * @param x - First operand
 * @param y - Second operand
 * @returns x - y clamped to [-128, 127]
 */
const sub = (x: Int8, y: Int8): Int8 => clamp(x - y);

/**
 * Multiplies two Int8 values, clamped to Int8 range.
 * @param x - First operand
 * @param y - Second operand
 * @returns x * y clamped to [-128, 127]
 */
const mul = (x: Int8, y: Int8): Int8 => clamp(x * y);

/**
 * Divides two Int8 values, clamped to Int8 range.
 * @param x - The dividend
 * @param y - The divisor (cannot be 0)
 * @returns ⌊x / y⌋ clamped to [-128, 127]
 */
const div = (x: Int8, y: Exclude<Int8, 0>): Int8 => clamp(Math.floor(x / y));

/**
 * Generates a random Int8 value within the specified range.
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (inclusive)
 * @returns A random Int8 between min and max
 */
const random = (min: Int8, max: Int8): Int8 =>
  castType(randomImpl(castTypeImpl(min), castTypeImpl(max)));

/**
 * Type guard that checks if a value is an 8-bit signed integer.
 *
 * An Int8 is a signed integer in the range [-128, 127], representing
 * values that fit in exactly 8 bits of memory.
 *
 * @param value - The value to check
 * @returns `true` if the value is an Int8, `false` otherwise
 *
 * @example
 * ```typescript
 * isInt8(100);   // true
 * isInt8(-50);   // true
 * isInt8(127);   // true (max value)
 * isInt8(-128);  // true (min value)
 * isInt8(128);   // false (exceeds max)
 * isInt8(-129);  // false (below min)
 * isInt8(5.5);   // false (not integer)
 * ```
 */
export const isInt8 = is;

/**
 * Casts a number to an Int8 branded type.
 *
 * This function validates that the input is within the Int8 range [-128, 127]
 * and is an integer, then returns it with the Int8 brand.
 *
 * @param value - The value to cast
 * @returns The value as an Int8 branded type
 * @throws {TypeError} If the value is not a valid 8-bit signed integer
 *
 * @example
 * ```typescript
 * const byte = asInt8(100);     // Int8
 * const max = asInt8(127);      // Int8 (maximum value)
 * const min = asInt8(-128);     // Int8 (minimum value)
 * const zero = asInt8(0);       // Int8
 *
 * // These throw TypeError:
 * // asInt8(128);               // Exceeds maximum (127)
 * // asInt8(-129);              // Below minimum (-128)
 * // asInt8(1.5);               // Not an integer
 * // asInt8(NaN);               // Not a number
 * ```
 */
export const asInt8 = castType;

/**
 * Namespace providing type-safe operations for Int8 (8-bit signed integer) branded types.
 *
 * Int8 represents signed integers in the range [-128, 127], equivalent to a signed
 * byte in many programming languages. All operations automatically clamp results
 * to stay within this range, preventing overflow/underflow issues.
 *
 * This type is useful for:
 * - Binary data processing (signed bytes)
 * - Small integer values with known bounds
 * - Embedded systems programming
 * - Memory-efficient integer storage
 * - Image processing (signed pixel offsets)
 *
 * @example
 * ```typescript
 * // Basic usage
 * const a = asInt8(100);
 * const b = asInt8(50);
 *
 * // Arithmetic with automatic clamping
 * const sum = Int8.add(a, b);        // Int8 (127) - clamped to maximum
 * const diff = Int8.sub(a, b);       // Int8 (50)
 * const product = Int8.mul(a, b);    // Int8 (127) - clamped due to overflow
 * const quotient = Int8.div(a, b);   // Int8 (2)
 *
 * // Boundary handling
 * const overflow = Int8.add(asInt8(127), asInt8(10));  // Int8 (127) - clamped
 * const underflow = Int8.sub(asInt8(-128), asInt8(10)); // Int8 (-128) - clamped
 *
 * // Utility operations
 * const clamped = Int8.clamp(200);          // Int8 (127)
 * const absolute = Int8.abs(asInt8(-100));  // Int8 (100)
 * const minimum = Int8.min(a, b);           // Int8 (50)
 * const maximum = Int8.max(a, b);           // Int8 (100)
 *
 * // Random generation
 * const die = Int8.random(asInt8(1), asInt8(6));        // Random 1-6
 * const offset = Int8.random(asInt8(-10), asInt8(10));  // Random ±10
 * ```
 */
export const Int8 = {
  /**
   * Type guard that checks if a value is an 8-bit signed integer.
   *
   * @param value - The value to check
   * @returns `true` if the value is in range [-128, 127] and is an integer
   *
   * @see {@link isInt8} for usage examples
   */
  is,

  /**
   * The minimum value for an 8-bit signed integer.
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for an 8-bit signed integer.
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the minimum value from a list of Int8 values.
   *
   * @param values - The Int8 values to compare (at least one required)
   * @returns The smallest value as an Int8
   *
   * @example
   * ```typescript
   * Int8.min(asInt8(50), asInt8(-30), asInt8(100)); // Int8 (-30)
   * ```
   */
  min: min_,

  /**
   * Returns the maximum value from a list of Int8 values.
   *
   * @param values - The Int8 values to compare (at least one required)
   * @returns The largest value as an Int8
   *
   * @example
   * ```typescript
   * Int8.max(asInt8(50), asInt8(-30), asInt8(100)); // Int8 (100)
   * ```
   */
  max: max_,

  /**
   * Clamps a number to the Int8 range.
   * @param value The number to clamp.
   * @returns The value clamped to [-128, 127] as an Int8.
   */
  clamp,

  /**
   * Returns the absolute value of an Int8.
   * @param value The Int8 value.
   * @returns The absolute value as an Int8, clamped to valid range.
   */
  abs,

  /**
   * Generates a random Int8 value within the specified range (inclusive).
   *
   * Both bounds are inclusive. If min > max, they are automatically swapped.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random Int8 in the range [min, max]
   *
   * @example
   * ```typescript
   * // Random signed byte
   * const randomByte = Int8.random(Int8.MIN_VALUE, Int8.MAX_VALUE);
   *
   * // Random small range
   * const dice = Int8.random(asInt8(1), asInt8(6));  // 1-6
   *
   * // Random offset
   * const offset = Int8.random(asInt8(-10), asInt8(10)); // -10 to 10
   * ```
   */
  random,

  /**
   * Raises an Int8 to the power of another Int8.
   * @param a The base Int8.
   * @param b The exponent Int8.
   * @returns `a ** b` clamped to [-128, 127] as an Int8.
   */
  pow,

  /**
   * Adds two Int8 values.
   * @param a The first Int8.
   * @param b The second Int8.
   * @returns `a + b` clamped to [-128, 127] as an Int8.
   */
  add,

  /**
   * Subtracts one Int8 from another.
   * @param a The minuend Int8.
   * @param b The subtrahend Int8.
   * @returns `a - b` clamped to [-128, 127] as an Int8.
   */
  sub,

  /**
   * Multiplies two Int8 values.
   * @param a The first Int8.
   * @param b The second Int8.
   * @returns `a * b` clamped to [-128, 127] as an Int8.
   */
  mul,

  /**
   * Divides one Int8 by another using floor division.
   * @param a The dividend Int8.
   * @param b The divisor Int8 (cannot be 0).
   * @returns `⌊a / b⌋` clamped to [-128, 127] as an Int8.
   */
  div,
} as const;

expectType<
  keyof typeof Int8,
  keyof TsVerifiedInternals.RefinedNumberUtils.NumberClass<
    Int16,
    'int' | 'range'
  >
>('=');
