/* eslint-disable unicorn/prefer-iterator-to-array-at-end */
import type {
  FixedLengthTuple,
  ReadonlyRecord,
  WidenLiteral,
} from 'ts-type-forge';
import { asUint32 } from '../number/index.mjs';
import type { MapSetKeyType, SizeType } from '../types.mjs';
import type { ISetMapped } from './iset-mapped.mjs';

/**
 * Creates a new ISetMapped instance with custom element transformation
 * functions.
 *
 * This factory function creates an immutable set that can use complex objects
 * as elements by providing bidirectional transformation functions. The `toKey`
 * function converts your custom element type to a primitive type that can be
 * efficiently stored, while `fromKey` reconstructs the original element type
 * for iteration and access.
 *
 * **Performance:** O(n) where n is the number of elements in the iterable.
 *
 * @example
 *
 * ```ts
 * type Point = Readonly<{ x: number; tag: string }>;
 *
 * const toKey = (point: Point) => JSON.stringify(point);
 *
 * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
 * const fromKey = (key: string) => JSON.parse(key) as Point;
 *
 * const set = ISetMapped.create<Point, string>(
 *   [
 *     { x: 1, tag: 'a' },
 *     { x: 1, tag: 'a' },
 *     { x: 2, tag: 'b' },
 *   ],
 *   toKey,
 *   fromKey,
 * );
 *
 * assert.deepStrictEqual(Array.from(set), [
 *   { x: 1, tag: 'a' },
 *   { x: 2, tag: 'b' },
 * ]);
 * ```
 *
 * @template K The type of the custom elements.
 * @template KM The type of the mapped primitive keys.
 * @param iterable An iterable of elements using the custom element type.
 * @param toKey A function that converts a custom element `K` to a primitive
 *   key `KM`. This function must be deterministic and produce unique values
 *   for unique elements.
 * @param fromKey A function that converts a primitive key `KM` back to the
 *   custom element `K`. This should be the inverse of `toKey`.
 * @returns A new ISetMapped instance containing all unique elements from the
 *   iterable.
 */
export const create = <K, KM extends MapSetKeyType>(
  iterable: Iterable<K>,
  toKey: (a: K) => KM,
  fromKey: (k: KM) => K,
): ISetMapped<K, KM> => new ISetMappedClass<K, KM>(iterable, toKey, fromKey);

/**
 * Checks if two ISetMapped instances are structurally equal.
 *
 * Two ISetMapped instances are considered equal if they have the same size and
 * contain exactly the same elements. The comparison is performed on the
 * underlying mapped keys, so the transformation functions themselves don't need
 * to be identical. Elements are compared based on their mapped key
 * representations.
 *
 * **Performance:** O(n) where n is the size of the smaller set.
 *
 * @example
 *
 * ```ts
 * type Point = Readonly<{ x: number; tag: string }>;
 *
 * const toKey = (point: Point) => JSON.stringify(point);
 *
 * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
 * const fromKey = (key: string) => JSON.parse(key) as Point;
 *
 * const first = ISetMapped.create<Point, string>(
 *   [
 *     { x: 1, tag: 'a' },
 *     { x: 2, tag: 'b' },
 *   ],
 *   toKey,
 *   fromKey,
 * );
 *
 * const second = ISetMapped.create<Point, string>(
 *   [
 *     { x: 2, tag: 'b' },
 *     { x: 1, tag: 'a' },
 *   ],
 *   toKey,
 *   fromKey,
 * );
 *
 * const third = ISetMapped.create<Point, string>(
 *   [{ x: 3, tag: 'c' }],
 *   toKey,
 *   fromKey,
 * );
 *
 * assert.isTrue(ISetMapped.equal(first, second));
 *
 * assert.isFalse(ISetMapped.equal(first, third));
 * ```
 *
 * @template K The type of the custom elements.
 * @template KM The type of the mapped primitive keys.
 * @param a The first ISetMapped instance to compare.
 * @param b The second ISetMapped instance to compare.
 * @returns `true` if the sets contain exactly the same elements, `false`
 *   otherwise.
 */
