// No imports from functional needed anymore
import { asUint32 } from '../number/index.mjs';
import { unknownToString } from '../others/index.mjs';

/**
 * Interface for an immutable set with membership testing and set operation
 * support.
 *
 * This interface defines all methods and properties available on ISet
 * instances. All operations that modify the set return new ISet instances,
 * preserving immutability. The underlying implementation uses JavaScript's
 * native Set but creates copies on mutations to maintain immutability.
 *
 * **Immutability Guarantees:**
 *
 * - All mutation operations (add, delete) return new ISet instances
 * - Original ISet instances are never modified
 * - Safe for concurrent access and functional programming patterns
 *
 * **Performance Characteristics:**
 *
 * - has: O(1) average case
 * - add/delete: O(n) due to copying for immutability
 * - set operations (union, intersection, difference): O(n)
 * - map/filter operations: O(n)
 * - iteration: O(n)
 *
 * @template K The type of the elements in the set. Must extend MapSetKeyType
 *   (string, number, boolean, etc.)
 */
type ISetInterface<K extends MapSetKeyType> = Readonly<{
  // Getting information

  /**
   * The number of elements in the set.
   *
   * @example
   *
   * ```ts
   * const set = ISet.create([1, 2, 3]);
   *
   * assert.isTrue(set.size === 3);
   * ```
   */
  size: SizeType.Arr;

  /**
   * Checks if the set is empty.
   *
   * @example
   *
   * ```ts
   * const emptySet = ISet.create<number>([]);
   *
   * const filledSet = ISet.create([1, 2]);
   *
   * assert.isTrue(emptySet.isEmpty);
   *
   * assert.isFalse(filledSet.isEmpty);
   * ```
   */
  isEmpty: boolean;

  /**
   * Checks if an element exists in the set. Allows for wider literal types for
   * keys during checking.
   *
   * @example
   *
   * ```ts
   * const set = ISet.create(['apple', 'banana']);
   *
   * assert.isTrue(set.has('apple'));
   *
   * assert.isFalse(set.has('cherry'));
   * ```
   *
   * @param key The element to check.
   * @returns `true` if the element exists, `false` otherwise.
   */
  has: (key: K | (WidenLiteral<K> & {})) => boolean;

  // Reducing a value

  /**
   * Checks if all elements in the set satisfy a predicate.
   *
   * @example
   *
   * ```ts
   * const numbers = ISet.create([2, 4, 6]);
   *
   * const allEven = numbers.every((value) => value % 2 === 0);
   *
   * const narrowed = numbers.every(
   *   (value): value is 2 | 4 | 6 => value % 2 === 0,
   * );
   *
   * assert.isTrue(allEven);
   *
   * assert.isTrue(narrowed);
   * ```
   *
   * @param predicate A function to test each element.
   * @returns `true` if all elements satisfy the predicate, `false` otherwise.
   */
  every: ((predicate: (key: K) => boolean) => boolean) &
    /**
     * Checks if all elements in the set satisfy a type predicate. Narrows the
     * type of elements in the set if the predicate returns true for all
     * elements.
     *
     * @template L The narrowed type of the elements.
     * @param predicate A type predicate function.
     * @returns `true` if all elements satisfy the predicate, `false` otherwise.
     */
    (<L extends K>(predicate: (key: K) => key is L) => this is ISet<L>);

  /**
   * Checks if at least one element in the set satisfies a predicate.
   *
   * @example
   *
   * ```ts
   * const numbers = ISet.create([1, 3, 5]);
   *
   * assert.isTrue(numbers.some((value) => value > 4));
   *
   * assert.isFalse(numbers.some((value) => value > 10));
   * ```
   *
   * @param predicate A function to test each element.
   * @returns `true` if at least one element satisfies the predicate, `false`
   *   otherwise.
   */
  some: (predicate: (key: K) => boolean) => boolean;

  // Mutation

  /**
   * Adds an element to the set.
   *
   * @example
   *
   * ```ts
   * const base = ISet.create<number>([1, 2]);
   *
   * const withThree = base.add(3);
   *
   * const unchanged = base.add(2);
   *
   * assert.deepStrictEqual(Array.from(withThree), [1, 2, 3]);
   *
   * assert.isTrue(unchanged === base);
   * ```
   *
   * @param key The element to add.
   * @returns A new ISet instance with the element added.
   */
  add: (key: K) => ISet<K>;

  /**
   * Deletes an element from the set.
   *
   * @example
   *
   * ```ts
   * const base = ISet.create<number>([1, 2, 3]);
   *
   * const withoutTwo = base.delete(2);
   *
   * const unchanged = base.delete(4);
   *
   * assert.deepStrictEqual(Array.from(withoutTwo), [1, 3]);
   *
   * assert.isTrue(unchanged === base);
   * ```
   *
   * @param key The element to delete.
   * @returns A new ISet instance without the specified element.
   */
  delete: (key: K) => ISet<K>;

  /**
   * Applies a series of mutations to the set.
   *
   * @example
   *
   * ```ts
   * const base = ISet.create<string>(['a', 'b']);
   *
   * const actions: readonly Readonly<
   *   { type: 'add'; key: string } | { type: 'delete'; key: string }
   * >[] = [
   *   { type: 'add', key: 'c' },
   *   { type: 'delete', key: 'a' },
   * ] as const;
   *
   * const mutated = base.withMutations(actions);
   *
   * assert.deepStrictEqual(Array.from(mutated), ['b', 'c']);
   *
   * assert.deepStrictEqual(Array.from(base), ['a', 'b']);
   * ```
   *
   * @param actions An array of mutation actions (add or delete).
   * @returns A new ISet instance with all mutations applied.
   */
  withMutations: (
    actions: readonly Readonly<
      { type: 'add'; key: K } | { type: 'delete'; key: K }
    >[],
  ) => ISet<K>;

  // Sequence algorithms

  /**
   * Maps the elements of the set to new elements.
   *
   * @example
   *
   * ```ts
   * const letters = ISet.create(['a', 'b']);
   *
   * const upper = letters.map((value) => value.toUpperCase());
   *
   * assert.deepStrictEqual(Array.from(upper), ['A', 'B']);
   * ```
   *
   * @template K2 The type of the new elements.
   * @param mapFn A function that maps an element to a new element.
   * @returns A new ISet instance with mapped elements.
   */
  map: <K2 extends MapSetKeyType>(mapFn: (key: K) => K2) => ISet<K2>;

  /**
   * Filters the elements of the set based on a type predicate. Narrows the type
   * of elements in the resulting set.
   *
   * @example
   *
   * ```ts
   * const letters = ISet.create(['apple', 'bee', 'cat']);
   *
   * const shortWords = letters.filter((value) => value.length <= 3);
   *
   * const narrowed = letters.filter(
   *   (value): value is 'bee' | 'cat' => value.length === 3,
   * );
   *
   * assert.deepStrictEqual(Array.from(shortWords), ['bee', 'cat']);
   *
   * assert.deepStrictEqual(Array.from(narrowed), ['bee', 'cat']);
   * ```
   *
   * @template K2 The narrowed type of the elements.
   * @param predicate A type predicate function.
   * @returns A new ISet instance with elements that satisfy the type predicate.
   */
  filter: (<K2 extends K>(predicate: (key: K) => key is K2) => ISet<K2>) &
    /**
     * Filters the elements of the set based on a predicate.
     *
     * @param predicate A function to test each element.
     * @returns A new ISet instance with elements that satisfy the predicate.
     */
    ((predicate: (key: K) => boolean) => ISet<K>);

  /**
   * Filters the elements of the set by excluding elements for which the
   * predicate returns true.
   *
   * @example
   *
   * ```ts
   * const numbers = ISet.create([1, 2, 3, 4]);
   *
   * const withoutEven = numbers.filterNot((value) => value % 2 === 0);
   *
   * assert.deepStrictEqual(Array.from(withoutEven), [1, 3]);
   * ```
   *
   * @param predicate A function to test each element.
   * @returns A new ISet instance with elements for which the predicate returned
   *   `false`.
   */
  filterNot: (predicate: (key: K) => boolean) => ISet<K>;

  // Set operations

  /**
   * Checks if this set is a subset of another set.
   *
   * @example
   *
   * ```ts
   * const subset = ISet.create<number>([1, 2]);
   *
   * const superset = ISet.create<number>([1, 2, 3]);
   *
   * assert.isTrue(subset.isSubsetOf(superset));
   *
   * assert.isFalse(superset.isSubsetOf(subset));
   * ```
   *
   * @param set The other set.
   * @returns `true` if this set is a subset of the other set, `false`
   *   otherwise.
   */
  isSubsetOf: (set: ISet<WidenLiteral<K>>) => boolean;

  /**
   * Checks if this set is a superset of another set.
   *
   * @example
   *
   * ```ts
   * const superset = ISet.create<string>(['a', 'b', 'c']);
   *
   * const subset = ISet.create<string>(['a', 'c']);
   *
   * assert.isTrue(superset.isSupersetOf(subset));
   *
   * assert.isFalse(subset.isSupersetOf(superset));
   * ```
   *
   * @param set The other set.
   * @returns `true` if this set is a superset of the other set, `false`
   *   otherwise.
   */
  isSupersetOf: (set: ISet<WidenLiteral<K>>) => boolean;

  /**
   * Returns a new set with elements that are in this set but not in another
   * set.
   *
   * @example
   *
   * ```ts
   * const all = ISet.create<number>([1, 2, 3, 4]);
   *
   * const toRemove = ISet.create<number>([2, 4]);
   *
   * const difference = all.subtract(toRemove);
   *
   * assert.deepStrictEqual(Array.from(difference), [1, 3]);
   * ```
   *
   * @param set The other set.
   * @returns A new ISet instance representing the set difference.
   */
  subtract: (set: ISet<K>) => ISet<K>;

  /**
   * Returns a new set with elements that are common to both this set and
   * another set.
   *
   * @example
   *
   * ```ts
   * const left = ISet.create<string>(['x', 'y']);
   *
   * const right = ISet.create<string>(['y', 'z']);
   *
   * const shared = left.intersect(right);
   *
   * assert.deepStrictEqual(Array.from(shared), ['y']);
   * ```
   *
   * @param set The other set.
   * @returns A new ISet instance representing the set intersection.
   */
  intersect: (set: ISet<K>) => ISet<K>;

  /**
   * Returns a new set with all elements from both this set and another set.
   *
   * @example
   *
   * ```ts
   * const numbers = ISet.create([1, 2]);
   *
   * const letters = ISet.create(['a', 'b']);
   *
   * const combined = numbers.union(letters);
   *
   * assert.deepStrictEqual(Array.from(combined), [1, 2, 'a', 'b']);
   * ```
   *
   * @template K2 The type of elements in the other set.
   * @param set The other set.
   * @returns A new ISet instance representing the set union.
   */
  union: <K2 extends MapSetKeyType>(set: ISet<K2>) => ISet<K | K2>;

  // Side effects

  /**
   * Executes a callback function for each element in the set.
   *
   * @example
   *
   * ```ts
   * const set = ISet.create(['alpha', 'beta']);
   *
   * const mut_collected: string[] = [];
   *
   * for (const value of set) {
   *   mut_collected.push(value);
   * }
   *
   * assert.deepStrictEqual(mut_collected, ['alpha', 'beta']);
   * ```
   *
   * @param callbackfn A function to execute for each element.
   */
  forEach: (callbackfn: (key: K) => void) => void;

  // Iterators

  /**
   * Returns an iterator for the elements in the set (alias for values).
   *
   * @example
   *
   * ```ts
   * const set = ISet.create([1, 2]);
   *
   * const keys = Array.from(set.keys());
   *
   * assert.deepStrictEqual(keys, [1, 2]);
   * ```
   *
   * @returns An iterable iterator of elements.
   */
  keys: () => IterableIterator<K>;

  /**
   * Returns an iterator for the elements in the set.
   *
   * @example
   *
   * ```ts
   * const set = ISet.create(['x', 'y']);
   *
   * const values = Array.from(set.values());
   *
   * assert.deepStrictEqual(values, ['x', 'y']);
   * ```
   *
   * @returns An iterable iterator of elements.
   */
  values: () => IterableIterator<K>;

  /**
   * Returns an iterator for the entries (element-element pairs) in the set.
   *
   * @example
   *
   * ```ts
   * const set = ISet.create(['red', 'blue']);
   *
   * const entries = Array.from(set.entries());
   *
   * assert.deepStrictEqual(entries, [
   *   ['red', 'red'],
   *   ['blue', 'blue'],
   * ]);
   * ```
   *
   * @returns An iterable iterator of entries.
   */
  entries: () => IterableIterator<readonly [K, K]>;

  // Conversion

  /**
   * Converts the elements of the set to an array.
   *
   * @example
   *
   * ```ts
   * const set = ISet.create(['north', 'south']);
   *
   * assert.deepStrictEqual(set.toArray(), ['north', 'south']);
   * ```
   *
   * @returns A readonly array of elements.
   */
  toArray: () => readonly K[];

  /**
   * Returns the underlying readonly JavaScript Set.
   *
   * @example
   *
   * ```ts
   * const set = ISet.create(['alpha']);
   *
   * const raw = set.toRawSet();
   *
   * assert.isTrue(isSet(raw));
   *
   * assert.isTrue(raw.has('alpha'));
   * ```
   *
   * @returns The raw ReadonlySet instance.
   */
  toRawSet: () => ReadonlySet<K>;
}>;

