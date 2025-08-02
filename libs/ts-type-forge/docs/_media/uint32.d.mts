/**
 * Branded numeric type for 32-bit unsigned integers.
 * Range: [0, 2^32 - 1] or [0, 4,294,967,295]
 *
 * @example
 * ```ts
 * const isUint32 = (x: number): x is Uint32 =>
 *   Number.isSafeInteger(x) && x >= 0 && x <= 2**32 - 1;
 *
 * const color = (rgba: Uint32) => ({ rgba });
 * const ipAddress = (ip: Uint32) => {
 *   // Convert to dotted decimal notation
 *   return `${ip >>> 24}.${(ip >>> 16) & 0xff}.${(ip >>> 8) & 0xff}.${ip & 0xff}`;
 * };
 * ```
 */
type Uint32 = TSTypeForgeInternals.ExtendNumberBrand<SafeUint, '< 2^32'>;

/**
 * Branded numeric type for positive 32-bit unsigned integers.
 * Range: [1, 2^32 - 1] or [1, 4,294,967,295]
 *
 * @example
 * ```ts
 * const isPositiveUint32 = (x: number): x is PositiveUint32 =>
 *   Number.isSafeInteger(x) && x > 0 && x <= 2**32 - 1;
 *
 * const id = (value: PositiveUint32) => ({ id: value });
 * ```
 */
type PositiveUint32 = IntersectBrand<Uint32, PositiveNumber>;

/**
 * Alias for `PositiveUint32`.
 * Branded numeric type for non-zero 32-bit unsigned integers.
 * Range: [1, 2^32 - 1] or [1, 4,294,967,295]
 *
 * @example
 * ```ts
 * const isNonZeroUint32 = (x: number): x is NonZeroUint32 =>
 *   Number.isSafeInteger(x) && x > 0 && x <= 2**32 - 1;
 *
 * const divisor = (value: NonZeroUint32) => 1000000 / value;
 * ```
 */
type NonZeroUint32 = PositiveUint32;

/**
 * 32-bit unsigned integer type with small literal values included.
 * Type: `0 | 1 | ... | 39 | Uint32`
 */
type Uint32WithSmallInt = WithSmallInt<Uint32>;

/**
 * Positive 32-bit unsigned integer type with small literal values included.
 * Type: `1 | 2 | ... | 39 | PositiveUint32`
 */
type PositiveUint32WithSmallInt = WithSmallInt<PositiveUint32>;

/**
 * Alias for `PositiveUint32WithSmallInt`.
 * Non-zero 32-bit unsigned integer type with small literal values included.
 * Type: `1 | 2 | ... | 39 | NonZeroUint32`
 */
type NonZeroUint32WithSmallInt = PositiveUint32WithSmallInt;