export const equal = <K, KM extends MapSetKeyType>(
  a: ISetMapped<K, KM>,
  b: ISetMapped<K, KM>,
): boolean => a.size === b.size && a.every((e) => b.has(e));

/**
 * Computes the difference between two ISetMapped instances.
 *
 * @example
 *
 * ```ts
 * type Point = Readonly<{ x: number; tag: string }>;
 *
 * const toKey = (point: Point) => JSON.stringify(point);
 *
 * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
 * const fromKey = (key: string) => JSON.parse(key) as Point;
 *
 * const previous = ISetMapped.create<Point, string>(
 *   [
 *     { x: 1, tag: 'a' },
 *     { x: 2, tag: 'b' },
 *   ],
 *   toKey,
 *   fromKey,
 * );
 *
 * const current = ISetMapped.create<Point, string>(
 *   [
 *     { x: 2, tag: 'b' },
 *     { x: 3, tag: 'c' },
 *   ],
 *   toKey,
 *   fromKey,
 * );
 *
 * const { added, deleted } = ISetMapped.diff(previous, current);
 *
 * assert.deepStrictEqual(Array.from(added), [{ x: 3, tag: 'c' }]);
 *
 * assert.deepStrictEqual(Array.from(deleted), [{ x: 1, tag: 'a' }]);
 * ```
 *
 * @template K The type of the elements.
 * @template KM The type of the mapped keys.
 * @param oldSet The original set.
 * @param newSet The new set.
 * @returns An object containing sets of added and deleted elements.
 */
export const diff = <K, KM extends MapSetKeyType>(
  oldSet: ISetMapped<K, KM>,
  newSet: ISetMapped<K, KM>,
): ReadonlyRecord<'added' | 'deleted', ISetMapped<K, KM>> =>
  ({
    deleted: oldSet.subtract(newSet),
    added: newSet.subtract(oldSet),
  }) as const;

/**
 * Computes the intersection of two ISetMapped instances.
 *
 * @example
 *
 * ```ts
 * type Point = Readonly<{ x: number; tag: string }>;
 *
 * const toKey = (point: Point) => JSON.stringify(point);
 *
 * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
 * const fromKey = (key: string) => JSON.parse(key) as Point;
 *
 * const left = ISetMapped.create<Point, string>(
 *   [
 *     { x: 1, tag: 'a' },
 *     { x: 2, tag: 'b' },
 *   ],
 *   toKey,
 *   fromKey,
 * );
 *
 * const right = ISetMapped.create<Point, string>(
 *   [{ x: 2, tag: 'b' }],
 *   toKey,
 *   fromKey,
 * );
 *
 * const overlap = ISetMapped.intersection(left, right);
 *
 * assert.deepStrictEqual(Array.from(overlap), [{ x: 2, tag: 'b' }]);
 * ```
 *
 * @template K The type of the elements.
 * @template KM The type of the mapped keys.
 * @param a The first set.
 * @param b The second set.
 * @returns A new ISetMapped instance representing the intersection.
 */
export const intersection = <K, KM extends MapSetKeyType>(
  a: ISetMapped<K, KM>,
  b: ISetMapped<K, KM>,
): ISetMapped<K, KM> => a.intersect(b);

/**
 * Computes the union of two ISetMapped instances.
 *
 * @example
 *
 * ```ts
 * type Point = Readonly<{ x: number; tag: string }>;
 *
 * const toKey = (point: Point) => JSON.stringify(point);
 *
 * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
 * const fromKey = (key: string) => JSON.parse(key) as Point;
 *
 * const left = ISetMapped.create<Point, string>(
 *   [{ x: 1, tag: 'a' }],
 *   toKey,
 *   fromKey,
 * );
 *
 * const right = ISetMapped.create<Point, string>(
 *   [{ x: 2, tag: 'b' }],
 *   toKey,
 *   fromKey,
 * );
 *
 * const combined = ISetMapped.union(left, right);
 *
 * assert.deepStrictEqual(Array.from(combined), [
 *   { x: 1, tag: 'a' },
 *   { x: 2, tag: 'b' },
 * ]);
 * ```
 *
 * @template K The type of the elements.
 * @template KM The type of the mapped keys.
 * @param a The first set.
 * @param b The second set.
 * @returns A new ISetMapped instance representing the union.
 */
