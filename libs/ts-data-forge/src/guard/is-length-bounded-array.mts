import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
  type SupportedLength,
} from 'ts-type-forge';

/**
 * Type guard that checks if an array has at least `minLength` elements.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows the input to `MinLengthArray<MinLength, E>` while preserving the
 *   original array type (e.g. tuple types) via intersection.
 * - The length constraint lives only in the brand, so this stays cheap for the
 *   type checker even when the element type is large — unlike
 *   `isMinLengthTuple`, which narrows to a structural tuple type.
 * - The result participates in the length-constraint subtyping relation: for
 *   example, a value narrowed to `MinLengthArray<3, E>` is assignable to
 *   `MinLengthArray<1, E>`.
 *
 * @example
 *
 * ```ts
 * const input: readonly number[] = [0, 1, 2, 3];
 *
 * assert.isTrue(isMinLengthArray(input, 3));
 *
 * assert.isFalse(isMinLengthArray([0], 3));
 *
 * if (isMinLengthArray(input, 3)) {
 *   const history: MinLengthArray<3, number> = input;
 *
 *   const nonEmpty: MinLengthArray<1, number> = input; // OK (3 >= 1)
 * }
 * ```
 *
 * @template Xs - The input array type (tuple types are preserved).
 * @template MinLength - The minimum number of elements (inclusive).
 * @param xs - The array to check.
 * @param minLength - The minimum number of elements (inclusive).
 * @returns `true` if `xs.length >= minLength`, `false` otherwise. When `true`,
 *   TypeScript narrows `xs` to `MinLengthArray<MinLength, Xs[number]> & Xs`.
 */
export const isMinLengthArray = <
  Xs extends readonly unknown[],
  MinLength extends SupportedLength,
>(
  xs: Xs,
  minLength: MinLength,
): xs is MinLengthArray<MinLength, Xs[number]> & Xs => xs.length >= minLength;

/**
 * Type guard that checks if an array has at most `maxLength` elements.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows the input to `MaxLengthArray<MaxLength, E>` while preserving the
 *   original array type (e.g. tuple types) via intersection.
 * - The length constraint lives only in the brand, so this stays cheap for the
 *   type checker even when the element type is large — unlike
 *   `isMaxLengthTuple`, which narrows to a union of tuple types.
 * - The result participates in the length-constraint subtyping relation: for
 *   example, a value narrowed to `MaxLengthArray<8, E>` is assignable to
 *   `MaxLengthArray<16, E>`.
 *
 * @example
 *
 * ```ts
 * const input: readonly string[] = ['a', 'b', 'c'];
 *
 * assert.isTrue(isMaxLengthArray(input, 8));
 *
 * assert.isFalse(isMaxLengthArray(input, 2));
 *
 * if (isMaxLengthArray(input, 8)) {
 *   const tags: MaxLengthArray<8, string> = input;
 *
 *   const relaxed: MaxLengthArray<16, string> = input; // OK (8 <= 16)
 * }
 * ```
 *
 * @template Xs - The input array type (tuple types are preserved).
 * @template MaxLength - The maximum number of elements (inclusive).
 * @param xs - The array to check.
 * @param maxLength - The maximum number of elements (inclusive).
 * @returns `true` if `xs.length <= maxLength`, `false` otherwise. When `true`,
 *   TypeScript narrows `xs` to `MaxLengthArray<MaxLength, Xs[number]> & Xs`.
 */
export const isMaxLengthArray = <
  Xs extends readonly unknown[],
  MaxLength extends SupportedLength,
>(
  xs: Xs,
  maxLength: MaxLength,
): xs is MaxLengthArray<MaxLength, Xs[number]> & Xs => xs.length <= maxLength;

