import { expectType } from '../../expect-type.mjs';
import { TsVerifiedInternals } from '../refined-number-utils.mjs';

type ElementType = FiniteNumber;

const typeNameInMessage = 'a finite number';

const {
  abs,
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
} = TsVerifiedInternals.RefinedNumberUtils.operatorsForFloat<
  ElementType,
  undefined,
  undefined
>({
  MIN_VALUE: undefined,
  MAX_VALUE: undefined,
  typeNameInMessage,
} as const);

const floor = (
  x: ElementType,
): TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  Math.floor(x) as TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType>;

const ceil = (
  x: ElementType,
): TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  Math.ceil(x) as TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType>;

const round = (
  x: ElementType,
): TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  Math.round(x) as TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType>;

expectType<TsVerifiedInternals.RefinedNumberUtils.ToInt<ElementType>, Int>('=');

/**
 * Type guard that checks if a value is a finite number.
 *
 * Returns `true` if the value is a finite number (not NaN, Infinity, or -Infinity).
 * This is stricter than the standard number type, which includes these special values.
 *
 * @param value - The value to check
 * @returns `true` if the value is finite, `false` otherwise
 *
 * @example
 * ```typescript
 * isFiniteNumber(42);          // true
 * isFiniteNumber(3.14);        // true
 * isFiniteNumber(-0);          // true
 * isFiniteNumber(Infinity);    // false
 * isFiniteNumber(-Infinity);   // false
 * isFiniteNumber(NaN);         // false
 * isFiniteNumber(1/0);         // false (Infinity)
 * ```
 */
export const isFiniteNumber = is;

/**
 * Casts a number to a FiniteNumber branded type.
 *
 * This function validates that the input is finite (not NaN, Infinity, or -Infinity)
 * and returns it with the FiniteNumber brand. This ensures type safety for operations
 * that require finite numeric values.
 *
 * @param value - The value to cast
 * @returns The value as a FiniteNumber branded type
 * @throws {TypeError} If the value is NaN, Infinity, or -Infinity
 *
 * @example
 * ```typescript
 * const x = asFiniteNumber(5.5);   // FiniteNumber
 * const y = asFiniteNumber(-10);   // FiniteNumber
 * const z = asFiniteNumber(0);     // FiniteNumber
 *
 * // These throw TypeError:
 * // asFiniteNumber(Infinity);     // Not finite
 * // asFiniteNumber(-Infinity);    // Not finite
 * // asFiniteNumber(NaN);          // Not a number
 * // asFiniteNumber(Math.sqrt(-1)); // Results in NaN
 * ```
 */
export const asFiniteNumber = castType;

/**
 * Namespace providing type-safe operations for FiniteNumber branded types.
 *
 * The FiniteNumber type represents any finite numeric value, excluding the
 * special values NaN, Infinity, and -Infinity. All operations are guaranteed
 * to maintain the finite constraint when given finite inputs.
 *
 * This type is essential for:
 * - Mathematical operations that require real numbers
 * - Preventing NaN/Infinity propagation in calculations
 * - Ensuring numeric stability in algorithms
 *
 * @example
 * ```typescript
 * // Type validation
 * FiniteNumber.is(3.14);       // true
 * FiniteNumber.is(Infinity);   // false
 * FiniteNumber.is(0/0);        // false (NaN)
 *
 * // Arithmetic with guaranteed finite results
 * const a = asFiniteNumber(10.5);
 * const b = asFiniteNumber(3.2);
 *
 * const sum = FiniteNumber.add(a, b);      // FiniteNumber (13.7)
 * const diff = FiniteNumber.sub(a, b);     // FiniteNumber (7.3)
 * const product = FiniteNumber.mul(a, b);  // FiniteNumber (33.6)
 * const quotient = FiniteNumber.div(a, b); // FiniteNumber (3.28125)
 * const power = FiniteNumber.pow(a, asFiniteNumber(2)); // FiniteNumber (110.25)
 *
 * // Rounding to integers
 * const value = asFiniteNumber(5.7);
 * const floored = FiniteNumber.floor(value);  // Int (5)
 * const ceiled = FiniteNumber.ceil(value);    // Int (6)
 * const rounded = FiniteNumber.round(value);  // Int (6)
 *
 * // Utility operations
 * const absolute = FiniteNumber.abs(asFiniteNumber(-42.5)); // FiniteNumber (42.5)
 * const minimum = FiniteNumber.min(a, b, asFiniteNumber(5)); // FiniteNumber (3.2)
 * const maximum = FiniteNumber.max(a, b, asFiniteNumber(5)); // FiniteNumber (10.5)
 *
 * // Random generation
 * const rand = FiniteNumber.random(asFiniteNumber(0), asFiniteNumber(1)); // Random in [0, 1]
 * ```
 */
