/**
 * Deeply picks a nested property from an object type along the specified key path.
 * Supports union of paths to pick multiple nested properties.
 * When one path is a prefix of another (e.g., `['a'] | ['a', 'b']`), the shorter path
 * takes precedence and the entire subtree is included.
 *
 * @template T - The object type to pick from.
 * @template Path - A tuple representing the key path, or a union of such tuples.
 * @returns A new object type containing only the properties along the specified path(s).
 *
 * @example
 * ```ts
 * type Data = { a: { b: { c: number; d: string } }; e: boolean };
 * type Picked = DeepPick<Data, ['a', 'b', 'c']>;
 * // Result: { a: { b: { c: number } } }
 *
 * type Multi = DeepPick<Data, ['a', 'b', 'c'] | ['e']>;
 * // Result: { a: { b: { c: number } }; e: boolean }
 * ```
 */
type DeepPick<T, Path extends readonly PropertyKey[]> = {
  [K in keyof T as K extends TSTypeForgeInternals.DeepPickOmitHead<Path>
    ? K
    : never]: TSTypeForgeInternals.DeepPickValue<
    T[K],
    TSTypeForgeInternals.DeepPickOmitTail<Path, K>
  >;
};

/**
 * Deeply omits a nested property from an object type along the specified key path.
 * Supports union of paths to omit multiple nested properties.
 * When one path is a prefix of another (e.g., `['a'] | ['a', 'b']`), the shorter path
 * takes precedence and the entire subtree is removed.
 *
 * @template T - The object type to omit from.
 * @template Path - A tuple representing the key path, or a union of such tuples.
 * @returns A new object type with the properties along the specified path(s) removed.
 *
 * @example
 * ```ts
 * type Data = { a: { b: { c: number; d: string } }; e: boolean };
 * type Omitted = DeepOmit<Data, ['a', 'b', 'c']>;
 * // Result: { a: { b: { d: string } }; e: boolean }
 *
 * type Multi = DeepOmit<Data, ['a', 'b'] | ['a', 'c']>;
 * // Result: { a: { d: boolean } }
 * ```
 */
type DeepOmit<T, Path extends readonly PropertyKey[]> = {
  [K in keyof T as K extends TSTypeForgeInternals.DeepOmitLeafKeys<Path>
    ? never
    : K]: TSTypeForgeInternals.DeepOmitValue<
    T[K],
    TSTypeForgeInternals.DeepPickOmitTail<Path, K>
  >;
};

declare namespace TSTypeForgeInternals {
  /**
   * @internal Extracts the first element from each path in a union of paths.
   */
  type DeepPickOmitHead<Path extends readonly PropertyKey[]> =
    Path extends readonly [infer H, ...(readonly PropertyKey[])] ? H : never;

  /**
   * @internal Extracts the tail (remaining elements) of paths that start with key K.
   */
  type DeepPickOmitTail<
    Path extends readonly PropertyKey[],
    K,
  > = Path extends readonly [K, ...infer Rest extends readonly PropertyKey[]]
    ? Rest
    : never;

  /**
   * @internal Computes the value type for DeepPick.
   * If any tail is empty (the key itself was picked), returns the full value.
   * Uses `[] extends Tail` to detect if the empty tuple is present in a union of tails
   * (e.g., `[] | ['b']` from paths `['a'] | ['a', 'b']`).
   * Uses `[NonNullable<T>]` to strip `undefined` added by optional property access
   * and prevent conditional type distribution.
   * If T is a primitive (non-record, non-array), returns `NonNullable<unknown>` (≡ `{}`)
   * to be consistent with RelaxedPick semantics where non-existent keys produce `{}`.
   * Otherwise recurses into the non-nullable part.
   */
  type DeepPickValue<T, Tail extends readonly PropertyKey[]> = [Tail] extends [
    never,
  ]
    ? T
    : [] extends Tail
      ? T
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [NonNullable<T>] extends [Record<string, any> | readonly unknown[]]
        ? DeepPick<NonNullable<T>, Tail>
        : NonNullable<unknown>;

  /**
   * @internal Extracts keys that should be removed (from paths of exactly length 1).
   */
  type DeepOmitLeafKeys<Path extends readonly PropertyKey[]> =
    Path extends readonly [infer K] ? K : never;

  /**
   * @internal Computes the value type for DeepOmit.
   * If tail is never (key not in any path), returns original value.
   * If tail includes empty (key is a leaf removal), returns original value
   * (key is filtered by `as` clause).
   * Uses `[NonNullable<T>]` to strip `undefined` added by optional property access
   * and prevent conditional type distribution.
   * If T is a primitive (non-record, non-array), returns T unchanged since
   * primitives have no meaningful properties to omit.
   * Otherwise recurses into the non-nullable part.
   */
  type DeepOmitValue<T, Tail extends readonly PropertyKey[]> = [Tail] extends [
    never,
  ]
    ? T
    : [] extends Tail
      ? T
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [NonNullable<T>] extends [Record<string, any> | readonly unknown[]]
        ? DeepOmit<NonNullable<T>, Tail>
        : T;
}
