/* eslint-disable unicorn/prefer-iterator-to-array-at-end */
import { type WidenLiteral } from 'ts-type-forge';
import { Optional, pipe } from '../functional/index.mjs';
import { asUint32 } from '../number/index.mjs';
import { tp } from '../others/index.mjs';
import { type MapSetKeyType, type SizeType } from '../types.mjs';

/**
 * Interface for an immutable map with custom key mapping and lookup operations.
 *
 * IMapMapped allows you to use complex objects as keys by providing
 * transformation functions that convert between your custom key type `K` and a
 * primitive `MapSetKeyType` `KM` that can be efficiently stored in JavaScript's
 * native Map. This enables operations on maps with complex keys while
 * maintaining type safety and immutability.
 *
 * **Key Features:**
 *
 * - **Custom Key Types**: Use any type as keys by providing `toKey`/`fromKey`
 *   functions
 * - **Immutable**: All operations return new instances, preserving immutability
 * - **Type Safe**: Full TypeScript support with generic key/value types
 *
 * **Performance Characteristics:**
 *
 * - get/has: O(1) average case (plus key transformation overhead)
 * - set/delete: O(n) due to copying for immutability (plus key transformation
 *   overhead)
 * - map/filter operations: O(n)
 * - iteration: O(n) (plus key transformation overhead)
 *
 * @template K The type of the custom keys in the map.
 * @template V The type of the values in the map.
 * @template KM The type of the mapped primitive keys (string, number, etc.).
 */
