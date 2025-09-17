import { Optional } from '../functional/index.mjs';
import { asUint32 } from '../number/index.mjs';
import { tp, unknownToString } from '../others/index.mjs';

/**
 * Interface for an immutable map with O(1) lookup performance and functional programming patterns.
 *
 * This interface defines all methods and properties available on IMap instances. All operations
 * that modify the map return new IMap instances, preserving immutability. The underlying implementation
 * uses JavaScript's native Map for O(1) average-case performance on get, set, has, and delete operations.
 *
 * **Immutability Guarantees:**
 * - All mutation operations (set, delete, update) return new IMap instances
 * - Original IMap instances are never modified
 * - Safe for concurrent access and functional programming patterns
 *
 * **Performance Characteristics:**
 * - get/has/delete: O(1) average case
 * - set: O(1) average case
 * - map/filter operations: O(n)
 * - Iteration: O(n)
 *
 * @template K The type of the keys in the map. Must extend MapSetKeyType (string, number, boolean, etc.)
 * @template V The type of the values in the map.
 *
 * @example
 * ```typescript
 * // This is a type alias describing an interface, so it's not directly instantiated.
 * // See IMap.create for examples of creating IMap instances that conform to this interface.
 *
 * // Example of how you might use a variable that implements this structure:
 * declare const userMap: IMap<string, User>;
 *
 * // Immutable operations - original map is never modified
 * const hasUser = userMap.has("alice");                    // O(1)
 * const user = userMap.get("alice").unwrapOr(defaultUser); // O(1)
 * const newMap = userMap.set("bob", newUser);              // O(1) - returns new IMap
 * const updated = userMap.update("alice", u => ({ ...u, active: true })); // O(1)
 *
 * // Functional transformations
 * const activeUsers = userMap.map((user, id) => ({ ...user, lastSeen: Date.now() })); // O(n)
 * ```
 */
