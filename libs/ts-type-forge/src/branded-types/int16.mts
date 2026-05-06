import { type TSTypeForgeInternals_ExtendNumberBrand } from './_internals.mjs';
import { type IntersectBrand } from './brand.mjs';
import {
  type NegativeNumber,
  type NonNegativeNumber,
  type NonZeroNumber,
  type PositiveNumber,
} from './core.mjs';
import { type Int32 } from './int32.mjs';
import { type WithSmallInt } from './small-int.mjs';

/**
 * Branded numeric type for 16-bit signed integers.
 * Range: [-2^15, 2^15 - 1] or [-32,768, 32,767]
 *
 * @example
 * ```ts
 * const isInt16 = (x: number): x is Int16 =>
 *   Number.isSafeInteger(x) && x >= -(2**15) && x <= 2**15 - 1;
 *
 * const audioSample = (value: Int16) => ({ sample: value });
 * const temperature = (celsius: Int16) => ({ celsius });
 * ```
 */
export type Int16 = TSTypeForgeInternals_ExtendNumberBrand<
  Int32,
  '< 2^15' | '< 2^16' | '> -2^16' | '>= -2^15'
>;

/**
 * Branded numeric type for non-zero 16-bit signed integers.
 * Range: [-2^15, -1] ∪ [1, 2^15 - 1]
 *
 * @example
 * ```ts
 * const isNonZeroInt16 = (x: number): x is NonZeroInt16 =>
 *   Number.isSafeInteger(x) && x !== 0 && x >= -(2**15) && x <= 2**15 - 1;
 *
 * const offset = (value: NonZeroInt16) => ({ offset: value });
 * ```
 */
export type NonZeroInt16 = IntersectBrand<Int16, NonZeroNumber>;

/**
 * Branded numeric type for non-negative 16-bit signed integers.
 * Range: [0, 2^15 - 1] or [0, 32,767]
 *
 * @example
 * ```ts
 * const isNonNegativeInt16 = (x: number): x is NonNegativeInt16 =>
 *   Number.isSafeInteger(x) && x >= 0 && x <= 2**15 - 1;
 *
 * const altitude = (meters: NonNegativeInt16) => ({ altitude: meters });
 * ```
 */
export type NonNegativeInt16 = IntersectBrand<Int16, NonNegativeNumber>;

/**
 * Branded numeric type for positive 16-bit signed integers.
 * Range: [1, 2^15 - 1] or [1, 32,767]
 *
 * @example
 * ```ts
 * const isPositiveInt16 = (x: number): x is PositiveInt16 =>
 *   Number.isSafeInteger(x) && x > 0 && x <= 2**15 - 1;
 *
 * const year = (value: PositiveInt16) => ({ year: value });
 * ```
 */
export type PositiveInt16 = IntersectBrand<Int16, PositiveNumber>;

/**
 * Branded numeric type for negative 16-bit integers.
 * Range: [-2^15, -1] or [-32,768, -1]
 *
 * @example
 * ```ts
 * const isNegativeInt16 = (x: number): x is NegativeInt16 =>
 *   Number.isSafeInteger(x) && x < 0 && x >= -(2**15);
 *
 * const relativePosition = (offset: NegativeInt16) => ({ x: offset });
 * ```
 */
export type NegativeInt16 = IntersectBrand<Int16, NegativeNumber>;

/**
 * 16-bit integer type with small literal values included.
 * Type: `-40 | -39 | ... | 39 | Int16`
 */
export type Int16WithSmallInt = WithSmallInt<Int16>;

/**
 * Non-zero 16-bit integer type with small literal values included.
 * Type: `-40 | ... | -1 | 1 | ... | 39 | NonZeroInt16`
 */
export type NonZeroInt16WithSmallInt = WithSmallInt<NonZeroInt16>;

/**
 * Non-negative 16-bit integer type with small literal values included.
 * Type: `0 | 1 | ... | 39 | NonNegativeInt16`
 */
export type NonNegativeInt16WithSmallInt = WithSmallInt<NonNegativeInt16>;

/**
 * Positive 16-bit integer type with small literal values included.
 * Type: `1 | 2 | ... | 39 | PositiveInt16`
 */
export type PositiveInt16WithSmallInt = WithSmallInt<PositiveInt16>;

/**
 * Negative 16-bit integer type with small literal values included.
 * Type: `-40 | -39 | ... | -1 | NegativeInt16`
 */
export type NegativeInt16WithSmallInt = WithSmallInt<NegativeInt16>;