type IMapMappedInterface<K, V, KM extends MapSetKeyType> = Readonly<{
  // Getting information

  /**
   * The number of elements in the map.
   *
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * assert.isTrue(map.size === 2);
   * ```
   */
  size: SizeType.Arr;

  /**
   * Checks if a key exists in the map.
   *
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [[{ x: 1, y: 2 }, 'A']],
   *   toKey,
   *   fromKey,
   * );
   *
   * assert.isTrue(map.has({ x: 1, y: 2 }));
   *
   * assert.isFalse(map.has({ x: 3, y: 4 }));
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
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [[{ x: 1, y: 2 }, 'A']],
   *   toKey,
   *   fromKey,
   * );
   *
   * assert.deepStrictEqual(map.get({ x: 1, y: 2 }), Optional.some('A'));
   *
   * assert.deepStrictEqual(map.get({ x: 0, y: 0 }), Optional.none);
   * ```
   *
   * @param key The key to retrieve.
   * @returns The value associated with the key wrapped with `Optional.some`, or
   *   `Optional.none` if the key does not exist.
   */
  get: (key: K | (WidenLiteral<K> & {})) => Optional<V>;

  // Reducing a value

  /**
   * Checks if all elements in the map satisfy a predicate. Also supports a
   * type predicate overload that narrows the type of values in the map if the
   * predicate returns true for all elements.
   *
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, number, string>(
   *   [
   *     [{ x: 0, y: 0 }, 2],
   *     [{ x: 1, y: 0 }, 4],
   *   ],
   *   toKey,
   *   fromKey,
   * );
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
   * @template W The narrowed type of the values.
   * @param predicate A function to test each key-value pair.
   * @returns `true` if all elements satisfy the predicate, `false` otherwise.
   */
  every: ((predicate: (value: V, key: K) => boolean) => boolean) &
    (<W extends V>(
      predicate: (value: V, key: K) => value is W,
    ) => this is IMapMapped<K, W, KM>);

  /**
   * Checks if at least one element in the map satisfies a predicate.
   *
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, number, string>(
   *   [
   *     [{ x: 0, y: 0 }, 3],
   *     [{ x: 1, y: 0 }, 7],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * assert.isTrue(map.some((value) => value > 5));
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
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const original = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const withoutRight = original.delete({ x: 1, y: 0 });
   *
   * assert.deepStrictEqual(
   *   original.get({ x: 1, y: 0 }),
   *   Optional.some('right'),
   * );
   *
   * assert.deepStrictEqual(withoutRight.get({ x: 1, y: 0 }), Optional.none);
   *
   * assert.isTrue(original.size === 2);
   *
   * assert.isTrue(withoutRight.size === 1);
   * ```
   *
   * @param key The key to delete.
   * @returns A new IMapMapped instance without the specified key.
   */
  delete: (key: K) => IMapMapped<K, V, KM>;

  /**
   * Sets a key-value pair in the map.
   *
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const base = IMapMapped.create<Point, string, string>(
   *   [[{ x: 0, y: 0 }, 'origin']],
   *   toKey,
   *   fromKey,
   * );
   *
   * const updated = base.set({ x: 0, y: 0 }, 'home');
   *
   * const extended = base.set({ x: 1, y: 0 }, 'right');
   *
   * assert.deepStrictEqual(base.get({ x: 0, y: 0 }), Optional.some('origin'));
   *
   * assert.deepStrictEqual(updated.get({ x: 0, y: 0 }), Optional.some('home'));
   *
   * assert.deepStrictEqual(
   *   extended.get({ x: 1, y: 0 }),
   *   Optional.some('right'),
   * );
   * ```
   *
   * @param key The key to set.
   * @param value The value to associate with the key.
   * @returns A new IMapMapped instance with the specified key-value pair.
   */
  set: (key: K, value: V) => IMapMapped<K, V, KM>;

  /**
   * Updates the value associated with a key using an updater function.
   *
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const scores = IMapMapped.create<Point, number, string>(
   *   [
   *     [{ x: 0, y: 0 }, 10],
   *     [{ x: 1, y: 0 }, 8],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const boosted = scores.update({ x: 0, y: 0 }, (value) => value + 5);
   *
   * const unchanged = scores.update({ x: 9, y: 9 }, (value) => value + 1);
   *
   * assert.deepStrictEqual(boosted.get({ x: 0, y: 0 }), Optional.some(15));
   *
   * assert.deepStrictEqual(scores.get({ x: 0, y: 0 }), Optional.some(10));
   *
   * assert.isTrue(unchanged === scores);
   * ```
   *
   * @param key The key whose value to update.
   * @param updater A function that takes the current value and returns the new
   *   value.
   * @returns A new IMapMapped instance with the updated value.
   */
  update: (key: K, updater: (value: V) => V) => IMapMapped<K, V, KM>;

  /**
   * Applies a series of mutations to the map.
   *
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const base = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const mutated = base.withMutations([
   *   { type: 'set', key: { x: 2, y: 0 }, value: 'far' },
   *   { type: 'update', key: { x: 1, y: 0 }, updater: (v) => v.toUpperCase() },
   *   { type: 'delete', key: { x: 0, y: 0 } },
   * ]);
   *
   * assert.deepStrictEqual(mutated.get({ x: 2, y: 0 }), Optional.some('far'));
   *
   * assert.deepStrictEqual(mutated.get({ x: 1, y: 0 }), Optional.some('RIGHT'));
   *
   * assert.deepStrictEqual(mutated.get({ x: 0, y: 0 }), Optional.none);
   *
   * assert.deepStrictEqual(base.get({ x: 1, y: 0 }), Optional.some('right'));
   * ```
   *
   * @param actions An array of mutation actions (delete, set, or update).
   * @returns A new IMapMapped instance with all mutations applied.
   */
  withMutations: (
    actions: readonly Readonly<
      | { type: 'delete'; key: K }
      | { type: 'set'; key: K; value: V }
      | { type: 'update'; key: K; updater: (value: V) => V }
    >[],
  ) => IMapMapped<K, V, KM>;

  // Sequence algorithms

  /**
   * Maps the values of the map to new values.
   *
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, number, string>(
   *   [
   *     [{ x: 0, y: 0 }, 1],
   *     [{ x: 1, y: 0 }, 2],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const doubled = map.map((value) => value * 2);
   *
   * assert.deepStrictEqual(Array.from(doubled), [
   *   [{ x: 0, y: 0 }, 2],
   *   [{ x: 1, y: 0 }, 4],
   * ]);
   * ```
   *
   * @template V2 The type of the new values.
   * @param mapFn A function that maps a value and key to a new value.
   * @returns A new IMapMapped instance with mapped values.
   */
  map: <V2>(mapFn: (value: V, key: K) => V2) => IMapMapped<K, V2, KM>;

  /**
   * Maps the keys of the map to new keys. Note: The key type cannot be changed
   * because `toKey` and `fromKey` would become unusable.
   *
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const shifted = map.mapKeys((p) => ({ x: p.x + 10, y: p.y + 10 }));
   *
   * assert.deepStrictEqual(Array.from(shifted), [
   *   [{ x: 10, y: 10 }, 'origin'],
   *   [{ x: 11, y: 10 }, 'right'],
   * ]);
   * ```
   *
   * @param mapFn A function that maps a key to a new key of the same type.
   * @returns A new IMapMapped instance with mapped keys.
   */
  mapKeys: (mapFn: (key: K) => K) => IMapMapped<K, V, KM>;

  /**
   * Maps the entries (key-value pairs) of the map to new entries.
   *
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, number, string>(
   *   [
   *     [{ x: 0, y: 0 }, 1],
   *     [{ x: 1, y: 0 }, 2],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const labeled = map.mapEntries(([key, value]) => [key, `value=${value}`]);
   *
   * assert.deepStrictEqual(Array.from(labeled), [
   *   [{ x: 0, y: 0 }, 'value=1'],
   *   [{ x: 1, y: 0 }, 'value=2'],
   * ]);
   * ```
   *
   * @template V2 The type of the new values in the entries.
   * @param mapFn A function that maps an entry to a new entry (key must remain
   *   the same type).
   * @returns A new IMapMapped instance with mapped entries.
   */
  mapEntries: <V2>(
    mapFn: (entry: readonly [K, V]) => readonly [K, V2],
  ) => IMapMapped<K, V2, KM>;

  // Side effects

  /**
   * Executes a callback function for each key-value pair in the map.
   *
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const mut_entries: (readonly [Point, string])[] = [];
   *
   * map.forEach((value, key) => {
   *   mut_entries.push([key, value]);
   * });
   *
   * assert.deepStrictEqual(mut_entries, [
   *   [{ x: 0, y: 0 }, 'origin'],
   *   [{ x: 1, y: 0 }, 'right'],
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
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const keys = Array.from(map.keys());
   *
   * assert.deepStrictEqual(keys, [
   *   { x: 0, y: 0 },
   *   { x: 1, y: 0 },
   * ]);
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
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const values = Array.from(map.values());
   *
   * assert.deepStrictEqual(values, ['origin', 'right']);
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
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const entries = Array.from(map.entries());
   *
   * assert.deepStrictEqual(entries, [
   *   [{ x: 0, y: 0 }, 'origin'],
   *   [{ x: 1, y: 0 }, 'right'],
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
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * assert.deepStrictEqual(map.toKeysArray(), [
   *   { x: 0, y: 0 },
   *   { x: 1, y: 0 },
   * ]);
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
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * assert.deepStrictEqual(map.toValuesArray(), ['origin', 'right']);
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
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * assert.deepStrictEqual(map.toEntriesArray(), [
   *   [{ x: 0, y: 0 }, 'origin'],
   *   [{ x: 1, y: 0 }, 'right'],
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
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * assert.deepStrictEqual(map.toArray(), [
   *   [{ x: 0, y: 0 }, 'origin'],
   *   [{ x: 1, y: 0 }, 'right'],
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
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [[{ x: 1, y: 2 }, 'A']],
   *   toKey,
   *   fromKey,
   * );
   *
   * const raw = map.toRawMap();
   *
   * assert.isTrue(isMap(raw));
   *
   * assert.isTrue(raw.get(toKey({ x: 1, y: 2 })) === 'A');
   * ```
   *
   * @returns The raw ReadonlyMap instance.
   */
  toRawMap: () => ReadonlyMap<KM, V>;
}>;

