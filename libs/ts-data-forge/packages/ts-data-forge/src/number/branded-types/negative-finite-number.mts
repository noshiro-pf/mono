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
 * Type guard that checks if a value is a negative finite number.
 *
 * Returns `true` only for a finite value — never `NaN`, `Infinity`, or
 * `-Infinity`.
 *
 * @param value - The value to check
 * @returns `true` if the value is a negative finite number, `false` otherwise
 */
export const isNegativeFiniteNumber = is;

/**
 * Casts a `number` to the `NegativeFiniteNumber` branded type.
 *
 * Validates that the value is a negative finite number and returns it with the
 * `NegativeFiniteNumber` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `NegativeFiniteNumber`
 * @throws {TypeError} If the value is not a negative finite number
 */
export const asNegativeFiniteNumber = castType;

/**
 * Namespace providing type-safe operations for the `NegativeFiniteNumber`
 * branded type.
 *
 * The `NegativeFiniteNumber` type represents a negative finite number.
 */
export const NegativeFiniteNumber = {
  /**
   * Type guard that checks if a value is a negative finite number.
   *
   * @param value - The value to check
   * @returns `true` if the value is a negative finite number, `false` otherwise
   * @see {@link isNegativeFiniteNumber} for usage examples
   */
  is,

  /**
   * The largest value representable as `NegativeFiniteNumber`.
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a negative finite number.
   *
   * The result is non-negative and keeps the `NegativeFiniteNumber` brand.
   *
   * @param a - The negative finite number value
   * @returns The absolute value as a non-negative `NegativeFiniteNumber`
   */
  abs,

  /**
   * Returns the smallest of the given negative finite numbers.
   *
   * @param values - The negative finite numbers to compare (at least one required)
   * @returns The smallest value as a `NegativeFiniteNumber`
   */
  min: min_,

  /**
   * Returns the largest of the given negative finite numbers.
   *
   * @param values - The negative finite numbers to compare (at least one required)
   * @returns The largest value as a `NegativeFiniteNumber`
   */
  max: max_,

  /**
   * Clamps a `number` into the `NegativeFiniteNumber` range `[MIN_VALUE,
   * MAX_VALUE]`.
   *
   * @param value - The value to clamp
   * @returns The clamped value as a `NegativeFiniteNumber`
   */
  clamp,

  /**
   * Returns the greatest integer less than or equal to a negative finite
   * number.
   *
   * @param a - The negative finite number value
   * @returns The floored value as an integer
   */
  floor,

  /**
   * Returns the smallest integer greater than or equal to a negative finite
   * number.
   *
   * @param a - The negative finite number value
   * @returns The ceiled value as an integer
   */
  ceil,

  /**
   * Returns the value of a negative finite number rounded to the nearest
   * integer.
   *
   * @param a - The negative finite number value
   * @returns The rounded value as an integer
   */
  round,

  /**
   * Generates a random `NegativeFiniteNumber` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `NegativeFiniteNumber` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a
   * `NegativeFiniteNumber`.
   *
   * @param a - The base negative finite number
   * @param b - The exponent negative finite number
   * @returns `a ** b` as a `NegativeFiniteNumber`
   */
  pow,

  /**
   * Adds two negative finite numbers, returning `a + b` as a
   * `NegativeFiniteNumber`.
   *
   * @param a - The first negative finite number
   * @param b - The second negative finite number
   * @returns The sum of `a` and `b` as a `NegativeFiniteNumber`
   */
  add,

  /**
   * Subtracts two negative finite numbers, returning `a - b` as a
   * `NegativeFiniteNumber`.
   *
   * @param a - The first negative finite number
   * @param b - The second negative finite number
   * @returns The difference of `a` and `b` as a `NegativeFiniteNumber`
   */
  sub,
} as const;
