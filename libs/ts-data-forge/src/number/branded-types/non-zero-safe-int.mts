import {
  type SafeInt,
  type SafeUint,
  type NonZeroSafeInt as TtfImported_NonZeroSafeInt,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export type NonZeroSafeInt = TtfImported_NonZeroSafeInt;

type ElementType = NonZeroSafeInt;

const typeNameInMessage = 'a non-zero safe integer';

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
  SafeInt,
  SafeUint
>({
  integerOrSafeInteger: 'SafeInteger',
  nonZero: true,
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion, math/prefer-number-min-safe-integer, ts-data-forge/prefer-as-int
  MIN_VALUE: Number.MIN_SAFE_INTEGER as SafeInt,
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion, math/prefer-number-max-safe-integer, ts-data-forge/prefer-as-int
  MAX_VALUE: Number.MAX_SAFE_INTEGER as SafeUint,
  typeNameInMessage,
} as const);

/**
 * Checks if a number is a NonZeroSafeInt (a non-zero safe integer in the range
 * [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] excluding 0).
 *
 * @param value The value to check.
 * @returns `true` if the value is a NonZeroSafeInt, `false` otherwise.
 */
export const isNonZeroSafeInt = is;

/**
 * Casts a number to a NonZeroSafeInt type.
 *
 * @param value The value to cast.
 * @returns The value as a NonZeroSafeInt type.
 * @throws {TypeError} If the value is not a non-zero safe integer.
 */
export const asNonZeroSafeInt = castType;

/**
 * Namespace providing type-safe arithmetic operations for non-zero safe
 * integers.
 *
 * All operations automatically clamp results to the non-zero safe integer
 * range, excluding zero. This ensures that all arithmetic maintains both the
 * non-zero constraint and IEEE 754 precision guarantees, preventing precision
 * loss while ensuring results are never zero.
 */
export const NonZeroSafeInt = {
  /**
   * Type guard to check if a value is a NonZeroSafeInt.
   *
   * @param value The value to check.
   * @returns `true` if the value is a non-zero safe integer, `false` otherwise.
   */
  is,

  /**
   * The minimum safe integer value (-(2^53 - 1)).
   *
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum safe integer value (2^53 - 1).
   *
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a non-zero safe integer.
   *
   * @param a The NonZeroSafeInt value.
   * @returns The absolute value as a NonZeroSafeInt, clamped to safe range.
   */
  abs,

  /**
   * Returns the smaller of two NonZeroSafeInt values.
   *
   * @param a The first NonZeroSafeInt.
   * @param b The second NonZeroSafeInt.
   * @returns The minimum value as a NonZeroSafeInt.
   */
  min: min_,

  /**
   * Returns the larger of two NonZeroSafeInt values.
   *
   * @param a The first NonZeroSafeInt.
   * @param b The second NonZeroSafeInt.
   * @returns The maximum value as a NonZeroSafeInt.
   */
  max: max_,

  /**
   * Clamps a number to the non-zero safe integer range.
   *
   * @param value The number to clamp.
   * @returns The value clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] \ {0} as
   *   a NonZeroSafeInt.
   */
  clamp,

  /**
   * Generates a random NonZeroSafeInt value within the valid range.
   *
   * @returns A random non-zero safe integer between MIN_SAFE_INTEGER and
   *   MAX_SAFE_INTEGER.
   */
  random,

  /**
   * Raises a NonZeroSafeInt to the power of another NonZeroSafeInt.
   *
   * @param a The base NonZeroSafeInt.
   * @param b The exponent NonZeroSafeInt.
   * @returns `a ** b` clamped to non-zero safe integer range as a
   *   NonZeroSafeInt.
   */
  pow,

  /**
   * Multiplies two NonZeroSafeInt values.
   *
   * The product of two non-zero safe integers is always non-zero, so this stays
   * closed; for the non-closed operations (`add`/`sub`/`div`, whose result may
   * be `0`) use {@link Num.add}/{@link Num.sub}/{@link Num.divInt}.
   *
   * @param a The first NonZeroSafeInt.
   * @param b The second NonZeroSafeInt.
   * @returns `a * b` clamped to non-zero safe integer range as a
   *   NonZeroSafeInt.
   */
  mul,
} as const;

expectType<
  keyof typeof NonZeroSafeInt,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range',
    'mul'
  >
>('=');

expectType<
  typeof NonZeroSafeInt,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range',
    'mul'
  >
>('<=');