export const union = <K, KM extends MapSetKeyType>(
  a: ISetMapped<K, KM>,
  b: ISetMapped<K, KM>,
): ISetMapped<K, KM> => a.union(b);

/**
 * Internal class implementation for ISetMapped providing immutable set
 * operations with element transformation.
 *
 * This class implements the ISetMapped interface by maintaining a JavaScript
 * Set with primitive keys internally while exposing an API that works with
 * custom element types. The transformation between custom and primitive
 * elements is handled transparently through the provided `toKey` and `fromKey`
 * functions.
 *
 * **Implementation Details:**
 *
 * - Uses ReadonlySet<KM> internally where KM is the primitive key type
 * - Stores transformation functions for bidirectional element conversion
 * - Implements copy-on-write semantics for efficiency
 * - Provides optional debug messaging for development
 *
 * @template K The type of the custom elements.
 * @template KM The type of the mapped primitive keys.
 * @implements ISetMapped
 * @implements Iterable
 * @internal This class should not be used directly. Use ISetMapped.create() instead.
 */
class ISetMappedClass<K, KM extends MapSetKeyType>
  implements ISetMapped<K, KM>, Iterable<K>
{
  readonly #set: ReadonlySet<KM>;
  readonly #toKey: (a: K) => KM;
  readonly #fromKey: (k: KM) => K;

  /**
   * Constructs an ISetMappedClass instance with custom element transformation.
   *
   * @param iterable An iterable of elements using the custom element type K.
   * @param toKey A function that converts a custom element K to a primitive key
   *   KM. Must be deterministic and produce unique values for unique elements.
   * @param fromKey A function that converts a primitive key KM back to the
   *   custom element K. Should be the inverse of the toKey function.
   * @internal Use ISetMapped.create() instead of calling this constructor directly.
   */
  constructor(
    iterable: Iterable<K>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K,
  ) {
    this.#set = new Set(Array.from(iterable, toKey));

    this.#toKey = toKey;

    this.#fromKey = fromKey;
  }

  /** @inheritdoc */
  get size(): SizeType.Arr {
    return asUint32(this.#set.size);
  }

  /** @inheritdoc */
  get isEmpty(): boolean {
    return this.size === 0;
  }

  /** @inheritdoc */
  has(key: K | (WidenLiteral<K> & {})): boolean {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return this.#set.has(this.#toKey(key as K));
  }

  /** @inheritdoc */
  every<L extends K>(
    predicate: (key: K) => key is L,
  ): this is ISetMapped<L, KM>;

  /** @inheritdoc */
  every(predicate: (key: K) => boolean): boolean;

  /** @inheritdoc */
  every(predicate: (key: K) => boolean): boolean {
    for (const key of this.values()) {
      if (!predicate(key)) {
        return false;
      }
    }

    return true;
  }

  /** @inheritdoc */
  some(predicate: (key: K) => boolean): boolean {
    for (const key of this.values()) {
      if (predicate(key)) {
        return true;
      }
    }

    return false;
  }

  /** @inheritdoc */
  add(key: K): ISetMapped<K, KM> {
    if (this.has(key)) {
      return this;
    }

    return create(
      [...this.#set, this.#toKey(key)].map(this.#fromKey),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  delete(key: K): ISetMapped<K, KM> {
    // Through the native collection, which compares keys with SameValueZero as
    // `has` and `get` do; a rebuild comparing with `Object.is` left a `-0` key
    // unmatched.
    return this.has(key) ? this.withMutations([{ type: 'delete', key }]) : this;
  }

  /** @inheritdoc */
  withMutations(
    actions: readonly Readonly<
      { type: 'add'; key: K } | { type: 'delete'; key: K }
    >[],
  ): ISetMapped<K, KM> {
    const mut_result = new Set<KM>(this.#set);

    const updateFn = (
      action: Readonly<{ type: 'add'; key: K } | { type: 'delete'; key: K }>,
    ): void => {
      const key = this.#toKey(action.key);

      switch (action.type) {
        case 'delete':
          mut_result.delete(key);

          break;

        case 'add':
          mut_result.add(key);

          break;
      }
    };

    for (const action of actions) {
      updateFn(action);
    }

    return create<K, KM>(
      Array.from(mut_result, this.#fromKey),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  map(mapFn: (key: K) => K): ISetMapped<K, KM> {
    return create(this.toArray().map(mapFn), this.#toKey, this.#fromKey);
  }

  /** @inheritdoc */
  filter(predicate: (key: K) => boolean): ISetMapped<K, KM> {
    return create(this.toArray().filter(predicate), this.#toKey, this.#fromKey);
  }

  /** @inheritdoc */
  filterNot(predicate: (key: K) => boolean): ISetMapped<K, KM> {
    return create(
      this.toArray().filter((k) => !predicate(k)),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  forEach(callbackfn: (key: K) => void): void {
    for (const km of this.#set) {
      callbackfn(this.#fromKey(km));
    }
  }

  /** @inheritdoc */
  isSubsetOf(set: ISetMapped<K, KM>): boolean {
    return this.every((k) => set.has(k));
  }

  /** @inheritdoc */
  isSupersetOf(set: ISetMapped<K, KM>): boolean {
    return set.every((k) => this.has(k));
  }

  /** @inheritdoc */
  subtract(set: ISetMapped<K, KM>): ISetMapped<K, KM> {
    return create(
      this.toArray().filter((k) => !set.has(k)),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  intersect(set: ISetMapped<K, KM>): ISetMapped<K, KM> {
    return create(
      this.toArray().filter((k) => set.has(k)),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  union(set: ISetMapped<K, KM>): ISetMapped<K, KM> {
    return create(
      [...this.values(), ...set.values()],
      this.#toKey,
      this.#fromKey,
    );
  }

  /**
   * @example
   *
   * ```ts
   * type Point = Readonly<{ x: number; tag: string }>;
   *
   * const toKey = (point: Point) => JSON.stringify(point);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const set = ISetMapped.create<Point, string>(
   *   [
   *     { x: 1, tag: 'a' },
   *     { x: 2, tag: 'b' },
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const collected = Array.from(set);
   *
   * assert.deepStrictEqual(collected, [
   *   { x: 1, tag: 'a' },
   *   { x: 2, tag: 'b' },
   * ]);
   * ```
   *
   * @inheritdoc
   */
  *[Symbol.iterator](): Iterator<K> {
    for (const k of this.keys()) {
      yield k;
    }
  }

  /** @inheritdoc */
  *keys(): IterableIterator<K> {
    for (const km of this.#set) {
      yield this.#fromKey(km);
    }
  }

  /** @inheritdoc */
  *values(): IterableIterator<K> {
    for (const km of this.#set) {
      // JavaScript Set's values() is an alias for keys()
      yield this.#fromKey(km);
    }
  }

  /** @inheritdoc */
  *entries(): IterableIterator<FixedLengthTuple<2, K>> {
    for (const km of this.#set) {
      // JavaScript Set's entries() yields [value, value]
      const a = this.#fromKey(km);

      yield [a, a];
    }
  }

  /** @inheritdoc */
  toArray(): readonly K[] {
    return Array.from(this.values());
  }

  /** @inheritdoc */
  toRawSet(): ReadonlySet<KM> {
    return this.#set;
  }
}
