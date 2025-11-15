import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = NonZeroInt;

const typeNameInMessage = 'a non-zero integer';

const {
  abs,
  add,
  castType,
  div,
  is,
  max: max_,
  min: min_,
  mul,
  pow,
  randomNonZero: random,
  sub,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  number,
  number
>({
  integerOrSafeInteger: 'Integer',
  nonZero: true,
  MIN_VALUE: -Number.MAX_VALUE,
  MAX_VALUE: Number.MAX_VALUE,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a NonZeroInt.
 *
 * @param value The value to check.
 * @returns `true` if the value is a NonZeroInt, `false` otherwise.
 */
export const isNonZeroInt = is;
/**
 * Casts a number to a NonZeroInt type.
 *
 * @param value The value to cast.
 * @returns The value as a NonZeroInt type.
 * @throws {TypeError} If the value is not a non-zero integer.
 */
export const asNonZeroInt = castType;

/**
 * Namespace providing type-safe arithmetic operations for non-zero integers.
 *
 * All operations maintain the non-zero constraint, ensuring that results are
 * always valid NonZeroInt values. Division operations return floor division
 * results, and all arithmetic maintains integer precision.
 */
export const NonZeroInt = {
  /**
   * Type guard to check if a value is a NonZeroInt.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-zero integer, `false` otherwise.
   */
  is,

  /**
   * Returns the absolute value of a non-zero integer.
   *
   * @param a The non-zero integer.
   * @returns The absolute value as a NonZeroInt.
   */
  abs,

  /**
   * Returns the smaller of two non-zero integers.
   *
   * @param a The first non-zero integer.
   * @param b The second non-zero integer.
   * @returns The minimum value as a NonZeroInt.
   */
  min: min_,

  /**
   * Returns the larger of two non-zero integers.
   *
   * @param a The first non-zero integer.
   * @param b The second non-zero integer.
   * @returns The maximum value as a NonZeroInt.
   */
  max: max_,

  /**
   * Generates a random non-zero integer.
   *
   * @returns A random NonZeroInt value.
   */
  random,

  /**
   * Raises a non-zero integer to the power of another non-zero integer.
   *
   * @param a The base non-zero integer.
   * @param b The exponent non-zero integer.
   * @returns `a ** b` as a NonZeroInt.
   */
  pow,

  /**
   * Adds two non-zero integers.
   *
   * @param a The first non-zero integer.
   * @param b The second non-zero integer.
   * @returns `a + b` as a NonZeroInt.
   */
  add,

  /**
   * Subtracts one non-zero integer from another.
   *
   * @param a The minuend non-zero integer.
   * @param b The subtrahend non-zero integer.
   * @returns `a - b` as a NonZeroInt.
   */
  sub,

  /**
   * Multiplies two non-zero integers.
   *
   * @param a The first non-zero integer.
   * @param b The second non-zero integer.
   * @returns `a * b` as a NonZeroInt.
   */
  mul,

  /**
   * Divides one non-zero integer by another using floor division.
   *
   * @param a The dividend non-zero integer.
   * @param b The divisor non-zero integer.
   * @returns `⌊a / b⌋` as a NonZeroInt.
   */
  div,
} as const;

expectType<
  keyof typeof NonZeroInt,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<ElementType, 'int'>
>('=');

expectType<
  typeof NonZeroInt,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<ElementType, 'int'>
>('<=');
