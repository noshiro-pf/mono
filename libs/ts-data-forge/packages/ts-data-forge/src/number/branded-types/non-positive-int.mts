import { type NonPositiveInt as TtfImported_NonPositiveInt } from 'ts-type-forge';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type NonPositiveInt = TtfImported_NonPositiveInt;

type ElementType = NonPositiveInt;

const typeNameInMessage = 'a non-positive integer';

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
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  number,
  0
>({
  integerOrSafeInteger: 'Integer',
  MIN_VALUE: -Number.MAX_VALUE,
  MAX_VALUE: 0,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a non-positive integer.
 *
 * A non-positive integer is any integer less than or equal to zero (<= 0).
 * This includes zero and all negative integers, but excludes positive numbers
 * and non-integers.
 *
 * @example
 *
 * ```ts
 * assert.isTrue(isNonPositiveInt(0));
 *
 * assert.isTrue(isNonPositiveInt(-5));
 *
 * assert.isFalse(isNonPositiveInt(1));
 * ```
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-positive integer, `false` otherwise
 */
export const isNonPositiveInt = is;

/**
 * Casts a number to a NonPositiveInt branded type.
 *
 * This function validates that the input is a non-positive integer (<= 0) and
 * returns it with the NonPositiveInt brand. This ensures type safety for
 * operations that require non-positive integer values.
 *
 * @example
 *
 * ```ts
 * const branded = asNonPositiveInt(-7);
 *
 * assert.isTrue(branded === -7);
 *
 * assert.isTrue(NonPositiveInt.is(branded));
 * ```
 *
 * @param value - The value to cast
 * @returns The value as a NonPositiveInt branded type
 * @throws {TypeError} If the value is not a non-positive integer
 */
export const asNonPositiveInt = castType;

/**
 * Namespace providing type-safe operations for NonPositiveInt branded types.
 *
 * NonPositiveInt represents integers that are less than or equal to zero (<= 0).
 * All operations automatically clamp results to maintain the non-positive
 * constraint, ensuring that arithmetic operations never produce positive values.
 *
 * This type is essential for:
 *
 * - Debts and negative balances
 * - Penalties and reductions
 * - Offsets and adjustments (downward)
 * - Negative counts or differences
 * - Depth or altitude below a reference point
 */
export const NonPositiveInt = {
  /**
   * Type guard that checks if a value is a non-positive integer.
   *
   * @example
   *
   * ```ts
   * const value: number = -42;
   *
   * if (NonPositiveInt.is(value)) {
   *   // value is now typed as NonPositiveInt
   *   const debt = value;
   * }
   * ```
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-positive integer, `false` otherwise
   */
  is,

  /**
   * The maximum value for a non-positive integer.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the smaller of two non-positive integers.
   *
   * Since non-positive integers range from negative infinity to 0, the smaller
   * value is the one further from zero (more negative).
   *
   * @example
   *
   * ```ts
   * const result = NonPositiveInt.min(-5, -10);
   *
   * assert.strictEqual(result, -10);
   * ```
   *
   * @param a - The first non-positive integer
   * @param b - The second non-positive integer
   * @returns The minimum value as a non-positive integer
   */
  min: min_,

  /**
   * Returns the larger of two non-positive integers.
   *
   * Since non-positive integers range from negative infinity to 0, the larger
   * value is the one closer to zero (less negative).
   *
   * @example
   *
   * ```ts
   * const result = NonPositiveInt.max(-5, -10);
   *
   * assert.strictEqual(result, -5);
   * ```
   *
   * @param a - The first non-positive integer
   * @param b - The second non-positive integer
   * @returns The maximum value as a non-positive integer
   */
  max: max_,

  /**
   * Clamps a number to the non-positive integer range.
   *
   * Any positive value is clamped to 0 (the maximum non-positive integer).
   * Negative values are preserved as long as they are valid integers.
   *
   * @example
   *
   * ```ts
   * assert.strictEqual(NonPositiveInt.clamp(5), 0);
   *
   * assert.strictEqual(NonPositiveInt.clamp(-5), -5);
   *
   * assert.strictEqual(NonPositiveInt.clamp(0), 0);
   * ```
   *
   * @param value - The number to clamp
   * @returns The value clamped to the non-positive integer range
   */
  clamp,

  /**
   * Generates a random non-positive integer value.
   *
   * @example
   *
   * ```ts
   * const randomValue = NonPositiveInt.random();
   *
   * assert.isTrue(NonPositiveInt.is(randomValue));
   * ```
   *
   * @returns A random non-positive integer
   */
  random,

  /**
   * Raises a non-positive integer to the power of another non-positive integer.
   *
   * The result is clamped to the non-positive integer range.
   *
   * @example
   *
   * ```ts
   * const result = NonPositiveInt.pow(-2, -1);
   * ```
   *
   * @param a - The base non-positive integer
   * @param b - The exponent non-positive integer
   * @returns `a ** b` clamped to the non-positive integer range
   */
  pow,

  /**
   * Adds two non-positive integers.
   *
   * The result is clamped to the non-positive integer range. If the sum is
   * positive, it is clamped to 0.
   *
   * @example
   *
   * ```ts
   * assert.strictEqual(NonPositiveInt.add(-5, -3), -8);
   *
   * assert.strictEqual(NonPositiveInt.add(-5, 10), 0);
   * ```
   *
   * @param a - The first non-positive integer
   * @param b - The second non-positive integer
   * @returns `a + b` clamped to the non-positive integer range
   */
  add,

  /**
   * Subtracts one non-positive integer from another.
   *
   * The result is clamped to the non-positive integer range. If the result is
   * positive, it is clamped to 0.
   *
   * @example
   *
   * ```ts
   * assert.strictEqual(NonPositiveInt.sub(-10, -3), -7);
   *
   * assert.strictEqual(NonPositiveInt.sub(-10, 5), 0);
   * ```
   *
   * @param a - The minuend non-positive integer
   * @param b - The subtrahend non-positive integer
   * @returns `a - b` clamped to the non-positive integer range
   */
  sub,
} as const;
