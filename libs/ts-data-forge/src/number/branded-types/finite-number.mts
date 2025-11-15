import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

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
 * Returns `true` if the value is a finite number (not NaN, Infinity, or
 * -Infinity). This is stricter than the standard number type, which includes
 * these special values.
 *
 * @param value - The value to check
 * @returns `true` if the value is finite, `false` otherwise
 */
export const isFiniteNumber = is;
/**
 * Casts a number to a FiniteNumber branded type.
 *
 * This function validates that the input is finite (not NaN, Infinity, or
 * -Infinity) and returns it with the FiniteNumber brand. This ensures type
 * safety for operations that require finite numeric values.
 *
 * @param value - The value to cast
 * @returns The value as a FiniteNumber branded type
 * @throws {TypeError} If the value is NaN, Infinity, or -Infinity
 */
export const asFiniteNumber = castType;

/**
 * Namespace providing type-safe operations for FiniteNumber branded types.
 *
 * The FiniteNumber type represents any finite numeric value, excluding the
 * special values NaN, Infinity, and -Infinity. All operations are guaranteed to
 * maintain the finite constraint when given finite inputs.
 *
 * This type is essential for:
 *
 * - Mathematical operations that require real numbers
 * - Preventing NaN/Infinity propagation in calculations
 * - Ensuring numeric stability in algorithms
 */
export const FiniteNumber = {
  /**
   * Type guard that checks if a value is a finite number.
   *
   * @param value - The value to check
   * @returns `true` if the value is finite, `false` otherwise
   * @see {@link isFiniteNumber} for usage examples
   */
  is,

  /**
   * Returns the absolute value of a finite number.
   *
   * @param x - The finite number to get the absolute value of
   * @returns The absolute value as a FiniteNumber
   */
  abs,

  /**
   * Returns the minimum value from a list of finite numbers.
   *
   * @param values - The finite numbers to compare (at least one required)
   * @returns The smallest value as a FiniteNumber
   */
  min: min_,

  /**
   * Returns the maximum value from a list of finite numbers.
   *
   * @param values - The finite numbers to compare (at least one required)
   * @returns The largest value as a FiniteNumber
   */
  max: max_,

  /**
   * Returns the largest integer less than or equal to the given finite number.
   *
   * @param x - The finite number to floor
   * @returns The floor value as an Int
   */
  floor,

  /**
   * Returns the smallest integer greater than or equal to the given finite
   * number.
   *
   * @param x - The finite number to ceil
   * @returns The ceiling value as an Int
   */
  ceil,

  /**
   * Rounds a finite number to the nearest integer.
   *
   * @param x - The finite number to round
   * @returns The rounded value as an Int
   */
  round,

  /**
   * Generates a random finite number within the specified range.
   *
   * The generated value is uniformly distributed in the range [min, max]. Both
   * bounds are inclusive.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random FiniteNumber in the range [min, max]
   */
  random,

  /**
   * Raises a finite number to a power.
   *
   * @param a - The base finite number
   * @param b - The exponent finite number
   * @returns `a ** b` as a FiniteNumber
   */
  pow,

  /**
   * Adds two finite numbers.
   *
   * @param a - First finite number
   * @param b - Second finite number
   * @returns `a + b` as a FiniteNumber
   */
  add,

  /**
   * Subtracts two finite numbers.
   *
   * @param a - First finite number
   * @param b - Second finite number
   * @returns `a - b` as a FiniteNumber
   */
  sub,

  /**
   * Multiplies two finite numbers.
   *
   * @param a - First finite number
   * @param b - Second finite number
   * @returns `a * b` as a FiniteNumber
   */
  mul,

  /**
   * Divides two finite numbers.
   *
   * The divisor must be non-zero (enforced by type constraints). The result is
   * guaranteed to be finite when both inputs are finite and the divisor is
   * non-zero.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The quotient `a / b` as a FiniteNumber
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
