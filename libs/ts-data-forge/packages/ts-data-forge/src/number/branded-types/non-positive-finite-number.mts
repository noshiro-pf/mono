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
 * Type guard that checks if a value is a non-positive finite number.
 *
 * Returns `true` only for a finite value — never `NaN`, `Infinity`, or
 * `-Infinity`.
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-positive finite number, `false` otherwise
 */
export const isNonPositiveFiniteNumber = is;

/**
 * Casts a `number` to the `NonPositiveFiniteNumber` branded type.
 *
 * Validates that the value is a non-positive finite number and returns it with
 * the `NonPositiveFiniteNumber` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `NonPositiveFiniteNumber`
 * @throws {TypeError} If the value is not a non-positive finite number
 */
export const asNonPositiveFiniteNumber = castType;

/**
 * Namespace providing type-safe operations for the `NonPositiveFiniteNumber`
 * branded type.
 *
 * The `NonPositiveFiniteNumber` type represents a non-positive finite number.
 */
export const NonPositiveFiniteNumber = {
  /**
   * Type guard that checks if a value is a non-positive finite number.
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-positive finite number, `false` otherwise
   * @see {@link isNonPositiveFiniteNumber} for usage examples
   */
  is,

  /**
   * The largest value representable as `NonPositiveFiniteNumber`.
   */
  MAX_VALUE,

  /**
   * Returns the smallest of the given non-positive finite numbers.
   *
   * @param values - The non-positive finite numbers to compare (at least one required)
   * @returns The smallest value as a `NonPositiveFiniteNumber`
   */
  min: min_,

  /**
   * Returns the largest of the given non-positive finite numbers.
   *
   * @param values - The non-positive finite numbers to compare (at least one required)
   * @returns The largest value as a `NonPositiveFiniteNumber`
   */
  max: max_,

  /**
   * Clamps a `number` into the `NonPositiveFiniteNumber` range `[MIN_VALUE,
   * MAX_VALUE]`.
   *
   * @param value - The value to clamp
   * @returns The clamped value as a `NonPositiveFiniteNumber`
   */
  clamp,

  /**
   * Returns the greatest integer less than or equal to a non-positive finite
   * number.
   *
   * @param a - The non-positive finite number value
   * @returns The floored value as an integer
   */
  floor,

  /**
   * Returns the smallest integer greater than or equal to a non-positive finite
   * number.
   *
   * @param a - The non-positive finite number value
   * @returns The ceiled value as an integer
   */
  ceil,

  /**
   * Returns the value of a non-positive finite number rounded to the nearest
   * integer.
   *
   * @param a - The non-positive finite number value
   * @returns The rounded value as an integer
   */
  round,

  /**
   * Generates a random `NonPositiveFiniteNumber` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `NonPositiveFiniteNumber` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a
   * `NonPositiveFiniteNumber`.
   *
   * @param a - The base non-positive finite number
   * @param b - The exponent non-positive finite number
   * @returns `a ** b` as a `NonPositiveFiniteNumber`
   */
  pow,

  /**
   * Adds two non-positive finite numbers, returning `a + b` as a
   * `NonPositiveFiniteNumber`.
   *
   * @param a - The first non-positive finite number
   * @param b - The second non-positive finite number
   * @returns The sum of `a` and `b` as a `NonPositiveFiniteNumber`
   */
  add,

  /**
   * Subtracts two non-positive finite numbers, returning `a - b` as a
   * `NonPositiveFiniteNumber`.
   *
   * @param a - The first non-positive finite number
   * @param b - The second non-positive finite number
   * @returns The difference of `a` and `b` as a `NonPositiveFiniteNumber`
   */
  sub,
} as const;
