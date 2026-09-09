import { type BoolOr, type IsAny, type IsUnknown } from 'ts-type-forge';

/**
 * Type guard that checks whether a value is an array.
 *
 * A copy of ts-data-forge's `Arr.isArray`, brought here with the guards the
 * D-49 port left behind so that this package — and the ESLint rule that steers
 * callers to it — no longer has to reach across to `Arr` for the one thing
 * `Array.isArray` gets wrong. What it adds over the built-in is the narrowing:
 * `Array.isArray` widens its argument to `any[]`, which erases whatever the
 * caller already knew, while this keeps the array members of a union and
 * discards the rest.
 *
 * @example
 *
 * ```ts
 * const maybeArray: unknown = [1, 2, 3] as const;
 *
 * const maybeValue: unknown = 'Ada';
 *
 * assert.isTrue(SafeArray.isArray(maybeArray));
 *
 * assert.isFalse(SafeArray.isArray(maybeValue));
 *
 * if (SafeArray.isArray(maybeArray)) {
 *   assert.deepStrictEqual(maybeArray, [1, 2, 3]);
 * }
 * ```
 *
 * @template E - The type of the value being checked.
 * @param value - The value to check.
 * @returns `true` if `value` is an array. When `true`, TypeScript narrows
 *   `value` to the array members of `E` (or to `readonly unknown[]` when `E`
 *   is `unknown` / `any`).
 */
export const isArray = <E,>(value: E): value is FilterArray<E> =>
  Array.isArray(value);

type FilterArray<T> = T extends T
  ? BoolOr<IsUnknown<T>, IsAny<T>> extends true
    ? Cast<readonly unknown[], T>
    : T extends readonly unknown[]
      ? T
      : never // Exclude non-array types
  : never;

type Cast<A, B> = A extends B ? A : never;
