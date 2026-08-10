import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
  type NonEmptyArray,
  type SupportedLength,
} from 'ts-type-forge';
import {
  isBoundedLengthArray,
  isFixedLengthArray,
  isMaxLengthArray,
  isMinLengthArray,
} from './array-utils-length-bounded-array-guard.mjs';

/**
 * Casts an array to `FixedLengthArray<Length, E>` after checking that it has
 * exactly `length` elements.
 *
 * Use this instead of writing `xs as unknown as FixedLengthArray<N, E>`: the
 * length is verified at runtime, and the original array type (e.g. tuple
 * types) is preserved via intersection, so the result also benefits from the
 * structural tuple prefix (in-range indexed access without `undefined` under
 * `noUncheckedIndexedAccess`).
 *
 * The length argument comes first, matching the type-parameter order of
 * `FixedLengthArray<Length, Elm>`. Omitting the array returns a function that
 * casts one, which is convenient for `pipe`/`map`.
 *
 * @example
 *
 * ```ts
 * const rgb = Arr.asFixedLengthArray(3, [255, 128, 0]);
 *
 * const atMost5: MaxLengthArray<5, number> = rgb; // OK (3 <= 5)
 * const red: number = rgb[0]; // OK — no `undefined`
 *
 * // curried version
 * const asRgb = Arr.asFixedLengthArray(3);
 * const green = asRgb([0, 255, 0]);
 *
 * // Arr.asFixedLengthArray(3, [255, 128]); // throws TypeError
 * ```
 *
 * @template Length - The exact number of elements.
 * @template Xs - The input array type (tuple types are preserved).
 * @param length - The exact number of elements.
 * @param xs - The array to cast.
 * @returns `xs` typed as `FixedLengthArray<Length, Xs[number]> & Xs`.
 * @throws {TypeError} If `xs.length !== length`.
 */
export function asFixedLengthArray<
  Length extends SupportedLength,
  Xs extends readonly unknown[],
>(length: Length, xs: Xs): FixedLengthArray<Length, Xs[number]> & Xs;

