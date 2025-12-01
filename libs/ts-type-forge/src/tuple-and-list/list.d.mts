declare namespace List {
  /**
   * Gets the type of the first element of a readonly array or tuple `T`.
   * If the array is empty, it returns the default type `D` (defaults to `never`).
   * Delegates to `Tuple.Head`.
   * @template T - The readonly array or tuple type.
   * @template D - The default type to return if `T` is empty. Defaults to `never`.
   * @returns The type of the first element, or `D` if `T` is empty.
   * @example
   * type H1 = List.Head<[1, 2, 3]>; // 1
   * type H2 = List.Head<readonly string[]>; // string
   * type H3 = List.Head<[]>; // never
   * type H4 = List.Head<[], 'default'>; // 'default'
   */
  type Head<T extends readonly unknown[], D = never> = Tuple.Head<T, D>;

  /**
   * Gets the type of the last element of a readonly array or tuple `T`.
   * If the array is empty, it returns `never`.
   * @template T - The readonly array or tuple type.
   * @returns The type of the last element, or `never` if `T` is empty.
   * @example
   * type L1 = List.Last<[1, 2, 3]>; // 3
   * type L2 = List.Last<readonly string[]>; // string
   * type L3 = List.Last<[]>; // never
   * type L4 = List.Last<[1]>; // 1
   */
  type Last<T extends readonly unknown[]> = Tuple.Last<T>;

  /**
   * Gets a new tuple/array type containing all elements of `A` except the last one.
   * Delegates to `Tuple.ButLast`.
   * @template A - The readonly array or tuple type.
   * @returns A new type with the last element removed.
   * @example
   * type BL1 = List.ButLast<[1, 2, 3]>; // readonly [1, 2]
   * type BL2 = List.ButLast<readonly string[]>; // readonly string[] (unchanged for general arrays)
   * type BL3 = List.ButLast<[1]>; // readonly []
   * type BL4 = List.ButLast<[]>; // readonly []
   */
  type ButLast<A extends readonly unknown[]> = Tuple.ButLast<A>;

  /**
   * Gets a new tuple/array type containing all elements of `A` except the first one.
   * Delegates to `Tuple.Tail`.
   * @template A - The readonly array or tuple type.
   * @returns A new type with the first element removed.
   * @example
   * type T1 = List.Tail<[1, 2, 3]>; // readonly [2, 3]
   * type T2 = List.Tail<readonly string[]>; // readonly string[] (unchanged for general arrays)
   * type T3 = List.Tail<[1]>; // readonly []
   * type T4 = List.Tail<[]>; // readonly []
   */
  type Tail<A extends readonly unknown[]> = Tuple.Tail<A>;

  /**
   * Reverses the order of elements in a readonly array or tuple `L`.
   * For fixed-length tuples, it returns a tuple with elements in reverse order.
   * For general arrays, it returns a readonly array of the same element type.
   * @template L - The readonly array or tuple type.
   * @returns A new type with elements reversed.
   * @example
   * type R1 = List.Reverse<[1, 2, 3]>; // readonly [3, 2, 1]
   * type R2 = List.Reverse<readonly string[]>; // readonly string[]
   * type R3 = List.Reverse<[]>; // readonly []
   */
  type Reverse<L extends readonly unknown[]> = L extends readonly []
    ? readonly []
    : IsFixedLengthList<L> extends true
      ? Tuple.Reverse<L>
      : L extends readonly [unknown, ...(readonly unknown[])]
        ? readonly [...Reverse<Tail<L>>, Head<L>]
        : Readonly<L>;

  /**
   * Takes the first `N` elements from a readonly array or tuple `T`.
   * If `T` is a tuple, it returns a new tuple containing the first `N` elements.
   * If `T` is a general array, it returns the original array type `T`.
   * @template N - The number of elements to take.
   * @template T - The readonly array or tuple type.
   * @returns A new type containing the first `N` elements (for tuples) or `T` (for arrays).
   * @example
   * type TK1 = List.Take<2, [1, 2, 3]>; // readonly [1, 2]
   * type TK2 = List.Take<5, [1, 2, 3]>; // readonly [1, 2, 3]
   * type TK3 = List.Take<2, readonly string[]>; // readonly string[]
   */
  type Take<N extends number, T extends readonly unknown[]> =
    IsFixedLengthList<T> extends true ? Tuple.Take<N, T> : T;

  /**
   * Skips the first `N` elements from a readonly array or tuple `T`.
   * If `T` is a tuple, it returns a new tuple containing the elements after the first `N`.
   * If `T` is a general array, it returns the original array type `T`.
   * @template N - The number of elements to skip.
   * @template T - The readonly array or tuple type.
   * @returns A new type containing elements after the first `N` (for tuples) or `T` (for arrays).
   * @example
   * type SK1 = List.Skip<1, [1, 2, 3]>; // readonly [2, 3]
   * type SK2 = List.Skip<3, [1, 2, 3]>; // readonly []
   * type SK3 = List.Skip<1, readonly string[]>; // readonly string[]
   */
  type Skip<N extends number, T extends readonly unknown[]> =
    IsFixedLengthList<T> extends true ? Tuple.Skip<N, T> : T;

  /**
   * Takes the last `N` elements from a readonly array or tuple `T`.
   * If `T` is a tuple, it returns a new tuple containing the last `N` elements.
   * If `T` is a general array, it returns the original array type `T`.
   * @template N - The number of elements to take.
   * @template T - The readonly array or tuple type.
   * @returns A new type containing the last `N` elements (for tuples) or `T` (for arrays).
   * @example
   * type TL1 = List.TakeLast<2, [1, 2, 3]>; // readonly [2, 3]
   * type TL2 = List.TakeLast<5, [1, 2, 3]>; // readonly [1, 2, 3]
   * type TL3 = List.TakeLast<2, readonly string[]>; // readonly string[]
   */
  type TakeLast<N extends number, T extends readonly unknown[]> =
    IsFixedLengthList<T> extends true ? Tuple.TakeLast<N, T> : T;

  /**
   * Skips the last `N` elements from a readonly array or tuple `T`.
   * If `T` is a tuple, it returns a new tuple containing the elements before the last `N`.
   * If `T` is a general array, it returns the original array type `T`.
   * @template N - The number of elements to skip.
   * @template T - The readonly array or tuple type.
   * @returns A new type containing elements before the last `N` (for tuples) or `T` (for arrays).
   * @example
   * type SL1 = List.SkipLast<1, [1, 2, 3]>; // readonly [1, 2]
   * type SL2 = List.SkipLast<3, [1, 2, 3]>; // readonly []
   * type SL3 = List.SkipLast<1, readonly string[]>; // readonly string[]
   */
  type SkipLast<N extends number, T extends readonly unknown[]> =
    IsFixedLengthList<T> extends true ? Tuple.SkipLast<N, T> : T;

  /**
   * Creates a new array/tuple type where the element at index `I` in `T` is replaced with type `V`.
   * If `T` is a tuple, it returns a new tuple type with the element at `I` updated.
   * If `T` is a general array, it returns a general array type `readonly (T[number] | V)[]`.
   * @template T - The readonly array or tuple type.
   * @template I - The index to update (must be a valid index for `T` if `T` is a tuple).
   * @template V - The new type for the element at index `I`.
   * @returns A new array/tuple type with the element at index `I` updated.
   * @example
   * type SA1 = List.SetAt<[1, 2, 3], 1, 'x'>; // readonly [1, 'x', 3]
   * type SA2 = List.SetAt<readonly number[], 1, 'x'>; // readonly (string | number)[]
   * // type SA3 = List.SetAt<[1, 2], 2, 'x'>; // Error if I is out of bounds for tuple
   */
  type SetAt<T extends readonly unknown[], I extends number, V> =
    IsFixedLengthList<T> extends true
      ? Tuple.SetAt<T, I, V>
      : // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
        readonly (T[number] | V)[];

  /**
   * Flattens a nested readonly array/tuple `T` by one level.
   * Delegates to `Tuple.Flatten`.
   * @template T - A readonly array/tuple where elements are themselves readonly arrays/tuples.
   * @returns A new flattened array/tuple type.
   * @example
   * type F1 = List.Flatten<[[1, 2], [3, 4]]>; // readonly [1, 2, 3, 4]
   * type F2 = List.Flatten<[readonly number[], readonly string[]]>; // readonly (string | number)[]
   * type F3 = List.Flatten<[[1], [2, [3]]]>; // readonly [1, 2, [3]] (only flattens one level)
   */
  type Flatten<T extends readonly (readonly unknown[])[]> = Tuple.Flatten<T>;

  /**
   * Concatenates two readonly arrays or tuples `A` and `B`.
   * Delegates to `Tuple.Concat`.
   * @template A - The first readonly array or tuple.
   * @template B - The second readonly array or tuple.
   * @returns A new type representing the concatenation of `A` and `B`.
   * @example
   * type C1 = List.Concat<[1, 2], [3, 4]>; // readonly [1, 2, 3, 4]
   * type C2 = List.Concat<readonly number[], readonly string[]>; // readonly (string | number)[]
   * type C3 = List.Concat<[1], readonly number[]>; // readonly [1, ...number[]]
   */
  type Concat<
    A extends readonly unknown[],
    B extends readonly unknown[],
  > = Tuple.Concat<A, B>;

  /**
   * Creates pairs of elements from two readonly arrays or tuples `A` and `B`.
   * If the arrays/tuples have different lengths, the resulting type reflects pairing up to the shortest length,
   * potentially using the general element type for the longer array if one is a general array.
   * @template A - The first readonly array or tuple.
   * @template B - The second readonly array or tuple.
   * @returns A readonly array/tuple of pairs `readonly [A[i], B[i]]`.
   * @example
   * type Z1 = List.Zip<[1, 2], ['a', 'b']>; // readonly [[1, 'a'], [2, 'b']]
   * type Z2 = List.Zip<[1, 2, 3], ['a', 'b']>; // readonly [[1, 'a'], [2, 'b']]
   * type Z3 = List.Zip<readonly number[], readonly string[]>; // readonly (readonly [number, string])[]
   * type Z4 = List.Zip<[1, 2], readonly string[]>; // readonly [[1, string], [2, string]]
   * type Z5 = List.Zip<readonly number[], ['a', 'b']>; // readonly [[number, 'a'], [number, 'b']]
   */
  type Zip<
    A extends readonly unknown[],
    B extends readonly unknown[],
  > = A extends readonly []
    ? readonly []
    : B extends readonly []
      ? readonly []
      : A extends NonEmptyArray<unknown>
        ? B extends NonEmptyArray<unknown>
          ? readonly [readonly [Head<A>, Head<B>], ...Zip<Tail<A>, Tail<B>>] // both A and B has at least 1 element
          : readonly [readonly [Head<A>, B[number]], ...Zip<Tail<A>, Tail<B>>] // A has at least 1 element but B has at least 0 element
        : B extends NonEmptyArray<unknown>
          ? readonly [readonly [A[number], Head<B>], ...Zip<Tail<A>, Tail<B>>] // B has at least 1 element but A has at least 0 element
          : readonly (readonly [A[number], B[number]])[];

  /**
   * Partitions a readonly array or tuple `T` into sub-arrays/tuples of length `N`.
   * Delegates to `Tuple.Partition`.
   * @template N - The desired size of each partition (must be a positive integer literal).
   * @template T - The readonly array or tuple type to partition.
   * @returns A readonly array/tuple where each element is a sub-array/tuple of length `N`.
   * @example
   * type P1 = List.Partition<2, [1, 2, 3, 4, 5]>; // readonly [[1, 2], [3, 4], [5]]
   * type P2 = List.Partition<3, readonly number[]>; // readonly (readonly number[])[]
   * type P3 = List.Partition<1, [1, 2]>; // readonly [[1], [2]]
   */
  type Partition<
    N extends number,
    T extends readonly unknown[],
  > = Tuple.Partition<N, T>;
}
