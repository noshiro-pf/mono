import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = NonZeroFiniteNumber;

const typeNameInMessage = 'a non-zero finite number';

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
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForFloat<
  ElementType,
  number,
  number
>({
  nonZero: true,
  MIN_VALUE: -Number.MAX_VALUE,
  MAX_VALUE: Number.MAX_VALUE,
  typeNameInMessage,
} as const);

// Not provided because reasonable rounding operations that avoid becoming 0 cannot be defined

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

expectType<
  TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>,
  NonZeroInt
>('=');

expectType<
  TsDataForgeInternals.RefinedNumberUtils.RemoveNonZeroBrandKey<
    TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>
  >,
  Int
>('=');

/**
 * Checks if a number is a NonZeroFiniteNumber (a finite number that is not 0).
 *
 * @param value The value to check.
 * @returns `true` if the value is a NonZeroFiniteNumber, `false` otherwise.
 */
export const isNonZeroFiniteNumber = is;
/**
 * Casts a number to a NonZeroFiniteNumber type.
 *
 * @param value The value to cast.
 * @returns The value as a NonZeroFiniteNumber type.
 * @throws {TypeError} If the value is not a non-zero finite number.
 */
export const asNonZeroFiniteNumber = castType;

/**
 * Namespace providing type-safe arithmetic operations for non-zero finite
 * numbers.
 *
 * All operations maintain the non-zero constraint while ensuring results remain
 * finite (excluding NaN and Infinity). This type is useful for values that must
 * never be zero, such as denominators, scaling factors, and ratios.
 */
export const NonZeroFiniteNumber = {
  /**
   * Type guard to check if a value is a NonZeroFiniteNumber.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-zero finite number, `false`
   *   otherwise.
   */
  is,

  /**
   * Returns the absolute value of a non-zero finite number.
   *
   * @param a The NonZeroFiniteNumber.
   * @returns The absolute value as a NonZeroFiniteNumber.
   */
  abs,

  /**
   * Returns the smaller of two NonZeroFiniteNumber values.
   *
   * @param a The first NonZeroFiniteNumber.
   * @param b The second NonZeroFiniteNumber.
   * @returns The minimum value as a NonZeroFiniteNumber.
   */
  min: min_,

  /**
   * Returns the larger of two NonZeroFiniteNumber values.
   *
   * @param a The first NonZeroFiniteNumber.
   * @param b The second NonZeroFiniteNumber.
   * @returns The maximum value as a NonZeroFiniteNumber.
   */
  max: max_,

  /**
   * Rounds down a NonZeroFiniteNumber to the nearest integer.
   *
   * @param x The NonZeroFiniteNumber to round down.
   * @returns The floor value as a NonZeroInt.
   */
  floor,

  /**
   * Rounds up a NonZeroFiniteNumber to the nearest integer.
   *
   * @param x The NonZeroFiniteNumber to round up.
   * @returns The ceiling value as a NonZeroInt.
   */
  ceil,

  /**
   * Rounds a NonZeroFiniteNumber to the nearest integer.
   *
   * @param x The NonZeroFiniteNumber to round.
   * @returns The rounded value as a NonZeroInt.
   */
  round,

  /**
   * Generates a random NonZeroFiniteNumber value.
   *
   * @returns A random non-zero finite number.
   */
  random,

  /**
   * Raises a NonZeroFiniteNumber to the power of another NonZeroFiniteNumber.
   *
   * @param a The base NonZeroFiniteNumber.
   * @param b The exponent NonZeroFiniteNumber.
   * @returns `a ** b` as a NonZeroFiniteNumber.
   */
  pow,

  /**
   * Adds two NonZeroFiniteNumber values.
   *
   * @param a The first NonZeroFiniteNumber.
   * @param b The second NonZeroFiniteNumber.
   * @returns `a + b` as a NonZeroFiniteNumber.
   */
  add,

  /**
   * Subtracts one NonZeroFiniteNumber from another.
   *
   * @param a The minuend NonZeroFiniteNumber.
   * @param b The subtrahend NonZeroFiniteNumber.
   * @returns `a - b` as a NonZeroFiniteNumber.
   */
  sub,

  /**
   * Multiplies two NonZeroFiniteNumber values.
   *
   * @param a The first NonZeroFiniteNumber.
   * @param b The second NonZeroFiniteNumber.
   * @returns `a * b` as a NonZeroFiniteNumber.
   */
  mul,

  /**
   * Divides one NonZeroFiniteNumber by another.
   *
   * @param a The dividend NonZeroFiniteNumber.
   * @param b The divisor NonZeroFiniteNumber.
   * @returns `a / b` as a NonZeroFiniteNumber.
   */
  div,
} as const;

expectType<
  TsDataForgeInternals.RefinedNumberUtils.ToNonNegative<ElementType>,
  PositiveFiniteNumber
>('=');

expectType<
  keyof typeof NonZeroFiniteNumber,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<ElementType, never>
>('=');

expectType<
  typeof NonZeroFiniteNumber,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<ElementType, never>
>('<=');
