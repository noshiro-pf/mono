/**
 * Extracts the numeric index type from a readonly array or tuple type `T`.
 * If `T` is a tuple (fixed length), it returns a union of its numeric index literals (e.g., `0 | 1 | 2`).
 * If `T` is a regular array (variable length), it returns `number`.
 *
 * @template T - The readonly array or tuple type.
 * @returns A union of number literals representing the indices if `T` is a tuple, otherwise `number`.
 * @example
 * type TupleIndices = IndexOfTuple<[string, boolean, number]>; // 0 | 1 | 2
 * type ArrayIndices = IndexOfTuple<string[]>; // number
 * type EmptyTupleIndices = IndexOfTuple<[]>; // never
 * type ReadonlyArrayIndices = IndexOfTuple<readonly number[]>; // number
 */
type IndexOfTuple<T extends readonly unknown[]> =
  TSTypeForgeInternals.IndexOfTupleImpl<T, keyof T>;

/**
 * Extracts the negative index type from a readonly array or tuple type `T`.
 * Negative indices allow accessing elements from the end of the array (e.g., `-1` for last element).
 * If `T` is a tuple (fixed length), it returns a union of its negative index literals (e.g., `-1 | -2 | -3`).
 * If `T` is a regular array (variable length), it returns `number`.
 *
 * @template T - The readonly array or tuple type.
 * @returns A union of negative number literals representing the indices if `T` is a tuple, otherwise `number`.
 * @example
 * type TupleNegativeIndices = NegativeIndexOfTuple<[string, boolean, number]>; // -1 | -2 | -3
 * type ArrayNegativeIndices = NegativeIndexOfTuple<string[]>; // number
 * type EmptyTupleNegativeIndices = NegativeIndexOfTuple<[]>; // never
 * type ReadonlyArrayNegativeIndices = NegativeIndexOfTuple<readonly number[]>; // number
 */
type NegativeIndexOfTuple<T extends readonly unknown[]> =
  TSTypeForgeInternals.MapIdx<RelaxedExclude<IndexOfTuple<[...T, 0]>, 0>>;

declare namespace TSTypeForgeInternals {
  /**
   * Internal implementation detail for `IndexOfTuple`.
   * Determines the numeric index type based on whether the input is a fixed-length tuple or a variable-length array.
   * @template T - The readonly array or tuple type.
   * @template K - The keys of `T` (including array methods and numeric indices).
   * @internal
   */
  type IndexOfTupleImpl<T extends readonly unknown[], K> =
    // Check if T is a tuple (fixed length)
    IsFixedLengthList<T> extends true
      ? // If it's a tuple, iterate through its keys K
        K extends keyof T
        ? // Check if the key K is a string representation of a number
          K extends `${number}`
          ? // Convert the numeric string key back to a number literal
            ToNumber<K>
          : // Ignore non-numeric keys (like 'length', 'map', etc.)
            never
        : never
      : // If T is not a tuple (it's a regular array), the index type is number
        number;
}