export const FiniteNumber = {
  /**
   * Type guard that checks if a value is a finite number.
   *
   * @param value - The value to check
   * @returns `true` if the value is finite, `false` otherwise
   *
   * @see {@link isFiniteNumber} for usage examples
   */
  is,

  /**
   * Returns the absolute value of a finite number.
   * @param x - The finite number to get the absolute value of
   * @returns The absolute value as a FiniteNumber
   * @example
   * ```typescript
   * FiniteNumber.abs(asFiniteNumber(-5.5)); // FiniteNumber (5.5)
   * FiniteNumber.abs(asFiniteNumber(3.2)); // FiniteNumber (3.2)
   * ```
   */
  abs,

  /**
   * Returns the minimum value from a list of finite numbers.
   *
   * @param values - The finite numbers to compare (at least one required)
   * @returns The smallest value as a FiniteNumber
   *
   * @example
   * ```typescript
   * const a = asFiniteNumber(5.5);
   * const b = asFiniteNumber(3.2);
   * const c = asFiniteNumber(7.8);
   *
   * FiniteNumber.min(a, b);      // FiniteNumber (3.2)
   * FiniteNumber.min(a, b, c);   // FiniteNumber (3.2)
   * ```
   */
  min: min_,

  /**
   * Returns the maximum value from a list of finite numbers.
   *
   * @param values - The finite numbers to compare (at least one required)
   * @returns The largest value as a FiniteNumber
   *
   * @example
   * ```typescript
   * const a = asFiniteNumber(5.5);
   * const b = asFiniteNumber(3.2);
   * const c = asFiniteNumber(7.8);
   *
   * FiniteNumber.max(a, b);      // FiniteNumber (7.8)
   * FiniteNumber.max(a, b, c);   // FiniteNumber (7.8)
   * ```
   */
  max: max_,

  /**
   * Returns the largest integer less than or equal to the given finite number.
   * @param x - The finite number to floor
   * @returns The floor value as an Int
   * @example
   * ```typescript
   * FiniteNumber.floor(asFiniteNumber(5.8)); // Int (5)
   * FiniteNumber.floor(asFiniteNumber(-5.2)); // Int (-6)
   * ```
   */
  floor,

  /**
   * Returns the smallest integer greater than or equal to the given finite number.
   * @param x - The finite number to ceil
   * @returns The ceiling value as an Int
   * @example
   * ```typescript
   * FiniteNumber.ceil(asFiniteNumber(5.2)); // Int (6)
   * FiniteNumber.ceil(asFiniteNumber(-5.8)); // Int (-5)
   * ```
   */
  ceil,

  /**
   * Rounds a finite number to the nearest integer.
   * @param x - The finite number to round
   * @returns The rounded value as an Int
   * @example
   * ```typescript
   * FiniteNumber.round(asFiniteNumber(5.4)); // Int (5)
   * FiniteNumber.round(asFiniteNumber(5.6)); // Int (6)
   * FiniteNumber.round(asFiniteNumber(5.5)); // Int (6)
   * ```
   */
  round,

  /**
   * Generates a random finite number within the specified range.
   *
   * The generated value is uniformly distributed in the range [min, max].
   * Both bounds are inclusive.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random FiniteNumber in the range [min, max]
   *
   * @example
   * ```typescript
   * // Random percentage (0-100)
   * const pct = FiniteNumber.random(
   *   asFiniteNumber(0),
   *   asFiniteNumber(100)
   * );
   *
   * // Random coordinate (-1 to 1)
   * const coord = FiniteNumber.random(
   *   asFiniteNumber(-1),
   *   asFiniteNumber(1)
   * );
   * ```
   */
  random,

  /**
   * Raises a finite number to a power.
   * @param a - The base finite number
   * @param b - The exponent finite number
   * @returns `a ** b` as a FiniteNumber
   * @example
   * ```typescript
   * FiniteNumber.pow(asFiniteNumber(2.5), asFiniteNumber(3)); // FiniteNumber (15.625)
   * ```
   */
  pow,

  /**
   * Adds two finite numbers.
   * @param a - First finite number
   * @param b - Second finite number
   * @returns `a + b` as a FiniteNumber
   * @example
   * ```typescript
   * FiniteNumber.add(asFiniteNumber(5.5), asFiniteNumber(3.2)); // FiniteNumber (8.7)
   * ```
   */
  add,

  /**
   * Subtracts two finite numbers.
   * @param a - First finite number
   * @param b - Second finite number
   * @returns `a - b` as a FiniteNumber
   * @example
   * ```typescript
   * FiniteNumber.sub(asFiniteNumber(8.7), asFiniteNumber(3.2)); // FiniteNumber (5.5)
   * ```
   */
  sub,

  /**
   * Multiplies two finite numbers.
   * @param a - First finite number
   * @param b - Second finite number
   * @returns `a * b` as a FiniteNumber
   * @example
   * ```typescript
   * FiniteNumber.mul(asFiniteNumber(5.5), asFiniteNumber(2)); // FiniteNumber (11)
   * ```
   */
  mul,

  /**
   * Divides two finite numbers.
   *
   * The divisor must be non-zero (enforced by type constraints).
   * The result is guaranteed to be finite when both inputs are finite
   * and the divisor is non-zero.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The quotient `a / b` as a FiniteNumber
   *
   * @example
   * ```typescript
   * const a = asFiniteNumber(11);
   * const b = asFiniteNumber(2);
   *
   * FiniteNumber.div(a, b); // FiniteNumber (5.5)
   *
   * // With non-zero type guard
   * const divisor = asFiniteNumber(userInput);
   * if (Num.isNonZero(divisor)) {
   *   const result = FiniteNumber.div(a, divisor);
   * }
   * ```
   */
  div,
} as const;

expectType<
  TsVerifiedInternals.RefinedNumberUtils.ToNonNegative<ElementType>,
  NonNegativeFiniteNumber
>('=');

expectType<
  keyof typeof FiniteNumber,
  keyof TsVerifiedInternals.RefinedNumberUtils.NumberClass<ElementType, never>
>('=');

expectType<
  typeof FiniteNumber,
  TsVerifiedInternals.RefinedNumberUtils.NumberClass<ElementType, never>
>('<=');
