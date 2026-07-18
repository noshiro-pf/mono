import {
  type NegativeSafeInt as TtfImported_NegativeSafeInt,
  type WithSmallInt,
} from 'ts-type-forge';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';
import { PositiveSafeInt } from './positive-safe-int.mjs';

export type NegativeSafeInt = TtfImported_NegativeSafeInt;

type ElementType = NegativeSafeInt;

const typeNameInMessage = 'a negative safe integer';

const {
  MAX_VALUE,
  MIN_VALUE,
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
  integerOrSafeInteger: 'SafeInteger',
  nonZero: true,
  MIN_VALUE: Number.MIN_SAFE_INTEGER,
  MAX_VALUE: -1,
  typeNameInMessage,
} as const);

/**
 * Returns the absolute value of a negative safe integer.
 *
 * The absolute value of a negative safe integer is always a positive safe
 * integer (`>= 1`), so the result is typed as a {@link PositiveSafeInt}.
 *
 * @param x - The negative safe integer.
 * @returns `|x|` as a PositiveSafeInt.
 */
const abs = (x: WithSmallInt<ElementType>): PositiveSafeInt =>
  PositiveSafeInt.clamp(Math.abs(x));

/**
 * Checks if a number is a NegativeSafeInt (a negative safe integer in the range
 * `[Number.MIN_SAFE_INTEGER, -1]`).
 *
 * @param value The value to check.
 * @returns `true` if the value is a NegativeSafeInt, `false` otherwise.
 */
export const isNegativeSafeInt = is;

/**
 * Casts a number to a NegativeSafeInt type.
 *
 * @param value The value to cast.
 * @returns The value as a NegativeSafeInt type.
 * @throws {TypeError} If the value is not a negative safe integer.
 */
export const asNegativeSafeInt = castType;

/**
 * Namespace providing type-safe arithmetic operations for negative safe
 * integers.
 *
 * NegativeSafeInt represents safe integers that are strictly less than zero
 * (`[Number.MIN_SAFE_INTEGER, -1]`). Operations that stay within the negative
 * safe integers clamp their results to the valid range, while operations whose
 * result leaves the set (`mul`, `div`, `abs`) are typed to reflect the actual
 * sign of the result.
 */
export const NegativeSafeInt = {
  /**
   * Type guard to check if a value is a NegativeSafeInt.
   *
   * @param value The value to check.
   * @returns `true` if the value is a negative safe integer, `false` otherwise.
   */
  is,

  /**
   * The minimum value for a negative safe integer.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a negative safe integer.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a negative safe integer.
   *
   * @param a The negative safe integer.
   * @returns The absolute value as a PositiveSafeInt.
   */
  abs,

  /**
   * Returns the smaller of two negative safe integers.
   *
   * @param a The first negative safe integer.
   * @param b The second negative safe integer.
   * @returns The minimum value as a NegativeSafeInt.
   */
  min: min_,

  /**
   * Returns the larger of two negative safe integers.
   *
   * @param a The first negative safe integer.
   * @param b The second negative safe integer.
   * @returns The maximum value as a NegativeSafeInt.
   */
  max: max_,

  /**
   * Clamps a number to the NegativeSafeInt range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to `[Number.MIN_SAFE_INTEGER, -1]` as a
   *   NegativeSafeInt.
   */
  clamp,

  /**
   * Generates a random NegativeSafeInt value within the valid range.
   *
   * @returns A random NegativeSafeInt between Number.MIN_SAFE_INTEGER and -1.
   */
  random,

  /**
   * Raises a negative safe integer to the power of another negative safe
   * integer.
   *
   * @param a The base negative safe integer.
   * @param b The exponent negative safe integer.
   * @returns `a ** b` clamped to the NegativeSafeInt range.
   */
  pow,

  /**
   * Adds two negative safe integers.
   *
   * @param a The first negative safe integer.
   * @param b The second negative safe integer.
   * @returns `a + b` clamped to the NegativeSafeInt range.
   */
  add,

  /**
   * Subtracts one negative safe integer from another.
   *
   * The mathematical result can be positive, so it is clamped to the
   * NegativeSafeInt range (maximum `-1`).
   *
   * @param a The minuend negative safe integer.
   * @param b The subtrahend negative safe integer.
   * @returns `a - b` clamped to the NegativeSafeInt range.
   */
  sub,
} as const;
