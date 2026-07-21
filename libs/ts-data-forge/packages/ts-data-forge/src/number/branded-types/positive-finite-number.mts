import {
  type PositiveInt,
  type PositiveFiniteNumber as TtfImported_PositiveFiniteNumber,
  type Uint,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type PositiveFiniteNumber = TtfImported_PositiveFiniteNumber;

type ElementType = PositiveFiniteNumber;

const typeNameInMessage = 'a positive finite number';

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
 * Type guard that checks if a value is a positive finite number.
 *
 * Returns `true` only for a finite value — never `NaN`, `Infinity`, or
 * `-Infinity`.
 *
 * @param value - The value to check
 * @returns `true` if the value is a positive finite number, `false` otherwise
 */
export const isPositiveFiniteNumber = is;

/**
 * Casts a `number` to the `PositiveFiniteNumber` branded type.
 *
 * Validates that the value is a positive finite number and returns it with the
 * `PositiveFiniteNumber` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `PositiveFiniteNumber`
 * @throws {TypeError} If the value is not a positive finite number
 */
export const asPositiveFiniteNumber = castType;

/**
 * Namespace providing type-safe operations for the `PositiveFiniteNumber`
 * branded type.
 *
 * The `PositiveFiniteNumber` type represents a positive finite number.
 */
export const PositiveFiniteNumber = {
  /**
   * Type guard that checks if a value is a positive finite number.
   *
   * @param value - The value to check
   * @returns `true` if the value is a positive finite number, `false` otherwise
   * @see {@link isPositiveFiniteNumber} for usage examples
   */
  is,

  /**
   * The smallest value representable as `PositiveFiniteNumber`.
   */
  MIN_VALUE,

  /**
   * Returns the smallest of the given positive finite numbers.
   *
   * @param values - The positive finite numbers to compare (at least one required)
   * @returns The smallest value as a `PositiveFiniteNumber`
   */
  min: min_,

  /**
   * Returns the largest of the given positive finite numbers.
   *
   * @param values - The positive finite numbers to compare (at least one required)
   * @returns The largest value as a `PositiveFiniteNumber`
   */
  max: max_,

  /**
   * Clamps a `number` into the `PositiveFiniteNumber` range `[MIN_VALUE,
   * MAX_VALUE]`.
   *
   * @param value - The value to clamp
   * @returns The clamped value as a `PositiveFiniteNumber`
   */
  clamp,

  /**
   * Returns the greatest integer less than or equal to a positive finite
   * number.
   *
   * @param a - The positive finite number value
   * @returns The floored value as an integer
   */
  floor,

  /**
   * Returns the smallest integer greater than or equal to a positive finite
   * number.
   *
   * @param a - The positive finite number value
   * @returns The ceiled value as an integer
   */
  ceil,

  /**
   * Returns the value of a positive finite number rounded to the nearest
   * integer.
   *
   * @param a - The positive finite number value
   * @returns The rounded value as an integer
   */
  round,

  /**
   * Generates a random `PositiveFiniteNumber` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `PositiveFiniteNumber` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a
   * `PositiveFiniteNumber`.
   *
   * @param a - The base positive finite number
   * @param b - The exponent positive finite number
   * @returns `a ** b` as a `PositiveFiniteNumber`
   */
  pow,

  /**
   * Adds two positive finite numbers, returning `a + b` as a
   * `PositiveFiniteNumber`.
   *
   * @param a - The first positive finite number
   * @param b - The second positive finite number
   * @returns The sum of `a` and `b` as a `PositiveFiniteNumber`
   */
  add,

  /**
   * Subtracts two positive finite numbers, returning `a - b` as a
   * `PositiveFiniteNumber`.
   *
   * @param a - The first positive finite number
   * @param b - The second positive finite number
   * @returns The difference of `a` and `b` as a `PositiveFiniteNumber`
   */
  sub,

  /**
   * Multiplies two positive finite numbers, returning `a * b` as a
   * `PositiveFiniteNumber`.
   *
   * @param a - The first positive finite number
   * @param b - The second positive finite number
   * @returns The product of `a` and `b` as a `PositiveFiniteNumber`
   */
  mul,

  /**
   * Divides two positive finite numbers, returning `a / b` as a
   * `PositiveFiniteNumber`.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns `a / b` as a `PositiveFiniteNumber`
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
