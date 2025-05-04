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

/** @internal */
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
