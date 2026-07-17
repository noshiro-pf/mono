import { type Mutable } from '../others/index.mjs';
import { type MakeTuple } from './make-tuple.mjs';

/* Length-constrained tuple types (structural) */

/* FixedLengthTuple */

/**
 * Creates a readonly tuple type of a specific length `N` with elements of type `Elm`.
 * Alias for `MakeTuple<Elm, N>`.
 * @template N - The desired length of the tuple (must be a non-negative integer literal).
 * @template Elm - The type of elements in the tuple.
 * @returns A readonly tuple type `readonly [Elm, Elm, ..., Elm]` of length `N`.
 * @example
 * type TupleOf3Strings = FixedLengthTuple<3, string>; // readonly [string, string, string]
 * type TupleOf0Numbers = FixedLengthTuple<0, number>; // readonly []
 */
export type FixedLengthTuple<N extends number, Elm> = MakeTuple<Elm, N>;

/**
 * Creates a mutable tuple type of a specific length `N` with elements of type `Elm`.
 * @template N - The desired length of the tuple (must be a non-negative integer literal).
 * @template Elm - The type of elements in the tuple.
 * @returns A mutable tuple type `[Elm, Elm, ..., Elm]` of length `N`.
 * @example
 * type MutableTupleOf2Booleans = MutableFixedLengthTuple<2, boolean>; // [boolean, boolean]
 */
export type MutableFixedLengthTuple<N extends number, Elm> = Mutable<
  FixedLengthTuple<N, Elm>
>;

/* MinLengthTuple */

// https://qiita.com/uhyo/items/80ce7c00f413c1d1be56

/**
 * Creates a mutable array type that is guaranteed to have at least `N` elements of type `Elm`.
 * @template N - The minimum length of the array (must be a non-negative integer literal).
 * @template Elm - The type of elements in the array.
 * @returns A mutable array type `[Elm, ..., Elm, ...Elm[]]` with at least `N` elements.
 * @example
 * type AtLeast2Numbers = MutableMinLengthTuple<2, number>; // [number, number, ...number[]]
 * const valid: AtLeast2Numbers = [1, 2];
 * const alsoValid: AtLeast2Numbers = [1, 2, 3, 4];
 * // const invalid: AtLeast2Numbers = [1]; // Error
 */
export type MutableMinLengthTuple<N extends number, Elm> = Mutable<
  MinLengthTuple<N, Elm>
>;

/**
 * Creates a readonly array type that is guaranteed to have at least `N` elements of type `Elm`.
 * @template N - The minimum length of the array (must be a non-negative integer literal).
 * @template Elm - The type of elements in the array.
 * @returns A readonly array type `readonly [Elm, ..., Elm, ...Elm[]]` with at least `N` elements.
 * @example
 * type AtLeast3Strings = MinLengthTuple<3, string>; // readonly [string, string, string, ...string[]]
 * const valid: AtLeast3Strings = ["a", "b", "c"];
 * const alsoValid: AtLeast3Strings = ["a", "b", "c", "d"];
 * // const invalid: AtLeast3Strings = ["a", "b"]; // Error
 */
export type MinLengthTuple<N extends number, Elm> = readonly [
  ...MakeTuple<Elm, N>,
  ...Elm[],
];

/* BoundedLengthTuple */

/**
 * @internal
 * Produces a union of `T` together with every shorter readonly tuple obtained by
 * dropping leading elements, stopping once the length reaches `Min`.
 * Because all elements share the same type, dropping from the front is equivalent
 * to dropping from the back, so this yields one tuple per length in `Min..T['length']`.
 *
 * The longest tuple is built once via `MakeTuple`; the remaining lengths are produced
 * by peeling elements off, avoiding any round-trip through an integer-literal union.
 *
 * @template T - The longest tuple in the range (its length is the inclusive maximum).
 * @template Min - The inclusive minimum length at which to stop peeling.
 */
type TuplePrefixesDownTo<
  T extends readonly unknown[],
  Min extends number,
> = T['length'] extends Min
  ? T
  : T extends readonly [unknown, ...infer Rest]
    ? T | TuplePrefixesDownTo<readonly [...Rest], Min>
    : T;

/**
 * Creates a readonly tuple type whose length is between `Min` and `Max` (both inclusive).
 * The result is a union of fixed-length readonly tuples
 * `MakeTuple<Elm, Min> | ... | MakeTuple<Elm, Max>`.
 * Requires `Min` and `Max` to be non-negative integer literals with `Min <= Max`.
 *
 * @template Min - The minimum length (inclusive). Must be a non-negative integer literal.
 * @template Max - The maximum length (inclusive). Must be a non-negative integer literal.
 * @template Elm - The type of elements in the tuple.
 * @returns A union of readonly tuples whose lengths range from `Min` to `Max`.
 * @example
 * type T = BoundedLengthTuple<1, 3, string>;
 * // readonly [string] | readonly [string, string] | readonly [string, string, string]
 * const a: T = ["a"]; // ok
 * const b: T = ["a", "b", "c"]; // ok
 * // const c: T = []; // Error
 * // const d: T = ["a", "b", "c", "d"]; // Error
 */
export type BoundedLengthTuple<
  Min extends number,
  Max extends number,
  Elm,
> = TuplePrefixesDownTo<MakeTuple<Elm, Max>, Min>;

/**
 * Mutable version of {@link BoundedLengthTuple}.
 * Creates a mutable tuple type whose length is between `Min` and `Max` (both inclusive).
 *
 * @template Min - The minimum length (inclusive). Must be a non-negative integer literal.
 * @template Max - The maximum length (inclusive). Must be a non-negative integer literal.
 * @template Elm - The type of elements in the tuple.
 * @example
 * type T = MutableBoundedLengthTuple<1, 2, number>; // [number] | [number, number]
 */
export type MutableBoundedLengthTuple<
  Min extends number,
  Max extends number,
  Elm,
> = Mutable<BoundedLengthTuple<Min, Max, Elm>>;

/* MaxLengthTuple */

/**
 * Creates a readonly tuple type whose length is at most `N` (i.e. `0` to `N`, both inclusive).
 * Counterpart of {@link MinLengthTuple}, defined as `BoundedLengthTuple<0, N, Elm>`.
 * The result is a union `readonly [] | readonly [Elm] | ... | MakeTuple<Elm, N>`.
 * Requires `N` to be a non-negative integer literal.
 *
 * @template N - The maximum length (inclusive). Must be a non-negative integer literal.
 * @template Elm - The type of elements in the tuple.
 * @returns A union of readonly tuples whose lengths range from `0` to `N`.
 * @example
 * type AtMost2Numbers = MaxLengthTuple<2, number>;
 * // readonly [] | readonly [number] | readonly [number, number]
 * const valid: AtMost2Numbers = []; // ok
 * const alsoValid: AtMost2Numbers = [1, 2]; // ok
 * // const invalid: AtMost2Numbers = [1, 2, 3]; // Error
 */
export type MaxLengthTuple<N extends number, Elm> = BoundedLengthTuple<
  0,
  N,
  Elm
>;

/**
 * Mutable version of {@link MaxLengthTuple}.
 * Creates a mutable tuple type whose length is at most `N` (i.e. `0` to `N`, both inclusive).
 *
 * @template N - The maximum length (inclusive). Must be a non-negative integer literal.
 * @template Elm - The type of elements in the tuple.
 * @example
 * type AtMost2Numbers = MutableMaxLengthTuple<2, number>; // [] | [number] | [number, number]
 */
export type MutableMaxLengthTuple<N extends number, Elm> = Mutable<
  MaxLengthTuple<N, Elm>
>;
