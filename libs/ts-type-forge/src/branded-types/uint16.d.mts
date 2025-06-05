/**
 * Branded numeric type for 16-bit unsigned integers.
 * Range: [0, 2^16 - 1] or [0, 65,535]
 *
 * @example
 * ```ts
 * const isUint16 = (x: number): x is Uint16 =>
 *   Number.isSafeInteger(x) && x >= 0 && x <= 2**16 - 1;
 *
 * const port = (num: Uint16) => ({ port: num });
 * const characterCode = (code: Uint16) => String.fromCharCode(code);
 * ```
 */
type Uint16 = TSTypeForgeInternals.ExtendNumberBrand<
  Uint32,
  '< 2^16' | '< 2^31'
>;

/**
 * Branded numeric type for positive 16-bit unsigned integers.
 * Range: [1, 2^16 - 1] or [1, 65,535]
 *
 * @example
 * ```ts
 * const isPositiveUint16 = (x: number): x is PositiveUint16 =>
 *   Number.isSafeInteger(x) && x > 0 && x <= 2**16 - 1;
 *
 * const tcpPort = (port: PositiveUint16) => ({ port });
 * ```
 */
type PositiveUint16 = IntersectBrand<Uint16, PositiveNumber>;

/**
 * Alias for `PositiveUint16`.
 * Branded numeric type for non-zero 16-bit unsigned integers.
 * Range: [1, 2^16 - 1] or [1, 65,535]
 *
 * @example
 * ```ts
 * const isNonZeroUint16 = (x: number): x is NonZeroUint16 =>
 *   Number.isSafeInteger(x) && x > 0 && x <= 2**16 - 1;
 *
 * const networkId = (id: NonZeroUint16) => ({ networkId: id });
 * ```
 */
type NonZeroUint16 = PositiveUint16;

/**
 * 16-bit unsigned integer type with small literal values included.
 * Type: `0 | 1 | ... | 39 | Uint16`
 */
type Uint16WithSmallInt = WithSmallInt<Uint16>;

/**
 * Positive 16-bit unsigned integer type with small literal values included.
 * Type: `1 | 2 | ... | 39 | PositiveUint16`
 */
type PositiveUint16WithSmallInt = WithSmallInt<PositiveUint16>;

/**
 * Alias for `PositiveUint16WithSmallInt`.
 * Non-zero 16-bit unsigned integer type with small literal values included.
 * Type: `1 | 2 | ... | 39 | NonZeroUint16`
 */
type NonZeroUint16WithSmallInt = PositiveUint16WithSmallInt;
