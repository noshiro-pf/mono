import { type TSTypeForgeInternals_ExtendNumberBrand } from './_internals.mjs';
import { type IntersectBrand } from './brand.mjs';
import {
  type NegativeNumber,
  type NonNegativeNumber,
  type NonZeroNumber,
  type PositiveNumber,
} from './core.mjs';
import { type FiniteNumber } from './finite-number.mjs';
import { type WithSmallInt } from './small-int.mjs';

/**
 * Branded numeric type for integers.
 * Represents values that pass `Number.isInteger(x)` check.
 *
 * @example
 * ```ts
 * const isInt = (x: number): x is Int => Number.isInteger(x);
 *
 * const getArrayElement = <T>(arr: readonly T[], index: Int & NonNegativeNumber) =>
 *   arr[index];
 *
 * const factorial = (n: Int & NonNegativeNumber): Int =>
 *   n === 0 ? 1 as Int : (n * factorial((n - 1) as Int & NonNegativeNumber)) as Int;
 * ```
 */
export type Int = TSTypeForgeInternals_ExtendNumberBrand<FiniteNumber, 'Int'>;

/**
 * Branded numeric type for non-zero integers.
 * Represents integers that are not equal to zero.
 *
 * @example
 * ```ts
 * const isNonZeroInt = (x: number): x is NonZeroInt =>
 *   Number.isInteger(x) && x !== 0;
 *
 * const modulo = (a: Int, b: NonZeroInt) => a % b;
 * const gcd = (a: NonZeroInt, b: NonZeroInt): NonZeroInt => {
 *   // Euclidean algorithm implementation
 *   return (b === 0 ? a : gcd(b, (a % b) as NonZeroInt)) as NonZeroInt;
 * };
 * ```
 */
export type NonZeroInt = IntersectBrand<Int, NonZeroNumber>;

/**
 * Branded numeric type for non-negative integers.
 * Represents integers greater than or equal to zero.
 *
 * @example
 * ```ts
 * const isNonNegativeInt = (x: number): x is NonNegativeInt =>
 *   Number.isInteger(x) && x >= 0;
 *
 * const arrayIndex = (arr: readonly unknown[], i: NonNegativeInt) => arr[i];
 * const count = (items: NonNegativeInt) => ({ count: items });
 * ```
 */
export type NonNegativeInt = IntersectBrand<Int, NonNegativeNumber>;

/**
 * Alias for `NonNegativeInt`.
 * Branded numeric type for unsigned integers (non-negative integers).
 * Represents integers greater than or equal to zero.
 *
 * @example
 * ```ts
 * const isUint = (x: number): x is Uint =>
 *   Number.isInteger(x) && x >= 0;
 *
 * const arrayLength = (arr: readonly unknown[]): Uint =>
 *   arr.length as Uint;
 *
 * const repeat = (str: string, count: Uint) => str.repeat(count);
 * ```
 */
export type Uint = NonNegativeInt;

/**
 * Branded numeric type for positive integers.
 * Represents integers strictly greater than zero.
 *
 * @example
 * ```ts
 * const isPositiveInt = (x: number): x is PositiveInt =>
 *   Number.isInteger(x) && x > 0;
 *
 * const take = <T>(arr: readonly T[], n: PositiveInt): T[] =>
 *   arr.slice(0, n);
 *
 * const id = (value: PositiveInt) => ({ id: value });
 * ```
 */
export type PositiveInt = IntersectBrand<Int, PositiveNumber>;

/**
 * Branded numeric type for negative integers.
 * Represents integers strictly less than zero.
 *
 * @example
 * ```ts
 * const isNegativeInt = (x: number): x is NegativeInt =>
 *   Number.isInteger(x) && x < 0;
 *
 * const offset = (value: NegativeInt) => ({ offset: value });
 * const depth = (level: NegativeInt) => ({ belowGround: -level });
 * ```
 */
export type NegativeInt = IntersectBrand<Int, NegativeNumber>;

/**
 * Integer type with small literal values included.
 * Type: `-40 | -39 | ... | 39 | Int`
 */
export type IntWithSmallInt = WithSmallInt<Int>;

/**
 * Non-zero integer type with small literal values included.
 * Type: `-40 | ... | -1 | 1 | ... | 39 | NonZeroInt`
 */
export type NonZeroIntWithSmallInt = WithSmallInt<NonZeroInt>;

/**
 * Non-negative integer type with small literal values included.
 * Type: `0 | 1 | ... | 39 | NonNegativeInt`
 */
export type NonNegativeIntWithSmallInt = WithSmallInt<NonNegativeInt>;

/**
 * Alias for `NonNegativeIntWithSmallInt`.
 * Unsigned integer type with small literal values included.
 * Type: `0 | 1 | ... | 39 | Uint`
 */
export type UintWithSmallInt = NonNegativeIntWithSmallInt;

/**
 * Positive integer type with small literal values included.
 * Type: `1 | 2 | ... | 39 | PositiveInt`
 */
export type PositiveIntWithSmallInt = WithSmallInt<PositiveInt>;

/**
 * Negative integer type with small literal values included.
 * Type: `-40 | -39 | ... | -1 | NegativeInt`
 */
export type NegativeIntWithSmallInt = WithSmallInt<NegativeInt>;
