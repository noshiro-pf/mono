/* eslint-disable unicorn/prefer-iterator-to-array-at-end */
import type { WidenLiteral } from 'ts-type-forge';
import { Optional, pipe } from '../functional/index.mjs';
import { asUint32 } from '../number/index.mjs';
import { tp } from '../others/index.mjs';
import type { MapSetKeyType, SizeType } from '../types.mjs';
import type { IMapMapped } from './imap-mapped.mjs';

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
 * Two IMapMapped instances are considered equal if they have the same size and
 * contain exactly the same key-value pairs. The comparison is performed on the
 * underlying mapped keys and values, so the transformation functions themselves
 * don't need to be identical. Values are compared using
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
      pipe(b.get(k)).map(
        (bv) => Optional.isSome(bv) && Optional.unwrap(bv) === v,
      ).value,
  );

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

  /**
   * Constructs an IMapMappedClass instance with custom key transformation.
   *
   * @param iterable An iterable of key-value pairs using the custom key type K.
   * @param toKey A function that converts a custom key K to a primitive key KM.
   *   Must be deterministic and produce unique values for unique keys.
   * @param fromKey A function that converts a primitive key KM back to the
   *   custom key K. Should be the inverse of the toKey function.
   * @internal Use IMapMapped.create() instead of calling this constructor directly.
   */
  constructor(
    iterable: Iterable<readonly [K, V]>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K,
  ) {
    this.#map = new Map(Array.from(iterable, ([k, v]) => [toKey(k), v]));

    this.#toKey = toKey;

    this.#fromKey = fromKey;
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
    return this.has(key)
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, total-functions/no-unsafe-type-assertion
        Optional.some(this.#map.get(this.#toKey(key as K))!)
      : Optional.none;
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
  delete(key: K): IMapMapped<K, V, KM> {
    // Through the native collection, which compares keys with SameValueZero as
    // `has` and `get` do; a rebuild comparing with `Object.is` left a `-0` key
    // unmatched.
    return this.has(key) ? this.withMutations([{ type: 'delete', key }]) : this;
  }

  /** @inheritdoc */
  set(key: K, value: V): IMapMapped<K, V, KM> {
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
  update(key: K, updater: (value: V) => V): IMapMapped<K, V, KM> {
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

    return create<K, V, KM>(
      Array.from(mut_result, ([k, v]) => [this.#fromKey(k), v]),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  map<V2>(mapFn: (value: V, key: K) => V2): IMapMapped<K, V2, KM> {
    return create(
      this.toArray().map(([k, v]) => tp(k, mapFn(v, k))),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  mapKeys(mapFn: (key: K) => K): IMapMapped<K, V, KM> {
    return create(
      this.toArray().map(([k, v]) => tp(mapFn(k), v)),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  mapEntries<V2>(
    mapFn: (entry: readonly [K, V]) => readonly [K, V2],
  ): IMapMapped<K, V2, KM> {
    return create(this.toArray().map(mapFn), this.#toKey, this.#fromKey);
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