type IMapInterface<K extends MapSetKeyType, V> = Readonly<{
  // Getting information

  /** The number of elements in the map. */
  size: SizeType.Arr;

  /**
   * Checks if a key exists in the map.
   * Allows for wider literal types for keys during checking.
   * @param key The key to check.
   * @returns `true` if the key exists, `false` otherwise.
   */
  has: (key: K | (WidenLiteral<K> & {})) => boolean;

  /**
   * Retrieves the value associated with a key.
   * @param key The key to retrieve.
   * @returns The value associated with the key wrapped with Optional.some, or `Optional.none` if the key does not exist.
   */
  get: (key: K | (WidenLiteral<K> & {})) => Optional<V>;

  // Reducing a value

  /**
   * Checks if all elements in the map satisfy a predicate.
   * @param predicate A function to test each key-value pair.
   * @returns `true` if all elements satisfy the predicate, `false` otherwise.
   */
  every: ((predicate: (value: V, key: K) => boolean) => boolean) &
    /**
     * Checks if all elements in the map satisfy a type predicate.
     * Narrows the type of values in the map if the predicate returns true for all elements.
     * @template W The narrowed type of the values.
     * @param predicate A type predicate function.
     * @returns `true` if all elements satisfy the predicate, `false` otherwise.
     */
    (<W extends V>(
      predicate: (value: V, key: K) => value is W,
    ) => this is IMap<K, W>);

  /**
   * Checks if at least one element in the map satisfies a predicate.
   * @param predicate A function to test each key-value pair.
   * @returns `true` if at least one element satisfies the predicate, `false` otherwise.
   */
  some: (predicate: (value: V, key: K) => boolean) => boolean;

  // Mutation
  /**
   * Deletes a key-value pair from the map.
   * @param key The key to delete.
   * @returns A new IMap instance without the specified key.
   */
  delete: (key: K) => IMap<K, V>;

  /**
   * Sets a key-value pair in the map.
   * @param key The key to set.
   * @param value The value to associate with the key.
   * @returns A new IMap instance with the specified key-value pair.
   */
  set: (key: K, value: V) => IMap<K, V>;

  /**
   * Updates the value associated with a key using an updater function.
   * @param key The key whose value to update.
   * @param updater A function that takes the current value and returns the new value.
   * @returns A new IMap instance with the updated value.
   */
  update: (key: K, updater: (value: V) => V) => IMap<K, V>;

  /**
   * Applies a series of mutations to the map.
   * @param actions An array of mutation actions (delete, set, or update).
   * @returns A new IMap instance with all mutations applied.
   */
  withMutations: (
    actions: readonly Readonly<
      | { type: 'delete'; key: K }
      | { type: 'set'; key: K; value: V }
      | { type: 'update'; key: K; updater: (value: V) => V }
    >[],
  ) => IMap<K, V>;

  // Sequence algorithms

  /**
   * Maps the values of the map to new values.
   * @template V2 The type of the new values.
   * @param mapFn A function that maps a value and key to a new value.
   * @returns A new IMap instance with mapped values.
   */
  map: <V2>(mapFn: (value: V, key: K) => V2) => IMap<K, V2>;

  /**
   * Maps the keys of the map to new keys.
   * @template K2 The type of the new keys.
   * @param mapFn A function that maps a key to a new key.
   * @returns A new IMap instance with mapped keys and original values.
   */
  mapKeys: <K2 extends MapSetKeyType>(mapFn: (key: K) => K2) => IMap<K2, V>;

  /**
   * Maps the entries (key-value pairs) of the map to new entries.
   * @template K2 The type of the new keys in the entries.
   * @template V2 The type of the new values in the entries.
   * @param mapFn A function that maps an entry to a new entry.
   * @returns A new IMap instance with mapped entries.
   */
  mapEntries: <K2 extends MapSetKeyType, V2>(
    mapFn: (entry: readonly [K, V]) => readonly [K2, V2],
  ) => IMap<K2, V2>;

  // Side effects

  /**
   * Executes a callback function for each key-value pair in the map.
   * @param callbackfn A function to execute for each element.
   */
  forEach: (callbackfn: (value: V, key: K) => void) => void;

  // Iterators
  /**
   * Returns an iterator for the keys in the map.
   * @returns An iterable iterator of keys.
   */
  keys: () => IterableIterator<K>;

  /**
   * Returns an iterator for the values in the map.
   * @returns An iterable iterator of values.
   */
  values: () => IterableIterator<V>;

  /**
   * Returns an iterator for the entries (key-value pairs) in the map.
   * @returns An iterable iterator of entries.
   */
  entries: () => IterableIterator<readonly [K, V]>;

  // Conversion

  /**
   * Converts the keys of the map to an array.
   * @returns A readonly array of keys.
   */
  toKeysArray: () => readonly K[];

  /**
   * Converts the values of the map to an array.
   * @returns A readonly array of values.
   */
  toValuesArray: () => readonly V[];

  /**
   * Converts the entries (key-value pairs) of the map to an array.
   * @returns A readonly array of entries.
   */
  toEntriesArray: () => readonly (readonly [K, V])[];

  /**
   * Converts the map to an array of entries (key-value pairs).
   * Alias for `toEntriesArray`.
   * @returns A readonly array of entries.
   */
  toArray: () => readonly (readonly [K, V])[];

  /**
   * Returns the underlying readonly JavaScript Map.
   * @returns The raw ReadonlyMap instance.
   */
  toRawMap: () => ReadonlyMap<K, V>;
}>;

/**
 * Represents an immutable map with high-performance operations and functional programming support.
 *
 * IMap is a persistent data structure that provides all the functionality of JavaScript's Map
 * while maintaining immutability. All operations that would normally mutate the map instead
 * return new IMap instances, making it safe for functional programming and concurrent access.
 *
 * **Key Features:**
 * - **Immutable**: All mutation operations return new instances
 * - **High Performance**: O(1) average-case for get/set/has/delete operations
 * - **Type Safe**: Full TypeScript support with generic key/value types
 * - **Iterable**: Implements standard JavaScript iteration protocols
 * - **Functional**: Rich API for map, filter, reduce-style operations
 *
 * **When to Use:**
 * - State management in functional applications
 * - Caching with immutable guarantees
 * - Data structures that need to be shared across components
 * - When you need Map functionality but want immutability
 *
 * @template K The type of the keys in the map. Must extend MapSetKeyType.
 * @template V The type of the values in the map.
 *
 * @example
 * ```typescript
 * // Create an immutable map with initial data
 * let userPreferences = IMap.create<string, UserPreference>([
 *   ["theme", { value: "dark", lastModified: Date.now() }],
 *   ["language", { value: "en", lastModified: Date.now() }]
 * ]);
 *
 * console.log(userPreferences.get("theme").unwrapOr(defaultPreference));
 * console.log(userPreferences.size); // Output: 2
 *
 * // All operations return new instances - original is unchanged
 * const updated = userPreferences
 *   .set("notifications", { value: true, lastModified: Date.now() })
 *   .update("theme", pref => ({ ...pref, value: "light" }));
 *
 * console.log(userPreferences.has("notifications")); // false (original unchanged)
 * console.log(updated.has("notifications"));         // true (new instance)
 *
 * // Efficient iteration and transformation
 * for (const [key, preference] of updated) {
 *   console.log(`${key}: ${preference.value}`);
 * }
 *
 * // Functional transformations
 * const withTimestamps = updated.map((pref, key) => ({
 *   ...pref,
 *   accessedAt: Date.now()
 * }));
 *
 * // Type-safe operations with narrowing
 * const stringKeys = IMap.create<number | string, any>([[1, "a"], ["b", 2]]);
 * const onlyStringKeys = stringKeys.mapKeys(key =>
 *   typeof key === "string" ? key : key.toString()
 * );
 * ```
 */
