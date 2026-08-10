import {
  type Int,
  type NonNegativeFiniteNumber,
  type FiniteNumber as TtfImported_FiniteNumber,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type FiniteNumber = TtfImported_FiniteNumber;

type ElementType = FiniteNumber;

const typeNameInMessage = 'a finite number';

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
  random,
  sub,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForFloat<
  ElementType,
  number,
  number
>({
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

expectType<TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>, Int>(
  '=',
);

/**
 * Type guard that checks if a value is a finite number.
 *
 * Returns `true` only for a finite value — never `NaN`, `Infinity`, or
 * `-Infinity`.
 *
 * @param value - The value to check
 * @returns `true` if the value is a finite number, `false` otherwise
 */
export const isFiniteNumber = is;

/**
 * Casts a `number` to the `FiniteNumber` branded type.
 *
 * Validates that the value is a finite number and returns it with the
 * `FiniteNumber` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `FiniteNumber`
 * @throws {TypeError} If the value is not a finite number
 */
export const asFiniteNumber = castType;

/**
 * Namespace providing type-safe operations for the `FiniteNumber` branded type.
 *
 * The `FiniteNumber` type represents a finite number.
 */
export const FiniteNumber = {
  /**
   * Type guard that checks if a value is a finite number.
   *
   * @param value - The value to check
   * @returns `true` if the value is a finite number, `false` otherwise
   * @see {@link isFiniteNumber} for usage examples
   */
  is,

  /**
   * Returns the absolute value of a finite number.
   *
   * The result is non-negative and keeps the `FiniteNumber` brand.
   *
   * @param a - The finite number value
   * @returns The absolute value as a non-negative `FiniteNumber`
   */
  abs,

  /**
   * Returns the smallest of the given finite numbers.
   *
   * @param values - The finite numbers to compare (at least one required)
   * @returns The smallest value as a `FiniteNumber`
   */
  min: min_,

  /**
   * Returns the largest of the given finite numbers.
   *
   * @param values - The finite numbers to compare (at least one required)
   * @returns The largest value as a `FiniteNumber`
   */
  max: max_,

  /**
   * Returns the greatest integer less than or equal to a finite number.
   *
   * @param a - The finite number value
   * @returns The floored value as an integer
   */
  floor,

  /**
   * Returns the smallest integer greater than or equal to a finite number.
   *
   * @param a - The finite number value
   * @returns The ceiled value as an integer
   */
  ceil,

  /**
   * Returns the value of a finite number rounded to the nearest integer.
   *
   * @param a - The finite number value
   * @returns The rounded value as an integer
   */
  round,

  /**
   * Generates a random `FiniteNumber` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `FiniteNumber` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `FiniteNumber`.
   *
   * @param a - The base finite number
   * @param b - The exponent finite number
   * @returns `a ** b` as a `FiniteNumber`
   */
  pow,

  /**
   * Adds two finite numbers, returning `a + b` as a `FiniteNumber`.
   *
   * @param a - The first finite number
   * @param b - The second finite number
   * @returns The sum of `a` and `b` as a `FiniteNumber`
   */
  add,

  /**
   * Subtracts two finite numbers, returning `a - b` as a `FiniteNumber`.
   *
   * @param a - The first finite number
   * @param b - The second finite number
   * @returns The difference of `a` and `b` as a `FiniteNumber`
   */
  sub,

  /**
   * Multiplies two finite numbers, returning `a * b` as a `FiniteNumber`.
   *
   * @param a - The first finite number
   * @param b - The second finite number
   * @returns The product of `a` and `b` as a `FiniteNumber`
   */
  mul,

  /**
   * Divides two finite numbers, returning `a / b` as a `FiniteNumber`.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns `a / b` as a `FiniteNumber`
   */
  div,
} as const;

expectType<
  TsDataForgeInternals.RefinedNumberUtils.ToNonNegative<ElementType>,
  NonNegativeFiniteNumber
>('=');

expectType<
  keyof typeof FiniteNumber,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<ElementType, never>
>('=');

expectType<
  typeof FiniteNumber,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<ElementType, never>
>('<=');
