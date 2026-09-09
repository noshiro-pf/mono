import { type NonEmptyTuple } from 'ts-type-forge';

/**
 * Type guard that checks whether an array has at least one element.
 *
 * `array.length > 0` says the same thing at runtime and nothing at all to the
 * checker: `array[0]` stays `E | undefined` under
 * `noUncheckedIndexedAccess`, and the usual way out is a non-null assertion.
 * Narrowing to `NonEmptyTuple<E>` makes the first element `E` instead, so the
 * guard replaces the assertion rather than joining it.
 *
 * This is ts-data-forge's `Arr.isNonEmptyTuple` under the shorter name — see
 * {@link isEmpty} for why the suffix is not needed here.
 *
 * @example
 *
 * ```ts
 * const values: readonly number[] = [1, 2];
 *
 * assert.isTrue(SafeArray.isNonEmpty(values));
 *
 * assert.isFalse(SafeArray.isNonEmpty([] as const));
 *
 * if (SafeArray.isNonEmpty(values)) {
 *   // `values[0]` is `number`, not `number | undefined`.
 *   assert.strictEqual(values[0], 1);
 * }
 * ```
 *
 * @template E - The element type.
 * @param array - The array to check.
 * @returns `true` if `array.length >= 1`. When `true`, TypeScript narrows
 *   `array` to `NonEmptyTuple<E>`.
 */
export const isNonEmpty = <E,>(
  array: readonly E[],
): array is NonEmptyTuple<E> => array.length >= 1;
