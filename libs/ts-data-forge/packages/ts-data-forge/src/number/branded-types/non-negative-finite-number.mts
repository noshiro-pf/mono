import {
  type NonNegativeFiniteNumber as TtfImported_NonNegativeFiniteNumber,
  type Uint,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type NonNegativeFiniteNumber = TtfImported_NonNegativeFiniteNumber;

type ElementType = NonNegativeFiniteNumber;

const typeNameInMessage = 'a non-negative finite number';

const {
  MIN_VALUE,
  add,
  castType,
  div,
  fromNumber,
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
 * Type guard that checks if a value is a non-negative finite number.
 *
 * Returns `true` only for a finite value — never `NaN`, `Infinity`, or
 * `-Infinity`.
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-negative finite number, `false` otherwise
 */
export const isNonNegativeFiniteNumber = is;

/**
 * Casts a `number` to the `NonNegativeFiniteNumber` branded type.
 *
 * Validates that the value is a non-negative finite number and returns it with
 * the `NonNegativeFiniteNumber` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `NonNegativeFiniteNumber`
 * @throws {TypeError} If the value is not a non-negative finite number
 */
export const asNonNegativeFiniteNumber = castType;

/**
 * Namespace providing type-safe operations for the `NonNegativeFiniteNumber`
 * branded type.
 *
 * The `NonNegativeFiniteNumber` type represents a non-negative finite number.
 */
export const NonNegativeFiniteNumber = {
  /**
   * Type guard that checks if a value is a non-negative finite number.
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-negative finite number, `false` otherwise
   * @see {@link isNonNegativeFiniteNumber} for usage examples
   */
  is,

  /**
   * The smallest value representable as `NonNegativeFiniteNumber` (the lower
   * saturation target of `fromNumber`).
   */
  MIN_VALUE,

  /**
   * Returns the smallest of the given non-negative finite numbers.
   *
   * @param values - The non-negative finite numbers to compare (at least one required)
   * @returns The smallest value as a `NonNegativeFiniteNumber`
   */
  min: min_,

  /**
   * Returns the largest of the given non-negative finite numbers.
   *
   * @param values - The non-negative finite numbers to compare (at least one required)
   * @returns The largest value as a `NonNegativeFiniteNumber`
   */
  max: max_,

  /**
   * Converts an arbitrary `number` into a `NonNegativeFiniteNumber`, saturating
   * it into the range `[MIN_VALUE, MAX_VALUE]`.
   *
   * Unlike `asNonNegativeFiniteNumber`, this is total: out-of-range inputs are
   * clamped to the nearest representable `NonNegativeFiniteNumber` instead of
   * throwing.
   *
   * @param value - The value to convert
   * @returns The value as a `NonNegativeFiniteNumber`
   */
  fromNumber,

  /**
   * Returns the greatest integer less than or equal to a non-negative finite
   * number.
   *
   * @param a - The non-negative finite number value
   * @returns The floored value as an integer
   */
  floor,

  /**
   * Returns the smallest integer greater than or equal to a non-negative finite
   * number.
   *
   * @param a - The non-negative finite number value
   * @returns The ceiled value as an integer
   */
  ceil,

  /**
   * Returns the value of a non-negative finite number rounded to the nearest
   * integer.
   *
   * @param a - The non-negative finite number value
   * @returns The rounded value as an integer
   */
  round,

  /**
   * Generates a random `NonNegativeFiniteNumber` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `NonNegativeFiniteNumber` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a
   * `NonNegativeFiniteNumber`.
   *
   * @param a - The base non-negative finite number
   * @param b - The exponent non-negative finite number
   * @returns `a ** b` as a `NonNegativeFiniteNumber`
   */
  pow,

  /**
   * Adds two non-negative finite numbers, returning `a + b` as a
   * `NonNegativeFiniteNumber`.
   *
   * @param a - The first non-negative finite number
   * @param b - The second non-negative finite number
   * @returns The sum of `a` and `b` as a `NonNegativeFiniteNumber`
   */
  add,

  /**
   * Subtracts two non-negative finite numbers, returning `a - b` as a
   * `NonNegativeFiniteNumber`.
   *
   * @param a - The first non-negative finite number
   * @param b - The second non-negative finite number
   * @returns The difference of `a` and `b` as a `NonNegativeFiniteNumber`
   */
  sub,

  /**
   * Multiplies two non-negative finite numbers, returning `a * b` as a
   * `NonNegativeFiniteNumber`.
   *
   * @param a - The first non-negative finite number
   * @param b - The second non-negative finite number
   * @returns The product of `a` and `b` as a `NonNegativeFiniteNumber`
   */
  mul,

  /**
   * Divides two non-negative finite numbers, returning `a / b` as a
   * `NonNegativeFiniteNumber`.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns `a / b` as a `NonNegativeFiniteNumber`
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