/**
 * Represents an immutable set with high-performance operations and
 * comprehensive set algebra support.
 *
 * ISet is a persistent data structure that provides all the functionality of
 * JavaScript's Set while maintaining immutability. All operations that would
 * normally mutate the set instead return new ISet instances, making it safe for
 * functional programming and concurrent access.
 *
 * **Key Features:**
 *
 * - **Immutable**: All mutation operations return new instances
 * - **Set Operations**: Full support for union, intersection, difference,
 *   subset/superset checks
 * - **Type Safe**: Full TypeScript support with generic element types
 * - **Iterable**: Implements standard JavaScript iteration protocols
 * - **Functional**: Rich API for map, filter, and functional composition
 *
 * **When to Use:**
 *
 * - Managing collections of unique values with immutability guarantees
 * - Set algebra operations (unions, intersections, differences)
 * - Membership testing with O(1) performance
 * - Functional programming patterns requiring immutable collections
 *
 * @template K The type of the elements in the set. Must extend MapSetKeyType.
 */
export type ISet<K extends MapSetKeyType> = Iterable<K> & ISetInterface<K>;

/** Provides utility functions for ISet. */
export namespace ISet {
  /**
   * Creates a new ISet instance from an iterable of elements.
   *
   * This factory function accepts any iterable of elements, including arrays,
   * JavaScript Sets, other ISets, or custom iterables. Duplicate elements in
   * the input iterable will be automatically deduplicated in the resulting
   * set.
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
   * Two ISets are considered equal if they have the same size and contain
   * exactly the same elements. The order of elements does not matter for
   * equality comparison since sets are unordered collections. Elements are
   * compared using JavaScript's `===` operator.
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
   * This function performs a set difference operation to determine what
   * elements were added and what elements were deleted when transitioning from
   * the old set to the new set. This is useful for change detection, state
   * management, and synchronization scenarios.
   *
   * **Performance:** O(n + m) where n and m are the sizes of the old and new
   * sets respectively.
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
   * **Performance:** O(min(n, m)) where n and m are the sizes of the input
   * sets.
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
}

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
  readonly #showNotFoundMessage: boolean;

  /**
   * Constructs an ISetClass instance with the given elements.
   *
   * @param iterable An iterable of elements to populate the set.
   * @param showNotFoundMessage Whether to log warning messages when operations
   *   are performed on non-existent elements. Useful for debugging. Defaults to
   *   false for production use.
   * @internal Use ISet.create() instead of calling this constructor directly.
   */
  constructor(iterable: Iterable<K>, showNotFoundMessage: boolean = false) {
    this.#set = new Set(iterable);

    this.#showNotFoundMessage = showNotFoundMessage;
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
    return this.#set.has(key as K);
  }

