import { type IsUnion } from '../condition/index.mjs';
import { type NonEmptyTuple } from './array.mjs';

export namespace Tuple {
  /**
   * Gets the type of the first element of a readonly tuple `T`.
   * If the tuple is empty, it returns the default type `D` (defaults to `never`).
   * For a general (non-tuple) array, it returns the element type.
   * @template T - The readonly tuple type.
   * @template D - The default type to return if `T` is empty. Defaults to `never`.
   * @returns The type of the first element, or `D` if `T` is empty.
   * @example
   * type H1 = Tuple.Head<[1, 2, 3]>; // 1
   * type H2 = Tuple.Head<[]>; // never
   * type H3 = Tuple.Head<[], 'default'>; // 'default'
   * type H4 = Tuple.Head<readonly string[]>; // string
   */
  export type Head<
    T extends readonly unknown[],
    D = never,
  > = T extends readonly []
    ? D
    : T extends readonly [infer X, ...(readonly unknown[])]
      ? X
      : T[number];

  /**
   * Gets the type of the last element of a readonly tuple `T`.
   * If the tuple is empty, it returns `never`.
   * For a general (non-tuple) array, it returns the element type. For a tuple
   * with a rest element (e.g. `[1, ...string[]]`), the exact last element is
   * not statically known, so the union of all element types is returned.
   * @template T - The readonly tuple type.
   * @returns The type of the last element, or `never` if `T` is empty.
   * @example
   * type L1 = Tuple.Last<[1, 2, 3]>; // 3
   * type L2 = Tuple.Last<[]>; // never
   * type L3 = Tuple.Last<[1]>; // 1
   * type L4 = Tuple.Last<readonly string[]>; // string
   * type L5 = Tuple.Last<[...string[], 1]>; // 1
   * type L6 = Tuple.Last<[1, ...string[]]>; // 1 | string
   */
  export type Last<T extends readonly unknown[]> = T extends readonly []
    ? never
    : T extends readonly [...(readonly unknown[]), infer L]
      ? L
      : T[number];

  /**
   * Gets a new readonly tuple type containing all elements of `A` except the last one.
   * If `A` is empty or has only one element, returns `readonly []`.
   * If `A` is a general array type, returns `Readonly<A>`.
   * @template A - The readonly array or tuple type.
   * @returns A new readonly tuple type with the last element removed.
   * @example
   * type BL1 = Tuple.ButLast<[1, 2, 3]>; // readonly [1, 2]
   * type BL2 = Tuple.ButLast<[1]>; // readonly []
   * type BL3 = Tuple.ButLast<[]>; // readonly []
   * type BL4 = Tuple.ButLast<readonly number[]>; // readonly number[]
   */
  export type ButLast<A extends readonly unknown[]> = A extends readonly []
    ? readonly []
    : A extends readonly [...infer R, unknown]
      ? Readonly<R>
      : Readonly<A>;

  /**
   * Gets a new readonly tuple type containing all elements of `A` except the first one.
   * If `A` is empty or has only one element, returns `readonly []`.
   * If `A` is a general array type, returns `Readonly<A>`.
   * @template A - The readonly array or tuple type.
   * @returns A new readonly tuple type with the first element removed.
   * @example
   * type T1 = Tuple.Tail<[1, 2, 3]>; // readonly [2, 3]
   * type T2 = Tuple.Tail<[1]>; // readonly []
   * type T3 = Tuple.Tail<[]>; // readonly []
   * type T4 = Tuple.Tail<readonly number[]>; // readonly number[]
   */
  export type Tail<A extends readonly unknown[]> = A extends readonly []
    ? readonly []
    : A extends readonly [unknown, ...infer R]
      ? Readonly<R>
      : Readonly<A>;

  /**
   * Reverses the order of elements in a readonly tuple `L`.
   * @template L - The readonly tuple type.
   * @returns A new readonly tuple type with elements reversed.
   * @example
   * type R1 = Tuple.Reverse<[1, 2, 3]>; // readonly [3, 2, 1]
   * type R2 = Tuple.Reverse<[]>; // readonly []
   */
  export type Reverse<L extends readonly unknown[]> = ReverseImpl<
    L,
    readonly []
  >;

