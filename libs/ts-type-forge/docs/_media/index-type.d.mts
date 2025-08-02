/**
 * Creates a union of non-negative integer literals from 0 up to (but not including) `N`.
 * Equivalent to `0 | 1 | ... | N-1`.
 * Requires `N` to be a non-negative integer literal.
 *
 * @template N - The upper bound (exclusive). Must be a non-negative integer literal.
 * @returns A union type `0 | 1 | ... | N-1`. Returns `never` if `N` is 0.
 * @example
 * type Idx3 = Index<3>; // 0 | 1 | 2
 * type Idx0 = Index<0>; // never
 * type Idx1 = Index<1>; // 0
 */
type Index<N extends number> = IndexOfTuple<MakeTuple<0, N>>;

/**
 * Creates a union of non-negative integer literals from 0 up to (and including) `N`.
 * Equivalent to `0 | 1 | ... | N`.
 * Requires `N` to be a non-negative integer literal.
 *
 * @template N - The upper bound (inclusive). Must be a non-negative integer literal.
 * @returns A union type `0 | 1 | ... | N`.
 * @example
 * type IdxInc3 = IndexInclusive<3>; // 0 | 1 | 2 | 3
 * type IdxInc0 = IndexInclusive<0>; // 0
 */
type IndexInclusive<N extends number> = IndexOfTuple<[...MakeTuple<0, N>, 0]>;

/**
 * Creates a union of negative integer literals from -1 down to (and including) `-N`.
 * Equivalent to `-1 | -2 | ... | -N`.
 * Requires `N` to be a non-negative integer literal.
 *
 * @template N - The absolute value of the lower bound (inclusive). Must be a non-negative integer literal.
 * @returns A union type `-1 | -2 | ... | -N`. Returns `never` if `N` is 0.
 * @example
 * type NegIdx3 = NegativeIndex<3>; // -1 | -2 | -3
 * type NegIdx0 = NegativeIndex<0>; // never
 * type NegIdx1 = NegativeIndex<1>; // -1
 */
type NegativeIndex<N extends number> = TSTypeForgeInternals.MapIdx<
  RelaxedExclude<IndexInclusive<N>, 0>
>;

declare namespace TSTypeForgeInternals {
  /**
   * @internal Converts a negative number string literal (e.g., `"-5"`) to its corresponding negative number literal (`-5`).
   * @template S - A string literal representing a negative integer.
   */
  type NegativeToNumber<S extends `-${number}`> =
    S extends `${infer N extends number}` ? N : never;

  /**
   * @internal Maps a union of positive integer literals `I` to a union of their corresponding negative integer literals `-I`.
   * @template I - A union of positive integer literals.
   */
  type MapIdx<I extends number> = I extends I // Distribute over the union I
    ? NegativeToNumber<`-${I}`> // Convert each positive I to its negative string literal and then to a negative number literal
    : never;
}
