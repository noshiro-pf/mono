import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = PositiveInt;

const typeNameInMessage = 'a positive integer';

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
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  1,
  number
>({
  integerOrSafeInteger: 'Integer',
  MIN_VALUE: 1,
  MAX_VALUE: Number.MAX_VALUE,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a positive integer.
 *
 * A positive integer is any integer greater than zero (>= 1). This excludes
 * zero, negative numbers, and non-integers.
 *
 * @example
 *
 * ```ts
 * assert.ok(isPositiveInt(5));
 *
 * assert.notOk(isPositiveInt(0));
 *
 * assert.ok(PositiveInt.is(10));
 * ```
 *
 * @param value - The value to check
 * @returns `true` if the value is a positive integer, `false` otherwise
 */
export const isPositiveInt = is;
/**
 * Casts a number to a PositiveInt branded type.
 *
 * This function validates that the input is a positive integer (>= 1) and
 * returns it with the PositiveInt brand. This ensures type safety for
 * operations that require strictly positive integer values.
 *
 * @example
 *
 * ```ts
 * const branded = asPositiveInt(7);
 *
 * assert(branded === 7);
 *
 * assert.ok(PositiveInt.is(branded));
 * ```
 *
 * @param value - The value to cast
 * @returns The value as a PositiveInt branded type
 * @throws {TypeError} If the value is not a positive integer
 */
export const asPositiveInt = castType;

/**
 * Namespace providing type-safe operations for PositiveInt branded types.
 *
 * PositiveInt represents integers that are strictly greater than zero (>= 1).
 * All operations automatically clamp results to maintain the positive
 * constraint, ensuring that arithmetic operations never produce zero or
 * negative values.
 *
 * This type is essential for:
 *
 * - Array lengths and sizes (length >= 1)
 * - Counts and quantities that must be positive
 * - Denominators in division operations
 * - Loop counters and iteration counts
 * - Database primary keys and IDs
 */
export const PositiveInt = {
  /**
   * Type guard that checks if a value is a positive integer.
   *
   * @example
   *
   * ```ts
   * assert.ok(isPositiveInt(5));
   *
   * assert.notOk(isPositiveInt(0));
   *
   * assert.ok(PositiveInt.is(10));
   * ```
   *
   * @param value - The value to check
   * @returns `true` if the value is a positive integer, `false` otherwise
   * @see {@link isPositiveInt} for usage examples
   */
  is,

  /**
   * The minimum value for a PositiveInt.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * Returns the minimum value from a list of positive integers.
   *
   * Since all inputs are guaranteed to be >= 1, the result is also guaranteed
   * to be a positive integer.
   *
   * @example
   *
   * ```ts
   * const smallest = PositiveInt.min(
   *   asPositiveInt(9),
   *   asPositiveInt(3),
   *   asPositiveInt(12),
   * );
   *
   * assert(smallest === 3);
   * ```
   *
   * @param values - The positive integers to compare (at least one required)
   * @returns The smallest value as a PositiveInt
   */
  min: min_,

  /**
   * Returns the maximum value from a list of positive integers.
   *
   * @example
   *
   * ```ts
   * const largest = PositiveInt.max(
   *   asPositiveInt(9),
   *   asPositiveInt(3),
   *   asPositiveInt(12),
   * );
   *
   * assert(largest === 12);
   * ```
   *
   * @param values - The positive integers to compare (at least one required)
   * @returns The largest value as a PositiveInt
   */
  max: max_,

  /**
   * Clamps a number to the positive integer range.
   *
   * Since PositiveInt has a minimum value of 1, this function ensures that any
   * input less than 1 is clamped to 1.
   *
   * @example
   *
   * ```ts
   * const belowRange = PositiveInt.clamp(0);
   *
   * const withinRange = PositiveInt.clamp(10);
   *
   * assert(belowRange === 1);
   *
   * assert(withinRange === 10);
   * ```
   *
   * @param value - The number to clamp
   * @returns The value clamped to >= 1 as a PositiveInt
   */
  clamp,

  /**
   * Generates a random positive integer within the specified range (inclusive).
   *
   * Both bounds are inclusive, and both min and max must be positive integers.
   * If min > max, they are automatically swapped.
   *
   * @example
   *
   * ```ts
   * const min = asPositiveInt(3);
   *
   * const max = asPositiveInt(6);
   *
   * const randomValue = PositiveInt.random(min, max);
   *
   * assert.ok(PositiveInt.is(randomValue));
   *
   * assert.ok(randomValue >= 3 && randomValue <= 6);
   * ```
   *
   * @param min - The minimum value (inclusive, must be >= 1)
   * @param max - The maximum value (inclusive, must be >= min)
   * @returns A random PositiveInt in the range [min, max]
   */
  random,

  /**
   * Raises a positive integer to a power, ensuring the result is never less
   * than 1.
   *
   * @example
   *
   * ```ts
   * const base = asPositiveInt(2);
   *
   * const exponent = asPositiveInt(4);
   *
   * const power = PositiveInt.pow(base, exponent);
   *
   * assert(power === 16);
   * ```
   *
   * @param a - The base positive integer
   * @param b - The exponent positive integer
   * @returns `a ** b` as a PositiveInt, but never less than 1
   */
  pow,

  /**
   * Adds two positive integers, ensuring the result is never less than 1.
   *
   * @example
   *
   * ```ts
   * const sum = PositiveInt.add(asPositiveInt(4), asPositiveInt(5));
   *
   * assert(sum === 9);
   * ```
   *
   * @param a - First positive integer
   * @param b - Second positive integer
   * @returns `a + b` as a PositiveInt, but never less than 1
   */
  add,

  /**
   * Subtracts two positive integers, clamping the result to remain positive.
   *
   * If the mathematical result would be <= 0, it is clamped to 1 to maintain
   * the positive integer constraint.
   *
   * @example
   *
   * ```ts
   * const difference = PositiveInt.sub(asPositiveInt(5), asPositiveInt(7));
   *
   * assert(difference === 1);
   * ```
   *
   * @param a - The minuend (positive integer)
   * @param b - The subtrahend (positive integer)
   * @returns `max(1, a - b)` as a PositiveInt
   */
  sub,

  /**
   * Multiplies two positive integers, ensuring the result is never less than 1.
   *
   * @example
   *
   * ```ts
   * const product = PositiveInt.mul(asPositiveInt(3), asPositiveInt(7));
   *
   * assert(product === 21);
   * ```
   *
   * @param a - First positive integer
   * @param b - Second positive integer
   * @returns `a * b` as a PositiveInt, but never less than 1
   */
  mul,

  /**
   * Divides two positive integers using floor division, clamping to remain
   * positive.
   *
   * Performs mathematical floor division: `⌊a / b⌋`. If the result would be 0
   * (when a < b), it is clamped to 1 to maintain the positive integer
   * constraint.
   *
   * @example
   *
   * ```ts
   * const quotient = PositiveInt.div(asPositiveInt(9), asPositiveInt(2));
   *
   * const clamped = PositiveInt.div(asPositiveInt(3), asPositiveInt(10));
   *
   * assert(quotient === 4);
   *
   * assert(clamped === 1);
   * ```
   *
   * @param a - The dividend (positive integer)
   * @param b - The divisor (positive integer, guaranteed non-zero)
   * @returns `max(1, ⌊a / b⌋)` as a PositiveInt
   */
  div,
} as const;

expectType<
  keyof typeof PositiveInt,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive'
  >
>('=');

expectType<
  typeof PositiveInt,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive'
  >
>('<=');
