/* eslint-disable unicorn/prefer-iterator-to-array-at-end */
import type { WidenLiteral } from 'ts-type-forge';
import { Optional, pipe } from '../functional/index.mjs';
import { asUint32 } from '../number/index.mjs';
import { tp } from '../others/index.mjs';
import type { MapSetKeyType, SizeType } from '../types.mjs';
import type { IMap } from './imap.mjs';

/**
 * Creates a new IMap instance from an iterable of key-value pairs.
 *
 * This factory function accepts any iterable of [key, value] tuples, including
 * arrays, JavaScript Maps, other IMaps, or custom iterables. The resulting IMap
 * will contain all the entries from the input iterable.
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
 * Two IMaps are considered equal if they have the same size and contain exactly
 * the same key-value pairs. The order of entries does not matter for equality
 * comparison. Values are compared using JavaScript's `===` operator.
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
      pipe(b.get(k)).map(
        (v2) => Optional.isSome(v2) && Optional.unwrap(v2) === v,
      ).value,
  );

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

  /**
   * Constructs an IMapClass instance with the given entries.
   *
   * @param iterable An iterable of key-value pairs to populate the map.
   * @internal Use IMap.create() instead of calling this constructor directly.
   */
  constructor(iterable: Iterable<readonly [K, V]>) {
    this.#map = new Map(iterable);
  }

  /** @inheritdoc */
  get size(): SizeType.Arr {
    return asUint32(this.#map.size);
  }

  /** @inheritdoc */
  has(key: K | (WidenLiteral<K> & {})): boolean {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion, @typescript-eslint/no-unnecessary-type-assertion -- unnecessary only under the strict standard library; the stock one types `has` as taking exactly `K`
    return this.#map.has(key as K);
  }

  /** @inheritdoc */
  get(key: K | (WidenLiteral<K> & {})): Optional<V> {
    return this.has(key)
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion, @typescript-eslint/no-non-null-assertion
        Optional.some(this.#map.get(key as K)!)
      : Optional.none;
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
      if (!predicate(v, k)) {
        return false;
      }
    }

    return true;
  }

  /** @inheritdoc */
  some(predicate: (value: V, key: K) => boolean): boolean {
    for (const [k, v] of this.entries()) {
      if (predicate(v, k)) {
        return true;
      }
    }

    return false;
  }

  /** @inheritdoc */
  delete(key: K): IMap<K, V> {
    // Through the native collection, which compares keys with SameValueZero as
    // `has` and `get` do; a rebuild comparing with `Object.is` left a `-0` key
    // unmatched.
    return this.has(key) ? this.withMutations([{ type: 'delete', key }]) : this;
  }

  /** @inheritdoc */
  set(key: K, value: V): IMap<K, V> {
    const curr = this.get(key);

    // Through the native collection, which compares keys with SameValueZero as
    // `has` and `get` do (a rebuild comparing with `Object.is` left a `-0` key
    // unmatched), and whose `set` appends a new key and keeps the position of
    // an existing one.
    return Optional.isSome(curr) && value === Optional.unwrap(curr)
      ? this
      : this.withMutations([{ type: 'set', key, value }]);
  }

  /** @inheritdoc */
  update(key: K, updater: (value: V) => V): IMap<K, V> {
    // Through the native collection, which compares keys with SameValueZero as
    // `has` and `get` do; a rebuild comparing with `Object.is` left a `-0` key
    // unmatched.
    return Optional.isNone(this.get(key))
      ? this
      : this.withMutations([{ type: 'update', key, updater }]);
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

    const updateFn = (
      action: Readonly<
        | { type: 'delete'; key: K }
        | { type: 'set'; key: K; value: V }
        | { type: 'update'; key: K; updater: (value: V) => V }
      >,
    ): void => {
      switch (action.type) {
        case 'delete':
          mut_result.delete(action.key);

          break;

        case 'set':
          mut_result.set(action.key, action.value);

          break;

        case 'update': {
          const { key } = action;

          // Presence is `has` alone, as in `update`: a stored value may itself
          // be `undefined`.
          if (!mut_result.has(key)) {
            break;
          }

          // `has` held, so `get` returns the stored `V`, `undefined` included.
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          mut_result.set(key, action.updater(mut_result.get(key) as V));

          break;
        }
      }
    };

    for (const action of actions) {
      updateFn(action);
    }

    return create(mut_result);
  }

  /** @inheritdoc */
  map<V2>(mapFn: (value: V, key: K) => V2): IMap<K, V2> {
    return create(this.toArray().map(([k, v]) => tp(k, mapFn(v, k))));
  }

  /** @inheritdoc */
  mapKeys<K2 extends MapSetKeyType>(mapFn: (key: K) => K2): IMap<K2, V> {
    return create(this.toArray().map(([k, v]) => tp(mapFn(k), v)));
  }

  /** @inheritdoc */
  mapEntries<K2 extends MapSetKeyType, V2>(
    mapFn: (entry: readonly [K, V]) => readonly [K2, V2],
  ): IMap<K2, V2> {
    return create(this.toArray().map(mapFn));
  }

  /** @inheritdoc */
  forEach(callbackfn: (value: V, key: K) => void): void {
    for (const [key, value] of this.#map) {
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
   * ] as const satisfies readonly (readonly [string, number])[];
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
