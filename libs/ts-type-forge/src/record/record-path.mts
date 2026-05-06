import { expectType } from 'ts-data-forge';
import { type IsNotFixedLengthList } from '../condition/index.mjs';
import { type UnknownRecord } from '../constants/index.mjs';
import { type ToNumber } from '../others/index.mjs';
import { type IndexOfTuple, type Tuple } from '../tuple-and-list/index.mjs';

/**
 * @internal Generates a union of all prefixes of a given readonly tuple
 * `L`, including the empty tuple `[]`.
 *
 * @example
 * type P = RecordPathPrefixes<[1, 'a', true]>;
 * // P = readonly [] | readonly [1] | readonly [1, 'a'] | readonly [1, 'a', true]
 */
type RecordPathPrefixes<L extends readonly unknown[]> = L extends readonly [
  infer Head,
  ...infer Rest,
]
  ? readonly [] | readonly [Head, ...RecordPathPrefixes<Rest>]
  : readonly [];

/**
 * Calculates all possible paths (including intermediate paths and the root `[]`) within a nested record `R`,
 * allowing `number` as an index type for arrays.
 * @template R - The record or array type.
 * @returns A union of readonly tuples representing all possible paths. Each tuple element is a key (string) or an index (number).
 * @example
 * type Data = { a: { b: string[]; c: number } };
 * type P = PathsWithIndex<Data>;
 * // P = readonly [] | readonly ["a"] | readonly ["a", "b"] | readonly ["a", "b", number] | readonly ["a", "c"]
 */
export type RecordPathsWithIndex<R> = RecordPathPrefixes<
  RecordLeafPathsWithIndex<R>
>;

/**
 * Calculates all possible paths (including intermediate paths and the root `[]`) within a nested record `R`,
 * using specific number literal indices for tuples.
 * @template R - The record or tuple type.
 * @returns A union of readonly tuples representing all possible paths. Each tuple element is a key (string) or a specific index (number literal).
 * @example
 * type Data = { a: { b: [string, boolean]; c: number } };
 * type P = Paths<Data>;
 * // P = readonly [] | readonly ["a"] | readonly ["a", "b"] | readonly ["a", "b", 0] | readonly ["a", "b", 1] | readonly ["a", "c"]
 */
export type RecordPaths<R> = RecordPathPrefixes<RecordLeafPaths<R>>;

/**
 * Generates a union of tuples, where each tuple contains a possible path in `R` (using specific tuple indices)
 * and the type of the value located at that path.
 * @template R - The record or tuple type.
 * @returns A union of `readonly [Path, ValueType]` tuples.
 * @example
 * type Data = { a: string; b: [number] };
 * type KPV = KeyPathAndValueTypeAtPathTuple<Data>;
 * // KPV = | readonly [readonly [], { a: string; b: [number] }]
 * //       | readonly [readonly ["a"], string]
 * //       | readonly [readonly ["b"], [number]]
 * //       | readonly [readonly ["b", 0], number]
 */
export type RecordPathAndValueTypeTuple<R> = AttachValueTypeAtPath<
  R,
  RecordPaths<R>
>;

/**
 * Calculates all possible paths from the root to the *leaf* nodes within a nested record `R`,
 * using specific number literal indices for tuples. Leaf nodes are values that are not records or tuples.
 * @template R - The record or tuple type.
 * @returns A union of readonly tuples representing paths to leaf nodes.
 * @example
 * type Data = { a: { b: [string, { d: boolean }]; c: number } };
 * type LP = LeafPaths<Data>;
 * // LP = readonly ["a", "b", 0] | readonly ["a", "b", 1, "d"] | readonly ["a", "c"]
 */
export type RecordLeafPaths<R> = R extends readonly unknown[]
  ? LeafPathsImplListCase<R, keyof R>
  : R extends UnknownRecord
    ? LeafPathsImplRecordCase<R, keyof R>
    : readonly [];

/**
 * Calculates all possible paths from the root to the *leaf* nodes within a nested record `R`,
 * allowing `number` as an index type for arrays. Leaf nodes are values that are not records or arrays.
 * @template R - The record or array type.
 * @returns A union of readonly tuples representing paths to leaf nodes, using `number` for array indices.
 * @example
 * type Data = { a: { b: string[]; c: number } };
 * type LP = LeafPathsWithIndex<Data>;
 * // LP = readonly ["a", "b", number] | readonly ["a", "c"]
 */
export type RecordLeafPathsWithIndex<R> = R extends readonly unknown[]
  ? LeafPathsWithIndexImplListCase<R, keyof R>
  : R extends UnknownRecord
    ? LeafPathsWithIndexImplRecordCase<R, keyof R>
    : readonly [];

/**
 * Creates a new record type based on `R`, where the value at the specified `Path` (using specific tuple indices)
 * is updated to have the type `ValueAfter`.
 * @template R - The original record or tuple type.
 * @template Path - The path to the value to update (from `Paths<R>`).
 * @template ValueAfter - The new type for the value at the path.
 * @returns A new record or tuple type with the updated value type at the specified path.
 * @example
 * type Data = { a: { b: [string, boolean] } };
 * type Updated = RecordUpdated<Data, ['a', 'b', 1], number>;
 * // Updated = { readonly a: { readonly b: readonly [string, number]; }; }
 * type UpdatedRoot = RecordUpdated<Data, [], null>; // null
 */