  /**
   * Takes the first `N` elements from a readonly tuple `T`.
   * @template N - The number of elements to take. Only a single numeric literal pins a
   * length; a union of literals and `number` alike answer an unsized array,
   * which every possible result satisfies.
   * @template T - The readonly tuple type.
   * @returns A new readonly tuple type containing the first `N` elements. If `N` is larger than the length of `T`, returns `T`.
   * @example
   * type TK1 = Tuple.Take<2, [1, 2, 3]>; // readonly [1, 2]
   * type TK2 = Tuple.Take<5, [1, 2, 3]>; // readonly [1, 2, 3]
   * type TK3 = Tuple.Take<0, [1, 2, 3]>; // readonly []
   * type TK4 = Tuple.Take<1 | 2, [1, 2, 3]>; // readonly (1 | 2 | 3)[]
   * type TK5 = Tuple.Take<number, [1, 2, 3]>; // readonly (1 | 2 | 3)[]
   */
  export type Take<N extends number, T extends readonly unknown[]> =
    TSTypeForgeInternals_PinsOneNumber<N> extends true
      ? TakeImpl<N, T, readonly []>
      : readonly T[number][];

  /**
   * Skips the first `N` elements from a readonly tuple `T`.
   * @template N - The number of elements to skip. Only a single numeric literal pins a
   * length; a union of literals and `number` alike answer an unsized array,
   * which every possible result satisfies.
   * @template T - The readonly tuple type.
   * @returns A new readonly tuple type containing the elements after the first `N`. If `N` is larger than the length of `T`, returns `readonly []`.
   * @example
   * type SK1 = Tuple.Skip<1, [1, 2, 3]>; // readonly [2, 3]
   * type SK2 = Tuple.Skip<3, [1, 2, 3]>; // readonly []
   * type SK3 = Tuple.Skip<0, [1, 2, 3]>; // readonly [1, 2, 3]
   * type SK4 = Tuple.Skip<1 | 2, [1, 2, 3]>; // readonly (1 | 2 | 3)[]
   * type SK5 = Tuple.Skip<number, [1, 2, 3]>; // readonly (1 | 2 | 3)[]
   */
  export type Skip<N extends number, T extends readonly unknown[]> =
    TSTypeForgeInternals_PinsOneNumber<N> extends true
      ? SkipImpl<N, T, readonly []>
      : readonly T[number][];

  /**
   * Takes the last `N` elements from a readonly tuple `T`.
   * @template N - The number of elements to take. Only a single numeric literal pins a
   * length; a union of literals and `number` alike answer an unsized array,
   * which every possible result satisfies.
   * @template T - The readonly tuple type.
   * @returns A new readonly tuple type containing the last `N` elements. If `N` is larger than the length of `T`, returns `T`.
   * @example
   * type TL1 = Tuple.TakeLast<2, [1, 2, 3]>; // readonly [2, 3]
   * type TL2 = Tuple.TakeLast<5, [1, 2, 3]>; // readonly [1, 2, 3]
   * type TL3 = Tuple.TakeLast<0, [1, 2, 3]>; // readonly []
   * type TL4 = Tuple.TakeLast<1 | 2, [1, 2, 3]>; // readonly (1 | 2 | 3)[]
   * type TL5 = Tuple.TakeLast<number, [1, 2, 3]>; // readonly (1 | 2 | 3)[]
   */
  export type TakeLast<N extends number, T extends readonly unknown[]> =
    TSTypeForgeInternals_PinsOneNumber<N> extends true
      ? TakeLastImpl<N, T, readonly []>
      : readonly T[number][];

  /**
   * Skips the last `N` elements from a readonly tuple `T`.
   * @template N - The number of elements to skip. Only a single numeric literal pins a
   * length; a union of literals and `number` alike answer an unsized array,
   * which every possible result satisfies.
   * @template T - The readonly tuple type.
   * @returns A new readonly tuple type containing the elements before the last `N`. If `N` is larger than the length of `T`, returns `readonly []`.
   * @example
   * type SL1 = Tuple.SkipLast<1, [1, 2, 3]>; // readonly [1, 2]
   * type SL2 = Tuple.SkipLast<3, [1, 2, 3]>; // readonly []
   * type SL3 = Tuple.SkipLast<0, [1, 2, 3]>; // readonly [1, 2, 3]
   * type SL4 = Tuple.SkipLast<1 | 2, [1, 2, 3]>; // readonly (1 | 2 | 3)[]
   * type SL5 = Tuple.SkipLast<number, [1, 2, 3]>; // readonly (1 | 2 | 3)[]
   */
  export type SkipLast<N extends number, T extends readonly unknown[]> =
    TSTypeForgeInternals_PinsOneNumber<N> extends true
      ? SkipLastImpl<N, T, readonly []>
      : readonly T[number][];

