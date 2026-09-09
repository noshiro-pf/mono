/**
 * Type guard that checks whether an array is empty.
 *
 * The reason to reach for this over `array.length === 0` is the other side of
 * the branch: narrowing to `readonly []` is what tells the checker that the
 * `else` arm has an element, which `noUncheckedIndexedAccess` otherwise makes
 * the caller assert by hand.
 *
 * This is ts-data-forge's `Arr.isEmptyTuple` under the shorter name. There the
 * suffix separates the structural guard from the branded `Arr.isEmpty`, which
 * narrows to `FixedLengthArray<0, E>`; this package has no number brands
 * (D-26 / D-39), so there is only one guard to name.
 *
 * @example
 *
 * ```ts
 * const values: readonly number[] = [];
 *
 * assert.isTrue(SafeArray.isEmpty(values));
 *
 * assert.isFalse(SafeArray.isEmpty([1] as const));
 * ```
 *
 * @template E - The element type.
 * @param array - The array to check.
 * @returns `true` if `array.length === 0`. When `true`, TypeScript narrows
 *   `array` to `readonly []`.
 */
export const isEmpty = <E,>(array: readonly E[]): array is readonly [] =>
  array.length === 0;
