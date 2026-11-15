/* eslint-disable unicorn/prefer-iterator-to-array-at-end */
import type {
  FixedLengthTuple,
  ReadonlyRecord,
  WidenLiteral,
} from 'ts-type-forge';
import { asUint32 } from '../number/index.mjs';
import type { MapSetKeyType, SizeType } from '../types.mjs';
import type { ISet } from './iset.mjs';

/**
 * Creates a new ISet instance from an iterable of elements.
 *
 * This factory function accepts any iterable of elements, including arrays,
 * JavaScript Sets, other ISets, or custom iterables. Duplicate elements in the
 * input iterable will be automatically deduplicated in the resulting set.
 *
 * **Performance:** O(n) where n is the number of elements in the iterable.
 *
 * @example
 *
 * ```ts
 * const set = ISet.create(['a', 'a', 'b']);
 *
 * assert.deepStrictEqual(Array.from(set), ['a', 'b']);
 * ```
 *
 * @template K The type of the elements. Must extend MapSetKeyType.
 * @param iterable An iterable of elements (e.g., Array, Set, ISet, etc.)
 * @returns A new ISet instance containing all unique elements from the
 *   iterable.
 */
export const create = <K extends MapSetKeyType>(
  iterable: Iterable<K>,
): ISet<K> => new ISetClass<K>(iterable);

/**
 * Checks if two ISet instances are structurally equal.
 *
 * Two ISets are considered equal if they have the same size and contain exactly
 * the same elements. The order of elements does not matter for equality
 * comparison since sets are unordered collections. Elements are compared using
 * JavaScript's `===` operator.
 *
 * **Performance:** O(n) where n is the size of the smaller set.
 *
 * @example
 *
 * ```ts
 * const first = ISet.create<number>([1, 2]);
 *
 * const second = ISet.create<number>([2, 1]);
 *
 * const third = ISet.create<number>([1, 3]);
 *
 * assert.isTrue(ISet.equal(first, second));
 *
 * assert.isFalse(ISet.equal(first, third));
 * ```
 *
 * @template K The type of the elements.
 * @param a The first ISet instance to compare.
 * @param b The second ISet instance to compare.
 * @returns `true` if the sets contain exactly the same elements, `false`
 *   otherwise.
 */
export const equal = <K extends MapSetKeyType>(
  a: ISet<K>,
  b: ISet<K>,
): boolean => a.size === b.size && a.every((e) => b.has(e));

/**
 * Computes the difference between two ISet instances, identifying added and
 * deleted elements.
 *
 * This function performs a set difference operation to determine what elements
 * were added and what elements were deleted when transitioning from the old set
 * to the new set. This is useful for change detection, state management, and
 * synchronization scenarios.
 *
 * **Performance:** O(n + m) where n and m are the sizes of the old and new sets
 * respectively.
 *
 * @example
 *
 * ```ts
 * const previous = ISet.create<string>(['draft', 'review']);
 *
 * const current = ISet.create<string>(['review', 'published']);
 *
 * const { added, deleted } = ISet.diff(previous, current);
 *
 * assert.deepStrictEqual(Array.from(added), ['published']);
 *
 * assert.deepStrictEqual(Array.from(deleted), ['draft']);
 * ```
 *
 * @template K The type of the elements.
 * @param oldSet The original set representing the previous state.
 * @param newSet The new set representing the current state.
 * @returns An object with `added` and `deleted` properties, each containing
 *   an ISet of elements that were added or removed respectively.
 */
export const diff = <K extends MapSetKeyType>(
  oldSet: ISet<K>,
  newSet: ISet<K>,
): ReadonlyRecord<'added' | 'deleted', ISet<K>> =>
  ({
    deleted: oldSet.subtract(newSet),
    added: newSet.subtract(oldSet),
  }) as const;

/**
 * Computes the intersection of two ISet instances.
 *
 * Returns a new set containing only the elements that are present in both
 * input sets. This operation is commutative: `intersection(a, b) ===
 * intersection(b, a)`.
 *
 * **Performance:** O(min(n, m)) where n and m are the sizes of the input sets.
 *
 * @example
 *
 * ```ts
 * const left = ISet.create<number>([1, 2, 3]);
 *
 * const right = ISet.create<number>([2, 4]);
 *
 * const overlap = ISet.intersection(left, right);
 *
 * assert.deepStrictEqual(Array.from(overlap), [2]);
 * ```
 *
 * @template K The type of the elements.
 * @param a The first set.
 * @param b The second set.
 * @returns A new ISet instance containing elements common to both sets.
 */
export const intersection = <K extends MapSetKeyType>(
  a: ISet<K>,
  b: ISet<K>,
): ISet<K> => a.intersect(b);

/**
 * Computes the union of two ISet instances.
 *
 * Returns a new set containing all elements that are present in either input
 * set. Duplicate elements are automatically handled since sets only contain
 * unique values. This operation is commutative: `union(a, b) === union(b,
 * a)`.
 *
 * **Performance:** O(n + m) where n and m are the sizes of the input sets.
 *
 * @example
 *
 * ```ts
 * const numbers = ISet.create([1, 2]);
 *
 * const words = ISet.create(['one', 'two']);
 *
 * const union = ISet.union(numbers, words);
 *
 * assert.deepStrictEqual(Array.from(union), [1, 2, 'one', 'two']);
 * ```
 *
 * @template K1 The type of elements in the first set.
 * @template K2 The type of elements in the second set.
 * @param a The first set.
 * @param b The second set.
 * @returns A new ISet instance containing all elements from both sets.
 */
