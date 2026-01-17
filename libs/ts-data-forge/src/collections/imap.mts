import { Optional, pipe } from '../functional/index.mjs';
import { asUint32 } from '../number/index.mjs';
import { tp, unknownToString } from '../others/index.mjs';

/**
 * Interface for an immutable map with lookup operations and functional
 * programming patterns.
 *
 * This interface defines all methods and properties available on IMap
 * instances. All operations that modify the map return new IMap instances,
 * preserving immutability. The underlying implementation uses JavaScript's
 * native Map but creates copies on mutations to maintain immutability.
 *
 * **Immutability Guarantees:**
 *
 * - All mutation operations (set, delete, update) return new IMap instances
 * - Original IMap instances are never modified
 * - Safe for concurrent access and functional programming patterns
 *
 * **Performance Characteristics:**
 *
 * - get/has: O(1) average case
 * - set/delete: O(n) due to copying for immutability
 * - map/filter operations: O(n)
 * - iteration: O(n)
 *
 * @template K The type of the keys in the map. Must extend MapSetKeyType
 *   (string, number, boolean, etc.)
 * @template V The type of the values in the map.
 */
type IMapInterface<K extends MapSetKeyType, V> = Readonly<{
  // Getting information

  /**
   * The number of elements in the map.
   *
   * @example
   *
   * ```ts
   * const entries = [
   *   ['a', 1],
   *   ['b', 2],
   * ] satisfies readonly (readonly [string, number])[];
   *
   * const map = IMap.create(entries);
   *
   * assert.isTrue(map.size === 2);
   * ```
   */
  size: SizeType.Arr;

  /**
   * Checks if a key exists in the map. Allows for wider literal types for keys
   * during checking.
   *
   * @example
   *
   * ```ts
   * const map = IMap.create<'id' | 'enabled', number | boolean>([
   *   ['id', 42],
   *   ['enabled', true],
   * ]);
   *
   * assert.isTrue(map.has('id'));
   *
   * assert.isFalse(map.has('missing'));
   * ```
   *
   * @param key The key to check.
   * @returns `true` if the key exists, `false` otherwise.
   */
  has: (key: K | (WidenLiteral<K> & {})) => boolean;

  /**
   * Retrieves the value associated with a key.
   *
   * @example
   *
   * ```ts
   * const map = IMap.create([['user', { id: 1 }]]);
   *
   * assert.deepStrictEqual(map.get('user'), Optional.some({ id: 1 }));
   *
   * assert.deepStrictEqual(map.get('missing'), Optional.none);
   * ```
   *
   * @param key The key to retrieve.
   * @returns The value associated with the key wrapped with Optional.some, or
   *   `Optional.none` if the key does not exist.
   */
  get: (key: K | (WidenLiteral<K> & {})) => Optional<V>;

  // Reducing a value

  /**
   * Checks if all elements in the map satisfy a predicate.
   *
   * @example
   *
   * ```ts
   * const map = IMap.create([
   *   ['a', 2],
   *   ['b', 4],
   * ]);
   *
   * const allEven = map.every((value) => value % 2 === 0);
   *
   * const isNarrowed = map.every((value): value is 2 | 4 => value % 2 === 0);
   *
   * assert.isTrue(allEven);
   *
   * assert.isTrue(isNarrowed);
   * ```
   *
   * @param predicate A function to test each key-value pair.
   * @returns `true` if all elements satisfy the predicate, `false` otherwise.
   */
  every: ((predicate: (value: V, key: K) => boolean) => boolean) &
    /**
     * Checks if all elements in the map satisfy a type predicate. Narrows the
     * type of values in the map if the predicate returns true for all
     * elements.
     *
     * @template W The narrowed type of the values.
     * @param predicate A type predicate function.
     * @returns `true` if all elements satisfy the predicate, `false` otherwise.
     */
    (<W extends V>(
      predicate: (value: V, key: K) => value is W,
    ) => this is IMap<K, W>);

  /**
   * Checks if at least one element in the map satisfies a predicate.
   *
   * @example
   *
   * ```ts
   * const entries = [
   *   ['alice', 3],
   *   ['bob', 5],
   * ] satisfies readonly (readonly [string, number])[];
   *
   * const map = IMap.create(entries);
   *
   * assert.isTrue(map.some((value) => value > 4));
   *
   * assert.isFalse(map.some((value) => value > 10));
   * ```
   *
   * @param predicate A function to test each key-value pair.
   * @returns `true` if at least one element satisfies the predicate, `false`
   *   otherwise.
   */
  some: (predicate: (value: V, key: K) => boolean) => boolean;

  // Mutation

  /**
   * Deletes a key-value pair from the map.
   *
   * @example
   *
   * ```ts
   * const original = IMap.create([
   *   ['a', 1],
   *   ['b', 2],
   * ]);
   *
   * const withoutB = original.delete('b');
   *
   * assert.deepStrictEqual(original.get('b'), Optional.some(2));
   *
   * assert.deepStrictEqual(withoutB.get('b'), Optional.none);
   *
   * assert.isTrue(original.size === 2);
   *
   * assert.isTrue(withoutB.size === 1);
   * ```
   *
   * @param key The key to delete.
   * @returns A new IMap instance without the specified key.
   */
  delete: (key: K) => IMap<K, V>;

  /**
   * Sets a key-value pair in the map.
   *
   * @example
   *
   * ```ts
   * const entries = [['count', 1]] satisfies readonly (readonly [
   *   'count' | 'status',
   *   number | string,
   * ])[];
   *
   * const base = IMap.create<'count' | 'status', number | string>(entries);
   *
   * const updated = base.set('count', 2);
   *
   * const extended = base.set('status', 'ok');
   *
   * assert.deepStrictEqual(base.get('count'), Optional.some(1));
   *
   * assert.deepStrictEqual(updated.get('count'), Optional.some(2));
   *
   * assert.deepStrictEqual(extended.get('status'), Optional.some('ok'));
   * ```
   *
   * @param key The key to set.
   * @param value The value to associate with the key.
   * @returns A new IMap instance with the specified key-value pair.
   */
  set: (key: K, value: V) => IMap<K, V>;

  /**
   * Updates the value associated with a key using an updater function.
   *
   * @example
   *
   * ```ts
   * const entries = [
   *   ['alice', 10],
   *   ['bob', 8],
   * ] satisfies readonly (readonly ['alice' | 'bob' | 'charlie', number])[];
   *
   * const scores = IMap.create<'alice' | 'bob' | 'charlie', number>(entries);
   *
   * const boosted = scores.update('alice', (value) => value + 5);
   *
   * const unchanged = scores.update('charlie', (value) => value + 1);
   *
   * assert.deepStrictEqual(boosted.get('alice'), Optional.some(15));
   *
   * assert.deepStrictEqual(scores.get('alice'), Optional.some(10));
   *
   * assert.isTrue(unchanged === scores);
   * ```
   *
   * @param key The key whose value to update.
   * @param updater A function that takes the current value and returns the new
   *   value.
   * @returns A new IMap instance with the updated value.
   */
  update: (key: K, updater: (value: V) => V) => IMap<K, V>;

  /**
   * Applies a series of mutations to the map.
   *
   * @example
   *
   * ```ts
   * const entries = [
   *   ['a', 1],
   *   ['b', 2],
   * ] satisfies readonly (readonly ['a' | 'b' | 'c', number])[];
   *
   * const base = IMap.create<'a' | 'b' | 'c', number>(entries);
   *
   * const actions: readonly Readonly<
   *   | { type: 'set'; key: 'c'; value: number }
   *   | { type: 'update'; key: 'b'; updater: (value: number) => number }
   *   | { type: 'delete'; key: 'a' }
   * >[] = [
   *   { type: 'set', key: 'c', value: 3 },
   *   { type: 'update', key: 'b', updater: (value) => value * 10 },
   *   { type: 'delete', key: 'a' },
   * ];
   *
   * const mutated = base.withMutations(actions);
   *
   * assert.deepStrictEqual(mutated.get('c'), Optional.some(3));
   *
   * assert.deepStrictEqual(mutated.get('b'), Optional.some(20));
   *
   * assert.deepStrictEqual(mutated.get('a'), Optional.none);
   *
   * assert.deepStrictEqual(base.get('b'), Optional.some(2));
   * ```
   *
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
   *
   * @example
   *
   * ```ts
   * const entries = [
   *   ['a', 1],
   *   ['b', 2],
   * ] satisfies readonly (readonly [string, number])[];
   *
   * const map = IMap.create(entries);
   *
   * const doubled = map.map((value) => value * 2);
   *
   * assert.deepStrictEqual(Array.from(doubled), [
   *   ['a', 2],
   *   ['b', 4],
   * ]);
   * ```
   *
   * @template V2 The type of the new values.
   * @param mapFn A function that maps a value and key to a new value.
   * @returns A new IMap instance with mapped values.
   */
  map: <V2>(mapFn: (value: V, key: K) => V2) => IMap<K, V2>;

  /**
   * Maps the keys of the map to new keys.
   *
   * @example
   *
   * ```ts
   * const entries = [
   *   ['first', 1],
   *   ['second', 2],
   * ] satisfies readonly (readonly [string, number])[];
   *
   * const map = IMap.create(entries);
   *
   * const upperKeys = map.mapKeys((key) => key.toUpperCase());
   *
   * assert.deepStrictEqual(Array.from(upperKeys), [
   *   ['FIRST', 1],
   *   ['SECOND', 2],
   * ]);
   * ```
   *
   * @template K2 The type of the new keys.
   * @param mapFn A function that maps a key to a new key.
   * @returns A new IMap instance with mapped keys and original values.
   */
  mapKeys: <K2 extends MapSetKeyType>(mapFn: (key: K) => K2) => IMap<K2, V>;

  /**
   * Maps the entries (key-value pairs) of the map to new entries.
   *
   * @example
   *
   * ```ts
   * const entries = [
   *   ['a', 1],
   *   ['b', 2],
   * ] satisfies readonly (readonly [string, number])[];
   *
   * const map = IMap.create(entries);
   *
   * const swapped = map.mapEntries(
   *   ([key, value]) => [value, key] satisfies readonly [number, string],
   * );
   *
   * assert.deepStrictEqual(Array.from(swapped), [
   *   [1, 'a'],
   *   [2, 'b'],
   * ]);
   * ```
   *
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
   *
   * @example
   *
   * ```ts
   * const map = IMap.create([
   *   ['a', 1],
   *   ['b', 2],
   * ]);
   *
   * const entries: (readonly [string, number])[] = [];
   *
   * for (const [key, value] of map.entries()) {
   *   entries.push([key, value]);
   * }
   *
   * assert.deepStrictEqual(entries, [
   *   ['a', 1],
   *   ['b', 2],
   * ]);
   * ```
   *
   * @param callbackfn A function to execute for each element.
   */
  forEach: (callbackfn: (value: V, key: K) => void) => void;

  // Iterators

  /**
   * Returns an iterator for the keys in the map.
   *
   * @example
   *
   * ```ts
   * const entries = [
   *   ['a', 1],
   *   ['b', 2],
   * ] satisfies readonly (readonly [string, number])[];
   *
   * const map = IMap.create(entries);
   *
   * const keys = Array.from(map.keys());
   *
   * assert.deepStrictEqual(keys, ['a', 'b']);
   * ```
   *
   * @returns An iterable iterator of keys.
   */
  keys: () => IterableIterator<K>;

  /**
   * Returns an iterator for the values in the map.
   *
   * @example
   *
   * ```ts
   * const entries = [
   *   ['a', 1],
   *   ['b', 2],
   * ] satisfies readonly (readonly [string, number])[];
   *
   * const map = IMap.create(entries);
   *
   * const values = Array.from(map.values());
   *
   * assert.deepStrictEqual(values, [1, 2]);
   * ```
   *
   * @returns An iterable iterator of values.
   */
  values: () => IterableIterator<V>;

  /**
   * Returns an iterator for the entries (key-value pairs) in the map.
   *
   * @example
   *
   * ```ts
   * const map = IMap.create([
   *   ['a', 1],
   *   ['b', 2],
   * ]);
   *
   * const entries = Array.from(map.entries());
   *
   * assert.deepStrictEqual(entries, [
   *   ['a', 1],
   *   ['b', 2],
   * ]);
   * ```
   *
   * @returns An iterable iterator of entries.
   */
  entries: () => IterableIterator<readonly [K, V]>;

  // Conversion

  /**
   * Converts the keys of the map to an array.
   *
   * @example
   *
   * ```ts
   * const entries = [
   *   ['x', 10],
   *   ['y', 20],
   * ] satisfies readonly (readonly [string, number])[];
   *
   * const map = IMap.create(entries);
   *
   * assert.deepStrictEqual(map.toKeysArray(), ['x', 'y']);
   * ```
   *
   * @returns A readonly array of keys.
   */
  toKeysArray: () => readonly K[];

  /**
   * Converts the values of the map to an array.
   *
   * @example
   *
   * ```ts
   * const entries = [
   *   ['x', 10],
   *   ['y', 20],
   * ] satisfies readonly (readonly [string, number])[];
   *
   * const map = IMap.create(entries);
   *
   * assert.deepStrictEqual(map.toValuesArray(), [10, 20]);
   * ```
   *
   * @returns A readonly array of values.
   */
  toValuesArray: () => readonly V[];

  /**
   * Converts the entries (key-value pairs) of the map to an array.
   *
   * @example
   *
   * ```ts
   * const entries = [
   *   ['a', 1],
   *   ['b', 2],
   * ] satisfies readonly (readonly [string, number])[];
   *
   * const map = IMap.create(entries);
   *
   * assert.deepStrictEqual(map.toEntriesArray(), [
   *   ['a', 1],
   *   ['b', 2],
   * ]);
   * ```
   *
   * @returns A readonly array of entries.
   */
  toEntriesArray: () => readonly (readonly [K, V])[];

  /**
   * Converts the map to an array of entries (key-value pairs). Alias for
   * `toEntriesArray`.
   *
   * @example
   *
   * ```ts
   * const entries = [
   *   ['k1', 'v1'],
   *   ['k2', 'v2'],
   * ] satisfies readonly (readonly [string, string])[];
   *
   * const map = IMap.create(entries);
   *
   * assert.deepStrictEqual(map.toArray(), [
   *   ['k1', 'v1'],
   *   ['k2', 'v2'],
   * ]);
   * ```
   *
   * @returns A readonly array of entries.
   */
  toArray: () => readonly (readonly [K, V])[];

  /**
   * Returns the underlying readonly JavaScript Map.
   *
   * @example
   *
   * ```ts
   * const entries = [['key', 1]] satisfies readonly (readonly [
   *   string,
   *   number,
   * ])[];
   *
   * const map = IMap.create(entries);
   *
   * const raw = map.toRawMap();
   *
   * assert.isTrue(isMap(raw));
   *
   * assert.isTrue(raw.get('key') === 1);
   * ```
   *
   * @returns The raw ReadonlyMap instance.
   */
  toRawMap: () => ReadonlyMap<K, V>;
}>;