/**
 * Type guard that checks if an array's length is within the inclusive range
 * `[minLength, maxLength]`.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows the input to `BoundedLengthArray<MinLength, MaxLength, E>` while
 *   preserving the original array type (e.g. tuple types) via intersection.
 * - Since `BoundedLengthArray` is the intersection of `MinLengthArray` and
 *   `MaxLengthArray`, the narrowed value is assignable to both, and both
 *   bounds can be weakened independently.
 * - The length constraint lives only in the brand, so this stays cheap for the
 *   type checker even when the element type is large — unlike
 *   `isBoundedLengthTuple`, which narrows to a union of tuple types.
 *
 * @example
 *
 * ```ts
 * const input: readonly number[] = [1, 2, 3];
 *
 * assert.isTrue(isBoundedLengthArray(input, 1, 5));
 *
 * assert.isFalse(isBoundedLengthArray([], 1, 5));
 *
 * if (isBoundedLengthArray(input, 1, 5)) {
 *   const selection: BoundedLengthArray<1, 5, number> = input;
 *
 *   const relaxed: BoundedLengthArray<0, 100, number> = input; // OK ([1, 5] ⊆ [0, 100])
 * }
 * ```
 *
 * @template Xs - The input array type (tuple types are preserved).
 * @template MinLength - The minimum number of elements (inclusive).
 * @template MaxLength - The maximum number of elements (inclusive).
 * @param xs - The array to check.
 * @param minLength - The minimum number of elements (inclusive).
 * @param maxLength - The maximum number of elements (inclusive).
 * @returns `true` if `minLength <= xs.length && xs.length <= maxLength`,
 *   `false` otherwise. When `true`, TypeScript narrows `xs` to
 *   `BoundedLengthArray<MinLength, MaxLength, Xs[number]> & Xs`.
 */
export const isBoundedLengthArray = <
  Xs extends readonly unknown[],
  MinLength extends SupportedLength,
  MaxLength extends SupportedLength,
>(
  xs: Xs,
  minLength: MinLength,
  maxLength: MaxLength,
): xs is BoundedLengthArray<MinLength, MaxLength, Xs[number]> & Xs =>
  xs.length >= minLength && xs.length <= maxLength;

/**
 * Type guard that checks if an array has exactly `length` elements.
 *
 * **Type Narrowing Behavior:**
 *
 * - Narrows the input to `FixedLengthArray<Length, E>` while preserving the
 *   original array type (e.g. tuple types) via intersection.
 * - Since `FixedLengthArray<Length, E>` is defined as
 *   `BoundedLengthArray<Length, Length, E>`, the narrowed value is assignable
 *   to any `MinLengthArray<N, E>` with `N <= Length` and any
 *   `MaxLengthArray<N, E>` with `N >= Length`.
 * - The length constraint lives only in the brand, so this stays cheap for the
 *   type checker even when the element type is large — unlike
 *   `isFixedLengthTuple`, which narrows to a structural tuple type.
 *
 * @example
 *
 * ```ts
 * const input: readonly number[] = [255, 128, 0];
 *
 * assert.isTrue(isFixedLengthArray(input, 3));
 *
 * assert.isFalse(isFixedLengthArray(input, 4));
 *
 * if (isFixedLengthArray(input, 3)) {
 *   const rgb: FixedLengthArray<3, number> = input;
 *
 *   const atMost5: MaxLengthArray<5, number> = input; // OK (3 <= 5)
 * }
 * ```
 *
 * @template Xs - The input array type (tuple types are preserved).
 * @template Length - The exact number of elements.
 * @param xs - The array to check.
 * @param length - The exact number of elements.
 * @returns `true` if `xs.length === length`, `false` otherwise. When `true`,
 *   TypeScript narrows `xs` to `FixedLengthArray<Length, Xs[number]> & Xs`.
 */
export const isFixedLengthArray = <
  Xs extends readonly unknown[],
  Length extends SupportedLength,
>(
  xs: Xs,
  length: Length,
): xs is FixedLengthArray<Length, Xs[number]> & Xs => xs.length === length;