export type IMap<K extends MapSetKeyType, V> = Iterable<readonly [K, V]> &
  IMapInterface<K, V>;

/**
 * Provides utility functions for IMap.
 */
export namespace IMap {
  /**
   * Creates a new IMap instance from an iterable of key-value pairs.
   *
   * This factory function accepts any iterable of [key, value] tuples, including arrays,
   * JavaScript Maps, other IMaps, or custom iterables. The resulting IMap will contain
   * all the entries from the input iterable.
   *
   * **Performance:** O(n) where n is the number of entries in the iterable.
   *
   * @template K The type of the keys. Must extend MapSetKeyType.
   * @template V The type of the values.
   * @param iterable An iterable of key-value pairs (e.g., Array, Map, IMap, etc.)
   * @returns A new IMap instance containing all entries from the iterable.
   *
   * @example
   * ```typescript
   * // From array of tuples
   * const userScores = IMap.create<string, number>([
   *   ["alice", 95],
   *   ["bob", 87],
   *   ["charlie", 92]
   * ]);
   * console.log(userScores.get("alice").unwrap()); // Output: 95
   *
   * // From JavaScript Map
   * const jsMap = new Map([["config", { debug: true }], ["env", "production"]]);
   * const config = IMap.create(jsMap);
   * console.log(config.get("env").unwrap()); // Output: "production"
   *
   * // From another IMap (creates a copy)
   * const originalMap = IMap.create<string, boolean>([["enabled", true]]);
   * const copiedMap = IMap.create(originalMap);
   * console.log(copiedMap.get("enabled").unwrap()); // Output: true
   *
   * // Empty map
   * const emptyMap = IMap.create<string, number>([]);
   * console.log(emptyMap.size); // Output: 0
   *
   * // From custom iterable
   * function* generateEntries(): Generator<[string, number]> {
   *   for (const i of range(3)) {
   *     yield [`item${i}`, i * 10];
   *   }
   * }
   * const generatedMap = IMap.create(generateEntries());
   * console.log(generatedMap.size); // Output: 3
   * ```
   */
  export const create = <K extends MapSetKeyType, V>(
    iterable: Iterable<readonly [K, V]>,
  ): IMap<K, V> => new IMapClass<K, V>(iterable);

