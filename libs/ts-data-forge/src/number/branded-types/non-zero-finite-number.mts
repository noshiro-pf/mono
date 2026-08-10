import {
  type Int,
  type NonZeroInt,
  type PositiveFiniteNumber,
  type NonZeroFiniteNumber as TtfImported_NonZeroFiniteNumber,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type NonZeroFiniteNumber = TtfImported_NonZeroFiniteNumber;

type ElementType = NonZeroFiniteNumber;

const typeNameInMessage = 'a non-zero finite number';

const {
  abs,
  castType,
  div,
  is,
  max: max_,
  min: min_,
  mul,
  pow,
  randomNonZero: random,
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
 * Type guard that checks if a value is a non-zero finite number.
 *
 * Returns `true` only for a finite value — never `NaN`, `Infinity`, or
 * `-Infinity`.
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-zero finite number, `false` otherwise
 */
export const isNonZeroFiniteNumber = is;

/**
 * Casts a `number` to the `NonZeroFiniteNumber` branded type.
 *
 * Validates that the value is a non-zero finite number and returns it with the
 * `NonZeroFiniteNumber` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `NonZeroFiniteNumber`
 * @throws {TypeError} If the value is not a non-zero finite number
 */
export const asNonZeroFiniteNumber = castType;

/**
 * Namespace providing type-safe operations for the `NonZeroFiniteNumber`
 * branded type.
 *
 * The `NonZeroFiniteNumber` type represents a non-zero finite number.
 */
export const NonZeroFiniteNumber = {
  /**
   * Type guard that checks if a value is a non-zero finite number.
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-zero finite number, `false` otherwise
   * @see {@link isNonZeroFiniteNumber} for usage examples
   */
  is,

  /**
   * Returns the absolute value of a non-zero finite number.
   *
   * The result is non-negative and keeps the `NonZeroFiniteNumber` brand.
   *
   * @param a - The non-zero finite number value
   * @returns The absolute value as a non-negative `NonZeroFiniteNumber`
   */
  abs,

  /**
   * Returns the smallest of the given non-zero finite numbers.
   *
   * @param values - The non-zero finite numbers to compare (at least one required)
   * @returns The smallest value as a `NonZeroFiniteNumber`
   */
  min: min_,

  /**
   * Returns the largest of the given non-zero finite numbers.
   *
   * @param values - The non-zero finite numbers to compare (at least one required)
   * @returns The largest value as a `NonZeroFiniteNumber`
   */
  max: max_,

  /**
   * Returns the greatest integer less than or equal to a non-zero finite
   * number.
   *
   * @param a - The non-zero finite number value
   * @returns The floored value as an integer
   */
  floor,

  /**
   * Returns the smallest integer greater than or equal to a non-zero finite
   * number.
   *
   * @param a - The non-zero finite number value
   * @returns The ceiled value as an integer
   */
  ceil,

  /**
   * Returns the value of a non-zero finite number rounded to the nearest
   * integer.
   *
   * @param a - The non-zero finite number value
   * @returns The rounded value as an integer
   */
  round,

  /**
   * Generates a random `NonZeroFiniteNumber` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `NonZeroFiniteNumber` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `NonZeroFiniteNumber`.
   *
   * @param a - The base non-zero finite number
   * @param b - The exponent non-zero finite number
   * @returns `a ** b` as a `NonZeroFiniteNumber`
   */
  pow,

  /**
   * Multiplies two non-zero finite numbers, returning `a * b` as a
   * `NonZeroFiniteNumber`.
   *
   * @param a - The first non-zero finite number
   * @param b - The second non-zero finite number
   * @returns The product of `a` and `b` as a `NonZeroFiniteNumber`
   */
  mul,

  /**
   * Divides two non-zero finite numbers, returning `a / b` as a
   * `NonZeroFiniteNumber`.
   *
   * Exact (non-flooring) division of two non-zero finite numbers is always
   * non-zero, so this stays closed. For the non-closed operations (`add`/`sub`,
   * whose result may be `0`) use {@link Num.add}/{@link Num.sub}.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns `a / b` as a `NonZeroFiniteNumber`
   */
  div,
} as const;

expectType<
  TsDataForgeInternals.RefinedNumberUtils.ToNonNegative<ElementType>,
  PositiveFiniteNumber
>('=');

expectType<
  keyof typeof NonZeroFiniteNumber,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    never,
    'div' | 'mul'
  >
>('=');

expectType<
  typeof NonZeroFiniteNumber,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    never,
    'div' | 'mul'
  >
>('<=');
