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
 * Supports a curried overload: calling it with only `length` returns a
 * function that casts an array, which is convenient for `pipe`/`map`.
 *
 * @example
 *
 * ```ts
 * const rgb = Arr.asFixedLengthArray([255, 128, 0], 3);
 *
 * const atMost5: MaxLengthArray<5, number> = rgb; // OK (3 <= 5)
 * const red: number = rgb[0]; // OK — no `undefined`
 *
 * // curried version
 * const asRgb = Arr.asFixedLengthArray(3);
 * const green = asRgb([0, 255, 0]);
 *
 * // Arr.asFixedLengthArray([255, 128], 3); // throws TypeError
 * ```
 *
 * @template Xs - The input array type (tuple types are preserved).
 * @template Length - The exact number of elements.
 * @param xs - The array to cast.
 * @param length - The exact number of elements.
 * @returns `xs` typed as `FixedLengthArray<Length, Xs[number]> & Xs`.
 * @throws {TypeError} If `xs.length !== length`.
 */
export function asFixedLengthArray<
  Xs extends readonly unknown[],
  Length extends SupportedLength,
>(xs: Xs, length: Length): FixedLengthArray<Length, Xs[number]> & Xs;

// Curried version
export function asFixedLengthArray<Length extends SupportedLength>(
  length: Length,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => FixedLengthArray<Length, Xs[number]> & Xs;

export function asFixedLengthArray<E>(
  ...args:
    | readonly [xs: readonly E[], length: SupportedLength]
    | readonly [length: SupportedLength]
): readonly E[] | ((xs: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2: {
      const [xs, length] = args;

      if (!isFixedLengthArray(xs, length)) {
        throw new TypeError(
          `Expected an array of length ${length}, got an array of length ${xs.length}`,
        );
      }

      return xs;
    }

    case 1: {
      const [length] = args;

      return (xs) => asFixedLengthArray(xs, length);
    }
  }
}

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
 * Supports a curried overload: calling it with only `minLength` returns a
 * function that casts an array, which is convenient for `pipe`/`map`.
 *
 * @example
 *
 * ```ts
 * const history = Arr.asMinLengthArray([0, 1, 2, 3], 3);
 *
 * const nonEmpty: MinLengthArray<1, number> = history; // OK (3 >= 1)
 * const first: number = history[0]; // OK — no `undefined`
 *
 * // curried version
 * const asHistory = Arr.asMinLengthArray(3);
 * const next = asHistory([4, 5, 6, 7]);
 *
 * // Arr.asMinLengthArray([0], 3); // throws TypeError
 * ```
 *
 * @template Xs - The input array type (tuple types are preserved).
 * @template MinLength - The minimum number of elements (inclusive).
 * @param xs - The array to cast.
 * @param minLength - The minimum number of elements (inclusive).
 * @returns `xs` typed as `MinLengthArray<MinLength, Xs[number]> & Xs`.
 * @throws {TypeError} If `xs.length < minLength`.
 */
export function asMinLengthArray<
  Xs extends readonly unknown[],
  MinLength extends SupportedLength,
>(xs: Xs, minLength: MinLength): MinLengthArray<MinLength, Xs[number]> & Xs;

// Curried version
export function asMinLengthArray<MinLength extends SupportedLength>(
  minLength: MinLength,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => MinLengthArray<MinLength, Xs[number]> & Xs;

export function asMinLengthArray<E>(
  ...args:
    | readonly [xs: readonly E[], minLength: SupportedLength]
    | readonly [minLength: SupportedLength]
): readonly E[] | ((xs: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2: {
      const [xs, minLength] = args;

      if (!isMinLengthArray(xs, minLength)) {
        throw new TypeError(
          `Expected an array of length >= ${minLength}, got an array of length ${xs.length}`,
        );
      }

      return xs;
    }

    case 1: {
      const [minLength] = args;

      return (xs) => asMinLengthArray(xs, minLength);
    }
  }
}

/**
 * Casts an array to `MaxLengthArray<MaxLength, E>` after checking that it has
 * at most `maxLength` elements.
 *
 * Use this instead of writing `xs as unknown as MaxLengthArray<N, E>`: the
 * length is verified at runtime, and the original array type (e.g. tuple
 * types) is preserved via intersection.
 *
 * Supports a curried overload: calling it with only `maxLength` returns a
 * function that casts an array, which is convenient for `pipe`/`map`.
 *
 * @example
 *
 * ```ts
 * const tags = Arr.asMaxLengthArray(['a', 'b', 'c'], 8);
 *
 * const relaxed: MaxLengthArray<16, string> = tags; // OK (8 <= 16)
 *
 * // curried version
 * const asTags = Arr.asMaxLengthArray(8);
 * const more = asTags(['d', 'e']);
 *
 * // Arr.asMaxLengthArray(['a', 'b', 'c'], 2); // throws TypeError
 * ```
 *
 * @template Xs - The input array type (tuple types are preserved).
 * @template MaxLength - The maximum number of elements (inclusive).
 * @param xs - The array to cast.
 * @param maxLength - The maximum number of elements (inclusive).
 * @returns `xs` typed as `MaxLengthArray<MaxLength, Xs[number]> & Xs`.
 * @throws {TypeError} If `xs.length > maxLength`.
 */
export function asMaxLengthArray<
  Xs extends readonly unknown[],
  MaxLength extends SupportedLength,
>(xs: Xs, maxLength: MaxLength): MaxLengthArray<MaxLength, Xs[number]> & Xs;

// Curried version
export function asMaxLengthArray<MaxLength extends SupportedLength>(
  maxLength: MaxLength,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => MaxLengthArray<MaxLength, Xs[number]> & Xs;

export function asMaxLengthArray<E>(
  ...args:
    | readonly [xs: readonly E[], maxLength: SupportedLength]
    | readonly [maxLength: SupportedLength]
): readonly E[] | ((xs: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2: {
      const [xs, maxLength] = args;

      if (!isMaxLengthArray(xs, maxLength)) {
        throw new TypeError(
          `Expected an array of length <= ${maxLength}, got an array of length ${xs.length}`,
        );
      }

      return xs;
    }

    case 1: {
      const [maxLength] = args;

      return (xs) => asMaxLengthArray(xs, maxLength);
    }
  }
}

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
 * Supports a curried overload: calling it with only `minLength` and
 * `maxLength` returns a function that casts an array, which is convenient for
 * `pipe`/`map`.
 *
 * @example
 *
 * ```ts
 * const selection = Arr.asBoundedLengthArray([1, 2, 3], 1, 5);
 *
 * const relaxed: BoundedLengthArray<0, 100, number> = selection; // OK
 *
 * // curried version
 * const asSelection = Arr.asBoundedLengthArray(1, 5);
 * const next = asSelection([4, 5]);
 *
 * // Arr.asBoundedLengthArray([], 1, 5); // throws TypeError
 * ```
 *
 * @template Xs - The input array type (tuple types are preserved).
 * @template MinLength - The minimum number of elements (inclusive).
 * @template MaxLength - The maximum number of elements (inclusive).
 * @param xs - The array to cast.
 * @param minLength - The minimum number of elements (inclusive).
 * @param maxLength - The maximum number of elements (inclusive).
 * @returns `xs` typed as
 *   `BoundedLengthArray<MinLength, MaxLength, Xs[number]> & Xs`.
 * @throws {TypeError} If `xs.length < minLength || xs.length > maxLength`.
 */
export function asBoundedLengthArray<
  Xs extends readonly unknown[],
  MinLength extends SupportedLength,
  MaxLength extends SupportedLength,
>(
  xs: Xs,
  minLength: MinLength,
  maxLength: MaxLength,
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
        xs: readonly E[],
        minLength: SupportedLength,
        maxLength: SupportedLength,
      ]
    | readonly [minLength: SupportedLength, maxLength: SupportedLength]
): readonly E[] | ((xs: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 3: {
      const [xs, minLength, maxLength] = args;

      if (!isBoundedLengthArray(xs, minLength, maxLength)) {
        throw new TypeError(
          `Expected an array of length in [${minLength}, ${maxLength}], got an array of length ${xs.length}`,
        );
      }

      return xs;
    }

    case 2: {
      const [minLength, maxLength] = args;

      return (xs) => asBoundedLengthArray(xs, minLength, maxLength);
    }
  }
}

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
  if (!isMinLengthArray(xs, 1)) {
    throw new TypeError('Expected a non-empty array, got an empty array');
  }

  return xs;
};