export type RecordUpdated<
  R,
  Path extends RecordPaths<R>,
  ValueAfter,
> = Path extends readonly [] // Base case: empty path means update the root
  ? ValueAfter
  : R extends readonly unknown[] // Is R a tuple/array?
    ? RecordUpdatedImplTupleCase<R, Path, ValueAfter> // Use tuple logic
    : R extends UnknownRecord // Is R a record?
      ? RecordUpdatedImplRecordCase<R, Path, ValueAfter> // Use record logic
      : R; // Not a record or tuple, return as is

/**
 * Extracts the type of the value at a specific `Path` within a nested record `R`.
 * Uses specific number literal indices for tuples.
 * @template R - The record or tuple type.
 * @template Path - The path to the value (from `Paths<R>`).
 * @returns The type of the value at the specified path. Returns `R` if `Path` is `[]`.
 * @example
 * type Data = { a: { b: [string, boolean] } };
 * type V1 = RecordValueAtPath<Data, ['a', 'b', 0]>; // string
 * type V2 = RecordValueAtPath<Data, ['a']>; // { b: [string, boolean] }
 * type V3 = RecordValueAtPath<Data, []>; // { a: { b: [string, boolean] } }
 */
export type RecordValueAtPath<
  R,
  Path extends RecordPaths<R>,
> = Path extends readonly [infer Head, ...infer Rest] // Deconstruct the path
  ? Head extends keyof R // Is the head a valid key/index?
    ? Rest extends RecordPaths<R[Head]> // Is the rest a valid path within the nested value?
      ? RecordValueAtPath<R[Head], Rest> // Recurse into the nested value
      : never // Invalid rest path
    : never // Invalid head key/index
  : R; // Base case: empty path returns the current record/value R

/**
 * Extracts the type of the value at a specific `Path` within a nested record `R`.
 * Allows `number` as an index type for arrays. May include `undefined` in the result
 * if the path involves a `number` index (as array elements might not exist at runtime).
 * @template R - The record or array type.
 * @template Path - The path to the value (from `PathsWithIndex<R>`).
 * @returns The type of the value at the specified path, potentially including `undefined`. Returns `R` if `Path` is `[]`.
 * @example
 * type Data = { a: { b: string[]; c: number } };
 * type V1 = RecordValueAtPathWithIndex<Data, ['a', 'b', number]>; // string | undefined
 * type V2 = RecordValueAtPathWithIndex<Data, ['a', 'c']>; // number
 * type V3 = RecordValueAtPathWithIndex<Data, []>; // { a: { b: string[]; c: number } }
 */
export type RecordValueAtPathWithIndex<
  R,
  Path extends RecordPathsWithIndex<R>,
> = RecordValueAtPathWithIndexImpl<R, Path, never>;

/**
 * @internal Attaches the value type found at a specific `Path` within `R` to the path itself.
 * @template R - The record type.
 * @template Path - A specific path within `R` (from `Paths<R>`).
 * @returns A readonly tuple `[Path, ValueType]`.
 */
type AttachValueTypeAtPath<R, Path extends RecordPaths<R>> = Path extends Path
  ? readonly [Path, RecordValueAtPath<R, Path>]
  : never;

/**
 * @internal Recursive implementation helper for `LeafPaths` when dealing with tuples/arrays.
 * Uses specific numeric indices.
 * @template T - The tuple or array type.
 * @template PathHead - The current key/index being processed.
 * @returns A union of readonly tuples representing leaf paths starting from `PathHead`.
 */
type LeafPathsImplListCase<
  T extends readonly unknown[],
  PathHead extends keyof T,
> = T extends readonly [] // Base case: empty tuple has no paths
  ? readonly []
  : IsNotFixedLengthList<T> extends true // If it's a general array, treat as leaf (no deeper paths)
    ? readonly []
    : PathHead extends keyof T // Iterate through keys/indices
      ? PathHead extends `${number}` // Is the key a numeric index?
        ? readonly [ToNumber<PathHead>, ...RecordLeafPaths<T[PathHead]>] // Recurse into the element at that index
        : never // Ignore non-numeric keys like 'length'
      : never;

/**
 * @internal Recursive implementation helper for `LeafPaths` when dealing with records.
 * @template R - The record type.
 * @template PathHead - The current key being processed.
 * @returns A union of readonly tuples representing leaf paths starting from `PathHead`.
 */
type LeafPathsImplRecordCase<
  R extends UnknownRecord,
  PathHead extends keyof R,
> = string extends PathHead // Avoid distributing over `string` index signature
  ? readonly []
  : PathHead extends keyof R // Iterate through keys
    ? readonly [PathHead, ...RecordLeafPaths<R[PathHead]>] // Recurse into the value associated with the key
    : never;

