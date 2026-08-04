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
 * The length argument comes first, matching the type-parameter order of
 * `MinLengthArray<MinLength, Elm>`. Omitting the array returns a reusable type
 * guard, which is convenient for `filter`/`pipe`.
 *
 * @example
 *
 * ```ts
 * const input: readonly number[] = [0, 1, 2, 3] as const;
 *
 * assert.isTrue(Arr.isMinLengthArray(3, input));
 *
 * assert.isFalse(Arr.isMinLengthArray(3, [0]));
 *
 * if (Arr.isMinLengthArray(3, input)) {
 *   const history: MinLengthArray<3, number> = input;
 *
 *   const nonEmpty: MinLengthArray<1, number> = input; // OK (3 >= 1)
 *
 *   assert.deepStrictEqual(history[0], 0);
 *
 *   assert.deepStrictEqual(nonEmpty[0], 0);
 * }
 *
 * // curried version
 * const hasThree = Arr.isMinLengthArray(3);
 *
 * assert.isTrue(hasThree(input));
 * ```
 *
 * @template MinLength - The minimum number of elements (inclusive).
 * @template Xs - The input array type (tuple types are preserved).
 * @param minLength - The minimum number of elements (inclusive).
 * @param xs - The array to check.
 * @returns `true` if `xs.length >= minLength`, `false` otherwise. When `true`,
 *   TypeScript narrows `xs` to `MinLengthArray<MinLength, Xs[number]> & Xs`.
 */
export function isMinLengthArray<
  MinLength extends SupportedLength,
  Xs extends readonly unknown[],
>(
  minLength: MinLength,
  xs: Xs,
): xs is MinLengthArray<MinLength, Xs[number]> & Xs;

