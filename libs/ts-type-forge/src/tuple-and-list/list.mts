import type { IsUnion } from '../condition/index.mjs';
import type { Tuple } from './tuple.mjs';

export namespace List {
  /**
   * Gets the type of the first element of a readonly array or tuple `T`.
   * If the array is empty, it returns the default type `D` (defaults to `never`).
   * Delegates to `Tuple.Head`.
   * @template T - The readonly array or tuple type.
   * @template D - The default type to return if `T` is empty. Defaults to `never`.
   * @returns The type of the first element, or `D` if `T` is empty.
   * @example
   * ```ts
   * type H1 = List.Head<[1, 2, 3]>; // 1
   * type H2 = List.Head<readonly string[]>; // string
   * type H3 = List.Head<[]>; // never
   * type H4 = List.Head<[], 'default'>; // 'default'
   * ```
   */
  export type Head<T extends readonly unknown[], D = never> = Tuple.Head<T, D>;

  /**
   * Gets the type of the last element of a readonly array or tuple `T`.
   * If the array is empty, it returns `never`.
   * @template T - The readonly array or tuple type.
   * @returns The type of the last element, or `never` if `T` is empty.
   * @example
   * ```ts
   * type L1 = List.Last<[1, 2, 3]>; // 3
   * type L2 = List.Last<readonly string[]>; // string
   * type L3 = List.Last<[]>; // never
   * type L4 = List.Last<[1]>; // 1
   * ```
   */
  export type Last<T extends readonly unknown[]> = Tuple.Last<T>;

  /**
   * Gets a new tuple/array type containing all elements of `A` except the last one.
   * Delegates to `Tuple.ButLast` for a tuple of one length. A tuple with a rest
   * or an optional element yields an unsized array of its elements, since the
   * result may lack any of its positional elements.
   * @template A - The readonly array or tuple type.
   * @returns A new type with the last element removed.
   * @example
   * ```ts
   * type BL1 = List.ButLast<[1, 2, 3]>; // readonly [1, 2]
   * type BL2 = List.ButLast<readonly string[]>; // readonly string[] (unchanged for general arrays)
   * type BL3 = List.ButLast<[1]>; // readonly []
   * type BL4 = List.ButLast<[]>; // readonly []
   * type BL5 = List.ButLast<readonly [1, ...string[]]>; // readonly (string | 1)[]
   * ```
   */
  export type ButLast<A extends readonly unknown[]> = A extends unknown
    ? ListShape<A> extends 'exact'
      ? Tuple.ButLast<A>
      : ListShape<A> extends 'array'
        ? Readonly<A>
        : readonly A[number][]
    : never;

  /**
   * Gets a new tuple/array type containing all elements of `A` except the first one.
   * A required first element is removed exactly, whatever follows it
   * (`[1, ...string[]]` gives `readonly string[]`). Any other tuple with a rest
   * or an optional element yields an unsized array of its elements.
   * @template A - The readonly array or tuple type.
   * @returns A new type with the first element removed.
   * @example
   * ```ts
   * type T1 = List.Tail<[1, 2, 3]>; // readonly [2, 3]
   * type T2 = List.Tail<readonly string[]>; // readonly string[] (unchanged for general arrays)
   * type T3 = List.Tail<[1]>; // readonly []
   * type T4 = List.Tail<[]>; // readonly []
   * type T5 = List.Tail<readonly [...string[], 1]>; // readonly (string | 1)[]
   * ```
   */
  export type Tail<A extends readonly unknown[]> =
    // A tuple intersected with a brand matches here too, with `R` read as
    // `unknown[]`, since variadic `infer` does not see through an intersection.
    // `unknown` claims nothing, and `ConstrainedList` is the namespace that
    // reads a branded array.
    A extends readonly [unknown, ...infer R]
      ? Readonly<R>
      : ListShape<A> extends 'exact' | 'array'
        ? Tuple.Tail<A>
        : readonly A[number][];

