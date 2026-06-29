import { type NegativeFiniteNumber as TtfImported_NegativeFiniteNumber } from 'ts-type-forge';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';
import { PositiveFiniteNumber } from './positive-finite-number.mjs';

export type NegativeFiniteNumber = TtfImported_NegativeFiniteNumber;

type ElementType = NegativeFiniteNumber;

const typeNameInMessage = 'a negative finite number';

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
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForFloat<
  ElementType,
  number,
  number
>({
  nonZero: true,
  MIN_VALUE: -Number.MAX_VALUE,
  MAX_VALUE: -Number.MIN_VALUE,
  typeNameInMessage,
} as const);

/**
 * Returns the absolute value of a negative finite number.
 *
 * The absolute value of a negative finite number is always a positive finite
 * number, so the result is typed as a {@link PositiveFiniteNumber}.
 *
 * @param x - The negative finite number.
 * @returns `|x|` as a PositiveFiniteNumber.
 */
const abs = (x: ElementType): PositiveFiniteNumber =>
  PositiveFiniteNumber.clamp(Math.abs(x));

const floor = (
  x: ElementType,
): TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Math.floor(x) as TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>;

const ceil = (
  x: ElementType,
): TsDataForgeInternals.RefinedNumberUtils.RemoveNonZeroBrandKey<
  TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>
> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Math.ceil(x) as TsDataForgeInternals.RefinedNumberUtils.RemoveNonZeroBrandKey<
    TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>
  >;

const round = (
  x: ElementType,
): TsDataForgeInternals.RefinedNumberUtils.RemoveNonZeroBrandKey<
  TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>
> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Math.round(
    x,
  ) as TsDataForgeInternals.RefinedNumberUtils.RemoveNonZeroBrandKey<
    TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>
  >;

/**
 * Checks if a number is a NegativeFiniteNumber (a finite number `< 0`).
 *
 * @param value The value to check.
 * @returns `true` if the value is a NegativeFiniteNumber, `false` otherwise.
 */
export const isNegativeFiniteNumber = is;

/**
 * Casts a number to a NegativeFiniteNumber type.
 *
 * @param value The value to cast.
 * @returns The value as a NegativeFiniteNumber type.
 * @throws {TypeError} If the value is not a negative finite number.
 */
export const asNegativeFiniteNumber = castType;

/**
 * Namespace providing type-safe arithmetic operations for negative finite
 * numbers.
 *
 * All operations keep results finite (excluding NaN and Infinity). Operations
 * that stay within the negative finite numbers clamp their results to the valid
 * range, while operations whose result leaves the set (`mul`, `div`, `abs`) are
 * typed to reflect the actual sign of the result.
 */
export const NegativeFiniteNumber = {
  /**
   * Type guard to check if a value is a NegativeFiniteNumber.
   *
   * @param value The value to check.
   * @returns `true` if the value is a negative finite number, `false`
   *   otherwise.
   */
  is,

  /**
   * The maximum value for a negative finite number.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a negative finite number.
   *
   * @param a The negative finite number.
   * @returns The absolute value as a PositiveFiniteNumber.
   */
  abs,

  /**
   * Returns the smaller of two NegativeFiniteNumber values.
   *
   * @param a The first NegativeFiniteNumber.
   * @param b The second NegativeFiniteNumber.
   * @returns The minimum value as a NegativeFiniteNumber.
   */
  min: min_,

  /**
   * Returns the larger of two NegativeFiniteNumber values.
   *
   * @param a The first NegativeFiniteNumber.
   * @param b The second NegativeFiniteNumber.
   * @returns The maximum value as a NegativeFiniteNumber.
   */
  max: max_,

  /**
   * Clamps a number to the negative finite range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to `(-∞, 0)` as a NegativeFiniteNumber.
   */
  clamp,

  /**
   * Rounds down a NegativeFiniteNumber to the nearest integer.
   *
   * @param x The NegativeFiniteNumber to round down.
   * @returns The floor value as a NegativeInt (always `<= -1`).
   */
  floor,

  /**
   * Rounds up a NegativeFiniteNumber to the nearest integer.
   *
   * @param x The NegativeFiniteNumber to round up.
   * @returns The ceiling value as a NonPositiveInt (can be 0).
   */
  ceil,

  /**
   * Rounds a NegativeFiniteNumber to the nearest integer.
   *
   * @param x The NegativeFiniteNumber to round.
   * @returns The rounded value as a NonPositiveInt (can be 0 if x > -0.5).
   */
  round,

  /**
   * Generates a random NegativeFiniteNumber value.
   *
   * @returns A random negative finite number.
   */
  random,

  /**
   * Raises a NegativeFiniteNumber to the power of another NegativeFiniteNumber.
   *
   * @param a The base NegativeFiniteNumber.
   * @param b The exponent NegativeFiniteNumber.
   * @returns `a ** b` clamped to `(-∞, 0)` as a NegativeFiniteNumber.
   */
  pow,

  /**
   * Adds two NegativeFiniteNumber values.
   *
   * @param a The first NegativeFiniteNumber.
   * @param b The second NegativeFiniteNumber.
   * @returns `a + b` as a NegativeFiniteNumber.
   */
  add,

  /**
   * Subtracts one NegativeFiniteNumber from another.
   *
   * The mathematical result can be positive, so it is clamped to the negative
   * finite range (maximum `-Number.MIN_VALUE`).
   *
   * @param a The minuend NegativeFiniteNumber.
   * @param b The subtrahend NegativeFiniteNumber.
   * @returns `a - b` clamped to `(-∞, 0)` as a NegativeFiniteNumber.
   */
  sub,
} as const;
