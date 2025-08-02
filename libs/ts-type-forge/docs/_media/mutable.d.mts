/**
 * Makes all properties of an object type `T` mutable by removing the `readonly` modifier.
 * This utility is the opposite of TypeScript's built-in `Readonly<T>` utility type.
 *
 * Uses the `-readonly` modifier syntax to explicitly remove readonly modifiers
 * from all properties at the top level of the object type.
 *
 * @template T - The object type to make mutable.
 * @returns An object type with all readonly modifiers removed.
 *
 * @example
 * ```ts
 * type ReadonlyUser = {
 *   readonly id: number;
 *   readonly name: string;
 *   readonly email: string;
 * };
 *
 * type MutableUser = Mutable<ReadonlyUser>;
 * // Result: { id: number; name: string; email: string }
 *
 * const user: MutableUser = { id: 1, name: "Alice", email: "alice@example.com" };
 * user.name = "Alice Smith"; // ✓ allowed - property is mutable
 *
 * // Useful for creating editable versions of readonly data
 * type Config = Readonly<{ host: string; port: number; ssl: boolean }>;
 * type EditableConfig = Mutable<Config>; // { host: string; port: number; ssl: boolean }
 * ```
 */
type Mutable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Converts a `ReadonlyMap<K, V>` type to its mutable counterpart `Map<K, V>`.
 * Extracts the key and value types from the readonly map and creates a standard mutable Map.
 *
 * @template T - A type that extends `ReadonlyMap<any, any>`.
 * @returns The corresponding mutable `Map<K, V>` type.
 *
 * @example
 * ```ts
 * type ReadOnlyUserMap = ReadonlyMap<string, User>;
 * type MutableUserMap = ToMutableMap<ReadOnlyUserMap>; // Map<string, User>
 *
 * // Useful when you need to convert readonly collections to mutable ones
 * const convertToMutable = (readonlyMap: ReadonlyMap<string, number>): Map<string, number> => {
 *   return new Map(readonlyMap);
 * };
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToMutableMap<T extends ReadonlyMap<any, any>> =
  T extends ReadonlyMap<infer K, infer V> ? Map<K, V> : never;

/**
 * Converts a `ReadonlySet<V>` type to its mutable counterpart `Set<V>`.
 * Extracts the value type from the readonly set and creates a standard mutable Set.
 *
 * @template T - A type that extends `ReadonlySet<any>`.
 * @returns The corresponding mutable `Set<V>` type.
 *
 * @example
 * ```ts
 * type ReadOnlyStringSet = ReadonlySet<string>;
 * type MutableStringSet = ToMutableSet<ReadOnlyStringSet>; // Set<string>
 *
 * // Converting readonly collections to mutable ones
 * const convertToMutable = (readonlySet: ReadonlySet<string>): Set<string> => {
 *   return new Set(readonlySet);
 * };
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToMutableSet<T extends ReadonlySet<any>> =
  T extends ReadonlySet<infer V> ? Set<V> : never;

/**
 * Alias for the standard `Set<K>` type. Represents a mutable set collection.
 * Provided for consistency with naming conventions and to make intent explicit.
 *
 * @template K - The type of elements stored in the set.
 *
 * @example
 * ```ts
 * type TagSet = MutableSet<string>;
 * const tags: TagSet = new Set(['typescript', 'javascript', 'react']);
 * tags.add('vue'); // ✓ allowed - set is mutable
 * tags.delete('react'); // ✓ allowed
 * ```
 */
type MutableSet<K> = Set<K>;

/**
 * Alias for the standard `Map<K, V>` type. Represents a mutable map collection.
 * Provided for consistency with naming conventions and to make intent explicit.
 *
 * @template K - The type of keys in the map.
 * @template V - The type of values in the map.
 *
 * @example
 * ```ts
 * type UserCache = MutableMap<string, User>;
 * const cache: UserCache = new Map();
 * cache.set('user1', { id: 1, name: 'Alice' }); // ✓ allowed - map is mutable
 * cache.delete('user1'); // ✓ allowed
 * ```
 */
type MutableMap<K, V> = Map<K, V>;