/**
 * Represents an immutable map with custom key transformation and
 * high-performance operations.
 *
 * IMapMapped is a specialized persistent data structure that enables using
 * complex objects as map keys while maintaining the performance benefits of
 * JavaScript's native Map. It achieves this by requiring bidirectional
 * transformation functions that convert between your custom key type and a
 * primitive type that can be efficiently stored and compared.
 *
 * **Key Features:**
 *
 * - **Complex Keys**: Use objects, arrays, or any custom type as map keys
 * - **Immutable**: All mutation operations return new instances
 * - **Type Safe**: Full TypeScript support with compile-time key/value type
 *   checking
 * - **Bidirectional**: Maintains ability to reconstruct original keys from mapped
 *   keys
 *
 * **Use Cases:**
 *
 * - Maps with composite keys (e.g., coordinates, user IDs with metadata)
 * - Caching with complex cache keys
 * - State management where entities have multi-part identifiers
 * - Performance-critical maps with non-primitive keys
 *
 * @template K The type of the custom keys in the map.
 * @template V The type of the values in the map.
 * @template KM The type of the mapped primitive keys (string, number, etc.).
 */
export type IMapMapped<K, V, KM extends MapSetKeyType> = Iterable<
  readonly [K, V]
> &
  IMapMappedInterface<K, V, KM>;

