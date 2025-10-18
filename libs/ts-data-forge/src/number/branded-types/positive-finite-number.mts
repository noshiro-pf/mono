import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = PositiveFiniteNumber;

const typeNameInMessage = 'a positive finite number';

const {
  MIN_VALUE,
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
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForFloat<
  ElementType,
  number,
  number
>({
  MIN_VALUE: Number.MIN_VALUE,
  MAX_VALUE: Number.MAX_VALUE,
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
): TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Math.ceil(x) as TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>;

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

expectType<
  TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>,
  PositiveInt
>('=');

expectType<
  TsDataForgeInternals.RefinedNumberUtils.RemoveNonZeroBrandKey<
    TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>
  >,
  Uint
>('=');

/**
 * Checks if a number is a PositiveFiniteNumber (a finite number > 0).
 *
 * @param value The value to check.
 * @returns `true` if the value is a PositiveFiniteNumber, `false` otherwise.
 */
export const isPositiveFiniteNumber = is;

/**
 * Casts a number to a PositiveFiniteNumber type.
 *
 * @param value The value to cast.
 * @returns The value as a PositiveFiniteNumber type.
 * @throws {TypeError} If the value is not a positive finite number.
 */
export const asPositiveFiniteNumber = castType;

/**
 * Namespace providing type-safe arithmetic operations for positive finite
 * numbers.
 *
 * All operations maintain the positive constraint by clamping non-positive
 * results to MIN_VALUE, while ensuring results remain finite (excluding NaN and
 * Infinity). This type is useful for representing quantities that must always
 * be positive, such as probabilities, magnitudes, and physical measurements.
 */
export const PositiveFiniteNumber = {
  /**
   * Type guard to check if a value is a PositiveFiniteNumber.
   *
   * @param value The value to check.
   * @returns `true` if the value is a positive finite number, `false`
   *   otherwise.
   */
  is,

  /**
   * The minimum value for a positive finite number.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * Returns the smaller of two PositiveFiniteNumber values.
   *
   * @param a The first PositiveFiniteNumber.
   * @param b The second PositiveFiniteNumber.
   * @returns The minimum value as a PositiveFiniteNumber.
   */
  min: min_,

  /**
   * Returns the larger of two PositiveFiniteNumber values.
   *
   * @param a The first PositiveFiniteNumber.
   * @param b The second PositiveFiniteNumber.
   * @returns The maximum value as a PositiveFiniteNumber.
   */
  max: max_,

  /**
   * Clamps a number to the positive finite range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to (0, +∞) as a PositiveFiniteNumber.
   */
  clamp,

  /**
   * Rounds down a PositiveFiniteNumber to the nearest integer.
   *
   * @param x The PositiveFiniteNumber to round down.
   * @returns The floor value as a Uint (can be 0).
   */
  floor,

  /**
   * Rounds up a PositiveFiniteNumber to the nearest integer.
   *
   * @param x The PositiveFiniteNumber to round up.
   * @returns The ceiling value as a PositiveInt (always >= 1).
   */
  ceil,

  /**
   * Rounds a PositiveFiniteNumber to the nearest integer.
   *
   * @param x The PositiveFiniteNumber to round.
   * @returns The rounded value as a Uint (can be 0 if x < 0.5).
   */
  round,

  /**
   * Generates a random PositiveFiniteNumber value.
   *
   * @returns A random positive finite number.
   */
  random,

  /**
   * Raises a PositiveFiniteNumber to the power of another PositiveFiniteNumber.
   *
   * @param a The base PositiveFiniteNumber.
   * @param b The exponent PositiveFiniteNumber.
   * @returns `a ** b` clamped to (0, +∞) as a PositiveFiniteNumber.
   */
  pow,

  /**
   * Adds two PositiveFiniteNumber values.
   *
   * @param a The first PositiveFiniteNumber.
   * @param b The second PositiveFiniteNumber.
   * @returns `a + b` clamped to (0, +∞) as a PositiveFiniteNumber.
   */
  add,

  /**
   * Subtracts one PositiveFiniteNumber from another.
   *
   * @param a The minuend PositiveFiniteNumber.
   * @param b The subtrahend PositiveFiniteNumber.
   * @returns `a - b` clamped to (0, +∞) as a PositiveFiniteNumber (minimum
   *   MIN_VALUE).
   */
  sub,

  /**
   * Multiplies two PositiveFiniteNumber values.
   *
   * @param a The first PositiveFiniteNumber.
   * @param b The second PositiveFiniteNumber.
   * @returns `a * b` clamped to (0, +∞) as a PositiveFiniteNumber.
   */
  mul,

  /**
   * Divides one PositiveFiniteNumber by another.
   *
   * @param a The dividend PositiveFiniteNumber.
   * @param b The divisor PositiveFiniteNumber.
   * @returns `a / b` clamped to (0, +∞) as a PositiveFiniteNumber.
   */
  div,
} as const;

expectType<
  keyof typeof PositiveFiniteNumber,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'positive'
  >
>('=');

expectType<
  typeof PositiveFiniteNumber,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<ElementType, 'positive'>
>('<=');
