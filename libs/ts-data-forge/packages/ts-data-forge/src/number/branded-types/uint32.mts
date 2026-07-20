import { type Uint32 as TtfImported_Uint32 } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type Uint32 = TtfImported_Uint32;

type ElementType = Uint32;

const typeNameInMessage = 'a non-negative integer less than 2^32';

const {
  MAX_VALUE,
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
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 0,
  MAX_VALUE: 2 ** 32 - 1,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a non-negative integer less than 2^32.
 *
 * Returns `true` for a non-negative integer less than 2^32 — a value with no
 * fractional component.
 *
 * @param value - The value to check
 * @returns `true` if the value is a non-negative integer less than 2^32, `false` otherwise
 */
export const isUint32 = is;

/**
 * Casts a `number` to the `Uint32` branded type.
 *
 * Validates that the value is a non-negative integer less than 2^32 and returns
 * it with the `Uint32` brand. Throws a `TypeError` otherwise.
 *
 * @param value - The value to cast
 * @returns The value as an `Uint32`
 * @throws {TypeError} If the value is not a non-negative integer less than 2^32
 */
export const asUint32 = castType;

/**
 * Namespace providing type-safe operations for the `Uint32` branded type.
 *
 * The `Uint32` type represents a non-negative integer less than 2^32. Division
 * (`div`) uses floor division.
 */
export const Uint32 = {
  /**
   * Type guard that checks if a value is a non-negative integer less than 2^32.
   *
   * @param value - The value to check
   * @returns `true` if the value is a non-negative integer less than 2^32, `false` otherwise
   * @see {@link isUint32} for usage examples
   */
  is,

  /**
   * The smallest value representable as `Uint32`.
   */
  MIN_VALUE,

  /**
   * The largest value representable as `Uint32`.
   */
  MAX_VALUE,

  /**
   * Returns the smallest of the given non-negative integers.
   *
   * @param values - The non-negative integers to compare (at least one required)
   * @returns The smallest value as an `Uint32`
   */
  min: min_,

  /**
   * Returns the largest of the given non-negative integers.
   *
   * @param values - The non-negative integers to compare (at least one required)
   * @returns The largest value as an `Uint32`
   */
  max: max_,

  /**
   * Clamps a `number` into the `Uint32` range, rounding to the nearest integer
   * and constraining the result to `[MIN_VALUE, MAX_VALUE]`.
   *
   * @param value - The value to clamp
   * @returns The clamped value as an `Uint32`
   */
  clamp,

  /**
   * Generates a random `Uint32` within the given range.
   *
   * The range is inclusive on both ends.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random `Uint32` in `[min, max]`
   */
  random,

  /**
   * Raises `a` to the power `b`, returning `a ** b` as an `Uint32` (floored to
   * an integer).
   *
   * @param a - The base non-negative integer
   * @param b - The exponent non-negative integer
   * @returns `a ** b` as an `Uint32`
   */
  pow,

  /**
   * Adds two non-negative integers, returning `a + b` as an `Uint32`.
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The sum of `a` and `b` as an `Uint32`
   */
  add,

  /**
   * Subtracts two non-negative integers, returning `a - b` as an `Uint32`.
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The difference of `a` and `b` as an `Uint32`
   */
  sub,

  /**
   * Multiplies two non-negative integers, returning `a * b` as an `Uint32`.
   *
   * @param a - The first non-negative integer
   * @param b - The second non-negative integer
   * @returns The product of `a` and `b` as an `Uint32`
   */
  mul,

  /**
   * Divides two non-negative integers using floor division (`⌊a / b⌋`): the
   * result is `a / b` rounded toward negative infinity, as an `Uint32`.
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The floored quotient as an `Uint32`
   */
  div,
} as const;

expectType<
  keyof typeof Uint32,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('=');

expectType<
  typeof Uint32,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'non-negative' | 'range'
  >
>('<=');
