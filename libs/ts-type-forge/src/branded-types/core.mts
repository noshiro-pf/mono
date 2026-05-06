import {
  type TSTypeForgeInternals_BrandedNumberBaseType,
  type TSTypeForgeInternals_ExtendNumberBrand,
} from './_internals.mjs';
import { type IntersectBrand } from './brand.mjs';

/*
This file serves as the main entry point for all branded number types.
All type definitions have been moved to separate files organized by base type:

Core types and utilities:
├── core.mts - Base infrastructure, NaN, ValidNumber, basic ranges
├── finite-number.mts - FiniteNumber, InfiniteNumber, POSITIVE/NEGATIVE_INFINITY
├── int.mts - Int, NonZeroInt, NonNegativeInt, PositiveInt, NegativeInt
├── uint.mts - Uint (unsigned integers)
├── safe-int.mts - SafeInt and all its variants

Sized integer types:
├── int32.mts - Int32, NonNegativeInt32, PositiveInt32, NegativeInt32, NonZeroInt32
├── int16.mts - Int16, NonNegativeInt16, PositiveInt16, NegativeInt16, NonZeroInt16
├── uint32.mts - Uint32, PositiveUint32, NonZeroUint32
├── uint16.mts - Uint16, PositiveUint16, NonZeroUint16

Floating point and other types:
├── float.mts - Float32, Float64
├── bigint.mts - BigInt64, BigUint64

Utility types:
└── small-int.mts - SmallInt, WithSmallInt variants, RemoveSmallInt
*/

type IntRangeKeys =
  | '< 2^15'
  | '< 2^16'
  | '< 2^31'
  | '< 2^32'
  | '> -2^16'
  | '> -2^32'
  | '>= -2^15'
  | '>= -2^31'
  | '>=0';

/**
 * Branded numeric type representing the `NaN` value.
 * This type is branded to ensure type safety when handling NaN values.
 *
 * @example
 * ```ts
 * const checkNaN = (x: number): x is NaNType => Number.isNaN(x);
 *
 * const value: number = parseFloat("invalid");
 * if (checkNaN(value)) {
 *   const nan: NaNType = value;
 *   // Handle NaN case specifically
 * }
 * ```
 */
export type NaNType = TSTypeForgeInternals_ExtendNumberBrand<
  TSTypeForgeInternals_BrandedNumberBaseType,
  '!=0' | 'NaNValue',
  IntRangeKeys | 'Finite' | 'Int' | 'SafeInt' | 'Float32' | 'Float64'
>;

/**
 * Branded numeric type for all valid numbers (excluding `NaN`).
 * This is the base type for most numeric brands.
 *
 * @example
 * ```ts
 * const isValidNumber = (x: number): x is ValidNumber => !Number.isNaN(x);
 *
 * const process = (n: ValidNumber) => {
 *   // Can safely perform arithmetic without NaN checks
 *   return n * 2 + 1;
 * };
 * ```
 */
export type ValidNumber = TSTypeForgeInternals_ExtendNumberBrand<
  TSTypeForgeInternals_BrandedNumberBaseType,
  never,
  'NaNValue'
>;

/**
 * Branded numeric type for non-zero numbers.
 * Represents values that are not equal to zero (including -0).
 *
 * @example
 * ```ts
 * const isNonZero = (x: number): x is NonZeroNumber => x !== 0;
 *
 * const safeDivide = (a: number, b: NonZeroNumber) => a / b;
 * // No division by zero possible
 *
 * const reciprocal = (x: NonZeroNumber) => 1 / x;
 * ```
 */
export type NonZeroNumber = TSTypeForgeInternals_ExtendNumberBrand<
  ValidNumber,
  '!=0'
>;

/**
 * Branded numeric type for non-negative numbers (x >= 0).
 * Includes zero and all positive numbers.
 *
 * @example
 * ```ts
 * const isNonNegative = (x: number): x is NonNegativeNumber => x >= 0;
 *
 * const sqrt = (x: NonNegativeNumber) => Math.sqrt(x);
 * // Safe square root without negative input
 *
 * const arrayIndex = (arr: readonly unknown[], i: NonNegativeNumber & Int) => arr[i];
 * ```
 */
export type NonNegativeNumber = TSTypeForgeInternals_ExtendNumberBrand<
  ValidNumber,
  '> -2^16' | '> -2^32' | '>= -2^15' | '>= -2^31' | '>=0'
>;

/**
 * Branded numeric type for positive numbers (x > 0).
 * Excludes zero, includes only strictly positive values.
 *
 * @example
 * ```ts
 * const isPositive = (x: number): x is PositiveNumber => x > 0;
 *
 * const log = (x: PositiveNumber) => Math.log(x);
 * // Safe logarithm without non-positive input
 *
 * const scale = (value: number, factor: PositiveNumber) => value * factor;
 * ```
 */
export type PositiveNumber = IntersectBrand<NonZeroNumber, NonNegativeNumber>;

/**
 * Branded numeric type for negative numbers (x < 0).
 * Excludes zero, includes only strictly negative values.
 *
 * @example
 * ```ts
 * const isNegative = (x: number): x is NegativeNumber => x < 0;
 *
 * const absoluteValue = (x: NegativeNumber): PositiveNumber =>
 *   Math.abs(x) as PositiveNumber;
 *
 * const debt = (amount: NegativeNumber) => ({ type: 'debt', amount });
 * ```
 */
export type NegativeNumber = TSTypeForgeInternals_ExtendNumberBrand<
  NonZeroNumber,
  '< 2^15' | '< 2^16' | '< 2^31' | '< 2^32',
  '>=0'
>;