  /**
   * Creates a new readonly tuple type where the element at index `I` in `T` is replaced with type `V`.
   *
   * When `I` is a single numeric literal it names one position, and only that
   * position changes. When `I` is a union — or `number`, which names no
   * position in particular — the call replaces *one* of the candidate positions
   * and never all of them, so each candidate is widened to `T[I] | V` rather
   * than set to `V` outright.
   * @template I - The index to update. A single literal names one position
   * exactly; a union of literals, or `number`, widens every candidate position
   * instead. An index beyond the end of `T` leaves it unchanged.
   * @template V - The new type for the element at index `I`.
   * @template T - The readonly tuple type.
   * @returns A new readonly tuple type with the element at index `I` updated.
   * @example
   * type SA1 = Tuple.SetAt<1, 'x', [1, 2, 3]>; // readonly [1, 'x', 3]
   * type SA2 = Tuple.SetAt<0 | 2, 'x', [1, 2, 3]>; // readonly [1 | 'x', 2, 3 | 'x']
   * type SA3 = Tuple.SetAt<number, 'x', [1, 2, 3]>; // readonly [1 | 'x', 2 | 'x', 3 | 'x']
   * type SA4 = Tuple.SetAt<2, 'x', [1, 2]>; // readonly [1, 2] (index out of bounds: unchanged)
   */
  export type SetAt<
    I extends number,
    V,
    T extends readonly unknown[],
  > = SetAtImpl<T, I, V, readonly [], TSTypeForgeInternals_PinsOneNumber<I>>;

  /**
   * Flattens a nested readonly tuple `T` by one level.
   * General (non-tuple) arrays are supported both as the outer type and as
   * elements; where the exact layout is not statically known, the result
   * degrades to a general readonly array of the combined element types.
   * @template T - A readonly tuple where elements are themselves readonly arrays/tuples.
   * @returns A new readonly tuple type flattened by one level.
   * @example
   * type F1 = Tuple.Flatten<[[1, 2], [3, 4]]>; // readonly [1, 2, 3, 4]
   * type F2 = Tuple.Flatten<[[1], readonly [2, 3]]>; // readonly [1, 2, 3]
   * type F3 = Tuple.Flatten<[[1], [2, [3]]]>; // readonly [1, 2, [3]] (only flattens one level)
   * type F4 = Tuple.Flatten<[readonly number[], readonly string[]]>; // readonly (number | string)[]
   * type F5 = Tuple.Flatten<readonly (readonly number[])[]>; // readonly number[]
   */
  export type Flatten<T extends readonly (readonly unknown[])[]> =
    T extends readonly []
      ? readonly []
      : T extends readonly [
            infer H extends readonly unknown[],
            ...infer R extends readonly (readonly unknown[])[],
          ]
        ? Readonly<[...H, ...Flatten<R>]>
        : readonly T[number][number][];

  /**
   * Concatenates two readonly tuples `A` and `B`.
   * General (non-tuple) arrays are also supported; concatenating two general
   * arrays yields a general readonly array of the union of the element types.
   * @template A - The first readonly tuple.
   * @template B - The second readonly tuple.
   * @returns A new readonly tuple type representing the concatenation of `A` and `B`.
   * @example
   * type C1 = Tuple.Concat<[1, 2], [3, 4]>; // readonly [1, 2, 3, 4]
   * type C2 = Tuple.Concat<[], [1]>; // readonly [1]
   * type C3 = Tuple.Concat<[1], []>; // readonly [1]
   * type C4 = Tuple.Concat<readonly number[], readonly string[]>; // readonly (number | string)[]
   * type C5 = Tuple.Concat<[1], readonly number[]>; // readonly [1, ...number[]]
   */
  export type Concat<
    A extends readonly unknown[],
    B extends readonly unknown[],
  > = Readonly<[...A, ...B]>;

