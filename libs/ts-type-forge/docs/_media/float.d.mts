/**
 * Branded numeric type for 32-bit floating point numbers.
 * Represents values that can be stored in a Float32Array.
 *
 * @example
 * ```ts
 * const toFloat32 = (x: number): Float32 => {
 *   const arr = new Float32Array([x]);
 *   return arr[0] as Float32;
 * };
 *
 * const shader = (vertices: Float32[]) => {
 *   // WebGL shader processing
 * };
 * ```
 */
type Float32 = TSTypeForgeInternals.ExtendNumberBrand<
  TSTypeForgeInternals.BrandedNumberBaseType,
  'Float32'
>;

/**
 * Branded numeric type for 64-bit floating point numbers.
 * Represents values that can be stored in a Float64Array (standard JS number precision).
 *
 * @example
 * ```ts
 * const toFloat64 = (x: number): Float64 => x as Float64;
 *
 * const scientificData = (measurements: Float64[]) => {
 *   // High-precision calculations
 * };
 * ```
 */
type Float64 = TSTypeForgeInternals.ExtendNumberBrand<
  TSTypeForgeInternals.BrandedNumberBaseType,
  'Float64'
>;