  /**
   * Reverses the order of elements in a readonly array or tuple `L`.
   * For fixed-length tuples, it returns a tuple with elements in reverse order.
   * For general arrays, it returns a readonly array of the same element type.
   * Required leading elements of a tuple with a rest or an optional element
   * move to the end; what is left before them is an unsized array of its
   * elements.
   * @template L - The readonly array or tuple type.
   * @returns A new type with elements reversed.
   * @example
   * ```ts
   * type R1 = List.Reverse<[1, 2, 3]>; // readonly [3, 2, 1]
   * type R2 = List.Reverse<readonly string[]>; // readonly string[]
   * type R3 = List.Reverse<[]>; // readonly []
   * type R4 = List.Reverse<readonly [1, 2?]>; // readonly [...(2 | undefined)[], 1]
   * ```
   */
  export type Reverse<L extends readonly unknown[]> = L extends readonly []
    ? readonly []
    : ListShape<L> extends 'exact'
      ? Tuple.Reverse<L>
      : L extends readonly [unknown, ...(readonly unknown[])]
        ? readonly [...Reverse<Tail<L>>, Head<L>]
        : ListShape<L> extends 'array'
          ? Readonly<L>
          : readonly L[number][];

  /**
   * Takes the first `N` elements from a readonly array or tuple `T`.
   * If `T` is a tuple of one length, it returns a new tuple containing the first `N` elements.
   * If `T` is a plain array (`E[]` or `readonly E[]`), it returns `T`.
   * A tuple with a rest or an optional element yields an unsized array of its
   * elements, which every possible result satisfies.
   * @template N - The number of elements to take.
   * @template T - The readonly array or tuple type.
   * @returns A new type containing the first `N` elements (for tuples of one length) or `T` (for plain arrays).
   * @example
   * ```ts
   * type TK1 = List.Take<2, [1, 2, 3]>; // readonly [1, 2]
   * type TK2 = List.Take<5, [1, 2, 3]>; // readonly [1, 2, 3]
   * type TK3 = List.Take<2, readonly string[]>; // readonly string[]
   * ```
   */
  export type Take<N extends number, T extends readonly unknown[]> =
    // A tuple with a rest or an optional element is widened even when its
    // required prefix already covers `N` (`Take<1, [string, ...string[]]>` is
    // `readonly string[]`, not non-empty): sound, though less precise than it
    // could be, as `ListShape` says.
    T extends unknown
      ? ListShape<T> extends 'exact'
        ? Tuple.Take<N, T>
        : ListShape<T> extends 'array'
          ? T
          : readonly T[number][]
      : never;

  /**
   * Skips the first `N` elements from a readonly array or tuple `T`.
   * If `T` is a tuple of one length, it returns a new tuple containing the elements after the first `N`.
   * If `T` is a plain array (`E[]` or `readonly E[]`), it returns `T`.
   * A tuple with a rest or an optional element yields an unsized array of its
   * elements, which every possible result satisfies.
   * @template N - The number of elements to skip.
   * @template T - The readonly array or tuple type.
   * @returns A new type containing elements after the first `N` (for tuples of one length) or `T` (for plain arrays).
   * @example
   * ```ts
   * type SK1 = List.Skip<1, [1, 2, 3]>; // readonly [2, 3]
   * type SK2 = List.Skip<3, [1, 2, 3]>; // readonly []
   * type SK3 = List.Skip<1, readonly string[]>; // readonly string[]
   * ```
   */
  export type Skip<
    N extends number,
    T extends readonly unknown[],
  > = T extends unknown
    ? ListShape<T> extends 'exact'
      ? Tuple.Skip<N, T>
      : ListShape<T> extends 'array'
        ? T
        : readonly T[number][]
    : never;

  /**
   * Takes the last `N` elements from a readonly array or tuple `T`.
   * If `T` is a tuple of one length, it returns a new tuple containing the last `N` elements.
   * If `T` is a plain array (`E[]` or `readonly E[]`), it returns `T`.
   * A tuple with a rest or an optional element yields an unsized array of its
   * elements, which every possible result satisfies.
   * @template N - The number of elements to take.
   * @template T - The readonly array or tuple type.
   * @returns A new type containing the last `N` elements (for tuples of one length) or `T` (for plain arrays).
   * @example
   * ```ts
   * type TL1 = List.TakeLast<2, [1, 2, 3]>; // readonly [2, 3]
   * type TL2 = List.TakeLast<5, [1, 2, 3]>; // readonly [1, 2, 3]
   * type TL3 = List.TakeLast<2, readonly string[]>; // readonly string[]
   * ```
   */
  export type TakeLast<
    N extends number,
    T extends readonly unknown[],
  > = T extends unknown
    ? ListShape<T> extends 'exact'
      ? Tuple.TakeLast<N, T>
      : ListShape<T> extends 'array'
        ? T
        : readonly T[number][]
    : never;

