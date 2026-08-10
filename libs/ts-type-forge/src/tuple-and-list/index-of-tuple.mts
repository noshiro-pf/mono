import { type IsFixedLengthList } from '../condition/index.mjs';
import { type RelaxedExclude, type ToNumber } from '../others/index.mjs';

/**
 * Extracts the numeric index type from a readonly array or tuple type `T`.
 * If `T` is a tuple (fixed length), it returns a union of its numeric index literals (e.g., `0 | 1 | 2`).
 * If `T` is a regular array (variable length), it returns `number`.
 *
 * @template T - The readonly array or tuple type.
 * @returns A union of number literals representing the indices if `T` is a tuple, otherwise `number`.
 * @example
 * ```ts
 * type TupleIndices = IndexOfTuple<[string, boolean, number]>; // 0 | 1 | 2
 * type ArrayIndices = IndexOfTuple<string[]>; // number
 * type EmptyTupleIndices = IndexOfTuple<[]>; // never
 * type ReadonlyArrayIndices = IndexOfTuple<readonly number[]>; // number
 * ```
 */
export type IndexOfTuple<T extends readonly unknown[]> = IndexOfTupleImpl<
  T,
  keyof T
>;

/**
 * Internal implementation detail for `IndexOfTuple`.
 * Determines the numeric index type based on whether the input is a fixed-length tuple or a variable-length array.
 * @template T - The readonly array or tuple type.
 * @template K - The keys of `T` (including array methods and numeric indices).
 * @internal
 */
type IndexOfTupleImpl<T extends readonly unknown[], K> =
  IsFixedLengthList<T> extends true
    ? K extends keyof T
      ? K extends `${number}`
        ? ToNumber<K>
        : never
      : never
    : number;

/**
 * Extracts the negative index type from a readonly array or tuple type `T`.
 * Negative indices allow accessing elements from the end of the array (e.g., `-1` for last element).
 * If `T` is a tuple (fixed length), it returns a union of its negative index literals (e.g., `-1 | -2 | -3`).
 * If `T` is a regular array (variable length), it returns `number`.
 *
 * @template T - The readonly array or tuple type.
 * @returns A union of negative number literals representing the indices if `T` is a tuple, otherwise `number`.
 * @example
 * ```ts
 * type TupleNegativeIndices = NegativeIndexOfTuple<[string, boolean, number]>; // -1 | -2 | -3
 * type ArrayNegativeIndices = NegativeIndexOfTuple<string[]>; // number
 * type EmptyTupleNegativeIndices = NegativeIndexOfTuple<[]>; // never
 * type ReadonlyArrayNegativeIndices = NegativeIndexOfTuple<readonly number[]>; // number
 * ```
 */
export type NegativeIndexOfTuple<T extends readonly unknown[]> = MapIdx<
  RelaxedExclude<IndexOfTuple<[...T, 0]>, 0>
>;

/**
 * @internal Maps a union of positive integer literals `I` to a union of
 * their corresponding negative integer literals `-I`.
 *
 * Deliberately duplicated in `src/type-level-integer/index-type.mts`: keeping
 * the helper module-local (instead of extracting a shared module) keeps it
 * out of the package's export surface.
 */
type MapIdx<I extends number> = I extends I ? NegativeToNumber<`-${I}`> : never;

/**
 * @internal Converts a negative number string literal (e.g. `"-5"`) to its
 * corresponding negative number literal (`-5`).
 * (Deliberately duplicated; see `MapIdx` above.)
 */
type NegativeToNumber<S extends `-${number}`> =
  S extends `${infer N extends number}` ? N : never;