/**
 * @internal Recursive implementation helper for `LeafPathsWithIndex` when dealing with tuples/arrays.
 * Uses `number` for general array indices.
 * @template T - The tuple or array type.
 * @template PathHead - The current key/index being processed.
 * @returns A union of readonly tuples representing leaf paths starting from `PathHead`.
 */
type LeafPathsWithIndexImplListCase<
  T extends readonly unknown[],
  PathHead extends keyof T,
> = T extends readonly [] // Base case: empty tuple has no paths
  ? readonly []
  : IsNotFixedLengthList<T> extends true // Is it a general array?
    ? readonly [number, ...RecordLeafPathsWithIndex<T[number]>] // Use `number` index and recurse into the element type
    : PathHead extends keyof T // Iterate through tuple indices
      ? PathHead extends `${number}` // Is the key a numeric index?
        ? readonly [
            ToNumber<PathHead>,
            ...RecordLeafPathsWithIndex<T[PathHead]>,
          ] // Recurse using the specific index
        : never // Ignore non-numeric keys
      : never;

/**
 * @internal Recursive implementation helper for `LeafPathsWithIndex` when dealing with records.
 * @template R - The record type.
 * @template PathHead - The current key being processed.
 * @returns A union of readonly tuples representing leaf paths starting from `PathHead`.
 */
type LeafPathsWithIndexImplRecordCase<
  R extends UnknownRecord,
  PathHead extends keyof R,
> = PathHead extends keyof R // Iterate through keys
  ? readonly [PathHead, ...RecordLeafPathsWithIndex<R[PathHead]>] // Recurse into the value associated with the key
  : never;

/**
 * @internal Recursive implementation helper for `RecordUpdated` when dealing with records.
 * @template R - The record type.
 * @template Path - The remaining path.
 * @template ValueAfter - The new value type.
 * @returns The updated record type.
 */
type RecordUpdatedImplRecordCase<
  R extends UnknownRecord,
  Path extends RecordPaths<R>,
  ValueAfter,
> = Path extends readonly [infer Head, ...infer Rest] // Deconstruct the path
  ? Head extends keyof R // Is the head a valid key?
    ? Rest extends RecordPaths<R[Head]> // Is the rest a valid path within the nested value?
      ? {
          // Map over the original record keys
          readonly [Key in keyof R]: Key extends Head // If the key matches the path head
            ? RecordUpdated<R[Head], Rest, ValueAfter> // Recurse to update the nested value
            : R[Key]; // Otherwise, keep the original value type
        }
      : never // Invalid rest path
    : never // Invalid head key
  : never; // Path should not be empty here (handled in RecordUpdated)

/**
 * @internal Recursive implementation helper for `RecordUpdated` when dealing with tuples.
 * @template T - The tuple type.
 * @template Path - The remaining path.
 * @template ValueAfter - The new value type.
 * @returns The updated tuple type.
 */
type RecordUpdatedImplTupleCase<
  T extends readonly unknown[],
  Path extends RecordPaths<T>,
  ValueAfter,
> = Path extends readonly [infer Head, ...infer Rest] // Deconstruct the path
  ? Head extends IndexOfTuple<T> // Is the head a valid numeric index for the tuple?
    ? Rest extends RecordPaths<T[Head]> // Is the rest a valid path within the nested value?
      ? // Use Tuple.SetAt to update the element at the specific index
        Tuple.SetAt<T, Head, RecordUpdated<T[Head], Rest, ValueAfter>>
      : never // Invalid rest path
    : never // Invalid head index
  : never; // Path should not be empty here (handled in RecordUpdated)

/**
 * @internal Recursive implementation helper for `RecordValueAtPathWithIndex`.
 * Tracks the last path element to determine if `undefined` should be added for `number` indices.
 * @template R - The current record/value being traversed.
 * @template Path - The remaining path.
 * @template LastPathElement - The previous path element processed (key or index).
 * @returns The type of the value, potentially including `undefined`.
 */
type RecordValueAtPathWithIndexImpl<
  R,
  Path extends RecordPathsWithIndex<R>,
  LastPathElement,
> = Path extends readonly [infer Head, ...infer Rest] // Deconstruct the path
  ? Head extends keyof R // Is the head a valid key/index?
    ? Rest extends RecordPathsWithIndex<R[Head]> // Is the rest a valid path within the nested value?
      ? // Recurse, passing the nested value, rest of path, and current head as the new LastPathElement
        RecordValueAtPathWithIndexImpl<R[Head], Rest, Head>
      : never // Invalid rest path
    : never // Invalid head key/index
  : // Base case: Path is empty, determine return type based on LastPathElement
    number extends LastPathElement // Was the last step accessing an array with `number` index?
    ? R | undefined // Yes, the value might be undefined at runtime
    : string extends LastPathElement // Was the last step accessing via `string` index signature?
      ? R | undefined // Yes, the value might be undefined
      : R; // No, it was a specific key/index, return the value type R

expectType<
  RecordPathPrefixes<readonly [1, 2, 3]>,
  readonly [] | readonly [1, 2, 3] | readonly [1, 2] | readonly [1]
>('=');

expectType<RecordPathPrefixes<[]>, readonly []>('=');
