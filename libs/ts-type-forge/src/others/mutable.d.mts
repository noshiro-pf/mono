/**
 * Makes all properties of an object type `T` mutable (removes the `readonly` modifier).
 * @template T - The object type to make mutable.
 * @example
 * type ReadonlyObj = { readonly a: string; readonly b: number };
 * type MutableObj = Mutable<ReadonlyObj>; // { a: string; b: number }
 */
type Mutable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Converts a `ReadonlyMap<K, V>` type to its mutable counterpart `Map<K, V>`.
 * @template T - A type extending `ReadonlyMap<any, any>`.
 * @example
 * type RMap = ReadonlyMap<string, number>;
 * type MMap = ToMutableMap<RMap>; // Map<string, number>
 */
type ToMutableMap<T extends ReadonlyMap<any, any>> =
  T extends ReadonlyMap<infer K, infer V> ? Map<K, V> : never;

/**
 * Converts a `ReadonlySet<V>` type to its mutable counterpart `Set<V>`.
 * @template T - A type extending `ReadonlySet<any>`.
 * @example
 * type RSet = ReadonlySet<string>;
 * type MSet = ToMutableSet<RSet>; // Set<string>
 */
type ToMutableSet<T extends ReadonlySet<any>> =
  T extends ReadonlySet<infer V> ? Set<V> : never;

/**
 * Alias for the standard `Set<K>` type. Represents a mutable set.
 * @template K - The type of elements in the set.
 */
type MutableSet<K> = Set<K>;

/**
 * Alias for the standard `Map<K, V>` type. Represents a mutable map.
 * @template K - The type of keys in the map.
 * @template V - The type of values in the map.
 */
type MutableMap<K, V> = Map<K, V>;
