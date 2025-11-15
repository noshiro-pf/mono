import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = Uint;

const typeNameInMessage = 'a non-negative integer';

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
  0,
  number
>({
  integerOrSafeInteger: 'Integer',
  MIN_VALUE: 0,
  MAX_VALUE: Number.MAX_VALUE,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a Uint.
 *
 * @example
 *
 * ```ts
 * assert.ok(isUint(4));
 *
 * assert.notOk(isUint(-1));
 *
 * assert.ok(Uint.is(0));
 * ```
 *
 * @param value The value to check.
 * @returns `true` if the value is a Uint, `false` otherwise.
 */
export const isUint = is;

/**
 * Casts a number to a Uint type.
 *
 * @example
 *
 * ```ts
 * const branded = asUint(12);
 *
 * assert(branded === 12);
 *
 * assert.ok(Uint.is(branded));
 * ```
 *
 * @param value The value to cast.
 * @returns The value as a Uint type.
 * @throws {TypeError} If the value is not a non-negative integer.
 */
export const asUint = castType;

/**
 * Namespace providing type-safe arithmetic operations for unsigned integers.
 *
 * All operations maintain the non-negative constraint by clamping negative
 * results to 0. This ensures that all arithmetic preserves the unsigned integer
 * property.
 */
export const Uint = {
  /**
   * Type guard to check if a value is a Uint.
   *
   * @example
   *
   * ```ts
   * assert.ok(isUint(4));
   *
   * assert.notOk(isUint(-1));
   *
   * assert.ok(Uint.is(0));
   * ```
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-negative integer, `false` otherwise.
   * @see {@link isUint} for usage examples
   */
  is,

  /**
   * The minimum value for an unsigned integer.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * Returns the smaller of two Uint values.
   *
   * @example
   *
   * ```ts
   * const smallest = Uint.min(asUint(7), asUint(3));
   *
   * assert(smallest === 3);
   * ```
   *
   * @param a The first Uint.
   * @param b The second Uint.
   * @returns The minimum value as a Uint.
   */
  min: min_,

  /**
   * Returns the larger of two Uint values.
   *
   * @example
   *
   * ```ts
   * const largest = Uint.max(asUint(7), asUint(3));
   *
   * assert(largest === 7);
   * ```
   *
   * @param a The first Uint.
   * @param b The second Uint.
   * @returns The maximum value as a Uint.
   */
  max: max_,

  /**
   * Clamps a number to the Uint range (non-negative).
   *
   * @example
   *
   * ```ts
   * const clampedNegative = Uint.clamp(-5);
   *
   * const clampedPositive = Uint.clamp(42);
   *
   * assert(clampedNegative === 0);
   *
   * assert(clampedPositive === 42);
   * ```
   *
   * @param value The number to clamp.
   * @returns The value clamped to [0, +∞) as a Uint.
   */
  clamp,

  /**
   * Generates a random Uint value.
   *
   * @example
   *
   * ```ts
   * const min = asUint(0);
   *
   * const max = asUint(3);
   *
   * const randomValue = Uint.random(min, max);
   *
   * assert.ok(Uint.is(randomValue));
   *
   * assert.ok(randomValue >= 0 && randomValue <= 3);
   * ```
   *
   * @returns A random non-negative integer as a Uint.
   */
  random,

  /**
   * Raises a Uint to the power of another Uint.
   *
   * @example
   *
   * ```ts
   * const base = asUint(2);
   *
   * const exponent = asUint(5);
   *
   * const power = Uint.pow(base, exponent);
   *
   * assert(power === 32);
   * ```
   *
   * @param a The base Uint.
   * @param b The exponent Uint.
   * @returns `a ** b` clamped to [0, +∞) as a Uint.
   */
  pow,

  /**
   * Adds two Uint values.
   *
   * @example
   *
   * ```ts
   * const sum = Uint.add(asUint(5), asUint(8));
   *
   * assert(sum === 13);
   * ```
   *
   * @param a The first Uint.
   * @param b The second Uint.
   * @returns `a + b` clamped to [0, +∞) as a Uint.
   */
  add,

  /**
   * Subtracts one Uint from another.
   *
   * @example
   *
   * ```ts
   * const difference = Uint.sub(asUint(5), asUint(8));
   *
   * assert(difference === 0);
   * ```
   *
   * @param a The minuend Uint.
   * @param b The subtrahend Uint.
   * @returns `a - b` clamped to [0, +∞) as a Uint (minimum 0).
   */
  sub,

  /**
   * Multiplies two Uint values.
   *
   * @example
   *
   * ```ts
   * const product = Uint.mul(asUint(7), asUint(6));
   *
   * assert(product === 42);
   * ```
   *
   * @param a The first Uint.
   * @param b The second Uint.
   * @returns `a * b` clamped to [0, +∞) as a Uint.
   */
  mul,

  /**
   * Divides one Uint by another using floor division.
   *
   * @example
   *
   * ```ts
   * const quotient = Uint.div(asUint(10), asUint(4));
   *
   * assert(quotient === 2);
   * ```
   *
   * @param a The dividend Uint.
   * @param b The divisor Uint.
   * @returns `⌊a / b⌋` clamped to [0, +∞) as a Uint.
   */
  div,
} as const;

expectType<
  keyof typeof Uint,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative'
  >
>('=');

expectType<
  typeof Uint,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative'
  >
>('<=');
