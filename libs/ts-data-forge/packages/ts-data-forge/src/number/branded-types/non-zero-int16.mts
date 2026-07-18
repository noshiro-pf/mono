import { type NonZeroInt16 as TtfImported_NonZeroInt16 } from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type NonZeroInt16 = TtfImported_NonZeroInt16;

type ElementType = NonZeroInt16;

const typeNameInMessage = 'a non-zero integer in [-2^15, 2^15)';

const {
  MAX_VALUE,
  MIN_VALUE,
  abs,
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
  number,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  nonZero: true,
  MIN_VALUE: -(2 ** 15),
  MAX_VALUE: 2 ** 15 - 1,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a NonZeroInt16 (16-bit non-zero signed integer in the
 * range [-2^15, 2^15) excluding 0).
 *
 * @param value The value to check.
 * @returns `true` if the value is a NonZeroInt16, `false` otherwise.
 */
export const isNonZeroInt16 = is;

/**
 * Casts a number to a NonZeroInt16 type.
 *
 * @param value The value to cast.
 * @returns The value as a NonZeroInt16 type.
 * @throws {TypeError} If the value is not a non-zero integer in [-2^15, 2^15).
 */
export const asNonZeroInt16 = castType;

/**
 * Namespace providing type-safe arithmetic operations for 16-bit non-zero
 * signed integers.
 *
 * All operations automatically clamp results to the valid NonZeroInt16 range
 * [-32768, 32767] excluding 0. This ensures that all arithmetic maintains the
 * 16-bit non-zero signed integer constraint, preventing zero results and
 * overflow.
 */
export const NonZeroInt16 = {
  /**
   * Type guard to check if a value is a NonZeroInt16.
   *
   * @param value The value to check.
   * @returns `true` if the value is a 16-bit non-zero signed integer, `false`
   *   otherwise.
   */
  is,

  /**
   * The minimum value for a 16-bit non-zero signed integer.
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum value for a 16-bit non-zero signed integer.
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a 16-bit non-zero signed integer.
   *
   * @param a The NonZeroInt16 value.
   * @returns The absolute value as a NonZeroInt16, clamped to valid range.
   */
  abs,

  /**
   * Returns the smaller of two NonZeroInt16 values.
   *
   * @param a The first NonZeroInt16.
   * @param b The second NonZeroInt16.
   * @returns The minimum value as a NonZeroInt16.
   */
  min: min_,

  /**
   * Returns the larger of two NonZeroInt16 values.
   *
   * @param a The first NonZeroInt16.
   * @param b The second NonZeroInt16.
   * @returns The maximum value as a NonZeroInt16.
   */
  max: max_,

  /**
   * Clamps a number to the NonZeroInt16 range (avoiding zero).
   *
   * @param value The number to clamp.
   * @returns The value clamped to [-32768, 32767] \ {0} as a NonZeroInt16.
   */
  clamp,

  /**
   * Generates a random NonZeroInt16 value within the valid range.
   *
   * @returns A random NonZeroInt16 between MIN_VALUE and MAX_VALUE (excluding
   *   0).
   */
  random,

  /**
   * Raises a NonZeroInt16 to the power of another NonZeroInt16.
   *
   * @param a The base NonZeroInt16.
   * @param b The exponent NonZeroInt16.
   * @returns `a ** b` clamped to [-32768, 32767] as a NonZeroInt16.
   */
  pow,

  /**
   * Multiplies two NonZeroInt16 values.
   *
   * The product of two non-zero integers is always non-zero, so this stays
   * closed; for the non-closed operations (`add`/`sub`/`div`, whose result may
   * be `0`) use {@link Num.add}/{@link Num.sub}/{@link Num.divInt}.
   *
   * @param a The first NonZeroInt16.
   * @param b The second NonZeroInt16.
   * @returns `a * b` clamped to [-32768, 32767] as a NonZeroInt16.
   */
  mul,
} as const;

expectType<
  keyof typeof NonZeroInt16,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range',
    'mul'
  >
>('=');

expectType<
  typeof NonZeroInt16,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range',
    'mul'
  >
>('<=');
