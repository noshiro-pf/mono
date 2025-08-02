/*
This file serves as the main entry point for all branded number types.
All type definitions have been moved to separate files organized by base type:

Core types and utilities:
├── core.d.mts - Base infrastructure, NaN, ValidNumber, basic ranges
├── finite-number.d.mts - FiniteNumber, InfiniteNumber, POSITIVE/NEGATIVE_INFINITY
├── int.d.mts - Int, NonZeroInt, NonNegativeInt, PositiveInt, NegativeInt
├── uint.d.mts - Uint (unsigned integers)
├── safe-int.d.mts - SafeInt and all its variants

Sized integer types:
├── int32.d.mts - Int32, NonNegativeInt32, PositiveInt32, NegativeInt32, NonZeroInt32
├── int16.d.mts - Int16, NonNegativeInt16, PositiveInt16, NegativeInt16, NonZeroInt16
├── uint32.d.mts - Uint32, PositiveUint32, NonZeroUint32
├── uint16.d.mts - Uint16, PositiveUint16, NonZeroUint16

Floating point and other types:
├── float.d.mts - Float32, Float64
├── bigint.d.mts - BigInt64, BigUint64

Utility types:
└── small-int.d.mts - SmallInt, WithSmallInt variants, RemoveSmallInt
*/

declare namespace TSTypeForgeInternals {
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

  type Keys_ =
    | 'NaNValue'
    | 'Finite'
    | 'Float64'
    | 'Float32'
    | 'Int'
    | 'SafeInt'
    | '!=0'
    | IntRangeKeys;

  type BrandedNumberBaseType = Brand<number, never, never>;

  type ExtendNumberBrand<
    B extends BrandedNumberBaseType,
    T extends RelaxedExclude<Keys_, UnwrapBrandTrueKeys<B>>,
    F extends RelaxedExclude<Keys_, T | UnwrapBrandFalseKeys<B>> = never,
  > = Brand<
    GetBrandValuePart<B>,
    T | (UnwrapBrandTrueKeys<B> & string),
    F | (UnwrapBrandFalseKeys<B> & string)
  >;
}

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
type NaNType = TSTypeForgeInternals.ExtendNumberBrand<
  TSTypeForgeInternals.BrandedNumberBaseType,
  '!=0' | 'NaNValue',
  | TSTypeForgeInternals.IntRangeKeys
  | 'Finite'
  | 'Int'
  | 'SafeInt'
  | 'Float32'
  | 'Float64'
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
type ValidNumber = TSTypeForgeInternals.ExtendNumberBrand<
  TSTypeForgeInternals.BrandedNumberBaseType,
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
type NonZeroNumber = TSTypeForgeInternals.ExtendNumberBrand<ValidNumber, '!=0'>;

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
type NonNegativeNumber = TSTypeForgeInternals.ExtendNumberBrand<
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
type PositiveNumber = IntersectBrand<NonZeroNumber, NonNegativeNumber>;

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
type NegativeNumber = TSTypeForgeInternals.ExtendNumberBrand<
  NonZeroNumber,
  '< 2^15' | '< 2^16' | '< 2^31' | '< 2^32',
  '>=0'
>;