  /**
   * Skips the last `N` elements from a readonly array or tuple `T`.
   * If `T` is a tuple of one length, it returns a new tuple containing the elements before the last `N`.
   * If `T` is a plain array (`E[]` or `readonly E[]`), it returns `T`.
   * A tuple with a rest or an optional element yields an unsized array of its
   * elements, which every possible result satisfies.
   * @template N - The number of elements to skip.
   * @template T - The readonly array or tuple type.
   * @returns A new type containing elements before the last `N` (for tuples of one length) or `T` (for plain arrays).
   * @example
   * ```ts
   * type SL1 = List.SkipLast<1, [1, 2, 3]>; // readonly [1, 2]
   * type SL2 = List.SkipLast<3, [1, 2, 3]>; // readonly []
   * type SL3 = List.SkipLast<1, readonly string[]>; // readonly string[]
   * ```
   */
  export type SkipLast<
    N extends number,
    T extends readonly unknown[],
  > = T extends unknown
    ? ListShape<T> extends 'exact'
      ? Tuple.SkipLast<N, T>
      : ListShape<T> extends 'array'
        ? T
        : readonly T[number][]
    : never;

  /**
   * Creates a new array/tuple type where the element at index `I` in `T` is replaced with type `V`.
   * If `T` is a tuple of one length, it returns a new tuple type with the element at `I` updated.
   * If `T` is a general array, it returns a general array type `readonly (T[number] | V)[]`,
   * and so does a tuple with a rest or an optional element.
   * @template I - The index to update (must be a valid index for `T` if `T` is a tuple).
   * @template V - The new type for the element at index `I`.
   * @template T - The readonly array or tuple type.
   * @returns A new array/tuple type with the element at index `I` updated.
   * @example
   * ```ts
   * type SA1 = List.SetAt<1, 'x', [1, 2, 3]>; // readonly [1, 'x', 3]
   * type SA2 = List.SetAt<1, 'x', readonly number[]>; // readonly (string | number)[]
   * // type SA3 = List.SetAt<2, 'x', [1, 2]>; // Error if I is out of bounds for tuple
   * ```
   */
  export type SetAt<
    I extends number,
    V,
    T extends readonly unknown[],
  > = T extends unknown
    ? ListShape<T> extends 'exact'
      ? Tuple.SetAt<I, V, T>
      : readonly (T[number] | V)[]
    : never;

  /**
   * Flattens a nested readonly array/tuple `T` by one level.
   * Delegates to `Tuple.Flatten`.
   * @template T - A readonly array/tuple where elements are themselves readonly arrays/tuples.
   * @returns A new flattened array/tuple type.
   * @example
   * ```ts
   * type F1 = List.Flatten<[[1, 2], [3, 4]]>; // readonly [1, 2, 3, 4]
   * type F2 = List.Flatten<[readonly number[], readonly string[]]>; // readonly (string | number)[]
   * type F3 = List.Flatten<[[1], [2, [3]]]>; // readonly [1, 2, [3]] (only flattens one level)
   * ```
   */
  export type Flatten<T extends readonly (readonly unknown[])[]> =
    Tuple.Flatten<T>;

  /**
   * Concatenates two readonly arrays or tuples `A` and `B`.
   * Delegates to `Tuple.Concat`.
   * @template A - The first readonly array or tuple.
   * @template B - The second readonly array or tuple.
   * @returns A new type representing the concatenation of `A` and `B`.
   * @example
   * ```ts
   * type C1 = List.Concat<[1, 2], [3, 4]>; // readonly [1, 2, 3, 4]
   * type C2 = List.Concat<readonly number[], readonly string[]>; // readonly (string | number)[]
   * type C3 = List.Concat<[1], readonly number[]>; // readonly [1, ...number[]]
   * ```
   */
  export type Concat<
    A extends readonly unknown[],
    B extends readonly unknown[],
  > = Tuple.Concat<A, B>;