// Curried version
export function isMinLengthArray<MinLength extends SupportedLength>(
  minLength: MinLength,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => xs is MinLengthArray<MinLength, Xs[number]> & Xs;

export function isMinLengthArray(
  ...args:
    | readonly [minLength: SupportedLength, xs: readonly unknown[]]
    | readonly [minLength: SupportedLength]
): boolean | ((xs: readonly unknown[]) => boolean) {
  switch (args.length) {
    case 2:
      return hasMinLength(...args);

    case 1:
      return (xs) => hasMinLength(args[0], xs);
  }
}

const hasMinLength = (
  minLength: SupportedLength,
  xs: readonly unknown[],
): boolean => xs.length >= minLength;

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
 * The length argument comes first, matching the type-parameter order of
 * `MaxLengthArray<MaxLength, Elm>`. Omitting the array returns a reusable type
 * guard, which is convenient for `filter`/`pipe`.
 *
 * @example
 *
 * ```ts
 * const input: readonly string[] = ['a', 'b', 'c'] as const;
 *
 * assert.isTrue(Arr.isMaxLengthArray(8, input));
 *
 * assert.isFalse(Arr.isMaxLengthArray(2, input));
 *
 * if (Arr.isMaxLengthArray(8, input)) {
 *   const tags: MaxLengthArray<8, string> = input;
 *
 *   const relaxed: MaxLengthArray<16, string> = input; // OK (8 <= 16)
 *
 *   assert.deepStrictEqual(tags.length, 3);
 *
 *   assert.deepStrictEqual(relaxed.length, 3);
 * }
 *
 * // curried version
 * const fitsInEight = Arr.isMaxLengthArray(8);
 *
 * assert.isTrue(fitsInEight(input));
 * ```
 *
 * @template MaxLength - The maximum number of elements (inclusive).
 * @template Xs - The input array type (tuple types are preserved).
 * @param maxLength - The maximum number of elements (inclusive).
 * @param xs - The array to check.
 * @returns `true` if `xs.length <= maxLength`, `false` otherwise. When `true`,
 *   TypeScript narrows `xs` to `MaxLengthArray<MaxLength, Xs[number]> & Xs`.
 */
export function isMaxLengthArray<
  MaxLength extends SupportedLength,
  Xs extends readonly unknown[],
>(
  maxLength: MaxLength,
  xs: Xs,
): xs is MaxLengthArray<MaxLength, Xs[number]> & Xs;

// Curried version
export function isMaxLengthArray<MaxLength extends SupportedLength>(
  maxLength: MaxLength,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => xs is MaxLengthArray<MaxLength, Xs[number]> & Xs;

export function isMaxLengthArray(
  ...args:
    | readonly [maxLength: SupportedLength, xs: readonly unknown[]]
    | readonly [maxLength: SupportedLength]
): boolean | ((xs: readonly unknown[]) => boolean) {
  switch (args.length) {
    case 2:
      return hasMaxLength(...args);

    case 1:
      return (xs) => hasMaxLength(args[0], xs);
  }
}

const hasMaxLength = (
  maxLength: SupportedLength,
  xs: readonly unknown[],
): boolean => xs.length <= maxLength;

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
 * The length arguments come first, matching the type-parameter order of
 * `BoundedLengthArray<MinLength, MaxLength, Elm>`. Omitting the array returns a
 * reusable type guard, which is convenient for `filter`/`pipe`.
 *
 * @example
 *
 * ```ts
 * const input: readonly number[] = [1, 2, 3] as const;
 *
 * assert.isTrue(Arr.isBoundedLengthArray(1, 5, input));
 *
 * assert.isFalse(Arr.isBoundedLengthArray(1, 5, []));
 *
 * if (Arr.isBoundedLengthArray(1, 5, input)) {
 *   const selection: BoundedLengthArray<1, 5, number> = input;
 *
 *   const relaxed: BoundedLengthArray<0, 100, number> = input; // OK ([1, 5] ⊆ [0, 100])
 *
 *   assert.deepStrictEqual(selection[0], 1);
 *
 *   assert.deepStrictEqual(relaxed.length, 3);
 * }
 *
 * // curried version
 * const isSmallSelection = Arr.isBoundedLengthArray(1, 5);
 *
 * assert.isTrue(isSmallSelection(input));
 * ```
 *
 * @template MinLength - The minimum number of elements (inclusive).
 * @template MaxLength - The maximum number of elements (inclusive).
 * @template Xs - The input array type (tuple types are preserved).
 * @param minLength - The minimum number of elements (inclusive).
 * @param maxLength - The maximum number of elements (inclusive).
 * @param xs - The array to check.
 * @returns `true` if `minLength <= xs.length && xs.length <= maxLength`,
 *   `false` otherwise. When `true`, TypeScript narrows `xs` to
 *   `BoundedLengthArray<MinLength, MaxLength, Xs[number]> & Xs`.
 */
export function isBoundedLengthArray<
  MinLength extends SupportedLength,
  MaxLength extends SupportedLength,
  Xs extends readonly unknown[],
>(
  minLength: MinLength,
  maxLength: MaxLength,
  xs: Xs,
): xs is BoundedLengthArray<MinLength, MaxLength, Xs[number]> & Xs;

// Curried version
export function isBoundedLengthArray<
  MinLength extends SupportedLength,
  MaxLength extends SupportedLength,
>(
  minLength: MinLength,
  maxLength: MaxLength,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => xs is BoundedLengthArray<MinLength, MaxLength, Xs[number]> & Xs;

export function isBoundedLengthArray(
  ...args:
    | readonly [
        minLength: SupportedLength,
        maxLength: SupportedLength,
        xs: readonly unknown[],
      ]
    | readonly [minLength: SupportedLength, maxLength: SupportedLength]
): boolean | ((xs: readonly unknown[]) => boolean) {
  switch (args.length) {
    case 3:
      return hasBoundedLength(...args);

    case 2:
      return (xs) => hasBoundedLength(args[0], args[1], xs);
  }
}

const hasBoundedLength = (
  minLength: SupportedLength,
  maxLength: SupportedLength,
  xs: readonly unknown[],
): boolean => xs.length >= minLength && xs.length <= maxLength;

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
 * The length argument comes first, matching the type-parameter order of
 * `FixedLengthArray<Length, Elm>`. Omitting the array returns a reusable type
 * guard, which is convenient for `filter`/`pipe`.
 *
 * @example
 *
 * ```ts
 * const input: readonly number[] = [255, 128, 0] as const;
 *
 * assert.isTrue(Arr.isFixedLengthArray(3, input));
 *
 * assert.isFalse(Arr.isFixedLengthArray(4, input));
 *
 * if (Arr.isFixedLengthArray(3, input)) {
 *   const rgb: FixedLengthArray<3, number> = input;
 *
 *   const atMost5: MaxLengthArray<5, number> = input; // OK (3 <= 5)
 *
 *   assert.deepStrictEqual(rgb[0], 255);
 *
 *   assert.deepStrictEqual(atMost5.length, 3);
 * }
 *
 * // curried version
 * const isRgb = Arr.isFixedLengthArray(3);
 *
 * assert.isTrue(isRgb(input));
 * ```
 *
 * @template Length - The exact number of elements.
 * @template Xs - The input array type (tuple types are preserved).
 * @param length - The exact number of elements.
 * @param xs - The array to check.
 * @returns `true` if `xs.length === length`, `false` otherwise. When `true`,
 *   TypeScript narrows `xs` to `FixedLengthArray<Length, Xs[number]> & Xs`.
 */
export function isFixedLengthArray<
  Length extends SupportedLength,
  Xs extends readonly unknown[],
>(length: Length, xs: Xs): xs is FixedLengthArray<Length, Xs[number]> & Xs;

// Curried version
export function isFixedLengthArray<Length extends SupportedLength>(
  length: Length,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => xs is FixedLengthArray<Length, Xs[number]> & Xs;

export function isFixedLengthArray(
  ...args:
    | readonly [length: SupportedLength, xs: readonly unknown[]]
    | readonly [length: SupportedLength]
): boolean | ((xs: readonly unknown[]) => boolean) {
  switch (args.length) {
    case 2:
      return hasFixedLength(...args);

    case 1:
      return (xs) => hasFixedLength(args[0], xs);
  }
}

const hasFixedLength = (
  length: SupportedLength,
  xs: readonly unknown[],
): boolean => xs.length === length;

/**
 * Type guard that checks if an array is empty.
 *
 * @example
 *
 * ```ts
 * const emptyNumbers: readonly number[] = [] as const;
 *
 * const words = ['Ada', 'Lovelace'] as const;
 *
 * assert.isTrue(Arr.isEmpty(emptyNumbers));
 *
 * assert.isFalse(Arr.isEmpty(words));
 *
 * if (Arr.isEmpty(emptyNumbers)) {
 *   // `isEmpty` narrows to the branded `FixedLengthArray<0, number>`, so the
 *   // expected value is annotated with the unbranded type.
 *   assert.deepStrictEqual<readonly number[]>(emptyNumbers, []);
 * }
 * ```
 */
export const isEmpty = <Xs extends readonly unknown[]>(
  array: Xs,
): array is FixedLengthArray<0, Xs[number]> & Xs => array.length === 0;

/**
 * Type guard that checks if an array is non-empty.
 *
 * @example
 *
 * ```ts
 * const users: readonly Readonly<{ id: number }>[] = [{ id: 1 }] as const;
 *
 * const emptyUsers: readonly Readonly<{ id: number }>[] = [] as const;
 *
 * assert.isTrue(Arr.isNonEmpty(users));
 *
 * assert.isFalse(Arr.isNonEmpty(emptyUsers));
 *
 * if (Arr.isNonEmpty(users)) {
 *   assert.deepStrictEqual(users[0], { id: 1 });
 * }
 * ```
 */
export const isNonEmpty = <Xs extends readonly unknown[]>(
  array: Xs,
): array is MinLengthArray<1, Xs[number]> & Xs => array.length > 0;