// Curried version
export function asFixedLengthArray<Length extends SupportedLength>(
  length: Length,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => FixedLengthArray<Length, Xs[number]> & Xs;

export function asFixedLengthArray<E>(
  ...args:
    | readonly [length: SupportedLength, xs: readonly E[]]
    | readonly [length: SupportedLength]
): readonly E[] | ((xs: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2:
      return asFixedLengthArrayImpl(...args);

    case 1:
      return (xs) => asFixedLengthArrayImpl(args[0], xs);
  }
}

const asFixedLengthArrayImpl = <E,>(
  length: SupportedLength,
  xs: readonly E[],
): readonly E[] => {
  const actualLength = xs.length;

  if (!isFixedLengthArray(length, xs)) {
    throw new TypeError(
      `Expected an array of length ${length}, got an array of length ${actualLength}`,
    );
  }

  return xs;
};

/**
 * Casts an array to `MinLengthArray<MinLength, E>` after checking that it has
 * at least `minLength` elements.
 *
 * Use this instead of writing `xs as unknown as MinLengthArray<N, E>`: the
 * length is verified at runtime, and the original array type (e.g. tuple
 * types) is preserved via intersection, so the result also benefits from the
 * structural tuple prefix (indexed access below `min(N, 10)` without
 * `undefined` under `noUncheckedIndexedAccess`).
 *
 * The length argument comes first, matching the type-parameter order of
 * `MinLengthArray<MinLength, Elm>`. Omitting the array returns a function that
 * casts one, which is convenient for `pipe`/`map`.
 *
 * @example
 *
 * ```ts
 * const history = Arr.asMinLengthArray(3, [0, 1, 2, 3]);
 *
 * const nonEmpty: MinLengthArray<1, number> = history; // OK (3 >= 1)
 * const first: number = history[0]; // OK — no `undefined`
 *
 * // curried version
 * const asHistory = Arr.asMinLengthArray(3);
 * const next = asHistory([4, 5, 6, 7]);
 *
 * // Arr.asMinLengthArray(3, [0]); // throws TypeError
 * ```
 *
 * @template MinLength - The minimum number of elements (inclusive).
 * @template Xs - The input array type (tuple types are preserved).
 * @param minLength - The minimum number of elements (inclusive).
 * @param xs - The array to cast.
 * @returns `xs` typed as `MinLengthArray<MinLength, Xs[number]> & Xs`.
 * @throws {TypeError} If `xs.length < minLength`.
 */
export function asMinLengthArray<
  MinLength extends SupportedLength,
  Xs extends readonly unknown[],
>(minLength: MinLength, xs: Xs): MinLengthArray<MinLength, Xs[number]> & Xs;

// Curried version
export function asMinLengthArray<MinLength extends SupportedLength>(
  minLength: MinLength,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => MinLengthArray<MinLength, Xs[number]> & Xs;

export function asMinLengthArray<E>(
  ...args:
    | readonly [minLength: SupportedLength, xs: readonly E[]]
    | readonly [minLength: SupportedLength]
): readonly E[] | ((xs: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2:
      return asMinLengthArrayImpl(...args);

    case 1:
      return (xs) => asMinLengthArrayImpl(args[0], xs);
  }
}

const asMinLengthArrayImpl = <E,>(
  minLength: SupportedLength,
  xs: readonly E[],
): readonly E[] => {
  const actualLength = xs.length;

  if (!isMinLengthArray(minLength, xs)) {
    throw new TypeError(
      `Expected an array of length >= ${minLength}, got an array of length ${actualLength}`,
    );
  }

  return xs;
};

/**
 * Casts an array to `MaxLengthArray<MaxLength, E>` after checking that it has
 * at most `maxLength` elements.
 *
 * Use this instead of writing `xs as unknown as MaxLengthArray<N, E>`: the
 * length is verified at runtime, and the original array type (e.g. tuple
 * types) is preserved via intersection.
 *
 * The length argument comes first, matching the type-parameter order of
 * `MaxLengthArray<MaxLength, Elm>`. Omitting the array returns a function that
 * casts one, which is convenient for `pipe`/`map`.
 *
 * @example
 *
 * ```ts
 * const tags = Arr.asMaxLengthArray(8, ['a', 'b', 'c']);
 *
 * const relaxed: MaxLengthArray<16, string> = tags; // OK (8 <= 16)
 *
 * // curried version
 * const asTags = Arr.asMaxLengthArray(8);
 * const more = asTags(['d', 'e']);
 *
 * // Arr.asMaxLengthArray(2, ['a', 'b', 'c']); // throws TypeError
 * ```
 *
 * @template MaxLength - The maximum number of elements (inclusive).
 * @template Xs - The input array type (tuple types are preserved).
 * @param maxLength - The maximum number of elements (inclusive).
 * @param xs - The array to cast.
 * @returns `xs` typed as `MaxLengthArray<MaxLength, Xs[number]> & Xs`.
 * @throws {TypeError} If `xs.length > maxLength`.
 */
export function asMaxLengthArray<
  MaxLength extends SupportedLength,
  Xs extends readonly unknown[],
>(maxLength: MaxLength, xs: Xs): MaxLengthArray<MaxLength, Xs[number]> & Xs;

// Curried version
export function asMaxLengthArray<MaxLength extends SupportedLength>(
  maxLength: MaxLength,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => MaxLengthArray<MaxLength, Xs[number]> & Xs;

export function asMaxLengthArray<E>(
  ...args:
    | readonly [maxLength: SupportedLength, xs: readonly E[]]
    | readonly [maxLength: SupportedLength]
): readonly E[] | ((xs: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2:
      return asMaxLengthArrayImpl(...args);

    case 1:
      return (xs) => asMaxLengthArrayImpl(args[0], xs);
  }
}

const asMaxLengthArrayImpl = <E,>(
  maxLength: SupportedLength,
  xs: readonly E[],
): readonly E[] => {
  const actualLength = xs.length;

  if (!isMaxLengthArray(maxLength, xs)) {
    throw new TypeError(
      `Expected an array of length <= ${maxLength}, got an array of length ${actualLength}`,
    );
  }

  return xs;
};

/**
 * Casts an array to `BoundedLengthArray<MinLength, MaxLength, E>` after
 * checking that its length is within the inclusive range
 * `[minLength, maxLength]`.
 *
 * Use this instead of writing
 * `xs as unknown as BoundedLengthArray<Min, Max, E>`: the length is verified
 * at runtime, and the original array type (e.g. tuple types) is preserved via
 * intersection.
 *
 * The length arguments come first, matching the type-parameter order of
 * `BoundedLengthArray<MinLength, MaxLength, Elm>`. Omitting the array returns a
 * function that casts one, which is convenient for `pipe`/`map`.
 *
 * @example
 *
 * ```ts
 * const selection = Arr.asBoundedLengthArray(1, 5, [1, 2, 3]);
 *
 * const relaxed: BoundedLengthArray<0, 100, number> = selection; // OK
 *
 * // curried version
 * const asSelection = Arr.asBoundedLengthArray(1, 5);
 * const next = asSelection([4, 5]);
 *
 * // Arr.asBoundedLengthArray(1, 5, []); // throws TypeError
 * ```
 *
 * @template MinLength - The minimum number of elements (inclusive).
 * @template MaxLength - The maximum number of elements (inclusive).
 * @template Xs - The input array type (tuple types are preserved).
 * @param minLength - The minimum number of elements (inclusive).
 * @param maxLength - The maximum number of elements (inclusive).
 * @param xs - The array to cast.
 * @returns `xs` typed as
 *   `BoundedLengthArray<MinLength, MaxLength, Xs[number]> & Xs`.
 * @throws {TypeError} If `xs.length < minLength || xs.length > maxLength`.
 */
export function asBoundedLengthArray<
  MinLength extends SupportedLength,
  MaxLength extends SupportedLength,
  Xs extends readonly unknown[],
>(
  minLength: MinLength,
  maxLength: MaxLength,
  xs: Xs,
): BoundedLengthArray<MinLength, MaxLength, Xs[number]> & Xs;

// Curried version
export function asBoundedLengthArray<
  MinLength extends SupportedLength,
  MaxLength extends SupportedLength,
>(
  minLength: MinLength,
  maxLength: MaxLength,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => BoundedLengthArray<MinLength, MaxLength, Xs[number]> & Xs;

export function asBoundedLengthArray<E>(
  ...args:
    | readonly [
        minLength: SupportedLength,
        maxLength: SupportedLength,
        xs: readonly E[],
      ]
    | readonly [minLength: SupportedLength, maxLength: SupportedLength]
): readonly E[] | ((xs: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 3:
      return asBoundedLengthArrayImpl(...args);

    case 2:
      return (xs) => asBoundedLengthArrayImpl(args[0], args[1], xs);
  }
}

const asBoundedLengthArrayImpl = <E,>(
  minLength: SupportedLength,
  maxLength: SupportedLength,
  xs: readonly E[],
): readonly E[] => {
  const actualLength = xs.length;

  if (!isBoundedLengthArray(minLength, maxLength, xs)) {
    throw new TypeError(
      `Expected an array of length in [${minLength}, ${maxLength}], got an array of length ${actualLength}`,
    );
  }

  return xs;
};

/**
 * Casts an array to `FixedLengthArray<0, E>` after checking that it is empty.
 *
 * `Arr.isEmpty` narrows to that same type, so this is its cast counterpart —
 * the length-0 specialization of {@link asFixedLengthArray}. Use this instead
 * of writing `xs as unknown as FixedLengthArray<0, E>`: the length is verified
 * at runtime, and the original array type is preserved via intersection.
 *
 * @example
 *
 * ```ts
 * const nothing = Arr.asEmptyArray([]);
 *
 * const atMost5: MaxLengthArray<5, never> = nothing; // OK (0 <= 5)
 *
 * // Arr.asEmptyArray([1]); // throws TypeError
 * ```
 *
 * @template Xs - The input array type (tuple types are preserved).
 * @param xs - The array to cast.
 * @returns `xs` typed as `FixedLengthArray<0, Xs[number]> & Xs`.
 * @throws {TypeError} If `xs` is not empty.
 */
export const asEmptyArray = <Xs extends readonly unknown[]>(
  xs: Xs,
): FixedLengthArray<0, Xs[number]> & Xs => {
  if (!isFixedLengthArray(0, xs)) {
    throw new TypeError(
      `Expected an empty array, got an array of length ${xs.length}`,
    );
  }

  return xs;
};

/**
 * Casts an array to `NonEmptyArray<E>` after checking that it has at least one
 * element.
 *
 * `NonEmptyArray<E>` is an alias of `MinLengthArray<1, E>`, so this is the
 * length-1 specialization of {@link asMinLengthArray}. Use this instead of
 * writing `xs as unknown as NonEmptyArray<E>`: the length is verified at
 * runtime, and the original array type (e.g. tuple types) is preserved via
 * intersection, so the result also benefits from the structural tuple prefix
 * (`xs[0]` without `undefined` under `noUncheckedIndexedAccess`).
 *
 * @example
 *
 * ```ts
 * const history = Arr.asNonEmptyArray([0, 1, 2, 3]);
 *
 * const first: number = history[0]; // OK — no `undefined`
 *
 * // Arr.asNonEmptyArray([]); // throws TypeError
 * ```
 *
 * @template Xs - The input array type (tuple types are preserved).
 * @param xs - The array to cast.
 * @returns `xs` typed as `NonEmptyArray<Xs[number]> & Xs`.
 * @throws {TypeError} If `xs` is empty.
 */
export const asNonEmptyArray = <Xs extends readonly unknown[]>(
  xs: Xs,
): NonEmptyArray<Xs[number]> & Xs => {
  if (!isMinLengthArray(1, xs)) {
    throw new TypeError('Expected a non-empty array, got an empty array');
  }

  return xs;
};