  /**
   * Creates pairs of elements from two readonly arrays or tuples `A` and `B`.
   * Zipping stops at the shorter input, so the result has as many required
   * pairs as both inputs are sure to have elements, then optional pairs up to
   * the shorter input's greatest length, and ends in an unsized array of pairs
   * only when both inputs are unsized. An optional element (`[A, B?]`) is a
   * pair that may be missing, and an element after a rest (`[...A[], B]`)
   * counts toward the length, with the array's element type, since which
   * element sits at a position is not known. The result never claims a pair
   * that may be missing.
   * @template A - The first readonly array or tuple.
   * @template B - The second readonly array or tuple.
   * @returns A readonly array/tuple of pairs `readonly [A[i], B[i]]`.
   * @example
   * ```ts
   * type Z1 = List.Zip<[1, 2], ['a', 'b']>; // readonly [[1, 'a'], [2, 'b']]
   * type Z2 = List.Zip<[1, 2, 3], ['a', 'b']>; // readonly [[1, 'a'], [2, 'b']]
   * type Z3 = List.Zip<readonly number[], readonly string[]>; // readonly (readonly [number, string])[]
   * type Z4 = List.Zip<[1, 2], readonly string[]>; // readonly [[1, string]?, [2, string]?]
   * type Z5 = List.Zip<readonly number[], ['a', 'b']>; // readonly [[number, 'a']?, [number, 'b']?]
   * type Z6 = List.Zip<[1, 2], readonly [string, ...string[]]>; // readonly [[1, string], [2, string]?]
   * ```
   */
  export type Zip<
    A extends readonly unknown[],
    B extends readonly unknown[],
  > = ZipSteps<ZipStep<A>, ZipStep<B>>;

  /**
   * Partitions a readonly array or tuple `T` into sub-arrays/tuples of length `N`.
   * Delegates to `Tuple.Partition` for a tuple of one length. A plain array or
   * a tuple with a rest or an optional element yields an unsized array of
   * unsized chunks, `readonly (readonly T[number][])[]`, and a chunk size of
   * `0` yields `never` for every input.
   * @template N - The desired size of each partition. Only a single positive
   * literal gives chunks of length `N`; a union or `number` gives unsized chunks.
   * @template T - The readonly array or tuple type to partition.
   * @returns For a tuple of one length and a single literal `N`, a readonly tuple
   * of chunks of length `N` (the last may be shorter); otherwise as described above.
   * @example
   * ```ts
   * type P1 = List.Partition<2, [1, 2, 3, 4, 5]>; // readonly [[1, 2], [3, 4], [5]]
   * type P2 = List.Partition<3, [1, 2, 3, 4, 5, 6]>; // readonly [[1, 2, 3], [4, 5, 6]]
   * type P4 = List.Partition<number, [1, 2]>; // readonly (readonly (1 | 2)[])[]
   * type P3 = List.Partition<1, [1, 2]>; // readonly [[1], [2]]
   * ```
   */
  export type Partition<
    N extends number,
    T extends readonly unknown[],
  > = T extends unknown
    ? ListShape<T> extends 'exact'
      ? Tuple.Partition<N, T>
      : [N] extends [0]
        ? never // as `Tuple.Partition` answers a chunk size of 0
        : readonly (readonly T[number][])[]
    : never;
}

/**
 * @internal How much of a list's shape its type pins. Read one union member at
 * a time: the operations above distribute over `T` before asking, so each
 * member of a union keeps its own answer.
 *
 * - `'exact'`: a tuple of one length, every element required. The only shape
 *   the `Tuple` operations walk element by element.
 * - `'array'`: an unsized array with no positional element (`readonly E[]`),
 *   which every slice of itself satisfies. `Take`, `Skip`, `TakeLast` and
 *   `SkipLast` return `T` as given and `ButLast`, `Tail` and `Reverse` return
 *   `Readonly<T>`, each as before. `Partition` answers unsized chunks of its
 *   elements, as for `'mixed'`.
 * - `'mixed'`: a tuple with an optional element or a rest element. A slice of
 *   one does not in general satisfy the tuple itself (`ButLast` of
 *   `[1, ...string[]]` may be empty), so `ButLast`, `Take`, `Skip`,
 *   `TakeLast`, `SkipLast` and `SetAt` answer a readonly unsized array of its
 *   elements. `Tail` and `Reverse` do so only for one with no required first
 *   element. `Partition` answers unsized chunks of them. An unsized array
 *   intersected with a brand lands here too, since
 *   `readonly T[number][]` is not assignable to it, and so loses the brand: a
 *   brand may state a minimum length that a slice no longer has.
 *
 * Each operation spells out this dispatch itself rather than sharing a helper:
 * the exact answer is a different `Tuple` operation in each, and a type alias
 * cannot take another generic alias as a parameter.
 *
 * Widening every `'mixed'` input is sound but gives up answers that some of
 * them could keep exactly: a required first or last element (`Take<1>` of
 * `[string, ...string[]]` is non-empty, `ButLast` of `[...string[], 1]` is
 * `string[]`), an index inside the required prefix (`Take<1, [1, 2?]>`), or a
 * `SetAt`, which changes no length. Each operation would need a derivation of
 * its own, and only `Tail` and `Reverse` keep a required first element today.
 */
