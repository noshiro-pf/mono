/**
 * Branded bigint type for 64-bit signed integers.
 * Represents values that can be stored in a BigInt64Array.
 *
 * @example
 * ```ts
 * const toBigInt64 = (x: bigint): BigInt64 => {
 *   const min = -(2n ** 63n);
 *   const max = 2n ** 63n - 1n;
 *   if (x >= min && x <= max) return x as BigInt64;
 *   throw new Error('Out of BigInt64 range');
 * };
 * ```
 */
type BigInt64 = ExtendBrand<ChangeBaseBrand<Int, bigint>, 'BigInt64'>;

/**
 * Branded bigint type for 64-bit unsigned integers.
 * Represents values that can be stored in a BigUint64Array.
 *
 * @example
 * ```ts
 * const toBigUint64 = (x: bigint): BigUint64 => {
 *   const max = 2n ** 64n - 1n;
 *   if (x >= 0n && x <= max) return x as BigUint64;
 *   throw new Error('Out of BigUint64 range');
 * };
 * ```
 */
type BigUint64 = ExtendBrand<ChangeBaseBrand<Int, bigint>, 'BigUint64'>;