  /**
   * Creates pairs of elements from two readonly tuples `A` and `B`.
   * The resulting tuple will have the length of the shorter input tuple.
   * @template A - The first readonly tuple.
   * @template B - The second readonly tuple.
   * @returns A readonly tuple of pairs `readonly [readonly [A[i], B[i]], ...]`.
   * @example
   * type Z1 = Tuple.Zip<[1, 2], ['a', 'b']>; // readonly [readonly [1, 'a'], readonly [2, 'b']]
   * type Z2 = Tuple.Zip<[1, 2, 3], ['a', 'b']>; // readonly [readonly [1, 'a'], readonly [2, 'b']]
   * type Z3 = Tuple.Zip<[1, 2], ['a', 'b', 'c']>; // readonly [readonly [1, 'a'], readonly [2, 'b']]
   * type Z4 = Tuple.Zip<[], ['a']>; // readonly []
   */
  export type Zip<A extends readonly unknown[], B extends readonly unknown[]> =
    A extends NonEmptyTuple<unknown>
      ? B extends NonEmptyTuple<unknown>
        ? readonly [readonly [Head<A>, Head<B>], ...Zip<Tail<A>, Tail<B>>]
        : readonly []
      : readonly [];

  /**
   * Partitions a readonly tuple `T` into sub-tuples of length `N`.
   * The last sub-tuple may have fewer than `N` elements if the length of `T` is not divisible by `N`.
   * @template N - The desired size of each partition. Only a single numeric
   * literal pins a size; a union of literals and `number` alike answer an
   * unsized array of unsized chunks. `0` is not a partition size and answers
   * `never`.
   * @template T - The readonly tuple type to partition.
   * @returns A readonly tuple where each element is a sub-tuple of length up to `N`.
   * @example
   * type P1 = Tuple.Partition<2, [1, 2, 3, 4, 5]>; // readonly [readonly [1, 2], readonly [3, 4], readonly [5]]
   * type P2 = Tuple.Partition<3, [1, 2, 3, 4, 5, 6]>; // readonly [readonly [1, 2, 3], readonly [4, 5, 6]]
   * type P3 = Tuple.Partition<1, [1, 2]>; // readonly [readonly [1], readonly [2]]
   * type P4 = Tuple.Partition<5, [1, 2]>; // readonly [readonly [1, 2]]
   * type P5 = Tuple.Partition<number, [1, 2]>; // readonly (readonly (1 | 2)[])[]
   */
  export type Partition<N extends number, T extends readonly unknown[]> =
    TSTypeForgeInternals_PinsOneNumber<N> extends true
      ? [N] extends [0]
        ? never // a chunk size of 0 consumes nothing; see the note below
        : PartitionImpl<N, T, readonly [], readonly []>
      : readonly (readonly T[number][])[];
}