/**
 * Represents an immutable map with high-performance operations and functional
 * programming support.
 *
 * IMap is a persistent data structure that provides all the functionality of
 * JavaScript's Map while maintaining immutability. All operations that would
 * normally mutate the map instead return new IMap instances, making it safe for
 * functional programming and concurrent access.
 *
 * **Key Features:**
 *
 * - **Immutable**: All mutation operations return new instances
 * - **Type Safe**: Full TypeScript support with generic key/value types
 * - **Iterable**: Implements standard JavaScript iteration protocols
 * - **Functional**: Rich API for map, filter, reduce-style operations
 *
 * **When to Use:**
 *
 * - State management in functional applications
 * - Caching with immutable guarantees
 * - Data structures that need to be shared across components
 * - When you need Map functionality but want immutability
 *
 * @template K The type of the keys in the map. Must extend MapSetKeyType.
 * @template V The type of the values in the map.
 */
export type IMap<K extends MapSetKeyType, V> = Iterable<readonly [K, V]> &
  IMapInterface<K, V>;

/** Provides utility functions for IMap. */
export namespace IMap {
  /**
   * Creates a new IMap instance from an iterable of key-value pairs.
   *
   * This factory function accepts any iterable of [key, value] tuples,
   * including arrays, JavaScript Maps, other IMaps, or custom iterables. The
   * resulting IMap will contain all the entries from the input iterable.
   *
   * **Performance:** O(n) where n is the number of entries in the iterable.
   *
   * @example
   *
   * ```ts
   * const map = IMap.create<string, number | string>([
   *   ['id', 1],
   *   ['status', 'active'],
   * ]);
   *
   * assert.isTrue(map.size === 2);
   *
   * assert.deepStrictEqual(map.get('status'), Optional.some('active'));
   * ```
   *
   * @template K The type of the keys. Must extend MapSetKeyType.
   * @template V The type of the values.
   * @param iterable An iterable of key-value pairs (e.g., Array, Map, IMap,
   *   etc.)
   * @returns A new IMap instance containing all entries from the iterable.
   */
  export const create = <K extends MapSetKeyType, V>(
    iterable: Iterable<readonly [K, V]>,
  ): IMap<K, V> => new IMapClass<K, V>(iterable);