  /**
   * Checks if two IMap instances are structurally equal.
   *
   * Two IMaps are considered equal if they have the same size and contain exactly the same
   * key-value pairs. The order of entries does not matter for equality comparison.
   * Values are compared using JavaScript's `===` operator.
   *
   * **Performance:** O(n) where n is the size of the smaller map.
   *
   * @template K The type of the keys.
   * @template V The type of the values.
   * @param a The first IMap instance to compare.
   * @param b The second IMap instance to compare.
   * @returns `true` if the maps contain exactly the same key-value pairs, `false` otherwise.
   *
   * @example
   * ```typescript
   * // Basic equality comparison
   * const preferences1 = IMap.create<string, boolean>([
   *   ["darkMode", true],
   *   ["notifications", false]
   * ]);
   * const preferences2 = IMap.create<string, boolean>([
   *   ["darkMode", true],
   *   ["notifications", false]
   * ]);
   * const preferences3 = IMap.create<string, boolean>([
   *   ["notifications", false],
   *   ["darkMode", true]  // Order doesn't matter
   * ]);
   *
   * console.log(IMap.equal(preferences1, preferences2)); // true
   * console.log(IMap.equal(preferences1, preferences3)); // true (order doesn't matter)
   *
   * // Different values
   * const preferences4 = IMap.create<string, boolean>([
   *   ["darkMode", false],  // Different value
   *   ["notifications", false]
   * ]);
   * console.log(IMap.equal(preferences1, preferences4)); // false
   *
   * // Different keys
   * const preferences5 = IMap.create<string, boolean>([
   *   ["darkMode", true],
   *   ["sounds", false]  // Different key
   * ]);
   * console.log(IMap.equal(preferences1, preferences5)); // false
   *
   * // Empty maps
   * const empty1 = IMap.create<string, number>([]);
   * const empty2 = IMap.create<string, number>([]);
   * console.log(IMap.equal(empty1, empty2)); // true
   *
   * // Note: For deep equality of object values, use a custom comparison
   * const users1 = IMap.create<string, User>([["1", { name: "Alice" }]]);
   * const users2 = IMap.create<string, User>([["1", { name: "Alice" }]]);
   * console.log(IMap.equal(users1, users2)); // false (different object references)
   * ```
   */
  export const equal = <K extends MapSetKeyType, V>(
    a: IMap<K, V>,
    b: IMap<K, V>,
  ): boolean => a.size === b.size && a.every((v, k) => b.get(k) === v);
}

/**
 * Internal class implementation for IMap providing immutable map operations.
 *
 * This class implements the IMap interface using JavaScript's native Map as the underlying
 * storage mechanism for optimal performance. All mutation operations create new instances
 * rather than modifying the existing map, ensuring immutability.
 *
 * **Implementation Details:**
 * - Uses ReadonlyMap<K, V> internally for type safety and performance
 * - Implements copy-on-write semantics for efficiency
 * - Provides optional debug messaging for development
 *
 * @template K The type of the keys. Must extend MapSetKeyType.
 * @template V The type of the values.
 * @implements IMap
 * @implements Iterable
 * @internal This class should not be used directly. Use IMap.create() instead.
 */