/** Provides utility functions for IMapMapped. */
export namespace IMapMapped {
  /**
   * Creates a new IMapMapped instance with custom key transformation functions.
   *
   * This factory function creates an immutable map that can use complex objects
   * as keys by providing bidirectional transformation functions. The `toKey`
   * function converts your custom key type to a primitive type that can be
   * efficiently stored, while `fromKey` reconstructs the original key type for
   * iteration and access.
   *
   * **Performance:** O(n) where n is the number of entries in the iterable.
   *
   * @template K The type of the custom keys.
   * @template V The type of the values.
   * @template KM The type of the mapped primitive keys.
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * assert.isTrue(map.size === 2);
   *
   * assert.deepStrictEqual(map.get({ x: 0, y: 0 }), Optional.some('origin'));
   * ```
   *
   * @param iterable An iterable of key-value pairs using the custom key type.
   * @param toKey A function that converts a custom key `K` to a primitive key
   *   `KM`. This function must be deterministic and produce unique values for
   *   unique keys.
   * @param fromKey A function that converts a primitive key `KM` back to the
   *   custom key `K`. This should be the inverse of `toKey`.
   * @returns A new IMapMapped instance containing all entries from the
   *   iterable.
   */
  export const create = <K, V, KM extends MapSetKeyType>(
    iterable: Iterable<readonly [K, V]>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K,
  ): IMapMapped<K, V, KM> =>
    new IMapMappedClass<K, V, KM>(iterable, toKey, fromKey);

  /**
   * Checks if two IMapMapped instances are structurally equal.
   *
   * Two IMapMapped instances are considered equal if they have the same size
   * and contain exactly the same key-value pairs. The comparison is performed
   * on the underlying mapped keys and values, so the transformation functions
   * themselves don't need to be identical. Values are compared using
   * JavaScript's `===` operator.
   *
   * **Performance:** O(n) where n is the size of the smaller map.
   *
   * @template K The type of the custom keys.
   * @template V The type of the values.
   * @template KM The type of the mapped primitive keys.
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const first = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const second = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 1, y: 0 }, 'right'],
   *     [{ x: 0, y: 0 }, 'origin'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const third = IMapMapped.create<Point, string, string>(
   *   [[{ x: 0, y: 0 }, 'different']],
   *   toKey,
   *   fromKey,
   * );
   *
   * assert.isTrue(IMapMapped.equal(first, second));
   *
   * assert.isFalse(IMapMapped.equal(first, third));
   * ```
   *
   * @param a The first IMapMapped instance to compare.
   * @param b The second IMapMapped instance to compare.
   * @returns `true` if the maps contain exactly the same key-value pairs,
   *   `false` otherwise.
   */
  export const equal = <K, V, KM extends MapSetKeyType>(
    a: IMapMapped<K, V, KM>,
    b: IMapMapped<K, V, KM>,
  ): boolean =>
    a.size === b.size &&
    a.every(
      (v, k) =>
        pipe(b.get(k)).map((bv) => Optional.isSome(bv) && bv.value === v).value,
    );
}

