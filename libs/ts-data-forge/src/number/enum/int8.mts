import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

const typeNameInMessage = 'an integer in [-128, 127]';

const {
  MAX_VALUE,
  MIN_VALUE,
  castType: castTypeImpl,
  clamp: clampImpl,
  is: isImpl,
  random: randomImpl,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  Int16,
  -128,
  127
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: -128,
  MAX_VALUE: 127,
  typeNameInMessage,
} as const);

const is = (x: number): x is Int8 => isImpl(x);

const castType = (x: number): Int8 =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  castTypeImpl(x) as Int8;

const clamp = (a: number): Int8 => castType(clampImpl(a));

const abs = <N extends Int8>(x: N): AbsoluteValue<N> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Math.abs(x) as unknown as AbsoluteValue<N>;

const min_ = (...values: readonly Int8[]): Int8 =>
  castType(Math.min(...values));

const max_ = (...values: readonly Int8[]): Int8 =>
  castType(Math.max(...values));

const pow = (x: Int8, y: Int8): Int8 => clamp(x ** y);

const add = (x: Int8, y: Int8): Int8 => clamp(x + y);

const sub = (x: Int8, y: Int8): Int8 => clamp(x - y);

const mul = (x: Int8, y: Int8): Int8 => clamp(x * y);

const div = (x: Int8, y: Exclude<Int8, 0>): Int8 => clamp(Math.floor(x / y));

const random = (min: Int8, max: Int8): Int8 =>
  castType(randomImpl(castTypeImpl(min), castTypeImpl(max)));

/**
 * Type guard that checks if a value is an 8-bit signed integer.
 *
 * An Int8 is a signed integer in the range [-128, 127], representing values
 * that fit in exactly 8 bits of memory.
 *
 * @param value - The value to check
 * @returns `true` if the value is an Int8, `false` otherwise
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
 */
export const asInt8 = castType;

/**
 * Namespace providing type-safe operations for Int8 (8-bit signed integer)
 * branded types.
 *
 * Int8 represents signed integers in the range [-128, 127], equivalent to a
 * signed byte in many programming languages. All operations automatically clamp
 * results to stay within this range, preventing overflow/underflow issues.
 *
 * This type is useful for:
 *
 * - Binary data processing (signed bytes)
 * - Small integer values with known bounds
 * - Embedded systems programming
 * - Memory-efficient integer storage
 * - Image processing (signed pixel offsets)
 */
export const Int8 = {
  /**
   * Type guard that checks if a value is an 8-bit signed integer.
   *
   * @param value - The value to check
   * @returns `true` if the value is in range [-128, 127] and is an integer
   * @see {@link isInt8} for usage examples
   */
  is,

  /**
   * The minimum value for an 8-bit signed integer.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for an 8-bit signed integer.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the minimum value from a list of Int8 values.
   *
   * @param values - The Int8 values to compare (at least one required)
   * @returns The smallest value as an Int8
   */
  min: min_,

  /**
   * Returns the maximum value from a list of Int8 values.
   *
   * @param values - The Int8 values to compare (at least one required)
   * @returns The largest value as an Int8
   */
  max: max_,

  /**
   * Clamps a number to the Int8 range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to [-128, 127] as an Int8.
   */
  clamp,

  /**
   * Returns the absolute value of an Int8.
   *
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
   */
  random,

  /**
   * Raises x to the power of y, clamped to Int8 range.
   *
   * @param x - The base
   * @param y - The exponent
   * @returns `x ** y` clamped to [-128, 127]
   */
  pow,

  /**
   * Adds two Int8 values, clamped to Int8 range.
   *
   * @param x - First operand
   * @param y - Second operand
   * @returns `x + y` clamped to [-128, 127]
   */
  add,

  /**
   * Subtracts two Int8 values, clamped to Int8 range.
   *
   * @param x - First operand
   * @param y - Second operand
   * @returns `x - y` clamped to [-128, 127]
   */
  sub,

  /**
   * Multiplies two Int8 values, clamped to Int8 range.
   *
   * @param x - First operand
   * @param y - Second operand
   * @returns `x * y` clamped to [-128, 127]
   */
  mul,

  /**
   * Divides two Int8 values, clamped to Int8 range.
   *
   * @param x - The dividend
   * @param y - The divisor (cannot be 0)
   * @returns `⌊x / y⌋` clamped to [-128, 127]
   */
  div,
} as const;

expectType<
  keyof typeof Int8,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    Int16,
    'int' | 'range'
  >
>('=');
