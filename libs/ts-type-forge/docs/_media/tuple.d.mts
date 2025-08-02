declare namespace Tuple {
  /**
   * Gets the type of the first element of a readonly tuple `T`.
   * If the tuple is empty, it returns the default type `D` (defaults to `never`).
   * @template T - The readonly tuple type.
   * @template D - The default type to return if `T` is empty. Defaults to `never`.
   * @returns The type of the first element, or `D` if `T` is empty.
   * @example
   * type H1 = Tuple.Head<[1, 2, 3]>; // 1
   * type H2 = Tuple.Head<[]>; // never
   * type H3 = Tuple.Head<[], 'default'>; // 'default'
   */
  type Head<T extends readonly unknown[], D = never> = T extends readonly [
    infer X,
    ...(readonly unknown[]),
  ]
    ? X
    : D;

  /**
   * Gets the type of the last element of a readonly tuple `T`.
   * If the tuple is empty, it returns `never`.
   * @template T - The readonly tuple type.
   * @returns The type of the last element, or `never` if `T` is empty.
   * @example
   * type L1 = Tuple.Last<[1, 2, 3]>; // 3
   * type L2 = Tuple.Last<[]>; // never
   * type L3 = Tuple.Last<[1]>; // 1
   */
  type Last<T extends readonly unknown[]> = T extends readonly []
    ? never
    : T extends readonly [unknown]
      ? Head<T>
      : Last<Tail<T>>;

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
  type ButLast<A extends readonly unknown[]> = A extends readonly []
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
  type Tail<A extends readonly unknown[]> = A extends readonly []
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
  type Reverse<L extends readonly unknown[]> = TSTypeForgeInternals.ReverseImpl<
    L,
    readonly []
  >;

  // /**
  //  * Gets a tuple containing all elements except the first. Alias for Tail.
  //  * @template T - The tuple type.
  //  * @returns A tuple type with the first element removed.
  //  */
  // type Rest<T extends unknown[]> = ((...x: T) => void) extends (
  //   x: T[0],
  //   ...xs: infer XS
  // ) => void
  //   ? XS
  //   : never;

  /**
   * Takes the first `N` elements from a readonly tuple `T`.
   * @template N - The number of elements to take (must be a non-negative integer literal).
   * @template T - The readonly tuple type.
   * @returns A new readonly tuple type containing the first `N` elements. If `N` is larger than the length of `T`, returns `T`.
   * @example
   * type TK1 = Tuple.Take<2, [1, 2, 3]>; // readonly [1, 2]
   * type TK2 = Tuple.Take<5, [1, 2, 3]>; // readonly [1, 2, 3]
   * type TK3 = Tuple.Take<0, [1, 2, 3]>; // readonly []
   */
  type Take<
    N extends number,
    T extends readonly unknown[],
  > = TSTypeForgeInternals.TakeImpl<N, T, readonly []>;

  /**
   * Skips the first `N` elements from a readonly tuple `T`.
   * @template N - The number of elements to skip (must be a non-negative integer literal).
   * @template T - The readonly tuple type.
   * @returns A new readonly tuple type containing the elements after the first `N`. If `N` is larger than the length of `T`, returns `readonly []`.
   * @example
   * type SK1 = Tuple.Skip<1, [1, 2, 3]>; // readonly [2, 3]
   * type SK2 = Tuple.Skip<3, [1, 2, 3]>; // readonly []
   * type SK3 = Tuple.Skip<0, [1, 2, 3]>; // readonly [1, 2, 3]
   */
  type Skip<
    N extends number,
    T extends readonly unknown[],
  > = TSTypeForgeInternals.SkipImpl<N, T, readonly []>;

  /**
   * Takes the last `N` elements from a readonly tuple `T`.
   * @template N - The number of elements to take (must be a non-negative integer literal).
   * @template T - The readonly tuple type.
   * @returns A new readonly tuple type containing the last `N` elements. If `N` is larger than the length of `T`, returns `T`.
   * @example
   * type TL1 = Tuple.TakeLast<2, [1, 2, 3]>; // readonly [2, 3]
   * type TL2 = Tuple.TakeLast<5, [1, 2, 3]>; // readonly [1, 2, 3]
   * type TL3 = Tuple.TakeLast<0, [1, 2, 3]>; // readonly []
   */
  type TakeLast<
    N extends number,
    T extends readonly unknown[],
  > = TSTypeForgeInternals.TakeLastImpl<N, T, readonly []>;

  /**
   * Skips the last `N` elements from a readonly tuple `T`.
   * @template N - The number of elements to skip (must be a non-negative integer literal).
   * @template T - The readonly tuple type.
   * @returns A new readonly tuple type containing the elements before the last `N`. If `N` is larger than the length of `T`, returns `readonly []`.
   * @example
   * type SL1 = Tuple.SkipLast<1, [1, 2, 3]>; // readonly [1, 2]
   * type SL2 = Tuple.SkipLast<3, [1, 2, 3]>; // readonly []
   * type SL3 = Tuple.SkipLast<0, [1, 2, 3]>; // readonly [1, 2, 3]
   */
  type SkipLast<
    N extends number,
    T extends readonly unknown[],
  > = TSTypeForgeInternals.SkipLastImpl<N, T, readonly []>;

  /**
   * Creates a new readonly tuple type where the element at index `I` in `T` is replaced with type `V`.
   * @template T - The readonly tuple type.
   * @template I - The index to update (must be a valid index literal for `T`).
   * @template V - The new type for the element at index `I`.
   * @returns A new readonly tuple type with the element at index `I` updated.
   * @example
   * type SA1 = Tuple.SetAt<[1, 2, 3], 1, 'x'>; // readonly [1, 'x', 3]
   * // type SA2 = Tuple.SetAt<[1, 2], 2, 'x'>; // Error: Index '2' is out of bounds.
   */
  type SetAt<
    T extends readonly unknown[],
    I extends number,
    V,
  > = TSTypeForgeInternals.SetAtImpl<T, I, V, readonly []>;

  /**
   * Flattens a nested readonly tuple `T` by one level.
   * @template T - A readonly tuple where elements are themselves readonly arrays/tuples.
   * @returns A new readonly tuple type flattened by one level.
   * @example
   * type F1 = Tuple.Flatten<[[1, 2], [3, 4]]>; // readonly [1, 2, 3, 4]
   * type F2 = Tuple.Flatten<[[1], readonly [2, 3]]>; // readonly [1, 2, 3]
   * type F3 = Tuple.Flatten<[[1], [2, [3]]]>; // readonly [1, 2, [3]] (only flattens one level)
   */
  type Flatten<T extends readonly (readonly unknown[])[]> =
    TSTypeForgeInternals.FlattenImpl<T, readonly [], readonly []>;

  /**
   * Concatenates two readonly tuples `A` and `B`.
   * @template A - The first readonly tuple.
   * @template B - The second readonly tuple.
   * @returns A new readonly tuple type representing the concatenation of `A` and `B`.
   * @example
   * type C1 = Tuple.Concat<[1, 2], [3, 4]>; // readonly [1, 2, 3, 4]
   * type C2 = Tuple.Concat<[], [1]>; // readonly [1]
   * type C3 = Tuple.Concat<[1], []>; // readonly [1]
   */
  type Concat<
    A extends readonly unknown[],
    B extends readonly unknown[],
  > = TSTypeForgeInternals.ConcatImpl<A, B, readonly []>;

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
  type Zip<A extends readonly unknown[], B extends readonly unknown[]> =
    A extends NonEmptyArray<unknown>
      ? B extends NonEmptyArray<unknown>
        ? readonly [readonly [Head<A>, Head<B>], ...Zip<Tail<A>, Tail<B>>] // both A and B has at least 1 element
        : readonly [] // B is empty
      : readonly []; // A is empty

  /**
   * Partitions a readonly tuple `T` into sub-tuples of length `N`.
   * The last sub-tuple may have fewer than `N` elements if the length of `T` is not divisible by `N`.
   * @template N - The desired size of each partition (must be a positive integer literal).
   * @template T - The readonly tuple type to partition.
   * @returns A readonly tuple where each element is a sub-tuple of length up to `N`.
   * @example
   * type P1 = Tuple.Partition<2, [1, 2, 3, 4, 5]>; // readonly [readonly [1, 2], readonly [3, 4], readonly [5]]
   * type P2 = Tuple.Partition<3, [1, 2, 3, 4, 5, 6]>; // readonly [readonly [1, 2, 3], readonly [4, 5, 6]]
   * type P3 = Tuple.Partition<1, [1, 2]>; // readonly [readonly [1], readonly [2]]
   * type P4 = Tuple.Partition<5, [1, 2]>; // readonly [readonly [1, 2]]
   */
  type Partition<
    N extends number,
    T extends readonly unknown[],
  > = TSTypeForgeInternals.PartitionImpl<N, T, readonly [], readonly []>;

  /** @internal Contains internal implementation details for `Tuple` utilities. */
  namespace TSTypeForgeInternals {
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
      : ReverseImpl<Tail<L>, readonly [Head<L>, ...X]>;

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
      0: Reverse<R>; // Base case: N reached 0 or T is empty, return reversed accumulator
      1: TakeImpl<N, Tail<T>, readonly [Head<T>, ...R]>; // Recursive step: take Head<T>, decrement N implicitly via R['length']
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
        : SkipImpl<N, Tail<T>, readonly [Head<T>, ...R]>; // Recursive step: skip Head<T>, increment R['length']

    /**
     * @internal Recursive implementation for `Tuple.TakeLast`. Uses `ButLast` and `Last`.
     * @template N - The number of elements remaining to take.
     * @template T - The remaining part of the input tuple (processed from the end).
     * @template R - The accumulator tuple (reversed taken elements from the end).
     */
    type TakeLastImpl<
      N extends number,
      T extends readonly unknown[],
      R extends readonly unknown[],
    > = T extends readonly []
      ? R // Base case: T is empty, return accumulator
      : R['length'] extends N
        ? R // Base case: N elements taken, return accumulator
        : TakeLastImpl<N, ButLast<T>, readonly [Last<T>, ...R]>; // Recursive step: take Last<T>, process ButLast<T>

    /**
     * @internal Recursive implementation for `Tuple.SkipLast`. Uses `ButLast` and `Last`.
     * @template N - The number of elements remaining to skip from the end.
     * @template T - The remaining part of the input tuple (processed from the end).
     * @template R - Accumulator tracking skipped elements from the end (used for length check).
     */
    type SkipLastImpl<
      N extends number,
      T extends readonly unknown[],
      R extends readonly unknown[],
    > = T extends readonly []
      ? T // Base case: T is empty, return empty
      : R['length'] extends N
        ? T // Base case: N elements skipped from end, return remaining T
        : SkipLastImpl<N, ButLast<T>, readonly [Last<T>, ...R]>; // Recursive step: skip Last<T>, process ButLast<T>

    /**
     * @internal Recursive implementation for `Tuple.SetAt`.
     * @template T - The remaining part of the input tuple.
     * @template I - The target index.
     * @template V - The value to set.
     * @template ACC - The accumulator tuple (reversed processed elements).
     */
    type SetAtImpl<
      T extends readonly unknown[],
      I extends number,
      V,
      ACC extends readonly unknown[],
    > = {
      end: Reverse<ACC>; // Base case: T is empty, return reversed accumulator
      next: SetAtImpl<Tail<T>, I, V, readonly [Head<T>, ...ACC]>; // Recursive step: index not reached, add Head<T> to accumulator
      setValue: SetAtImpl<Tail<T>, I, V, readonly [V, ...ACC]>; // Recursive step: index reached, add V to accumulator
    }[T extends readonly []
      ? 'end'
      : ACC['length'] extends I
        ? 'setValue'
        : 'next'];

    /**
     * @internal Recursive implementation for `Tuple.Flatten`.
     * @template T - The remaining tuple of tuples.
     * @template R1 - The current inner tuple being processed (reversed).
     * @template R2 - The accumulator for the final flattened tuple (reversed).
     */
    type FlattenImpl<
      T extends readonly (readonly unknown[])[],
      R1 extends readonly unknown[],
      R2 extends readonly unknown[],
    > = T extends readonly [] // Is the outer tuple processed?
      ? R1 extends readonly [] // Is the current inner tuple processed?
        ? Reverse<R2> // Yes to both: return final reversed accumulator
        : FlattenImpl<T, Tail<R1>, readonly [Head<R1>, ...R2]> // No: process current inner tuple
      : R1 extends readonly [] // Current inner tuple processed?
        ? FlattenImpl<Tail<T>, Head<T, []>, R2> // Yes: move to the next inner tuple from T
        : FlattenImpl<T, Tail<R1>, readonly [Head<R1>, ...R2]>; // No: process current inner tuple

    /**
     * @internal Recursive implementation for `Tuple.Concat`.
     * @template A - The remaining part of the first tuple.
     * @template B - The remaining part of the second tuple.
     * @template R - The accumulator tuple (reversed concatenated elements).
     */
    type ConcatImpl<
      A extends readonly unknown[],
      B extends readonly unknown[],
      R extends readonly unknown[],
    > = A extends readonly [] // Is A processed?
      ? B extends readonly [] // Is B processed?
        ? Reverse<R> // Yes to both: return final reversed accumulator
        : ConcatImpl<A, Tail<B>, readonly [Head<B>, ...R]> // No: process B
      : ConcatImpl<Tail<A>, B, readonly [Head<A>, ...R]>; // No: process A

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
        ? Reverse<R2> // Yes to both: return final reversed accumulator
        : PartitionImpl<N, T, readonly [], readonly [Reverse<R1>, ...R2]> // No: add the last partial partition
      : R1['length'] extends N // Is the current partition full?
        ? PartitionImpl<N, T, readonly [], readonly [Reverse<R1>, ...R2]> // Yes: add completed partition to accumulator, start new one
        : PartitionImpl<N, Tail<T>, readonly [Head<T>, ...R1], R2>; // No: add Head<T> to current partition
  }
}
