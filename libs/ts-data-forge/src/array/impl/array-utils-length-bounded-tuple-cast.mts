import {
  type BoundedLengthTuple,
  type FixedLengthTuple,
  type MaxLengthTuple,
  type MinLengthTuple,
} from 'ts-type-forge';
import { type SizeType } from '../../types.mjs';
import {
  isBoundedLengthTuple,
  isEmptyTuple,
  isFixedLengthTuple,
  isMaxLengthTuple,
  isMinLengthTuple,
} from './array-utils-length-bounded-tuple-guard.mjs';

/**
 * Casts an array to `FixedLengthTuple<Length, E>` after checking that it has
 * exactly `length` elements.
 *
 * This is the structural counterpart of `asFixedLengthArray`: it produces a
 * tuple type rather than the branded `FixedLengthArray`. Prefer the branded
 * one unless you specifically need the structural type — the brand keeps
 * type-checking cost independent of the element type and of the bound.
 *
 * The length argument comes first, matching the type-parameter order of
 * `FixedLengthTuple<Length, Elm>`. Omitting the array returns a function that
 * casts one.
 *
 * @example
 *
 * ```ts
 * const rgb = Arr.asFixedLengthTuple(3, [255, 128, 0]);
 *
 * const red: number = rgb[0]; // OK — no `undefined`
 *
 * // curried version
 * const asRgb = Arr.asFixedLengthTuple(3);
 *
 * // Arr.asFixedLengthTuple(3, [255, 128]); // throws TypeError
 * ```
 *
 * @template Length - The exact number of elements.
 * @template Xs - The input array type (tuple types are preserved).
 * @param length - The exact number of elements.
 * @param xs - The array to cast.
 * @returns `xs` typed as `FixedLengthTuple<Length, Xs[number]> & Xs`.
 * @throws {TypeError} If `xs.length !== length`.
 */
export function asFixedLengthTuple<
  Length extends SizeType.ArgArr,
  Xs extends readonly unknown[],
>(length: Length, xs: Xs): FixedLengthTuple<Length, Xs[number]> & Xs;