  /**
   * Checks if two IMap instances are structurally equal.
   *
   * Two IMaps are considered equal if they have the same size and contain
   * exactly the same key-value pairs. The order of entries does not matter for
   * equality comparison. Values are compared using JavaScript's `===`
   * operator.
   *
   * **Performance:** O(n) where n is the size of the smaller map.
   *
   * @example
   *
   * ```ts
   * const first = IMap.create<'a' | 'b', number>([
   *   ['a', 1],
   *   ['b', 2],
   * ]);
   *
   * const second = IMap.create<'a' | 'b', number>([
   *   ['b', 2],
   *   ['a', 1],
   * ]);
   *
   * const third = IMap.create<'a' | 'b', number>([
   *   ['a', 1],
   *   ['b', 3],
   * ]);
   *
   * assert.isTrue(IMap.equal(first, second));
   *
   * assert.isFalse(IMap.equal(first, third));
   * ```
   *
   * @template K The type of the keys.
   * @template V The type of the values.
   * @param a The first IMap instance to compare.
   * @param b The second IMap instance to compare.
   * @returns `true` if the maps contain exactly the same key-value pairs,
   *   `false` otherwise.
   */
  export const equal = <K extends MapSetKeyType, V>(
    a: IMap<K, V>,
    b: IMap<K, V>,
  ): boolean =>
    a.size === b.size &&
    a.every(
      (v, k) =>
        pipe(b.get(k)).map((v2) => Optional.isSome(v2) && v2.value === v).value,
    );
}

/**
 * Internal class implementation for IMap providing immutable map operations.
 *
 * This class implements the IMap interface using JavaScript's native Map as the
 * underlying storage mechanism for optimal performance. All mutation operations
 * create new instances rather than modifying the existing map, ensuring
 * immutability.
 *
 * **Implementation Details:**
 *
 * - Uses Map<K, V> internally for type safety and performance
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
   *   are performed on non-existent keys. Useful for debugging. Defaults to
   *   false for production use.
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
    const curr = this.get(key);

    if (Optional.isSome(curr) && value === curr.value) return this; // has no changes

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
   * @example
   *
   * ```ts
   * const entries = [
   *   ['first', 1],
   *   ['second', 2],
   * ] satisfies readonly (readonly [string, number])[];
   *
   * const map = IMap.create(entries);
   *
   * const collected = Array.from(map);
   *
   * assert.deepStrictEqual(collected, [
   *   ['first', 1],
   *   ['second', 2],
   * ]);
   * ```
   *
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
