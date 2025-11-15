import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

const typeNameInMessage = 'an non-negative integer less than 256';

const {
  MAX_VALUE,
  MIN_VALUE,
  castType: castTypeImpl,
  clamp: clampImpl,
  is: isImpl,
  random: randomImpl,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<Uint16, 0, 255>(
  {
    integerOrSafeInteger: 'SafeInteger',
    MIN_VALUE: 0,
    MAX_VALUE: 255,
    typeNameInMessage,
  } as const,
);

const is = (x: number): x is Uint8 => isImpl(x);

const castType = (x: number): Uint8 =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  castTypeImpl(x) as Uint8;

const clamp = (a: number): Uint8 => castType(clampImpl(a));

const min_ = (...values: readonly Uint8[]): Uint8 =>
  castType(Math.min(...values));

const max_ = (...values: readonly Uint8[]): Uint8 =>
  castType(Math.max(...values));

const pow = (x: Uint8, y: Uint8): Uint8 => clamp(x ** y);

const add = (x: Uint8, y: Uint8): Uint8 => clamp(x + y);

const sub = (x: Uint8, y: Uint8): Uint8 => clamp(x - y);

const mul = (x: Uint8, y: Uint8): Uint8 => clamp(x * y);

const div = (x: Uint8, y: Exclude<Uint8, 0>): Uint8 => clamp(Math.floor(x / y));

const random = (min: Uint8, max: Uint8): Uint8 =>
  castType(randomImpl(castTypeImpl(min), castTypeImpl(max)));

/**
 * Checks if a number is a Uint8 (8-bit unsigned integer in the range [0, 255]).
 *
 * @param value The value to check.
 * @returns `true` if the value is a Uint8, `false` otherwise.
 */
export const isUint8 = is;

/**
 * Casts a number to a Uint8 type. This function validates that the input is
 * within the Uint8 range [0, 255] and is an integer, then returns it with the
 * Uint8 brand.
 *
 * @param value The value to cast.
 * @returns The value as a Uint8 type.
 * @throws {TypeError} If the value is not a valid 8-bit unsigned integer.
 */
export const asUint8 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 8-bit unsigned
 * integers.
 *
 * All operations automatically clamp results to the valid Uint8 range [0, 255].
 * This ensures that all arithmetic maintains the 8-bit unsigned integer
 * constraint, with negative results clamped to 0 and overflow results clamped
 * to MAX_VALUE.
 */
export const Uint8 = {
  /**
   * Type guard that checks if a value is an 8-bit unsigned integer.
   *
   * @param value The value to check.
   * @returns `true` if the value is an 8-bit unsigned integer, `false`
   *   otherwise.
   */
  is,

  /**
   * The minimum value for an 8-bit unsigned integer.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for an 8-bit unsigned integer.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the larger of the given Uint8 values.
   *
   * @param values The Uint8 values to compare.
   * @returns The maximum value as a Uint8.
   */
  max: max_,

  /**
   * Returns the smaller of the given Uint8 values.
   *
   * @param values The Uint8 values to compare.
   * @returns The minimum value as a Uint8.
   */
  min: min_,

  /**
   * Clamps a number to the Uint8 range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to [0, 255] as a Uint8.
   */
  clamp,

  /**
   * Generates a random Uint8 value within the specified range.
   *
   * @param min The minimum value (inclusive).
   * @param max The maximum value (inclusive).
   * @returns A random Uint8 between min and max.
   */
  random,

  /**
   * Raises x to the power of y, clamped to Uint8 range.
   *
   * @param x - The base
   * @param y - The exponent
   * @returns `x ** y` clamped to [0, 255]
   */
  pow,

  /**
   * Adds two Uint8 values, clamped to Uint8 range.
   *
   * @param x - First operand
   * @param y - Second operand
   * @returns `x + y` clamped to [0, 255]
   */
  add,

  /**
   * Subtracts two Uint8 values, clamped to Uint8 range.
   *
   * @param x - First operand
   * @param y - Second operand
   * @returns `x - y` clamped to [0, 255]
   */
  sub,

  /**
   * Multiplies two Uint8 values, clamped to Uint8 range.
   *
   * @param x - First operand
   * @param y - Second operand
   * @returns `x * y` clamped to [0, 255]
   */
  mul,

  /**
   * Divides two Uint8 values, clamped to Uint8 range.
   *
   * @param x - The dividend
   * @param y - The divisor (cannot be 0)
   * @returns `⌊x / y⌋` clamped to [0, 255]
   */
  div,
} as const;

expectType<
  keyof typeof Uint8,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    Uint16,
    'int' | 'non-negative' | 'range'
  >
>('=');