// Curried version
export function asFixedLengthTuple<Length extends SizeType.ArgArr>(
  length: Length,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => FixedLengthTuple<Length, Xs[number]> & Xs;

export function asFixedLengthTuple(
  ...args:
    | readonly [length: SizeType.ArgArr, xs: readonly unknown[]]
    | readonly [length: SizeType.ArgArr]
): readonly unknown[] | ((xs: readonly unknown[]) => readonly unknown[]) {
  switch (args.length) {
    case 2:
      return asFixedLengthTupleImpl(...args);

    case 1:
      return (xs) => asFixedLengthTupleImpl(args[0], xs);
  }
}

const asFixedLengthTupleImpl = (
  length: SizeType.ArgArr,
  xs: readonly unknown[],
): readonly unknown[] => {
  const actualLength = xs.length;

  if (!isFixedLengthTuple(length, xs)) {
    throw new TypeError(
      `Expected an array of length ${length}, got an array of length ${actualLength}`,
    );
  }

  return xs;
};

/**
 * Casts an array to `MinLengthTuple<MinLength, E>` after checking that it has
 * at least `minLength` elements.
 *
 * This is the structural counterpart of `asMinLengthArray`; see
 * {@link asFixedLengthTuple} for when to prefer which.
 *
 * @example
 *
 * ```ts
 * const history = Arr.asMinLengthTuple(3, [0, 1, 2, 3]);
 *
 * const first: number = history[0]; // OK — no `undefined`
 *
 * // curried version
 * const asHistory = Arr.asMinLengthTuple(3);
 *
 * // Arr.asMinLengthTuple(3, [0, 1]); // throws TypeError
 * ```
 *
 * @template MinLength - The minimum number of elements (inclusive).
 * @template Xs - The input array type (tuple types are preserved).
 * @param minLength - The minimum number of elements (inclusive).
 * @param xs - The array to cast.
 * @returns `xs` typed as `MinLengthTuple<MinLength, Xs[number]> & Xs`.
 * @throws {TypeError} If `xs.length < minLength`.
 */
export function asMinLengthTuple<
  MinLength extends SizeType.ArgArr,
  Xs extends readonly unknown[],
>(minLength: MinLength, xs: Xs): MinLengthTuple<MinLength, Xs[number]> & Xs;

// Curried version
export function asMinLengthTuple<MinLength extends SizeType.ArgArr>(
  minLength: MinLength,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => MinLengthTuple<MinLength, Xs[number]> & Xs;

export function asMinLengthTuple(
  ...args:
    | readonly [minLength: SizeType.ArgArr, xs: readonly unknown[]]
    | readonly [minLength: SizeType.ArgArr]
): readonly unknown[] | ((xs: readonly unknown[]) => readonly unknown[]) {
  switch (args.length) {
    case 2:
      return asMinLengthTupleImpl(...args);

    case 1:
      return (xs) => asMinLengthTupleImpl(args[0], xs);
  }
}

const asMinLengthTupleImpl = (
  minLength: SizeType.ArgArr,
  xs: readonly unknown[],
): readonly unknown[] => {
  const actualLength = xs.length;

  if (!isMinLengthTuple(minLength, xs)) {
    throw new TypeError(
      `Expected an array of length >= ${minLength}, got an array of length ${actualLength}`,
    );
  }

  return xs;
};

/**
 * Casts an array to `MaxLengthTuple<MaxLength, E>` after checking that it has
 * at most `maxLength` elements.
 *
 * This is the structural counterpart of `asMaxLengthArray`; see
 * {@link asFixedLengthTuple} for when to prefer which.
 *
 * @example
 *
 * ```ts
 * const tags = Arr.asMaxLengthTuple(8, ['a', 'b', 'c']);
 *
 * // curried version
 * const asTags = Arr.asMaxLengthTuple(8);
 *
 * // Arr.asMaxLengthTuple(2, ['a', 'b', 'c']); // throws TypeError
 * ```
 *
 * @template MaxLength - The maximum number of elements (inclusive).
 * @template Xs - The input array type (tuple types are preserved).
 * @param maxLength - The maximum number of elements (inclusive).
 * @param xs - The array to cast.
 * @returns `xs` typed as `MaxLengthTuple<MaxLength, Xs[number]> & Xs`.
 * @throws {TypeError} If `xs.length > maxLength`.
 */
export function asMaxLengthTuple<
  MaxLength extends SizeType.ArgArr,
  Xs extends readonly unknown[],
>(maxLength: MaxLength, xs: Xs): MaxLengthTuple<MaxLength, Xs[number]> & Xs;

// Curried version
export function asMaxLengthTuple<MaxLength extends SizeType.ArgArr>(
  maxLength: MaxLength,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => MaxLengthTuple<MaxLength, Xs[number]> & Xs;

export function asMaxLengthTuple(
  ...args:
    | readonly [maxLength: SizeType.ArgArr, xs: readonly unknown[]]
    | readonly [maxLength: SizeType.ArgArr]
): readonly unknown[] | ((xs: readonly unknown[]) => readonly unknown[]) {
  switch (args.length) {
    case 2:
      return asMaxLengthTupleImpl(...args);

    case 1:
      return (xs) => asMaxLengthTupleImpl(args[0], xs);
  }
}

const asMaxLengthTupleImpl = (
  maxLength: SizeType.ArgArr,
  xs: readonly unknown[],
): readonly unknown[] => {
  const actualLength = xs.length;

  if (!isMaxLengthTuple(maxLength, xs)) {
    throw new TypeError(
      `Expected an array of length <= ${maxLength}, got an array of length ${actualLength}`,
    );
  }

  return xs;
};

/**
 * Casts an array to `BoundedLengthTuple<Min, Max, E>` after checking that its
 * length is within the inclusive range `[min, max]`.
 *
 * This is the structural counterpart of `asBoundedLengthArray`; see
 * {@link asFixedLengthTuple} for when to prefer which.
 *
 * @example
 *
 * ```ts
 * const selection = Arr.asBoundedLengthTuple(1, 5, [1, 2, 3]);
 *
 * // curried version
 * const asSelection = Arr.asBoundedLengthTuple(1, 5);
 *
 * // Arr.asBoundedLengthTuple(1, 2, [1, 2, 3]); // throws TypeError
 * ```
 *
 * @template Min - The minimum number of elements (inclusive).
 * @template Max - The maximum number of elements (inclusive).
 * @template Xs - The input array type (tuple types are preserved).
 * @param min - The minimum number of elements (inclusive).
 * @param max - The maximum number of elements (inclusive).
 * @param xs - The array to cast.
 * @returns `xs` typed as `BoundedLengthTuple<Min, Max, Xs[number]> & Xs`.
 * @throws {TypeError} If `xs.length` is outside `[min, max]`.
 */
export function asBoundedLengthTuple<
  Min extends SizeType.ArgArr,
  Max extends SizeType.ArgArr,
  Xs extends readonly unknown[],
>(min: Min, max: Max, xs: Xs): BoundedLengthTuple<Min, Max, Xs[number]> & Xs;

// Curried version
export function asBoundedLengthTuple<
  Min extends SizeType.ArgArr,
  Max extends SizeType.ArgArr,
>(
  min: Min,
  max: Max,
): <Xs extends readonly unknown[]>(
  xs: Xs,
) => BoundedLengthTuple<Min, Max, Xs[number]> & Xs;

export function asBoundedLengthTuple(
  ...args:
    | readonly [
        min: SizeType.ArgArr,
        max: SizeType.ArgArr,
        xs: readonly unknown[],
      ]
    | readonly [min: SizeType.ArgArr, max: SizeType.ArgArr]
): readonly unknown[] | ((xs: readonly unknown[]) => readonly unknown[]) {
  switch (args.length) {
    case 3:
      return asBoundedLengthTupleImpl(...args);

    case 2:
      return (xs) => asBoundedLengthTupleImpl(...args, xs);
  }
}

const asBoundedLengthTupleImpl = (
  min: SizeType.ArgArr,
  max: SizeType.ArgArr,
  xs: readonly unknown[],
): readonly unknown[] => {
  const actualLength = xs.length;

  if (!isBoundedLengthTuple(min, max, xs)) {
    throw new TypeError(
      `Expected an array of length in [${min}, ${max}], got an array of length ${actualLength}`,
    );
  }

  return xs;
};

/**
 * Casts an array to the structural empty tuple after checking that it is
 * empty.
 *
 * This is the structural counterpart of `asEmptyArray`, and the length-0
 * specialization of {@link asFixedLengthTuple}.
 *
 * @example
 *
 * ```ts
 * const nothing = Arr.asEmptyTuple([]);
 *
 * // Arr.asEmptyTuple([1]); // throws TypeError
 * ```
 *
 * @template Xs - The input array type (tuple types are preserved).
 * @param xs - The array to cast.
 * @returns `xs` typed as `readonly [] & Xs`.
 * @throws {TypeError} If `xs` is not empty.
 */
export const asEmptyTuple = <Xs extends readonly unknown[]>(
  xs: Xs,
): readonly [] & Xs => {
  if (!isEmptyTuple(xs)) {
    throw new TypeError(
      `Expected an empty array, got an array of length ${xs.length}`,
    );
  }

  return xs;
};

/**
 * Casts an array to `MinLengthTuple<1, E>` after checking that it has at least
 * one element.
 *
 * This is the structural counterpart of `asNonEmptyArray`, and the length-1
 * specialization of {@link asMinLengthTuple}.
 *
 * @example
 *
 * ```ts
 * const values = Arr.asNonEmptyTuple([1, 2, 3]);
 *
 * const first: number = values[0]; // OK — no `undefined`
 *
 * // Arr.asNonEmptyTuple([]); // throws TypeError
 * ```
 *
 * @template Xs - The input array type (tuple types are preserved).
 * @param xs - The array to cast.
 * @returns `xs` typed as `MinLengthTuple<1, Xs[number]> & Xs`.
 * @throws {TypeError} If `xs` is empty.
 */
export const asNonEmptyTuple = <Xs extends readonly unknown[]>(
  xs: Xs,
): MinLengthTuple<1, Xs[number]> & Xs => {
  if (!isMinLengthTuple(1, xs)) {
    throw new TypeError('Expected a non-empty array, got an empty array');
  }

  return xs;
};