class IMapClass<K extends MapSetKeyType, V>
  implements IMap<K, V>, Iterable<readonly [K, V]>
{
  readonly #map: ReadonlyMap<K, V>;
  readonly #showNotFoundMessage: boolean;

  /**
   * Constructs an IMapClass instance with the given entries.
   *
   * @param iterable An iterable of key-value pairs to populate the map.
   * @param showNotFoundMessage Whether to log warning messages when operations
   *                           are performed on non-existent keys. Useful for debugging.
   *                           Defaults to false for production use.
   * @internal Use IMap.create() instead of calling this constructor directly.
   */
  constructor(
    iterable: Iterable<readonly [K, V]>,
    showNotFoundMessage: boolean = false,
  ) {
    this.#map = new Map(iterable);
    this.#showNotFoundMessage = showNotFoundMessage;
  }

  /** @inheritdoc */
  get size(): SizeType.Arr {
    return asUint32(this.#map.size);
  }

  /** @inheritdoc */
  has(key: K | (WidenLiteral<K> & {})): boolean {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return this.#map.has(key as K);
  }

  /** @inheritdoc */
  get(key: K | (WidenLiteral<K> & {})): Optional<V> {
    if (!this.has(key)) return Optional.none;
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion, @typescript-eslint/no-non-null-assertion
    return Optional.some(this.#map.get(key as K)!);
  }

  /** @inheritdoc */
  every<W extends V>(
    predicate: (value: V, key: K) => value is W,
  ): this is IMap<K, W>;
  /** @inheritdoc */
  every(predicate: (value: V, key: K) => boolean): boolean;
  /** @inheritdoc */
  every(predicate: (value: V, key: K) => boolean): boolean {
    for (const [k, v] of this.entries()) {
      if (!predicate(v, k)) return false;
    }

    return true;
  }

  /** @inheritdoc */
  some(predicate: (value: V, key: K) => boolean): boolean {
    for (const [k, v] of this.entries()) {
      if (predicate(v, k)) return true;
    }

    return false;
  }

  /** @inheritdoc */
  delete(key: K): IMap<K, V> {
    if (!this.has(key)) {
      if (this.#showNotFoundMessage) {
        const keyStr = unknownToString(key);
        console.warn(`IMap.delete: key not found: ${keyStr}`);
      }
      return this;
    }

    return IMap.create(
      Array.from(this.#map).filter(([k]) => !Object.is(k, key)),
    );
  }

  /** @inheritdoc */
  set(key: K, value: V): IMap<K, V> {
    if (value === this.get(key)) return this; // has no changes
    if (!this.has(key)) {
      return IMap.create([...this.#map, tp(key, value)]);
    } else {
      return IMap.create(
        Array.from(this.#map, ([k, v]) => tp(k, Object.is(k, key) ? value : v)),
      );
    }
  }

  /** @inheritdoc */
  update(key: K, updater: (value: V) => V): IMap<K, V> {
    const curr = this.get(key);

    if (Optional.isNone(curr)) {
      if (this.#showNotFoundMessage) {
        const keyStr = unknownToString(key);
        console.warn(`IMap.update: key not found: ${keyStr}`);
      }
      return this;
    }

    return IMap.create(
      Array.from(this.#map, ([k, v]) =>
        tp(k, Object.is(k, key) ? updater(curr.value) : v),
      ),
    );
  }

  /** @inheritdoc */
  withMutations(
    actions: readonly Readonly<
      | { type: 'delete'; key: K }
      | { type: 'set'; key: K; value: V }
      | { type: 'update'; key: K; updater: (value: V) => V }
    >[],
  ): IMap<K, V> {
    const mut_result = new Map<K, V>(this.#map);

    for (const action of actions) {
      switch (action.type) {
        case 'delete':
          mut_result.delete(action.key);
          break;

        case 'set':
          mut_result.set(action.key, action.value);
          break;

        case 'update': {
          const { key } = action;

          const curr = mut_result.get(key);

          if (!mut_result.has(key) || curr === undefined) {
            if (this.#showNotFoundMessage) {
              const keyStr = unknownToString(key);
              console.warn(`IMap.withMutations: key not found: ${keyStr}`);
            }
            break;
          }

          mut_result.set(key, action.updater(curr));

          break;
        }
      }
    }

    return IMap.create(mut_result);
  }

  /** @inheritdoc */
  map<V2>(mapFn: (value: V, key: K) => V2): IMap<K, V2> {
    return IMap.create(this.toArray().map(([k, v]) => tp(k, mapFn(v, k))));
  }

  /** @inheritdoc */
  mapKeys<K2 extends MapSetKeyType>(mapFn: (key: K) => K2): IMap<K2, V> {
    return IMap.create(this.toArray().map(([k, v]) => tp(mapFn(k), v)));
  }

  /** @inheritdoc */
  mapEntries<K2 extends MapSetKeyType, V2>(
    mapFn: (entry: readonly [K, V]) => readonly [K2, V2],
  ): IMap<K2, V2> {
    return IMap.create(this.toArray().map(mapFn));
  }

  /** @inheritdoc */
  forEach(callbackfn: (value: V, key: K) => void): void {
    for (const [key, value] of this.#map.entries()) {
      callbackfn(value, key);
    }
  }

  /**
   * @inheritdoc
   */
  [Symbol.iterator](): Iterator<readonly [K, V]> {
    return this.#map[Symbol.iterator]();
  }

  /** @inheritdoc */
  keys(): IterableIterator<K> {
    return this.#map.keys();
  }

  /** @inheritdoc */
  values(): IterableIterator<V> {
    return this.#map.values();
  }

  /** @inheritdoc */
  entries(): IterableIterator<readonly [K, V]> {
    return this.#map.entries();
  }

  /** @inheritdoc */
  toKeysArray(): readonly K[] {
    return Array.from(this.keys());
  }

  /** @inheritdoc */
  toValuesArray(): readonly V[] {
    return Array.from(this.values());
  }

  /** @inheritdoc */
  toEntriesArray(): readonly (readonly [K, V])[] {
    return Array.from(this.entries());
  }

  /** @inheritdoc */
  toArray(): readonly (readonly [K, V])[] {
    return Array.from(this.entries());
  }

  /** @inheritdoc */
  toRawMap(): ReadonlyMap<K, V> {
    return this.#map;
  }
}
