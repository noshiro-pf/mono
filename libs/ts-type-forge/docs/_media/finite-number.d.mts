/**
 * Branded numeric type for finite numbers.
 * Represents values that pass `Number.isFinite(x)` check.
 * Excludes `NaN`, `Infinity`, and `-Infinity`.
 *
 * @example
 * ```ts
 * const isFinite = (x: number): x is FiniteNumber => Number.isFinite(x);
 *
 * const safeDivide = (a: FiniteNumber, b: FiniteNumber): FiniteNumber | InfiniteNumber => {
 *   const result = a / b;
 *   return isFinite(result) ? result : result as InfiniteNumber;
 * };
 * ```
 */
type FiniteNumber = TSTypeForgeInternals.ExtendNumberBrand<
  ValidNumber,
  'Finite'
>;

/**
 * Branded numeric type for infinite values (`Infinity` or `-Infinity`).
 * Represents values that are valid numbers but not finite.
 *
 * @example
 * ```ts
 * const isInfinite = (x: number): x is InfiniteNumber =>
 *   !Number.isNaN(x) && !Number.isFinite(x);
 *
 * const checkOverflow = (x: number): FiniteNumber | InfiniteNumber => {
 *   if (isInfinite(x)) return x;
 *   return x as FiniteNumber;
 * };
 * ```
 */
type InfiniteNumber = TSTypeForgeInternals.ExtendNumberBrand<
  ValidNumber,
  '!=0',
  'Finite' | 'Int' | 'SafeInt'
>;

/**
 * Branded numeric type specifically for `Number.POSITIVE_INFINITY`.
 *
 * @example
 * ```ts
 * const isPosInfinity = (x: number): x is POSITIVE_INFINITY =>
 *   x === Number.POSITIVE_INFINITY;
 *
 * const handleLimit = (x: number): FiniteNumber | POSITIVE_INFINITY => {
 *   if (x > Number.MAX_VALUE) return Number.POSITIVE_INFINITY as POSITIVE_INFINITY;
 *   return x as FiniteNumber;
 * };
 * ```
 */
type POSITIVE_INFINITY = TSTypeForgeInternals.ExtendNumberBrand<
  IntersectBrand<InfiniteNumber, PositiveNumber>,
  never,
  '< 2^15' | '< 2^16' | '< 2^31' | '< 2^32'
>;

/**
 * Branded numeric type specifically for `Number.NEGATIVE_INFINITY`.
 *
 * @example
 * ```ts
 * const isNegInfinity = (x: number): x is NEGATIVE_INFINITY =>
 *   x === Number.NEGATIVE_INFINITY;
 *
 * const handleUnderflow = (x: number): FiniteNumber | NEGATIVE_INFINITY => {
 *   if (x < -Number.MAX_VALUE) return Number.NEGATIVE_INFINITY as NEGATIVE_INFINITY;
 *   return x as FiniteNumber;
 * };
 * ```
 */
type NEGATIVE_INFINITY = TSTypeForgeInternals.ExtendNumberBrand<
  IntersectBrand<InfiniteNumber, NegativeNumber>,
  never,
  '> -2^16' | '> -2^32' | '>= -2^15' | '>= -2^31'
>;

/**
 * Branded numeric type for finite non-negative numbers.
 * Represents finite values greater than or equal to zero.
 *
 * @example
 * ```ts
 * const isNonNegativeFinite = (x: number): x is NonNegativeFiniteNumber =>
 *   Number.isFinite(x) && x >= 0;
 *
 * const distance = (x: NonNegativeFiniteNumber) => ({ meters: x });
 * const age = (years: NonNegativeFiniteNumber & Int) => ({ years });
 * ```
 */
type NonNegativeFiniteNumber = IntersectBrand<NonNegativeNumber, FiniteNumber>;

/**
 * Branded numeric type for finite positive numbers.
 * Represents finite values strictly greater than zero.
 *
 * @example
 * ```ts
 * const isPositiveFinite = (x: number): x is PositiveFiniteNumber =>
 *   Number.isFinite(x) && x > 0;
 *
 * const price = (amount: PositiveFiniteNumber) => ({ USD: amount });
 * const weight = (kg: PositiveFiniteNumber) => ({ kilograms: kg });
 * ```
 */
type PositiveFiniteNumber = IntersectBrand<PositiveNumber, FiniteNumber>;

/**
 * Branded numeric type for finite negative numbers.
 * Represents finite values strictly less than zero.
 *
 * @example
 * ```ts
 * const isNegativeFinite = (x: number): x is NegativeFiniteNumber =>
 *   Number.isFinite(x) && x < 0;
 *
 * const temperature = (celsius: NegativeFiniteNumber) =>
 *   ({ celsius, freezing: true });
 * ```
 */
type NegativeFiniteNumber = IntersectBrand<NegativeNumber, FiniteNumber>;

/**
 * Branded numeric type for finite non-zero numbers.
 * Combines the constraints of being finite and non-zero.
 *
 * @example
 * ```ts
 * const isNonZeroFinite = (x: number): x is NonZeroFiniteNumber =>
 *   Number.isFinite(x) && x !== 0;
 *
 * const rate = (distance: FiniteNumber, time: NonZeroFiniteNumber) =>
 *   distance / time; // Safe division, finite result
 * ```
 */
type NonZeroFiniteNumber = IntersectBrand<NonZeroNumber, FiniteNumber>;
