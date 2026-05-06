import { type TSTypeForgeInternals_ExtendNumberBrand } from './_internals.mjs';
import { type IntersectBrand } from './brand.mjs';
import {
  type NegativeNumber,
  type NonNegativeNumber,
  type NonZeroNumber,
  type PositiveNumber,
} from './core.mjs';
import { type Int } from './int.mjs';
import { type WithSmallInt } from './small-int.mjs';

/**
 * Branded numeric type for safe integers.
 * Represents integers that can be exactly represented in JavaScript (±2^53 - 1).
 *
 * @example
 * ```ts
 * const isSafeInt = (x: number): x is SafeInt => Number.isSafeInteger(x);
 *
 * const safeMath = {
 *   add: (a: SafeInt, b: SafeInt): SafeInt | undefined => {
 *     const result = a + b;
 *     return isSafeInt(result) ? result : undefined;
 *   }
 * };
 * ```
 */
export type SafeInt = TSTypeForgeInternals_ExtendNumberBrand<Int, 'SafeInt'>;

/**
 * Branded numeric type for non-zero safe integers.
 * Represents safe integers that are not equal to zero.
 *
 * @example
 * ```ts
 * const isNonZeroSafeInt = (x: number): x is NonZeroSafeInt =>
 *   Number.isSafeInteger(x) && x !== 0;
 *
 * const step = (current: SafeInt, increment: NonZeroSafeInt): SafeInt =>
 *   (current + increment) as SafeInt;
 * ```
 */
export type NonZeroSafeInt = IntersectBrand<SafeInt, NonZeroNumber>;

/**
 * Branded numeric type for safe unsigned integers.
 * Represents non-negative integers within the safe integer range.
 *
 * @example
 * ```ts
 * const isSafeUint = (x: number): x is SafeUint =>
 *   Number.isSafeInteger(x) && x >= 0;
 *
 * const fileSize = (bytes: SafeUint) => ({ bytes });
 * const timestamp = (): SafeUint => Date.now() as SafeUint;
 * ```
 */
export type SafeUint = IntersectBrand<SafeInt, NonNegativeNumber>;

/**
 * Branded numeric type for positive safe integers.
 * Represents positive integers within the safe integer range.
 *
 * @example
 * ```ts
 * const isPositiveSafeInt = (x: number): x is PositiveSafeInt =>
 *   Number.isSafeInteger(x) && x > 0;
 *
 * const userId = (id: PositiveSafeInt) => ({ userId: id });
 * const port = (num: PositiveSafeInt & Uint16) => ({ port: num });
 * ```
 */
export type PositiveSafeInt = IntersectBrand<SafeInt, PositiveNumber>;

/**
 * Branded numeric type for negative safe integers.
 * Represents negative integers within the safe integer range.
 *
 * @example
 * ```ts
 * const isNegativeSafeInt = (x: number): x is NegativeSafeInt =>
 *   Number.isSafeInteger(x) && x < 0;
 *
 * const priority = (level: NegativeSafeInt) => ({ priority: -level });
 * ```
 */
export type NegativeSafeInt = IntersectBrand<SafeInt, NegativeNumber>;

/**
 * Alias for `SafeUint`.
 * Branded numeric type for non-negative safe integers.
 * Represents non-negative integers within the safe integer range.
 */
export type NonNegativeSafeInt = SafeUint;

/**
 * Safe integer type with small literal values included.
 * Type: `-40 | -39 | ... | 39 | SafeInt`
 */
export type SafeIntWithSmallInt = WithSmallInt<SafeInt>;

/**
 * Non-zero safe integer type with small literal values included.
 * Type: `-40 | ... | -1 | 1 | ... | 39 | NonZeroSafeInt`
 */
export type NonZeroSafeIntWithSmallInt = WithSmallInt<NonZeroSafeInt>;

/**
 * Non-negative safe integer type with small literal values included.
 * Type: `0 | 1 | ... | 39 | NonNegativeSafeInt`
 */
export type NonNegativeSafeIntWithSmallInt = WithSmallInt<NonNegativeSafeInt>;

/**
 * Alias for `NonNegativeSafeIntWithSmallInt`.
 * Safe unsigned integer type with small literal values included.
 * Type: `0 | 1 | ... | 39 | SafeUint`
 */
export type SafeUintWithSmallInt = WithSmallInt<SafeUint>;

/**
 * Positive safe integer type with small literal values included.
 * Type: `1 | 2 | ... | 39 | PositiveSafeInt`
 */
export type PositiveSafeIntWithSmallInt = WithSmallInt<PositiveSafeInt>;

/**
 * Negative safe integer type with small literal values included.
 * Type: `-40 | -39 | ... | -1 | NegativeSafeInt`
 */
export type NegativeSafeIntWithSmallInt = WithSmallInt<NegativeSafeInt>;
