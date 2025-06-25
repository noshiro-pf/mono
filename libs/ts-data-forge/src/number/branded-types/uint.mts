import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = Uint;

const typeNameInMessage = 'a non-negative integer';

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
 * @param value The value to check.
 * @returns `true` if the value is a Uint, `false` otherwise.
 */
export const isUint = is;

/**
 * Casts a number to a Uint type.
 * @param value The value to cast.
 * @returns The value as a Uint type.
 * @throws {TypeError} If the value is not a non-negative integer.
 * @example
 * ```typescript
 * const x = asUint(5); // Uint
 * const y = asUint(0); // Uint
 * // asUint(-1); // throws TypeError
 * // asUint(1.5); // throws TypeError
 * ```
 */
export const asUint = castType;

/**
 * Namespace providing type-safe arithmetic operations for unsigned integers.
 *
 * All operations maintain the non-negative constraint by clamping negative results to 0.
 * This ensures that all arithmetic preserves the unsigned integer property.
 *
 * @example
 * ```typescript
 * const a = asUint(100);
 * const b = asUint(150);
 *
 * // Arithmetic operations with non-negative clamping
 * const sum = Uint.add(a, b);       // Uint (250)
 * const diff = Uint.sub(a, b);      // Uint (0 - clamped to MIN_VALUE)
 * const product = Uint.mul(a, b);   // Uint (15000)
 * const quotient = Uint.div(b, a);  // Uint (1)
 *
 * // Range operations
 * const clamped = Uint.clamp(-50);      // Uint (0)
 * const minimum = Uint.min(a, b);       // Uint (100)
 * const maximum = Uint.max(a, b);       // Uint (150)
 *
 * // Utility operations
 * const random = Uint.random();         // Uint (random non-negative integer)
 * const power = Uint.pow(asUint(2), asUint(8)); // Uint (256)
 * ```
 */
export const Uint = {
  /**
   * Type guard to check if a value is a Uint.
   * @param value The value to check.
   * @returns `true` if the value is a non-negative integer, `false` otherwise.
   */
  is,

  /**
   * The minimum value for an unsigned integer.
   * @readonly
   */
  MIN_VALUE,

  /**
   * Returns the smaller of two Uint values.
   * @param a The first Uint.
   * @param b The second Uint.
   * @returns The minimum value as a Uint.
   */
  min: min_,

  /**
   * Returns the larger of two Uint values.
   * @param a The first Uint.
   * @param b The second Uint.
   * @returns The maximum value as a Uint.
   */
  max: max_,

  /**
   * Clamps a number to the Uint range (non-negative).
   * @param value The number to clamp.
   * @returns The value clamped to [0, +∞) as a Uint.
   */
  clamp,

  /**
   * Generates a random Uint value.
   * @returns A random non-negative integer as a Uint.
   */
  random,

  /**
   * Raises a Uint to the power of another Uint.
   * @param a The base Uint.
   * @param b The exponent Uint.
   * @returns `a ** b` clamped to [0, +∞) as a Uint.
   */
  pow,

  /**
   * Adds two Uint values.
   * @param a The first Uint.
   * @param b The second Uint.
   * @returns `a + b` clamped to [0, +∞) as a Uint.
   */
  add,

  /**
   * Subtracts one Uint from another.
   * @param a The minuend Uint.
   * @param b The subtrahend Uint.
   * @returns `a - b` clamped to [0, +∞) as a Uint (minimum 0).
   */
  sub,

  /**
   * Multiplies two Uint values.
   * @param a The first Uint.
   * @param b The second Uint.
   * @returns `a * b` clamped to [0, +∞) as a Uint.
   */
  mul,

  /**
   * Divides one Uint by another using floor division.
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
