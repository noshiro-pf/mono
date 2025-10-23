import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = NonNegativeFiniteNumber;

const typeNameInMessage = 'a non-negative finite number';

const {
  MIN_VALUE,
  add,
  castType,
  clamp,
  div,
  is,
  max: max_,
  min: min_,
  mul,
  pow,
  random,
  sub,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForFloat<
  ElementType,
  0,
  number
>({
  MIN_VALUE: 0,
  MAX_VALUE: Number.MAX_VALUE,
  typeNameInMessage,
} as const);

const floor = (
  x: ElementType,
): TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Math.floor(x) as TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>;

const ceil = (
  x: ElementType,
): TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Math.ceil(x) as TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>;

const round = (
  x: ElementType,
): TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Math.round(x) as TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>;

expectType<TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>, Uint>(
  '=',
);

/**
 * Checks if a number is a NonNegativeFiniteNumber (a finite number >= 0).
 *
 * @param value The value to check.
 * @returns `true` if the value is a NonNegativeFiniteNumber, `false` otherwise.
 */
export const isNonNegativeFiniteNumber = is;

/**
 * Casts a number to a NonNegativeFiniteNumber type.
 *
 * @param value The value to cast.
 * @returns The value as a NonNegativeFiniteNumber type.
 * @throws {TypeError} If the value is not a non-negative finite number.
 */
export const asNonNegativeFiniteNumber = castType;

/**
 * Namespace providing type-safe arithmetic operations for non-negative finite
 * numbers.
 *
 * All operations maintain the non-negative constraint by clamping negative
 * results to 0, while ensuring results remain finite (excluding NaN and
 * Infinity). This type is useful for representing measurements, distances,
 * weights, and other inherently non-negative values.
 */
export const NonNegativeFiniteNumber = {
  /**
   * Type guard to check if a value is a NonNegativeFiniteNumber.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-negative finite number, `false`
   *   otherwise.
   */
  is,

  /**
   * The minimum value for a non-negative finite number.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * Returns the smaller of two NonNegativeFiniteNumber values.
   *
   * @param a The first NonNegativeFiniteNumber.
   * @param b The second NonNegativeFiniteNumber.
   * @returns The minimum value as a NonNegativeFiniteNumber.
   */
  min: min_,

  /**
   * Returns the larger of two NonNegativeFiniteNumber values.
   *
   * @param a The first NonNegativeFiniteNumber.
   * @param b The second NonNegativeFiniteNumber.
   * @returns The maximum value as a NonNegativeFiniteNumber.
   */
  max: max_,

  /**
   * Clamps a number to the non-negative finite range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to [0, +∞) as a NonNegativeFiniteNumber.
   */
  clamp,

  /**
   * Rounds down a NonNegativeFiniteNumber to the nearest integer.
   *
   * @param x The NonNegativeFiniteNumber to round down.
   * @returns The floor value as a Uint.
   */
  floor,

  /**
   * Rounds up a NonNegativeFiniteNumber to the nearest integer.
   *
   * @param x The NonNegativeFiniteNumber to round up.
   * @returns The ceiling value as a Uint.
   */
  ceil,

  /**
   * Rounds a NonNegativeFiniteNumber to the nearest integer.
   *
   * @param x The NonNegativeFiniteNumber to round.
   * @returns The rounded value as a Uint.
   */
  round,

  /**
   * Generates a random NonNegativeFiniteNumber value.
   *
   * @returns A random non-negative finite number.
   */
  random,

  /**
   * Raises a NonNegativeFiniteNumber to the power of another
   * NonNegativeFiniteNumber.
   *
   * @param a The base NonNegativeFiniteNumber.
   * @param b The exponent NonNegativeFiniteNumber.
   * @returns `a ** b` clamped to [0, +∞) as a NonNegativeFiniteNumber.
   */
  pow,

  /**
   * Adds two NonNegativeFiniteNumber values.
   *
   * @param a The first NonNegativeFiniteNumber.
   * @param b The second NonNegativeFiniteNumber.
   * @returns `a + b` clamped to [0, +∞) as a NonNegativeFiniteNumber.
   */
  add,

  /**
   * Subtracts one NonNegativeFiniteNumber from another.
   *
   * @param a The minuend NonNegativeFiniteNumber.
   * @param b The subtrahend NonNegativeFiniteNumber.
   * @returns `a - b` clamped to [0, +∞) as a NonNegativeFiniteNumber (minimum
   *   0).
   */
  sub,

  /**
   * Multiplies two NonNegativeFiniteNumber values.
   *
   * @param a The first NonNegativeFiniteNumber.
   * @param b The second NonNegativeFiniteNumber.
   * @returns `a * b` clamped to [0, +∞) as a NonNegativeFiniteNumber.
   */
  mul,

  /**
   * Divides one NonNegativeFiniteNumber by another.
   *
   * @param a The dividend NonNegativeFiniteNumber.
   * @param b The divisor NonNegativeFiniteNumber.
   * @returns `a / b` clamped to [0, +∞) as a NonNegativeFiniteNumber.
   */
  div,
} as const;

expectType<
  keyof typeof NonNegativeFiniteNumber,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'non-negative'
  >
>('=');

expectType<
  typeof NonNegativeFiniteNumber,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'non-negative'
  >
>('<=');