/**
 * Internal class implementation for IMapMapped providing immutable map
 * operations with key transformation.
 *
 * This class implements the IMapMapped interface by maintaining a JavaScript
 * Map with primitive keys internally while exposing an API that works with
 * custom key types. The transformation between custom and primitive keys is
 * handled transparently through the provided `toKey` and `fromKey` functions.
 *
 * **Implementation Details:**
 *
 * - Uses ReadonlyMap<KM, V> internally where KM is the primitive key type
 * - Stores transformation functions for bidirectional key conversion
 * - Implements copy-on-write semantics for efficiency
 * - Provides optional debug messaging for development
 *
 * @template K The type of the custom keys.
 * @template V The type of the values.
 * @template KM The type of the mapped primitive keys.
 * @implements IMapMapped
 * @implements Iterable
 * @internal This class should not be used directly. Use IMapMapped.create() instead.
 */
class IMapMappedClass<K, V, KM extends MapSetKeyType>
  implements IMapMapped<K, V, KM>, Iterable<readonly [K, V]>
{
  readonly #map: ReadonlyMap<KM, V>;
  readonly #toKey: (a: K) => KM;
  readonly #fromKey: (k: KM) => K;
  readonly #showNotFoundMessage: boolean;

  /**
   * Constructs an IMapMappedClass instance with custom key transformation.
   *
   * @param iterable An iterable of key-value pairs using the custom key type K.
   * @param toKey A function that converts a custom key K to a primitive key KM.
   *   Must be deterministic and produce unique values for unique keys.
   * @param fromKey A function that converts a primitive key KM back to the
   *   custom key K. Should be the inverse of the toKey function.
   * @param showNotFoundMessage Whether to log warning messages when operations
   *   are performed on non-existent keys. Useful for debugging. Defaults to
   *   false for production use.
   * @internal Use IMapMapped.create() instead of calling this constructor directly.
   */
  constructor(
    iterable: Iterable<readonly [K, V]>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K,
    showNotFoundMessage: boolean = false,
  ) {
    this.#map = new Map(Array.from(iterable, ([k, v]) => [toKey(k), v]));

    this.#toKey = toKey;

    this.#fromKey = fromKey;

    this.#showNotFoundMessage = showNotFoundMessage;
  }

  /** @inheritdoc */
  get size(): SizeType.Arr {
    return asUint32(this.#map.size);
  }

  /** @inheritdoc */
  has(key: K | (WidenLiteral<K> & {})): boolean {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return this.#map.has(this.#toKey(key as K));
  }

  /** @inheritdoc */
  get(key: K | (WidenLiteral<K> & {})): Optional<V> {
    if (!this.has(key)) return Optional.none;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, total-functions/no-unsafe-type-assertion
    return Optional.some(this.#map.get(this.#toKey(key as K))!);
  }

  /** @inheritdoc */
  every<W extends V>(
    predicate: (value: V, key: K) => value is W,
  ): this is IMapMapped<K, W, KM>;

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
  delete(key: K): IMapMapped<K, V, KM> {
    if (!this.has(key)) {
      if (this.#showNotFoundMessage) {
        console.warn(
          `IMapMapped.delete: key not found: ${String(this.#toKey(key))}`,
        );
      }

      return this;
    }

    const keyMapped = this.#toKey(key);

    return IMapMapped.create(
      Array.from(this.#map)
        .filter(([km]) => !Object.is(km, keyMapped))
        .map(([km, v]) => tp(this.#fromKey(km), v)),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  set(key: K, value: V): IMapMapped<K, V, KM> {
    const curr = this.get(key);

    if (Optional.isSome(curr) && value === curr.value) return this;

    const keyMapped = this.#toKey(key);

    if (!this.has(key)) {
      return IMapMapped.create(
        [...this.#map, tp(keyMapped, value)].map(([km, v]) =>
          tp(this.#fromKey(km), v),
        ),
        this.#toKey,
        this.#fromKey,
      );
    }

    return IMapMapped.create(
      Array.from(this.#map, ([km, v]) =>
        tp(this.#fromKey(km), Object.is(km, keyMapped) ? value : v),
      ),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  update(key: K, updater: (value: V) => V): IMapMapped<K, V, KM> {
    const curr = this.get(key);

    if (Optional.isNone(curr)) {
      if (this.#showNotFoundMessage) {
        console.warn(
          `IMapMapped.update: key not found: ${String(this.#toKey(key))}`,
        );
      }

      return this;
    }

    const keyMapped = this.#toKey(key);

    return IMapMapped.create(
      Array.from(this.#map, ([km, v]) =>
        tp(
          this.#fromKey(km),
          Object.is(km, keyMapped) ? updater(curr.value) : v,
        ),
      ),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  withMutations(
    actions: readonly Readonly<
      | { type: 'delete'; key: K }
      | { type: 'set'; key: K; value: V }
      | { type: 'update'; key: K; updater: (value: V) => V }
    >[],
  ): IMapMapped<K, V, KM> {
    const mut_result = new Map<KM, V>(this.#map);

    const updateFn = (
      action: Readonly<
        | { type: 'delete'; key: K }
        | { type: 'set'; key: K; value: V }
        | { type: 'update'; key: K; updater: (value: V) => V }
      >,
    ): void => {
      const key = this.#toKey(action.key);

      switch (action.type) {
        case 'delete':
          mut_result.delete(key);

          break;

        case 'set':
          mut_result.set(key, action.value);

          break;

        case 'update': {
          const curr = mut_result.get(key);

          if (!mut_result.has(key) || curr === undefined) {
            if (this.#showNotFoundMessage) {
              console.warn(
                `IMapMapped.withMutations::update: key not found: ${String(key)}`,
              );
            }

            break;
          }

          mut_result.set(key, action.updater(curr));

          break;
        }
      }
    };

    for (const action of actions) {
      updateFn(action);
    }

    return IMapMapped.create<K, V, KM>(
      Array.from(mut_result, ([k, v]) => [this.#fromKey(k), v]),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  map<V2>(mapFn: (value: V, key: K) => V2): IMapMapped<K, V2, KM> {
    return IMapMapped.create(
      this.toArray().map(([k, v]) => tp(k, mapFn(v, k))),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  mapKeys(mapFn: (key: K) => K): IMapMapped<K, V, KM> {
    return IMapMapped.create(
      this.toArray().map(([k, v]) => tp(mapFn(k), v)),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  mapEntries<V2>(
    mapFn: (entry: readonly [K, V]) => readonly [K, V2],
  ): IMapMapped<K, V2, KM> {
    return IMapMapped.create(
      this.toArray().map(mapFn),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  forEach(callbackfn: (value: V, key: K) => void): void {
    for (const [km, value] of this.#map) {
      callbackfn(value, this.#fromKey(km));
    }
  }

  /**
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; y: number }>;
   *
   * const toKey = (p: Point) => JSON.stringify(p);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const map = IMapMapped.create<Point, string, string>(
   *   [
   *     [{ x: 0, y: 0 }, 'origin'],
   *     [{ x: 1, y: 0 }, 'right'],
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const collected = Array.from(map);
   *
   * assert.deepStrictEqual(collected, [
   *   [{ x: 0, y: 0 }, 'origin'],
   *   [{ x: 1, y: 0 }, 'right'],
   * ]);
   * ```
   *
   * @inheritdoc
   */
  *[Symbol.iterator](): Iterator<readonly [K, V]> {
    for (const e of this.entries()) {
      yield e;
    }
  }

  /** @inheritdoc */
  *keys(): IterableIterator<K> {
    for (const km of this.#map.keys()) {
      yield this.#fromKey(km);
    }
  }

  /** @inheritdoc */
  values(): IterableIterator<V> {
    return this.#map.values();
  }

  /** @inheritdoc */
  *entries(): IterableIterator<readonly [K, V]> {
    for (const [km, v] of this.#map) {
      yield [this.#fromKey(km), v];
    }
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
  toRawMap(): ReadonlyMap<KM, V> {
    return this.#map;
  }
}