export const union = <K1 extends MapSetKeyType, K2 extends MapSetKeyType>(
  a: ISet<K1>,
  b: ISet<K2>,
): ISet<K1 | K2> => a.union(b);

/**
 * Internal class implementation for ISet providing immutable set operations.
 *
 * This class implements the ISet interface using JavaScript's native Set as the
 * underlying storage mechanism for optimal performance. All mutation operations
 * create new instances rather than modifying the existing set, ensuring
 * immutability.
 *
 * **Implementation Details:**
 *
 * - Uses ReadonlySet<K> internally for type safety and performance
 * - Implements copy-on-write semantics for efficiency
 * - Provides optional debug messaging for development
 *
 * @template K The type of the elements. Must extend MapSetKeyType.
 * @implements ISet
 * @implements Iterable
 * @internal This class should not be used directly. Use ISet.create() instead.
 */
class ISetClass<K extends MapSetKeyType> implements ISet<K>, Iterable<K> {
  readonly #set: ReadonlySet<K>;

  /**
   * Constructs an ISetClass instance with the given elements.
   *
   * @param iterable An iterable of elements to populate the set.
   * @internal Use ISet.create() instead of calling this constructor directly.
   */
  constructor(iterable: Iterable<K>) {
    this.#set = new Set(iterable);
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
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion, @typescript-eslint/no-unnecessary-type-assertion -- unnecessary only under the strict standard library; the stock one types `has` as taking exactly `K`
    return this.#set.has(key as K);
  }

  /** @inheritdoc */
  every<L extends K>(predicate: (key: K) => key is L): this is ISet<L>;

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
  add(key: K): ISet<K> {
    return this.has(key) ? this : create([...this.#set, key]);
  }

  /** @inheritdoc */
  delete(key: K): ISet<K> {
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
  ): ISet<K> {
    const mut_result = new Set<K>(this.#set);

    const updateFn = (
      action: Readonly<{ type: 'add'; key: K } | { type: 'delete'; key: K }>,
    ): void => {
      switch (action.type) {
        case 'delete':
          mut_result.delete(action.key);

          break;

        case 'add':
          mut_result.add(action.key);

          break;
      }
    };

    for (const action of actions) {
      updateFn(action);
    }

    return create(mut_result);
  }

  /** @inheritdoc */
  map<K2 extends MapSetKeyType>(mapFn: (key: K) => K2): ISet<K2> {
    return create(this.toArray().map(mapFn));
  }

  /** @inheritdoc */
  filter<K2 extends K>(predicate: (key: K) => key is K2): ISet<K2>;

  /** @inheritdoc */
  filter(predicate: (key: K) => boolean): ISet<K>;

  /** @inheritdoc */
  filter(predicate: (key: K) => boolean): ISet<K> {
    return create(this.toArray().filter(predicate));
  }

  /** @inheritdoc */
  filterNot(predicate: (key: K) => boolean): ISet<K> {
    return create(this.toArray().filter((e) => !predicate(e)));
  }

  /** @inheritdoc */
  forEach(callbackfn: (key: K) => void): void {
    for (const v of this.#set) {
      callbackfn(v);
    }
  }

  /** @inheritdoc */
  isSubsetOf(set: ISet<WidenLiteral<K>>): boolean {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return this.every((k) => set.has(k as WidenLiteral<K>));
  }

  /** @inheritdoc */
  isSupersetOf(set: ISet<WidenLiteral<K>>): boolean {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return set.every((k) => this.has(k as K));
  }

  /** @inheritdoc */
  subtract(set: ISet<K>): ISet<K> {
    return create(this.toArray().filter((k) => !set.has(k)));
  }

  /** @inheritdoc */
  intersect(set: ISet<K>): ISet<K> {
    return create(this.toArray().filter((k) => set.has(k)));
  }

  /** @inheritdoc */
  union<K2 extends MapSetKeyType>(set: ISet<K2>): ISet<K | K2> {
    return create([...this, ...set]);
  }

  /**
   * @example
   *
   * ```ts
   * const set = ISet.create(['first', 'second']);
   *
   * const collected = Array.from(set);
   *
   * assert.deepStrictEqual(collected, ['first', 'second']);
   * ```
   *
   * @inheritdoc
   */
  [Symbol.iterator](): Iterator<K> {
    return this.#set[Symbol.iterator]();
  }

  /** @inheritdoc */
  keys(): IterableIterator<K> {
    return this.#set.keys();
  }

  /** @inheritdoc */
  values(): IterableIterator<K> {
    return this.#set.values();
  }

  /** @inheritdoc */
  entries(): IterableIterator<FixedLengthTuple<2, K>> {
    return this.#set.entries();
  }

  /** @inheritdoc */
  toArray(): readonly K[] {
    return Array.from(this.values());
  }

  /** @inheritdoc */
  toRawSet(): ReadonlySet<K> {
    return this.#set;
  }
}
