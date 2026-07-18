import {
  type NegativeInt as TtfImported_NegativeInt,
  type WithSmallInt,
} from 'ts-type-forge';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';
import { PositiveInt } from './positive-int.mjs';

export type NegativeInt = TtfImported_NegativeInt;

type ElementType = NegativeInt;

const typeNameInMessage = 'a negative integer';

const {
  MAX_VALUE,
  add,
  castType,
  clamp,
  is,
  max: max_,
  min: min_,
  pow,
  random,
  sub,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  number,
  -1
>({
  integerOrSafeInteger: 'Integer',
  nonZero: true,
  MIN_VALUE: -Number.MAX_VALUE,
  MAX_VALUE: -1,
  typeNameInMessage,
} as const);

/**
 * Returns the absolute value of a negative integer.
 *
 * The absolute value of a negative integer is always a positive integer
 * (`>= 1`), so the result is typed as a {@link PositiveInt}.
 *
 * @param x - The negative integer.
 * @returns `|x|` as a PositiveInt.
 */
const abs = (x: WithSmallInt<ElementType>): PositiveInt =>
  PositiveInt.clamp(Math.abs(x));

/**
 * Checks if a number is a NegativeInt (a negative integer `<= -1`).
 *
 * @param value The value to check.
 * @returns `true` if the value is a NegativeInt, `false` otherwise.
 */
export const isNegativeInt = is;

/**
 * Casts a number to a NegativeInt type.
 *
 * @param value The value to cast.
 * @returns The value as a NegativeInt type.
 * @throws {TypeError} If the value is not a negative integer.
 */
export const asNegativeInt = castType;

/**
 * Namespace providing type-safe arithmetic operations for negative integers.
 *
 * NegativeInt represents integers that are strictly less than zero (`<= -1`).
 * Operations that stay within the negative integers (such as `add`) clamp their
 * results to the valid range, while operations whose result leaves the set
 * (`mul`, `div`, `abs`) are typed to reflect the actual sign of the result.
 */
export const NegativeInt = {
  /**
   * Type guard to check if a value is a NegativeInt.
   *
   * @param value The value to check.
   * @returns `true` if the value is a negative integer, `false` otherwise.
   */
  is,

  /**
   * The maximum value for a negative integer.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a negative integer.
   *
   * @param a The negative integer.
   * @returns The absolute value as a PositiveInt.
   */
  abs,

  /**
   * Returns the smaller of two negative integers.
   *
   * @param a The first negative integer.
   * @param b The second negative integer.
   * @returns The minimum value as a NegativeInt.
   */
  min: min_,

  /**
   * Returns the larger of two negative integers.
   *
   * @param a The first negative integer.
   * @param b The second negative integer.
   * @returns The maximum value as a NegativeInt.
   */
  max: max_,

  /**
   * Clamps a number to the negative integer range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to `[-∞, -1]` as a NegativeInt.
   */
  clamp,

  /**
   * Generates a random NegativeInt value within the valid range.
   *
   * @returns A random negative integer.
   */
  random,

  /**
   * Raises a negative integer to the power of another negative integer.
   *
   * @param a The base negative integer.
   * @param b The exponent negative integer.
   * @returns `a ** b` clamped to the negative integer range.
   */
  pow,

  /**
   * Adds two negative integers.
   *
   * @param a The first negative integer.
   * @param b The second negative integer.
   * @returns `a + b` as a NegativeInt.
   */
  add,

  /**
   * Subtracts one negative integer from another.
   *
   * The mathematical result can be positive, so it is clamped to the negative
   * integer range (maximum `-1`).
   *
   * @param a The minuend negative integer.
   * @param b The subtrahend negative integer.
   * @returns `a - b` clamped to the negative integer range.
   */
  sub,
} as const;