type ListShape<T extends readonly unknown[]> = number extends T['length']
  ? readonly T[number][] extends Readonly<T>
    ? 'array'
    : 'mixed'
  : IsUnion<T['length']> extends true
    ? 'mixed'
    : 'exact';

/**
 * @internal
 * One element of a tuple, as {@link List.Zip} reads it: the input has ended
 * (`End`); its first element is there (`Required`) or may be missing
 * (`Optional`), with what follows; or it is an unsized array of `Element`
 * (`Rest`). Elements after a rest (`[...A[], B]`) are read as that many
 * required elements of the array's element type, since which of them sits at
 * a position is not known.
 */
type ZipStep<A extends readonly unknown[]> = A extends readonly []
  ? ZipEnd
  : A extends readonly [infer Head, ...infer Rest]
    ? ZipElement<'Required', Head, Rest>
    : number extends A['length']
      ? TrailingCount<A> extends readonly [unknown, ...infer Fewer]
        ? ZipElement<'Required', A[number], AtLeast<A[number], Fewer>>
        : A[number][] extends A
          ? Readonly<{ kind: 'Rest'; element: A[number] }>
          : A extends readonly [(infer Head)?, ...infer Rest]
            ? ZipElement<'Optional', Head, Rest>
            : Readonly<{ kind: 'Rest'; element: A[number] }>
      : A extends readonly [(infer Head)?, ...infer Rest]
        ? ZipElement<'Optional', Head, Rest>
        : ZipEnd;

/** @internal */
type ZipEnd = Readonly<{ kind: 'End' }>;

/** @internal */
type ZipElement<
  K extends 'Required' | 'Optional',
  Head,
  Rest extends readonly unknown[],
> = Readonly<{ kind: K; head: Head; rest: Rest }>;

/**
 * @internal The elements of `A` after its rest, as a tuple counting them. An
 * array matches `[...infer Before, unknown]` with `Before` the array itself,
 * which is where the count stops; the two are compared both ways, since
 * `[...E[], X]` is assignable to `E[]`.
 */
type TrailingCount<
  A extends readonly unknown[],
  Count extends readonly unknown[] = [],
> = A extends readonly [...infer Before, unknown]
  ? [A, Before] extends [Before, A]
    ? Count
    : TrailingCount<Before, [...Count, unknown]>
  : Count;

/**
 * @internal An array of `E` with at least as many elements as `Count` has: the
 * rest of a tuple whose elements after a rest are not yet all paired.
 */
type AtLeast<E, Count extends readonly unknown[]> = readonly [
  ...{ [I in keyof Count]: E },
  ...E[],
];

/**
 * @internal
 * The pairs of two inputs read one {@link ZipStep} at a time: a pair is
 * required while both sides are sure to have an element, optional once either
 * may have run out, and the result ends where either side ends; only two
 * unsized arrays give an unsized array of pairs.
 */
type ZipSteps<SA, SB> = SA extends ZipEnd
  ? readonly []
  : SB extends ZipEnd
    ? readonly []
    : SA extends Readonly<{ kind: 'Rest'; element: infer EA }>
      ? SB extends Readonly<{ kind: 'Rest'; element: infer EB }>
        ? readonly (readonly [EA, EB])[]
        : SB extends ZipElement<'Required' | 'Optional', infer HB, infer RB>
          ? readonly [(readonly [EA, HB])?, ...ZipSteps<SA, ZipStep<RB>>]
          : never
      : SA extends ZipElement<infer KA, infer HA, infer RA>
        ? SB extends Readonly<{ kind: 'Rest'; element: infer EB }>
          ? readonly [(readonly [HA, EB])?, ...ZipSteps<ZipStep<RA>, SB>]
          : SB extends ZipElement<infer KB, infer HB, infer RB>
            ? [KA, KB] extends ['Required', 'Required']
              ? readonly [
                  readonly [HA, HB],
                  ...ZipSteps<ZipStep<RA>, ZipStep<RB>>,
                ]
              : readonly [
                  (readonly [HA, HB])?,
                  ...ZipSteps<ZipStep<RA>, ZipStep<RB>>,
                ]
            : never
        : never;
