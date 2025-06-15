import { expectType } from '../../expect-type.mjs';
import { TsVerifiedInternals } from '../refined-number-utils.mjs';

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
} = TsVerifiedInternals.RefinedNumberUtils.operatorsForFloat<
  ElementType,
  number,
  undefined
>({
  MIN_VALUE: Number.MIN_VALUE,
  MAX_VALUE: undefined,
  typeNameInMessage,
} as const);

const floor = (
  x: ElementType,
): TsVerifiedInternals.RefinedNumberUtils.RemoveNonZeroBrandKey<
  TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType>
> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  Math.floor(x) as TsVerifiedInternals.RefinedNumberUtils.RemoveNonZeroBrandKey<
    TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType>
  >;

const ceil = (
  x: ElementType,
): TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  Math.ceil(x) as TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType>;

const round = (
  x: ElementType,
): TsVerifiedInternals.RefinedNumberUtils.RemoveNonZeroBrandKey<
  TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType>
> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  Math.round(x) as TsVerifiedInternals.RefinedNumberUtils.RemoveNonZeroBrandKey<
    TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType>
  >;

expectType<
  TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType>,
  PositiveInt
>('=');

expectType<
  TsVerifiedInternals.RefinedNumberUtils.RemoveNonZeroBrandKey<
    TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType>
  >,
  Uint
>('=');

/**
 * Checks if a number is a PositiveFiniteNumber (a finite number > 0).
 * @param value The value to check.
 * @returns `true` if the value is a PositiveFiniteNumber, `false` otherwise.
 */
export const isPositiveFiniteNumber = is;

/**
 * Casts a number to a PositiveFiniteNumber type.
 * @param value The value to cast.
 * @returns The value as a PositiveFiniteNumber type.
 * @throws {TypeError} If the value is not a positive finite number.
 * @example
 * ```typescript
 * const x = asPositiveFiniteNumber(5.5); // PositiveFiniteNumber
 * const y = asPositiveFiniteNumber(0.001); // PositiveFiniteNumber
 * // asPositiveFiniteNumber(0); // throws TypeError
 * // asPositiveFiniteNumber(-1); // throws TypeError
 * ```
 */
export const asPositiveFiniteNumber = castType;

/**
 * Namespace providing type-safe arithmetic operations for positive finite numbers.
 *
 * All operations maintain the positive constraint by clamping non-positive results to MIN_VALUE,
 * while ensuring results remain finite (excluding NaN and Infinity). This type is useful
 * for representing quantities that must always be positive, such as probabilities, magnitudes,
 * and physical measurements.
 *
 * @example
 * ```typescript
 * const probability = asPositiveFiniteNumber(0.75);
 * const rate = asPositiveFiniteNumber(1.25);
 *
 * // Arithmetic operations with positive clamping
 * const combined = PositiveFiniteNumber.add(probability, rate);        // PositiveFiniteNumber (2.0)
 * const difference = PositiveFiniteNumber.sub(rate, probability);      // PositiveFiniteNumber (0.5)
 * const scaled = PositiveFiniteNumber.mul(probability, rate);          // PositiveFiniteNumber (0.9375)
 * const ratio = PositiveFiniteNumber.div(rate, probability);           // PositiveFiniteNumber (1.666...)
 *
 * // Range operations
 * const clamped = PositiveFiniteNumber.clamp(-10.5);                  // PositiveFiniteNumber (MIN_VALUE)
 * const minimum = PositiveFiniteNumber.min(probability, rate);         // PositiveFiniteNumber (0.75)
 * const maximum = PositiveFiniteNumber.max(probability, rate);         // PositiveFiniteNumber (1.25)
 *
 * // Rounding operations (different return types based on operation)
 * const ceiled = PositiveFiniteNumber.ceil(probability);              // PositiveInt (1)
 * const floored = PositiveFiniteNumber.floor(rate);                   // Uint (1)
 * const rounded = PositiveFiniteNumber.round(rate);                   // Uint (1)
 *
 * // Utility operations
 * const random = PositiveFiniteNumber.random();                       // PositiveFiniteNumber (random positive value)
 * const power = PositiveFiniteNumber.pow(rate, probability);          // PositiveFiniteNumber (1.18...)
 * ```
 */
