import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = NonZeroFiniteNumber;

const typeNameInMessage = 'a non-zero finite number';

const {
  abs,
  min: min_,
  max: max_,
  pow,
  add,
  sub,
  mul,
  div,
  randomNonZero: random,
  is,
  castType,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForFloat<
  ElementType,
  undefined,
  undefined
>({
  nonZero: true,
  MIN_VALUE: undefined,
  MAX_VALUE: undefined,
  typeNameInMessage,
} as const);

// Not provided because reasonable rounding operations that avoid becoming 0 cannot be defined

const floor = (
  x: ElementType,
): TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  Math.floor(x) as TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>;

const ceil = (
  x: ElementType,
): TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  Math.ceil(x) as TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType>;

const round = (
  x: ElementType,
): TsDataForgeInternals.RefinedNumberUtils.ToInt<ElementType> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
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
 * @param value The value to check.
 * @returns `true` if the value is a NonZeroFiniteNumber, `false` otherwise.
 */
export const isNonZeroFiniteNumber = is;

/**
 * Casts a number to a NonZeroFiniteNumber type.
 * @param value The value to cast.
 * @returns The value as a NonZeroFiniteNumber type.
 * @throws {TypeError} If the value is not a non-zero finite number.
 * @example
 * ```typescript
 * const x = asNonZeroFiniteNumber(5.5); // NonZeroFiniteNumber
 * const y = asNonZeroFiniteNumber(-3.2); // NonZeroFiniteNumber
 * // asNonZeroFiniteNumber(0); // throws TypeError
 * // asNonZeroFiniteNumber(Infinity); // throws TypeError
 * ```
 */
export const asNonZeroFiniteNumber = castType;

/**
 * Namespace providing type-safe arithmetic operations for non-zero finite numbers.
 *
 * All operations maintain the non-zero constraint while ensuring results remain finite
 * (excluding NaN and Infinity). This type is useful for values that must never be zero,
 * such as denominators, scaling factors, and ratios.
 *
 * @example
 * ```typescript
 * const factor = asNonZeroFiniteNumber(2.5);
 * const multiplier = asNonZeroFiniteNumber(-1.5);
 *
 * // Arithmetic operations that preserve non-zero constraint
 * const result = NonZeroFiniteNumber.add(factor, multiplier);        // NonZeroFiniteNumber (1.0)
 * const difference = NonZeroFiniteNumber.sub(factor, multiplier);    // NonZeroFiniteNumber (4.0)
 * const product = NonZeroFiniteNumber.mul(factor, multiplier);       // NonZeroFiniteNumber (-3.75)
 * const quotient = NonZeroFiniteNumber.div(factor, multiplier);      // NonZeroFiniteNumber (-1.666...)
 *
 * // Utility operations
 * const absolute = NonZeroFiniteNumber.abs(multiplier);              // NonZeroFiniteNumber (1.5)
 * const minimum = NonZeroFiniteNumber.min(factor, multiplier);       // NonZeroFiniteNumber (-1.5)
 * const maximum = NonZeroFiniteNumber.max(factor, multiplier);       // NonZeroFiniteNumber (2.5)
 *
 * // Rounding operations (return NonZeroInt)
 * const rounded = NonZeroFiniteNumber.round(factor);                 // NonZeroInt (3)
 * const floored = NonZeroFiniteNumber.floor(factor);                 // NonZeroInt (2)
 * const ceiled = NonZeroFiniteNumber.ceil(factor);                   // NonZeroInt (3)
 *
 * // Random generation
 * const randomValue = NonZeroFiniteNumber.random();                  // NonZeroFiniteNumber (random non-zero value)
 * ```
 */
export const NonZeroFiniteNumber = {
  /**
   * Type guard to check if a value is a NonZeroFiniteNumber.
   * @param value The value to check.
   * @returns `true` if the value is a non-zero finite number, `false` otherwise.
   */
  is,

  /**
   * Returns the absolute value of a non-zero finite number.
   * @param a The NonZeroFiniteNumber.
   * @returns The absolute value as a NonZeroFiniteNumber.
   */
  abs,

  /**
   * Returns the smaller of two NonZeroFiniteNumber values.
   * @param a The first NonZeroFiniteNumber.
   * @param b The second NonZeroFiniteNumber.
   * @returns The minimum value as a NonZeroFiniteNumber.
   */
  min: min_,

  /**
   * Returns the larger of two NonZeroFiniteNumber values.
   * @param a The first NonZeroFiniteNumber.
   * @param b The second NonZeroFiniteNumber.
   * @returns The maximum value as a NonZeroFiniteNumber.
   */
  max: max_,

  /**
   * Rounds down a NonZeroFiniteNumber to the nearest integer.
   * @param x The NonZeroFiniteNumber to round down.
   * @returns The floor value as a NonZeroInt.
   */
  floor,

  /**
   * Rounds up a NonZeroFiniteNumber to the nearest integer.
   * @param x The NonZeroFiniteNumber to round up.
   * @returns The ceiling value as a NonZeroInt.
   */
  ceil,

  /**
   * Rounds a NonZeroFiniteNumber to the nearest integer.
   * @param x The NonZeroFiniteNumber to round.
   * @returns The rounded value as a NonZeroInt.
   */
  round,

  /**
   * Generates a random NonZeroFiniteNumber value.
   * @returns A random non-zero finite number.
   */
  random,

  /**
   * Raises a NonZeroFiniteNumber to the power of another NonZeroFiniteNumber.
   * @param a The base NonZeroFiniteNumber.
   * @param b The exponent NonZeroFiniteNumber.
   * @returns `a ** b` as a NonZeroFiniteNumber.
   */
  pow,

  /**
   * Adds two NonZeroFiniteNumber values.
   * @param a The first NonZeroFiniteNumber.
   * @param b The second NonZeroFiniteNumber.
   * @returns `a + b` as a NonZeroFiniteNumber.
   */
  add,

  /**
   * Subtracts one NonZeroFiniteNumber from another.
   * @param a The minuend NonZeroFiniteNumber.
   * @param b The subtrahend NonZeroFiniteNumber.
   * @returns `a - b` as a NonZeroFiniteNumber.
   */
  sub,

  /**
   * Multiplies two NonZeroFiniteNumber values.
   * @param a The first NonZeroFiniteNumber.
   * @param b The second NonZeroFiniteNumber.
   * @returns `a * b` as a NonZeroFiniteNumber.
   */
  mul,

  /**
   * Divides one NonZeroFiniteNumber by another.
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