  /** @inheritdoc */
  every<L extends K>(predicate: (key: K) => key is L): this is ISet<L>;

  /** @inheritdoc */
  every(predicate: (key: K) => boolean): boolean;

  /** @inheritdoc */
  every(predicate: (key: K) => boolean): boolean {
    for (const key of this.values()) {
      if (!predicate(key)) return false;
    }

    return true;
  }

  /** @inheritdoc */
  some(predicate: (key: K) => boolean): boolean {
    for (const key of this.values()) {
      if (predicate(key)) return true;
    }

    return false;
  }

  /** @inheritdoc */
  add(key: K): ISet<K> {
    if (this.has(key)) return this;

    return ISet.create([...this.#set, key]);
  }

  /** @inheritdoc */
  delete(key: K): ISet<K> {
    if (!this.has(key)) {
      if (this.#showNotFoundMessage) {
        const keyStr = unknownToString(key);

        console.warn(`ISet.delete: key not found: ${keyStr}`);
      }

      return this;
    }

    return ISet.create(Array.from(this.#set).filter((k) => !Object.is(k, key)));
  }

  /** @inheritdoc */
  withMutations(
    actions: readonly Readonly<
      { type: 'add'; key: K } | { type: 'delete'; key: K }
    >[],
  ): ISet<K> {
    const mut_result = new Set<K>(this.#set);

    for (const action of actions) {
      switch (action.type) {
        case 'delete':
          mut_result.delete(action.key);

          break;

        case 'add':
          mut_result.add(action.key);

          break;
      }
    }

    return ISet.create(mut_result);
  }

  /** @inheritdoc */
  map<K2 extends MapSetKeyType>(mapFn: (key: K) => K2): ISet<K2> {
    return ISet.create(this.toArray().map(mapFn));
  }

  /** @inheritdoc */
  filter<K2 extends K>(predicate: (key: K) => key is K2): ISet<K2>;

  /** @inheritdoc */
  filter(predicate: (key: K) => boolean): ISet<K>;

  /** @inheritdoc */
  filter(predicate: (key: K) => boolean): ISet<K> {
    return ISet.create(this.toArray().filter(predicate));
  }

  /** @inheritdoc */
  filterNot(predicate: (key: K) => boolean): ISet<K> {
    return ISet.create(this.toArray().filter((e) => !predicate(e)));
  }

  /** @inheritdoc */
  forEach(callbackfn: (key: K) => void): void {
    for (const v of this.#set.values()) {
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
    return ISet.create(this.toArray().filter((k) => !set.has(k)));
  }

  /** @inheritdoc */
  intersect(set: ISet<K>): ISet<K> {
    return ISet.create(this.toArray().filter((k) => set.has(k)));
  }

  /** @inheritdoc */
  union<K2 extends MapSetKeyType>(set: ISet<K2>): ISet<K | K2> {
    return ISet.create([...this, ...set]);
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
  entries(): IterableIterator<readonly [K, K]> {
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