export const PositiveFiniteNumber = {
  /**
   * Type guard to check if a value is a PositiveFiniteNumber.
   * @param value The value to check.
   * @returns `true` if the value is a positive finite number, `false` otherwise.
   */
  is,

  /**
   * The minimum value for a positive finite number.
   * @readonly
   */
  MIN_VALUE,

  /**
   * Returns the smaller of two PositiveFiniteNumber values.
   * @param a The first PositiveFiniteNumber.
   * @param b The second PositiveFiniteNumber.
   * @returns The minimum value as a PositiveFiniteNumber.
   */
  min: min_,

  /**
   * Returns the larger of two PositiveFiniteNumber values.
   * @param a The first PositiveFiniteNumber.
   * @param b The second PositiveFiniteNumber.
   * @returns The maximum value as a PositiveFiniteNumber.
   */
  max: max_,

  /**
   * Clamps a number to the positive finite range.
   * @param value The number to clamp.
   * @returns The value clamped to (0, +∞) as a PositiveFiniteNumber.
   */
  clamp,

  /**
   * Rounds down a PositiveFiniteNumber to the nearest integer.
   * @param x The PositiveFiniteNumber to round down.
   * @returns The floor value as a Uint (can be 0).
   */
  floor,

  /**
   * Rounds up a PositiveFiniteNumber to the nearest integer.
   * @param x The PositiveFiniteNumber to round up.
   * @returns The ceiling value as a PositiveInt (always >= 1).
   */
  ceil,

  /**
   * Rounds a PositiveFiniteNumber to the nearest integer.
   * @param x The PositiveFiniteNumber to round.
   * @returns The rounded value as a Uint (can be 0 if x < 0.5).
   */
  round,

  /**
   * Generates a random PositiveFiniteNumber value.
   * @returns A random positive finite number.
   */
  random,

  /**
   * Raises a PositiveFiniteNumber to the power of another PositiveFiniteNumber.
   * @param a The base PositiveFiniteNumber.
   * @param b The exponent PositiveFiniteNumber.
   * @returns `a ** b` clamped to (0, +∞) as a PositiveFiniteNumber.
   */
  pow,

  /**
   * Adds two PositiveFiniteNumber values.
   * @param a The first PositiveFiniteNumber.
   * @param b The second PositiveFiniteNumber.
   * @returns `a + b` clamped to (0, +∞) as a PositiveFiniteNumber.
   */
  add,

  /**
   * Subtracts one PositiveFiniteNumber from another.
   * @param a The minuend PositiveFiniteNumber.
   * @param b The subtrahend PositiveFiniteNumber.
   * @returns `a - b` clamped to (0, +∞) as a PositiveFiniteNumber (minimum MIN_VALUE).
   */
  sub,

  /**
   * Multiplies two PositiveFiniteNumber values.
   * @param a The first PositiveFiniteNumber.
   * @param b The second PositiveFiniteNumber.
   * @returns `a * b` clamped to (0, +∞) as a PositiveFiniteNumber.
   */
  mul,

  /**
   * Divides one PositiveFiniteNumber by another.
   * @param a The dividend PositiveFiniteNumber.
   * @param b The divisor PositiveFiniteNumber.
   * @returns `a / b` clamped to (0, +∞) as a PositiveFiniteNumber.
   */
  div,
} as const;

expectType<
  keyof typeof PositiveFiniteNumber,
  keyof TsVerifiedInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'positive'
  >
>('=');

expectType<
  typeof PositiveFiniteNumber,
  TsVerifiedInternals.RefinedNumberUtils.NumberClass<ElementType, 'positive'>
>('<=');
