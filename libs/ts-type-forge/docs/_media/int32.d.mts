/**
 * Branded numeric type for 32-bit signed integers.
 * Range: [-2^31, 2^31 - 1] or [-2,147,483,648, 2,147,483,647]
 *
 * @example
 * ```ts
 * const isInt32 = (x: number): x is Int32 =>
 *   Number.isSafeInteger(x) && x >= -(2**31) && x <= 2**31 - 1;
 *
 * const toInt32 = (x: number): Int32 => {
 *   // Simulate 32-bit integer overflow
 *   return (x | 0) as Int32;
 * };
 *
 * const bitwiseOr = (a: Int32, b: Int32): Int32 => (a | b) as Int32;
 * ```
 */
type Int32 = TSTypeForgeInternals.ExtendNumberBrand<
  SafeInt,
  '< 2^31' | '< 2^32' | '> -2^32' | '>= -2^31'
>;

/**
 * Branded numeric type for non-zero 32-bit signed integers.
 * Range: [-2^31, -1] ∪ [1, 2^31 - 1]
 *
 * @example
 * ```ts
 * const isNonZeroInt32 = (x: number): x is NonZeroInt32 =>
 *   Number.isSafeInteger(x) && x !== 0 && x >= -(2**31) && x <= 2**31 - 1;
 *
 * const delta = (change: NonZeroInt32) => ({ delta: change });
 * ```
 */
type NonZeroInt32 = IntersectBrand<Int32, NonZeroNumber>;

/**
 * Branded numeric type for non-negative 32-bit signed integers.
 * Range: [0, 2^31 - 1] or [0, 2,147,483,647]
 *
 * @example
 * ```ts
 * const isNonNegativeInt32 = (x: number): x is NonNegativeInt32 =>
 *   Number.isSafeInteger(x) && x >= 0 && x <= 2**31 - 1;
 *
 * const score = (points: NonNegativeInt32) => ({ score: points });
 * ```
 */
type NonNegativeInt32 = IntersectBrand<Int32, NonNegativeNumber>;

/**
 * Branded numeric type for positive 32-bit signed integers.
 * Range: [1, 2^31 - 1] or [1, 2,147,483,647]
 *
 * @example
 * ```ts
 * const isPositiveInt32 = (x: number): x is PositiveInt32 =>
 *   Number.isSafeInteger(x) && x > 0 && x <= 2**31 - 1;
 *
 * const userId = (id: PositiveInt32) => ({ userId: id });
 * ```
 */
type PositiveInt32 = IntersectBrand<Int32, PositiveNumber>;

/**
 * Branded numeric type for negative 32-bit integers.
 * Range: [-2^31, -1] or [-2,147,483,648, -1]
 *
 * @example
 * ```ts
 * const isNegativeInt32 = (x: number): x is NegativeInt32 =>
 *   Number.isSafeInteger(x) && x < 0 && x >= -(2**31);
 *
 * const offset = (value: NegativeInt32) => ({ offset: value });
 * ```
 */
type NegativeInt32 = IntersectBrand<Int32, NegativeNumber>;

/**
 * 32-bit integer type with small literal values included.
 * Type: `-40 | -39 | ... | 39 | Int32`
 */
type Int32WithSmallInt = WithSmallInt<Int32>;

/**
 * Non-zero 32-bit integer type with small literal values included.
 * Type: `-40 | ... | -1 | 1 | ... | 39 | NonZeroInt32`
 */
type NonZeroInt32WithSmallInt = WithSmallInt<NonZeroInt32>;

/**
 * Non-negative 32-bit integer type with small literal values included.
 * Type: `0 | 1 | ... | 39 | NonNegativeInt32`
 */
type NonNegativeInt32WithSmallInt = WithSmallInt<NonNegativeInt32>;

/**
 * Positive 32-bit integer type with small literal values included.
 * Type: `1 | 2 | ... | 39 | PositiveInt32`
 */
type PositiveInt32WithSmallInt = WithSmallInt<PositiveInt32>;

/**
 * Negative 32-bit integer type with small literal values included.
 * Type: `-40 | -39 | ... | -1 | NegativeInt32`
 */
type NegativeInt32WithSmallInt = WithSmallInt<NegativeInt32>;
