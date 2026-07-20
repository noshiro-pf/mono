import { type NonZeroUint32 as TtfImported_NonZeroUint32 } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type NonZeroUint32 = TtfImported_NonZeroUint32;

type ElementType = NonZeroUint32;

const typeNameInMessage = 'a non-zero integer in [1, 2^32)';

const {
  MAX_VALUE,
  MIN_VALUE,
  add,
  castType,
  clamp,
  is,
  max: max_,
  min: min_,
  mul,
  pow,
  randomNonZero: random,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  1,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  nonZero: true,
  MIN_VALUE: 1,
  MAX_VALUE: 2 ** 32 - 1,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a non-zero integer in [1, 2^32).
 *
 * Returns `true` for a non-zero integer in [1, 2^32) — a value with no
 * fractional component.
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-zero integer in [1, 2^32), `false` otherwise
 */
export const isNonZeroUint32 = is;

/**
 * Casts a `number` to the `NonZeroUint32` branded type.
 *
 * Validates that the value is a non-zero integer in [1, 2^32) and returns it
 * with the `NonZeroUint32` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as a `NonZeroUint32`
 * @throws {TypeError} If the value is not a non-zero integer in [1, 2^32)
 */
export const asNonZeroUint32 = castType;

/**
 * Namespace providing type-safe operations for the `NonZeroUint32` branded
 * type.
 *
 * The `NonZeroUint32` type represents a non-zero integer in [1, 2^32). Division
 * (`div`) uses floor division.
 */
export const NonZeroUint32 = {
  /**
   * Type guard that checks if a value is a non-zero integer in [1, 2^32).
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-zero integer in [1, 2^32), `false` otherwise
   * @see {@link isNonZeroUint32} for usage examples
   */
  is,

  /**
   * The smallest value representable as `NonZeroUint32`.
   */
  MIN_VALUE,

  /**
   * The largest value representable as `NonZeroUint32`.
   */
  MAX_VALUE,

  /**
   * Returns the smallest of the given non-zero integers.
   *
   * @param values - The non-zero integers to compare (at least one required)
   * @returns The smallest value as a `NonZeroUint32`
   */
  min: min_,

  /**
   * Returns the largest of the given non-zero integers.
   *
   * @param values - The non-zero integers to compare (at least one required)
   * @returns The largest value as a `NonZeroUint32`
   */
  max: max_,

  /**
   * Clamps a `number` into the `NonZeroUint32` range, rounding to the nearest
   * integer and constraining the result to `[MIN_VALUE, MAX_VALUE]`.
   *
   * @param value - The value to clamp
   * @returns The clamped value as a `NonZeroUint32`
   */
  clamp,

  /**
   * Generates a random `NonZeroUint32` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `NonZeroUint32` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as a `NonZeroUint32`
   * (floored to an integer).
   *
   * @param a - The base non-zero integer
   * @param b - The exponent non-zero integer
   * @returns `a ** b` as a `NonZeroUint32`
   */
  pow,

  /**
   * Adds two non-zero integers, returning `a + b` as a `NonZeroUint32`.
   *
   * @param a - The first non-zero integer
   * @param b - The second non-zero integer
   * @returns The sum of `a` and `b` as a `NonZeroUint32`
   */
  add,

  /**
   * Multiplies two non-zero integers, returning `a * b` as a `NonZeroUint32`.
   *
   * @param a - The first non-zero integer
   * @param b - The second non-zero integer
   * @returns The product of `a` and `b` as a `NonZeroUint32`
   */
  mul,
} as const;

expectType<
  keyof typeof NonZeroUint32,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range',
    'add' | 'mul'
  >
>('=');

expectType<
  typeof NonZeroUint32,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'positive' | 'range',
    'add' | 'mul'
  >
>('<=');