/*
 * A union-valued length or index argument.
 *
 * Every operation here takes a length or an index that is meant to name one
 * value. A union names several, of which a call uses exactly one, and `number`
 * names all of them — so neither pins the single value the result depends on.
 *
 * Each of these used to answer as though it had been given that one value, and
 * was wrong for it. The counting members — `Take`, `Skip`, `TakeLast`,
 * `SkipLast`, `Partition` — walk a counter up to `N` and stop at the first
 * match, so a union stopped at its smallest member and `Take<1 | 2, [1, 2, 3]>`
 * came out as `readonly [1]`, which the equally possible `[1, 2]` does not
 * satisfy. `number` matched at length zero, so `Take<number, T>` came out as
 * `readonly []`. `SetAt` asks `Position extends I`, which every member of a
 * union answers at once, so `SetAt<0 | 2, 'x', [1, 2, 3]>` came out as
 * `['x', 2, 'x']` — satisfied by neither `['x', 2, 3]` nor `[1, 2, 'x']`.
 *
 * None of them distributes over the argument. Distribution would be exact — a
 * union answer, one member per candidate — but it multiplies the result by the
 * size of the union, and these are the types most likely to be handed a wide
 * one: an index union is simply what indexing a tuple by a non-literal
 * produces, and `ConstrainedList` bounds its length argument by
 * `SupportedLength`, which is `0..2048`. Paying that on every such call is not
 * worth the precision.
 *
 * So each of them answers, for anything but a single literal, the widest result
 * that every possible call satisfies:
 *
 *   - the counting members answer an unsized `readonly Elm[]` (`Partition`, an
 *     unsized array of unsized chunks), there being no one tuple to name when
 *     the candidates differ in length;
 *   - `SetAt` widens each candidate position to `T[I] | V` in place. It can
 *     keep the tuple, because its result has the same length whichever index is
 *     chosen — and indexed access into `readonly [1 | 'x', 2, 3 | 'x']` answers
 *     exactly what the distributed union would.
 *
 * A single numeric literal takes the precise path in every one of them, which
 * is the overwhelmingly common case.
 *
 * `MakeTuple` needs no equivalent: it walks the decimal digits of `${N}`, and
 * that walk distributes over a union on its own, which is already exact.
 *
 * `Partition` additionally rejects a chunk size of `0`. `PartitionImpl` closes
 * the current chunk whenever it reaches `N` elements, so at `N = 0` it closes
 * an empty chunk without ever consuming from `T` and recurses until the
 * instantiation limit — `Tuple.Partition<0, [1, 2]>` was TS2589 rather than a
 * type. There is no sensible answer to "split this into chunks of nothing", so
 * it answers `never`. A union containing `0` no longer reaches it — it takes
 * the widened branch above — but a literal `0` still does.
 */

/**
 * @internal Recursive implementation for `Tuple.Reverse`.
 * @template L - The remaining part of the input tuple.
 * @template X - The accumulator tuple (reversed elements).
 */
type ReverseImpl<
  L extends readonly unknown[],
  X extends readonly unknown[],
> = L extends readonly []
  ? X
  : ReverseImpl<Tuple.Tail<L>, readonly [Tuple.Head<L>, ...X]>;

/**
 * @internal Recursive implementation for `Tuple.Take`.
 * @template N - The number of elements remaining to take.
 * @template T - The remaining part of the input tuple.
 * @template R - The accumulator tuple (reversed taken elements).
 */
type TakeImpl<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[],
> = {
  0: Tuple.Reverse<R>; // Base case: N reached 0 or T is empty, return reversed accumulator
  1: TakeImpl<N, Tuple.Tail<T>, readonly [Tuple.Head<T>, ...R]>; // Recursive step: take Head<T>, decrement N implicitly via R['length']
}[T extends readonly [] ? 0 : R['length'] extends N ? 0 : 1];

/**
 * @internal Recursive implementation for `Tuple.Skip`.
 * @template N - The number of elements remaining to skip.
 * @template T - The remaining part of the input tuple.
 * @template R - Accumulator tracking skipped elements (used for length check).
 */
type SkipImpl<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[],
> = T extends readonly []
  ? T // Base case: T is empty, return empty
  : R['length'] extends N
    ? T // Base case: N elements skipped, return remaining T
    : SkipImpl<N, Tuple.Tail<T>, readonly [Tuple.Head<T>, ...R]>; // Recursive step: skip Head<T>, increment R['length']

/**
 * @internal Implementation for `Tuple.TakeLast`. Builds a counter tuple `R` of
 * length `N`, then splits `T` at the counted position with a single
 * rest-element inference instead of peeling one element per step (which would
 * cost O(N * |T|) instantiations via `ButLast`/`Last`).
 * @template N - The number of elements to take from the end.
 * @template T - The input tuple.
 * @template R - Counter tuple; grows until its length reaches `N`.
 */
type TakeLastImpl<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[],
> = R['length'] extends N
  ? T extends readonly [...infer Init, ...{ [K in keyof R]: unknown }]
    ? T extends readonly [...Init, ...infer LastN]
      ? Readonly<LastN> // Split succeeded: return the trailing N elements
      : never // Unreachable: the split above always re-matches
    : Readonly<T> // N >= T['length']: return the whole tuple
  : TakeLastImpl<N, T, readonly [unknown, ...R]>;

/**
 * @internal Implementation for `Tuple.SkipLast`. Builds a counter tuple `R` of
 * length `N`, then splits `T` at the counted position with a single
 * rest-element inference instead of peeling one element per step (which would
 * cost O(N * |T|) instantiations via `ButLast`/`Last`).
 * @template N - The number of elements to skip from the end.
 * @template T - The input tuple.
 * @template R - Counter tuple; grows until its length reaches `N`.
 */
