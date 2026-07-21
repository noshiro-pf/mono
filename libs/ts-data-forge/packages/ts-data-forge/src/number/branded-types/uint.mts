import { type Uint as TtfImported_Uint } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type Uint = TtfImported_Uint;

type ElementType = Uint;

const typeNameInMessage = 'a non-negative integer';

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
 * Type guard that checks if a value is a non-negative integer.
 *
 * Returns `true` for a non-negative integer — a value with no fractional
 * component, including values outside the safe integer range (unlike
 * `SafeInt`).
 *
 * @example
 *
 * ```ts
 * assert.isTrue(isUint(4));
 *
 * assert.isFalse(isUint(-1));
 *
 * assert.isTrue(Uint.is(0));
 * ```
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-negative integer, `false` otherwise
 */
export const isUint = is;

/**
 * Casts a `number` to the `Uint` branded type.
 *
 * Validates that the value is a non-negative integer and returns it with the
 * `Uint` brand. Throws a `TypeError` otherwise.
 *
 * @example
 *
 * ```ts
 * const branded = asUint(12);
 *
 * assert.isTrue(branded === 12);
 *
 * assert.isTrue(Uint.is(branded));
 * ```
 *
 * @param value - The value to cast
 * @returns The value as an `Uint`
 * @throws {TypeError} If the value is not a non-negative integer
 */
export const asUint = castType;

/**
 * Namespace providing type-safe operations for the `Uint` branded type.
 *
 * The `Uint` type represents a non-negative integer. Division (`div`) uses
 * floor division.
 *
 * Unlike `SafeInt`, `Uint` allows values outside the safe integer range (±2^53
 * − 1), so very large magnitudes may lose precision in JavaScript's `number`
 * type.
 */
export const Uint = {
  /**
   * Type guard that checks if a value is a non-negative integer.
   *
   * @example
   *
   * ```ts
   * assert.isTrue(isUint(4));
   *
   * assert.isFalse(isUint(-1));
   *
   * assert.isTrue(Uint.is(0));
   * ```
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-negative integer, `false` otherwise
   * @see {@link isUint} for usage examples
   */
  is,

  /**
   * The smallest value representable as `Uint` (the lower saturation target of
   * `fromNumber`).
   */
  MIN_VALUE,

  /**
   * Returns the smallest of the given non-negative integers.
   *
   * @example
   *
   * ```ts
   * const smallest = Uint.min(asUint(7), asUint(3));
   *
   * assert.isTrue(smallest === 3);
   * ```
   *
   * @param values - The non-negative integers to compare (at least one required)
   * @returns The smallest value as an `Uint`
   */
  min: min_,

  /**
   * Returns the largest of the given non-negative integers.
   *
   * @example
   *
   * ```ts
   * const largest = Uint.max(asUint(7), asUint(3));
   *
   * assert.isTrue(largest === 7);
   * ```
   *
   * @param values - The non-negative integers to compare (at least one required)
   * @returns The largest value as an `Uint`
   */
  max: max_,

  /**
   * Converts an arbitrary `number` into an `Uint`, rounding to the nearest
   * integer and saturating the result into the range `[MIN_VALUE, MAX_VALUE]`.
   *
   * Unlike `asUint`, this is total: out-of-range inputs are clamped to the
   * nearest representable `Uint` instead of throwing.
   *
   * @example
   *
   * ```ts
   * const fromNegative = Uint.fromNumber(-5);
   *
   * const fromPositive = Uint.fromNumber(42);
   *
   * assert.isTrue(fromNegative === 0);
   *
   * assert.isTrue(fromPositive === 42);
   * ```
   *
   * @param value - The value to convert
   * @returns The value as an `Uint`
   */
  fromNumber,

  /**
   * Generates a random `Uint` within the given range.
   *
   * The range is inclusive on both ends.
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
   * assert.isTrue(Uint.is(randomValue));
   *
   * assert.isTrue(randomValue >= 0 && randomValue <= 3);
   * ```
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `Uint` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as an `Uint` (floored to an
   * integer).
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
   * assert.isTrue(power === 32);
   * ```
   *
   * @param a - The base non-negative integer
   * @param b - The exponent non-negative integer
   * @returns `a ** b` as an `Uint`
   */
  pow,

  /**
   * Adds two non-negative integers, returning `a + b` as an `Uint`.
   *
   * @example
   *
   * ```ts
   * const sum = Uint.add(asUint(5), asUint(8));
   *
   * assert.isTrue(sum === 13);
   * ```
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The sum of `a` and `b` as an `Uint`
   */
  add,

  /**
   * Subtracts two non-negative integers, returning `a - b` as an `Uint`.
   *
   * @example
   *
   * ```ts
   * const difference = Uint.sub(asUint(5), asUint(8));
   *
   * assert.isTrue(difference === 0);
   * ```
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The difference of `a` and `b` as an `Uint`
   */
  sub,

  /**
   * Multiplies two non-negative integers, returning `a * b` as an `Uint`.
   *
   * @example
   *
   * ```ts
   * const product = Uint.mul(asUint(7), asUint(6));
   *
   * assert.isTrue(product === 42);
   * ```
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The product of `a` and `b` as an `Uint`
   */
  mul,

  /**
   * Divides two non-negative integers using floor division (`⌊a / b⌋`): the
   * result is `a / b` rounded toward negative infinity, as an `Uint`.
   *
   * @example
   *
   * ```ts
   * const quotient = Uint.div(asUint(10), asUint(4));
   *
   * assert.isTrue(quotient === 2);
   * ```
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as an `Uint`
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
