import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
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
 * @example
 *
 * ```ts
 * const rgb = Arr.asFixedLengthArray([255, 128, 0], 3);
 *
 * const atMost5: MaxLengthArray<5, number> = rgb; // OK (3 <= 5)
 * const red: number = rgb[0]; // OK — no `undefined`
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
export const asFixedLengthArray = <
  Xs extends readonly unknown[],
  Length extends SupportedLength,
>(
  xs: Xs,
  length: Length,
): FixedLengthArray<Length, Xs[number]> & Xs => {
  if (!isFixedLengthArray(xs, length)) {
    throw new TypeError(
      `Expected an array of length ${length}, got an array of length ${xs.length}`,
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
 * @example
 *
 * ```ts
 * const history = Arr.asMinLengthArray([0, 1, 2, 3], 3);
 *
 * const nonEmpty: MinLengthArray<1, number> = history; // OK (3 >= 1)
 * const first: number = history[0]; // OK — no `undefined`
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
export const asMinLengthArray = <
  Xs extends readonly unknown[],
  MinLength extends SupportedLength,
>(
  xs: Xs,
  minLength: MinLength,
): MinLengthArray<MinLength, Xs[number]> & Xs => {
  if (!isMinLengthArray(xs, minLength)) {
    throw new TypeError(
      `Expected an array of length >= ${minLength}, got an array of length ${xs.length}`,
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
 * @example
 *
 * ```ts
 * const tags = Arr.asMaxLengthArray(['a', 'b', 'c'], 8);
 *
 * const relaxed: MaxLengthArray<16, string> = tags; // OK (8 <= 16)
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
export const asMaxLengthArray = <
  Xs extends readonly unknown[],
  MaxLength extends SupportedLength,
>(
  xs: Xs,
  maxLength: MaxLength,
): MaxLengthArray<MaxLength, Xs[number]> & Xs => {
  if (!isMaxLengthArray(xs, maxLength)) {
    throw new TypeError(
      `Expected an array of length <= ${maxLength}, got an array of length ${xs.length}`,
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
 * @example
 *
 * ```ts
 * const selection = Arr.asBoundedLengthArray([1, 2, 3], 1, 5);
 *
 * const relaxed: BoundedLengthArray<0, 100, number> = selection; // OK
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
export const asBoundedLengthArray = <
  Xs extends readonly unknown[],
  MinLength extends SupportedLength,
  MaxLength extends SupportedLength,
>(
  xs: Xs,
  minLength: MinLength,
  maxLength: MaxLength,
): BoundedLengthArray<MinLength, MaxLength, Xs[number]> & Xs => {
  if (!isBoundedLengthArray(xs, minLength, maxLength)) {
    throw new TypeError(
      `Expected an array of length in [${minLength}, ${maxLength}], got an array of length ${xs.length}`,
    );
  }

  return xs;
};