type SkipLastImpl<
  N extends number,
  T extends readonly unknown[],
  R extends readonly unknown[],
> = R['length'] extends N
  ? T extends readonly [...infer Init, ...{ [K in keyof R]: unknown }]
    ? Readonly<Init> // Split succeeded: return everything before the last N
    : readonly [] // N >= T['length']: everything is skipped
  : SkipLastImpl<N, T, readonly [unknown, ...R]>;

/**
 * @internal Whether `N` names exactly one number — one length, or one position.
 *
 * A union does not: `0 | 2` marks two *candidates*, of which a call uses one
 * and never both. Nor does `number` (or `any`, which absorbs the check), which
 * marks every candidate at once. Only for a single literal is the length or
 * position that a call actually uses statically known.
 *
 * Every operation that takes a length or an index branches on this, and none of
 * them distributes over the argument; see the note above.
 */
export type TSTypeForgeInternals_PinsOneNumber<N extends number> =
  IsUnion<N> extends true ? false : number extends N ? false : true;

/**
 * @internal Recursive implementation for `Tuple.SetAt`.
 *
 * `ACC['length'] extends I` asks whether the current position is *a* candidate,
 * which for a union `I` is true at every member of it at once. Replacing each
 * of them with `V` would describe a result no single call can produce —
 * `SetAt<0 | 2, 'x', [1, 2, 3]>` as `['x', 2, 'x']` is satisfied by neither
 * `['x', 2, 3]` nor `[1, 2, 'x']`. So a candidate position is only *set* when
 * `I` pins it alone, and otherwise *widened* to `T[I] | V`, which every
 * possible result does satisfy.
 * @template T - The remaining part of the input tuple.
 * @template I - The target index.
 * @template V - The value to set.
 * @template ACC - The accumulator tuple (reversed processed elements).
 * @template Exact - Whether `I` names exactly one position; see {@link TSTypeForgeInternals_PinsOneNumber}.
 */
type SetAtImpl<
  T extends readonly unknown[],
  I extends number,
  V,
  ACC extends readonly unknown[],
  Exact extends boolean,
> = {
  end: Tuple.Reverse<ACC>; // Base case: T is empty, return reversed accumulator
  next: SetAtImpl<Tuple.Tail<T>, I, V, readonly [Tuple.Head<T>, ...ACC], Exact>; // Recursive step: not a candidate, add Head<T> to accumulator
  setValue: SetAtImpl<Tuple.Tail<T>, I, V, readonly [V, ...ACC], Exact>; // Recursive step: the one index, add V to accumulator
  widen: SetAtImpl<
    Tuple.Tail<T>,
    I,
    V,
    readonly [Tuple.Head<T> | V, ...ACC],
    Exact
  >; // Recursive step: one candidate of several, add Head<T> | V to accumulator
}[T extends readonly []
  ? 'end'
  : ACC['length'] extends I
    ? Exact extends true
      ? 'setValue'
      : 'widen'
    : 'next'];

/**
 * @internal Recursive implementation for `Tuple.Partition`.
 * @template N - The partition size.
 * @template T - The remaining part of the input tuple.
 * @template R1 - The current partition being built (reversed).
 * @template R2 - The accumulator for the final tuple of partitions (reversed).
 */
type PartitionImpl<
  N extends number,
  T extends readonly unknown[],
  R1 extends readonly unknown[],
  R2 extends readonly unknown[],
> = T extends readonly [] // Is input tuple processed?
  ? R1 extends readonly [] // Is the current partition empty?
    ? Tuple.Reverse<R2> // Yes to both: return final reversed accumulator
    : PartitionImpl<N, T, readonly [], readonly [Tuple.Reverse<R1>, ...R2]> // No: add the last partial partition
  : R1['length'] extends N // Is the current partition full?
    ? PartitionImpl<N, T, readonly [], readonly [Tuple.Reverse<R1>, ...R2]> // Yes: add completed partition to accumulator, start new one
    : PartitionImpl<N, Tuple.Tail<T>, readonly [Tuple.Head<T>, ...R1], R2>; // No: add Head<T> to current partition
