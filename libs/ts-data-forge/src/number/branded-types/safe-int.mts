import { expectType } from '../../expect-type.mjs';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

type ElementType = SafeInt;

const typeNameInMessage = 'a safe integer';

const {
  MIN_VALUE,
  MAX_VALUE,
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
  clamp,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  ElementType,
  SafeInt,
  SafeUint
>({
  integerOrSafeInteger: 'SafeInteger',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  MIN_VALUE: Number.MIN_SAFE_INTEGER as SafeInt,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  MAX_VALUE: Number.MAX_SAFE_INTEGER as SafeUint,
  typeNameInMessage,
} as const);

/**
 * Type guard that checks if a value is a safe integer.
 *
 * A safe integer is an integer that can be exactly represented in JavaScript
 * without precision loss. The range is [±(2^53 - 1)].
 *
 * @param value - The value to check
 * @returns `true` if the value is a safe integer, `false` otherwise
 *
 * @example
 * ```typescript
 * isSafeInt(42);                    // true
 * isSafeInt(Number.MAX_SAFE_INTEGER); // true
 * isSafeInt(Number.MAX_SAFE_INTEGER + 1); // false
 * isSafeInt(3.14);                  // false
 * isSafeInt(NaN);                   // false
 * ```
 */
export const isSafeInt = is;

/**
 * Casts a number to a SafeInt branded type.
 *
 * This function validates that the input is a safe integer (within ±(2^53 - 1))
 * and returns it with the SafeInt brand. This ensures type safety for operations
 * that require precise integer arithmetic.
 *
 * @param value - The value to cast
 * @returns The value as a SafeInt branded type
 * @throws {TypeError} If the value is not a safe integer
 *
 * @example
 * ```typescript
 * const x = asSafeInt(5);          // SafeInt
 * const y = asSafeInt(-1000);      // SafeInt
 * const z = asSafeInt(2**50);      // SafeInt (within range)
 *
 * // These throw TypeError:
 * // asSafeInt(1.5);                      // Not an integer
 * // asSafeInt(Number.MAX_SAFE_INTEGER + 1); // Exceeds safe range
 * // asSafeInt(2**53);                    // Loss of precision
 * ```
 */
export const asSafeInt = castType;

/**
 * Namespace providing type-safe operations for SafeInt branded types.
 *
 * SafeInt represents integers that can be exactly represented in JavaScript's
 * number type without precision loss. The range is [±(2^53 - 1)], which covers
 * approximately ±9 quadrillion.
 *
 * All operations automatically clamp results to stay within the safe range,
 * preventing precision loss that occurs with larger integers. This makes SafeInt
 * ideal for:
 * - Financial calculations requiring exact cents
 * - Database IDs and counters
 * - Array indices and sizes
 * - Any integer arithmetic requiring precision guarantees
 *
 * @example
 * ```typescript
 * // Near the boundary
 * const nearMax = asSafeInt(9007199254740990);
 * const increment = asSafeInt(10);
 *
 * // Automatic clamping prevents precision loss
 * const sum = SafeInt.add(nearMax, increment);    // Clamped to MAX_SAFE_INTEGER
 * const product = SafeInt.mul(nearMax, increment); // Clamped to MAX_SAFE_INTEGER
 *
 * // Safe operations
 * const a = asSafeInt(1000000);
 * const b = asSafeInt(500);
 *
 * const diff = SafeInt.sub(a, b);        // SafeInt (999500)
 * const quotient = SafeInt.div(a, b);    // SafeInt (2000)
 * const power = SafeInt.pow(b, asSafeInt(2)); // SafeInt (250000)
 *
 * // Utility operations
 * const absolute = SafeInt.abs(asSafeInt(-42)); // SafeInt (42)
 * const clamped = SafeInt.clamp(2**60);         // SafeInt (MAX_SAFE_INTEGER)
 *
 * // Random generation
 * const die = SafeInt.random(asSafeInt(1), asSafeInt(6)); // Random 1-6
 * ```
 */
export const SafeInt = {
  /**
   * Type guard that checks if a value is a safe integer.
   *
   * @param value - The value to check
   * @returns `true` if the value is a safe integer, `false` otherwise
   *
   * @see {@link isSafeInt} for usage examples
   */
  is,

  /**
   * The minimum safe integer value (-(2^53 - 1)).
   * @readonly
   */
  MIN_VALUE,

  /**
   * The maximum safe integer value (2^53 - 1).
   * @readonly
   */
  MAX_VALUE,

  /**
   * Returns the absolute value of a safe integer.
   *
   * Note: `Math.abs(MIN_SAFE_INTEGER)` would exceed `MAX_SAFE_INTEGER`,
   * so this function clamps the result to maintain the safe integer guarantee.
   *
   * @param a - The safe integer value
   * @returns The absolute value as a SafeInt, clamped if necessary
   *
   * @example
   * ```typescript
   * SafeInt.abs(asSafeInt(-42));    // SafeInt (42)
   * SafeInt.abs(asSafeInt(42));     // SafeInt (42)
   * SafeInt.abs(SafeInt.MIN_VALUE); // SafeInt (MAX_SAFE_INTEGER)
   * ```
   */
  abs,

  /**
   * Returns the minimum value from a list of safe integers.
   *
   * @param values - The safe integers to compare (at least one required)
   * @returns The smallest value as a SafeInt
   *
   * @example
   * ```typescript
   * SafeInt.min(asSafeInt(5), asSafeInt(3));        // SafeInt (3)
   * SafeInt.min(asSafeInt(-10), asSafeInt(0), asSafeInt(10)); // SafeInt (-10)
   * ```
   */
  min: min_,

  /**
   * Returns the maximum value from a list of safe integers.
   *
   * @param values - The safe integers to compare (at least one required)
   * @returns The largest value as a SafeInt
   *
   * @example
   * ```typescript
   * SafeInt.max(asSafeInt(5), asSafeInt(3));        // SafeInt (5)
   * SafeInt.max(asSafeInt(-10), asSafeInt(0), asSafeInt(10)); // SafeInt (10)
   * ```
   */
  max: max_,

  /**
   * Clamps a number to the safe integer range.
   * @param value The number to clamp.
   * @returns The value clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] as a SafeInt.
   */
  clamp,

  /**
   * Generates a random safe integer within the specified range (inclusive).
   *
   * The range is inclusive on both ends. If min > max, they are automatically swapped.
   *
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   * @returns A random SafeInt in the range [min, max]
   *
   * @example
   * ```typescript
   * // Dice roll
   * const d20 = SafeInt.random(asSafeInt(1), asSafeInt(20));
   *
   * // Random index for large array
   * const index = SafeInt.random(asSafeInt(0), asSafeInt(1000000));
   *
   * // Can use full safe range
   * const any = SafeInt.random(SafeInt.MIN_VALUE, SafeInt.MAX_VALUE);
   * ```
   */
  random,

  /**
   * Raises a SafeInt to the power of another SafeInt.
   * @param a The base SafeInt.
   * @param b The exponent SafeInt.
   * @returns `a ** b` clamped to safe integer range as a SafeInt.
   */
  pow,

  /**
   * Adds two SafeInt values.
   * @param a The first SafeInt.
   * @param b The second SafeInt.
   * @returns `a + b` clamped to safe integer range as a SafeInt.
   */
  add,

  /**
   * Subtracts one SafeInt from another.
   * @param a The minuend SafeInt.
   * @param b The subtrahend SafeInt.
   * @returns `a - b` clamped to safe integer range as a SafeInt.
   */
  sub,

  /**
   * Multiplies two SafeInt values.
   * @param a The first SafeInt.
   * @param b The second SafeInt.
   * @returns `a * b` clamped to safe integer range as a SafeInt.
   */
  mul,

  /**
   * Divides one SafeInt by another using floor division.
   *
   * Performs mathematical floor division: `⌊a / b⌋`.
   * The divisor must be non-zero (enforced by type constraints).
   *
   * @param a - The dividend
   * @param b - The divisor (must be non-zero)
   * @returns The integer quotient as a SafeInt
   *
   * @example
   * ```typescript
   * SafeInt.div(asSafeInt(10), asSafeInt(3));   // SafeInt (3)
   * SafeInt.div(asSafeInt(-10), asSafeInt(3));  // SafeInt (-4)
   *
   * // Large number division
   * const large = asSafeInt(1000000000000);
   * const divisor = asSafeInt(1000000);
   * SafeInt.div(large, divisor); // SafeInt (1000000)
   * ```
   */
  div,
} as const;

expectType<
  keyof typeof SafeInt,
  keyof TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('=');

expectType<
  typeof SafeInt,
  TsDataForgeInternals.RefinedNumberUtils.NumberClass<
    ElementType,
    'int' | 'range'
  >
>('<=');
