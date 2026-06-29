import { type NonPositiveFiniteNumber as TtfImported_NonPositiveFiniteNumber } from 'ts-type-forge';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type NonPositiveFiniteNumber = TtfImported_NonPositiveFiniteNumber;

type ElementType = NonPositiveFiniteNumber;

const typeNameInMessage = 'a non-positive finite number';

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
  0
>({
  MIN_VALUE: Number.MAX_VALUE * -1,
  MAX_VALUE: 0,
  typeNameInMessage,
} as const);

const floor = (
  x: ElementType,
): TsDataForgeInternals.RefinedNumberUtils.RemoveNonZeroBrandKey<
  TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>
> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Math.floor(
    x,
  ) as TsDataForgeInternals.RefinedNumberUtils.RemoveNonZeroBrandKey<
    TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>
  >;

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
 * Checks if a number is a NonPositiveFiniteNumber (a finite number <= 0).
 *
 * @param value The value to check.
 * @returns `true` if the value is a NonPositiveFiniteNumber, `false` otherwise.
 */
export const isNonPositiveFiniteNumber = is;

/**
 * Casts a number to a NonPositiveFiniteNumber type.
 *
 * @param value The value to cast.
 * @returns The value as a NonPositiveFiniteNumber type.
 * @throws {TypeError} If the value is not a non-positive finite number.
 */
export const asNonPositiveFiniteNumber = castType;

/**
 * Namespace providing type-safe arithmetic operations for non-positive finite
 * numbers.
 *
 * All operations maintain the non-positive constraint by clamping positive
 * results to MAX_VALUE (0), while ensuring results remain finite (excluding NaN
 * and Infinity). This type is useful for representing quantities that must
 * always be non-positive, such as debts, penalties, and negative offsets.
 */
export const NonPositiveFiniteNumber = {
  /**
   * Type guard to check if a value is a NonPositiveFiniteNumber.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-positive finite number, `false`
   *   otherwise.
   */
  is,

  /**
   * The maximum value for a non-positive finite number.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two NonPositiveFiniteNumber values.
   *
   * @param a The first NonPositiveFiniteNumber.
   * @param b The second NonPositiveFiniteNumber.
   * @returns The minimum value as a NonPositiveFiniteNumber.
   */
  min: min_,

  /**
   * Returns the larger of two NonPositiveFiniteNumber values.
   *
   * @param a The first NonPositiveFiniteNumber.
   * @param b The second NonPositiveFiniteNumber.
   * @returns The maximum value as a NonPositiveFiniteNumber.
   */
  max: max_,

  /**
   * Clamps a number to the non-positive finite range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to (-∞, 0] as a NonPositiveFiniteNumber.
   */
  clamp,

  /**
   * Rounds down a NonPositiveFiniteNumber to the nearest integer.
   *
   * @param x The NonPositiveFiniteNumber to round down.
   * @returns The floor value as a NonPositiveInt (can be 0).
   */
  floor,

  /**
   * Rounds up a NonPositiveFiniteNumber to the nearest integer.
   *
   * @param x The NonPositiveFiniteNumber to round up.
   * @returns The ceiling value as a NegativeInt (always <= -1) or 0.
   */
  ceil,

  /**
   * Rounds a NonPositiveFiniteNumber to the nearest integer.
   *
   * @param x The NonPositiveFiniteNumber to round.
   * @returns The rounded value as a NonPositiveInt (can be 0 if x > -0.5).
   */
  round,

  /**
   * Generates a random NonPositiveFiniteNumber value.
   *
   * @returns A random non-positive finite number.
   */
  random,

  /**
   * Raises a NonPositiveFiniteNumber to the power of another NonPositiveFiniteNumber.
   *
   * @param a The base NonPositiveFiniteNumber.
   * @param b The exponent NonPositiveFiniteNumber.
   * @returns `a ** b` clamped to (-∞, 0] as a NonPositiveFiniteNumber.
   */
  pow,

  /**
   * Adds two NonPositiveFiniteNumber values.
   *
   * @param a The first NonPositiveFiniteNumber.
   * @param b The second NonPositiveFiniteNumber.
   * @returns `a + b` clamped to (-∞, 0] as a NonPositiveFiniteNumber.
   */
  add,

  /**
   * Subtracts one NonPositiveFiniteNumber from another.
   *
   * @param a The minuend NonPositiveFiniteNumber.
   * @param b The subtrahend NonPositiveFiniteNumber.
   * @returns `a - b` clamped to (-∞, 0] as a NonPositiveFiniteNumber (maximum 0).
   */
  sub,
} as const;
