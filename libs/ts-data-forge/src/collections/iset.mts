// No imports from functional needed anymore
import { asUint32 } from '../number/index.mjs';
import { unknownToString } from '../others/index.mjs';

/**
 * Interface for an immutable set with O(1) lookup performance and set operation support.
 *
 * This interface defines all methods and properties available on ISet instances. All operations
 * that modify the set return new ISet instances, preserving immutability. The underlying implementation
 * uses JavaScript's native Set for O(1) average-case performance on add, has, and delete operations.
 *
 * **Immutability Guarantees:**
 * - All mutation operations (add, delete) return new ISet instances
 * - Original ISet instances are never modified
 * - Safe for concurrent access and functional programming patterns
 *
 * **Performance Characteristics:**
 * - has/add/delete: O(1) average case
 * - Set operations (union, intersection, difference): O(n)
 * - map/filter operations: O(n)
 * - Iteration: O(n)
 *
 * @template K The type of the elements in the set. Must extend MapSetKeyType (string, number, boolean, etc.)
 */
type ISetInterface<K extends MapSetKeyType> = Readonly<{
  // Getting information

  /** The number of elements in the set. */
  size: SizeType.Arr;

  /** Checks if the set is empty. */
  isEmpty: boolean;
  /**
   * Checks if an element exists in the set.
   * Allows for wider literal types for keys during checking.
   * @param key The element to check.
   * @returns `true` if the element exists, `false` otherwise.
   */
  has: (key: K | (WidenLiteral<K> & {})) => boolean;

  // Reducing a value

  /**
   * Checks if all elements in the set satisfy a predicate.
   * @param predicate A function to test each element.
   * @returns `true` if all elements satisfy the predicate, `false` otherwise.
   */
  every: ((predicate: (key: K) => boolean) => boolean) &
    /**
     * Checks if all elements in the set satisfy a type predicate.
     * Narrows the type of elements in the set if the predicate returns true for all elements.
     * @template L The narrowed type of the elements.
     * @param predicate A type predicate function.
     * @returns `true` if all elements satisfy the predicate, `false` otherwise.
     */
    (<L extends K>(predicate: (key: K) => key is L) => this is ISet<L>);

  /**
   * Checks if at least one element in the set satisfies a predicate.
   * @param predicate A function to test each element.
   * @returns `true` if at least one element satisfies the predicate, `false` otherwise.
   */
  some: (predicate: (key: K) => boolean) => boolean;

  // Mutation

  /**
   * Adds an element to the set.
   * @param key The element to add.
   * @returns A new ISet instance with the element added.
   */
  add: (key: K) => ISet<K>;

  /**
   * Deletes an element from the set.
   * @param key The element to delete.
   * @returns A new ISet instance without the specified element.
   */
  delete: (key: K) => ISet<K>;

  /**
   * Applies a series of mutations to the set.
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
   * @template K2 The type of the new elements.
   * @param mapFn A function that maps an element to a new element.
   * @returns A new ISet instance with mapped elements.
   */
  map: <K2 extends MapSetKeyType>(mapFn: (key: K) => K2) => ISet<K2>;

  /**
   * Filters the elements of the set based on a type predicate.
   * Narrows the type of elements in the resulting set.
   * @template K2 The narrowed type of the elements.
   * @param predicate A type predicate function.
   * @returns A new ISet instance with elements that satisfy the type predicate.
   */
  filter: (<K2 extends K>(predicate: (key: K) => key is K2) => ISet<K2>) &
    /**
     * Filters the elements of the set based on a predicate.
     * @param predicate A function to test each element.
     * @returns A new ISet instance with elements that satisfy the predicate.
     */
    ((predicate: (key: K) => boolean) => ISet<K>);

  /**
   * Filters the elements of the set by excluding elements for which the predicate returns true.
   * @param predicate A function to test each element.
   * @returns A new ISet instance with elements for which the predicate returned `false`.
   */
  filterNot: (predicate: (key: K) => boolean) => ISet<K>;

  // Set operations
  /**
   * Checks if this set is a subset of another set.
   * @param set The other set.
   * @returns `true` if this set is a subset of the other set, `false` otherwise.
   */
  isSubsetOf: (set: ISet<WidenLiteral<K>>) => boolean;
  /**
   * Checks if this set is a superset of another set.
   * @param set The other set.
   * @returns `true` if this set is a superset of the other set, `false` otherwise.
   */
  isSupersetOf: (set: ISet<WidenLiteral<K>>) => boolean;
  /**
   * Returns a new set with elements that are in this set but not in another set.
   * @param set The other set.
   * @returns A new ISet instance representing the set difference.
   */
  subtract: (set: ISet<K>) => ISet<K>;
  /**
   * Returns a new set with elements that are common to both this set and another set.
   * @param set The other set.
   * @returns A new ISet instance representing the set intersection.
   */
  intersect: (set: ISet<K>) => ISet<K>;
  /**
   * Returns a new set with all elements from both this set and another set.
   * @template K2 The type of elements in the other set.
   * @param set The other set.
   * @returns A new ISet instance representing the set union.
   */
  union: <K2 extends MapSetKeyType>(set: ISet<K2>) => ISet<K | K2>;

  // Side effects
  /**
   * Executes a callback function for each element in the set.
   * @param callbackfn A function to execute for each element.
   */
  forEach: (callbackfn: (key: K) => void) => void;

  // Iterators
  /**
   * Returns an iterator for the elements in the set (alias for values).
   * @returns An iterable iterator of elements.
   */
  keys: () => IterableIterator<K>;
  /**
   * Returns an iterator for the elements in the set.
   * @returns An iterable iterator of elements.
   */
  values: () => IterableIterator<K>;
  /**
   * Returns an iterator for the entries (element-element pairs) in the set.
   * @returns An iterable iterator of entries.
   */
  entries: () => IterableIterator<readonly [K, K]>;

  // Conversion
  /**
   * Converts the elements of the set to an array.
   * @returns A readonly array of elements.
   */
  toArray: () => readonly K[];
  /**
   * Returns the underlying readonly JavaScript Set.
   * @returns The raw ReadonlySet instance.
   */
  toRawSet: () => ReadonlySet<K>;
}>;

/**
 * Represents an immutable set with high-performance operations and comprehensive set algebra support.
 *
 * ISet is a persistent data structure that provides all the functionality of JavaScript's Set
 * while maintaining immutability. All operations that would normally mutate the set instead
 * return new ISet instances, making it safe for functional programming and concurrent access.
 *
 * **Key Features:**
 * - **Immutable**: All mutation operations return new instances
 * - **High Performance**: O(1) average-case for has/add/delete operations
 * - **Set Operations**: Full support for union, intersection, difference, subset/superset checks
 * - **Type Safe**: Full TypeScript support with generic element types
 * - **Iterable**: Implements standard JavaScript iteration protocols
 * - **Functional**: Rich API for map, filter, and functional composition
 *
 * **When to Use:**
 * - Managing collections of unique values with immutability guarantees
 * - Set algebra operations (unions, intersections, differences)
 * - Membership testing with O(1) performance
 * - Functional programming patterns requiring immutable collections
 *
 * @template K The type of the elements in the set. Must extend MapSetKeyType.
 */
export type ISet<K extends MapSetKeyType> = Iterable<K> & ISetInterface<K>;

/**
 * Provides utility functions for ISet.
 */
export namespace ISet {
  /**
   * Creates a new ISet instance from an iterable of elements.
   *
   * This factory function accepts any iterable of elements, including arrays,
   * JavaScript Sets, other ISets, or custom iterables. Duplicate elements in the
   * input iterable will be automatically deduplicated in the resulting set.
   *
   * **Performance:** O(n) where n is the number of elements in the iterable.
   *
   * @template K The type of the elements. Must extend MapSetKeyType.
   * @param iterable An iterable of elements (e.g., Array, Set, ISet, etc.)
   * @returns A new ISet instance containing all unique elements from the iterable.
   *
   * @example
   * ```typescript
   * // From array (duplicates automatically removed)
   * const uniqueIds = ISet.create([1, 2, 3, 2, 1]); // Contains: 1, 2, 3
   * console.log(uniqueIds.size); // Output: 3
   *
   * // From JavaScript Set
   * const jsSet = new Set(["red", "green", "blue"]);
   * const colors = ISet.create(jsSet);
   * console.log(colors.has("red")); // Output: true
   *
   * // From another ISet (creates a copy)
   * const originalTags = ISet.create(["typescript", "immutable"]);
   * const copiedTags = ISet.create(originalTags);
   * console.log(copiedTags.size); // Output: 2
   *
   * // Empty set
   * const emptyPermissions = ISet.create<string>([]);
   * console.log(emptyPermissions.isEmpty); // Output: true
   *
   * // Fluent operations
   * const processedNumbers = ISet.create([1, 2, 3, 4, 5])
   *   .filter(x => x % 2 === 0)  // Keep even numbers: 2, 4
   *   .add(6)                    // Add 6: 2, 4, 6
   *   .delete(2);                // Remove 2: 4, 6
   * console.log(processedNumbers.toArray().toSorted()); // Output: [4, 6]
   *
   * // From generator function
   * function* generatePrimes(): Generator<number> {
   *   yield 2; yield 3; yield 5; yield 7;
   * }
   * const primes = ISet.create(generatePrimes());
   * console.log(primes.size); // Output: 4
   * ```
   */
  export const create = <K extends MapSetKeyType>(
    iterable: Iterable<K>,
  ): ISet<K> => new ISetClass<K>(iterable);

  /**
   * Checks if two ISet instances are structurally equal.
   *
   * Two ISets are considered equal if they have the same size and contain exactly the same
   * elements. The order of elements does not matter for equality comparison since sets are
   * unordered collections. Elements are compared using JavaScript's `===` operator.
   *
   * **Performance:** O(n) where n is the size of the smaller set.
   *
   * @template K The type of the elements.
   * @param a The first ISet instance to compare.
   * @param b The second ISet instance to compare.
   * @returns `true` if the sets contain exactly the same elements, `false` otherwise.
   *
   * @example
   * ```typescript
   * // Basic equality comparison
   * const permissions1 = ISet.create(["read", "write", "execute"]);
   * const permissions2 = ISet.create(["execute", "read", "write"]); // Order doesn't matter
   * const permissions3 = ISet.create(["read", "write"]);
   *
   * console.log(ISet.equal(permissions1, permissions2)); // true
   * console.log(ISet.equal(permissions1, permissions3)); // false (different sizes)
   *
   * // With different element types
   * const numbers1 = ISet.create([1, 2, 3]);
   * const numbers2 = ISet.create([3, 1, 2]);
   * const numbers3 = ISet.create([1, 2, 4]); // Different element
   *
   * console.log(ISet.equal(numbers1, numbers2)); // true
   * console.log(ISet.equal(numbers1, numbers3)); // false
   *
   * // Empty sets
   * const empty1 = ISet.create<string>([]);
   * const empty2 = ISet.create<string>([]);
   * console.log(ISet.equal(empty1, empty2)); // true
   *
   * // Single element sets
   * const single1 = ISet.create(["unique"]);
   * const single2 = ISet.create(["unique"]);
   * const single3 = ISet.create(["different"]);
   *
   * console.log(ISet.equal(single1, single2)); // true
   * console.log(ISet.equal(single1, single3)); // false
   * ```
   */
  export const equal = <K extends MapSetKeyType>(
    a: ISet<K>,
    b: ISet<K>,
  ): boolean => a.size === b.size && a.every((e) => b.has(e));

  /**
   * Computes the difference between two ISet instances, identifying added and deleted elements.
   *
   * This function performs a set difference operation to determine what elements were added
   * and what elements were deleted when transitioning from the old set to the new set.
   * This is useful for change detection, state management, and synchronization scenarios.
   *
   * **Performance:** O(n + m) where n and m are the sizes of the old and new sets respectively.
   *
   * @template K The type of the elements.
   * @param oldSet The original set representing the previous state.
   * @param newSet The new set representing the current state.
   * @returns An object with `added` and `deleted` properties, each containing an ISet
   *          of elements that were added or removed respectively.
   *
   * @example
   * ```typescript
   * // User permission changes
   * const oldPermissions = ISet.create(["read", "write", "delete"]);
   * const newPermissions = ISet.create(["read", "write", "execute", "admin"]);
   *
   * const permissionDiff = ISet.diff(oldPermissions, newPermissions);
   *
   * console.log("Permissions removed:", permissionDiff.deleted.toArray());
   * // Output: ["delete"]
   *
   * console.log("Permissions added:", permissionDiff.added.toArray());
   * // Output: ["execute", "admin"]
   *
   * // No changes
   * const unchanged1 = ISet.create(["a", "b", "c"]);
   * const unchanged2 = ISet.create(["a", "b", "c"]);
   * const noDiff = ISet.diff(unchanged1, unchanged2);
   *
   * console.log(noDiff.added.isEmpty);   // true
   * console.log(noDiff.deleted.isEmpty); // true
   *
   * // Complete replacement
   * const oldTags = ISet.create(["javascript", "react"]);
   * const newTags = ISet.create(["typescript", "vue"]);
   * const tagDiff = ISet.diff(oldTags, newTags);
   *
   * console.log(tagDiff.deleted.toArray()); // ["javascript", "react"]
   * console.log(tagDiff.added.toArray());   // ["typescript", "vue"]
   * ```
   */
  export const diff = <K extends MapSetKeyType>(
    oldSet: ISet<K>,
    newSet: ISet<K>,
  ): ReadonlyRecord<'added' | 'deleted', ISet<K>> => ({
    deleted: oldSet.subtract(newSet),
    added: newSet.subtract(oldSet),
  });

  /**
   * Computes the intersection of two ISet instances.
   *
   * Returns a new set containing only the elements that are present in both input sets.
   * This operation is commutative: `intersection(a, b) === intersection(b, a)`.
   *
   * **Performance:** O(min(n, m)) where n and m are the sizes of the input sets.
   *
   * @template K The type of the elements.
   * @param a The first set.
   * @param b The second set.
   * @returns A new ISet instance containing elements common to both sets.
   *
   * @example
   * ```typescript
   * // Finding common permissions between user and role
   * const userPermissions = ISet.create(["read", "write", "delete", "admin"]);
   * const rolePermissions = ISet.create(["read", "write", "execute"]);
   *
   * const commonPermissions = ISet.intersection(userPermissions, rolePermissions);
   * console.log(commonPermissions.toArray()); // ["read", "write"]
   *
   * // No common elements
   * const setA = ISet.create([1, 2, 3]);
   * const setB = ISet.create([4, 5, 6]);
   * const noCommon = ISet.intersection(setA, setB);
   * console.log(noCommon.isEmpty); // true
   *
   * // Complete overlap
   * const identical1 = ISet.create(["a", "b", "c"]);
   * const identical2 = ISet.create(["a", "b", "c"]);
   * const completeOverlap = ISet.intersection(identical1, identical2);
   * console.log(ISet.equal(completeOverlap, identical1)); // true
   *
   * // Intersection with empty set
   * const nonEmpty = ISet.create([1, 2, 3]);
   * const empty = ISet.create<number>([]);
   * const withEmpty = ISet.intersection(nonEmpty, empty);
   * console.log(withEmpty.isEmpty); // true
   * ```
   */
  export const intersection = <K extends MapSetKeyType>(
    a: ISet<K>,
    b: ISet<K>,
  ): ISet<K> => a.intersect(b);

  /**
   * Computes the union of two ISet instances.
   *
   * Returns a new set containing all elements that are present in either input set.
   * Duplicate elements are automatically handled since sets only contain unique values.
   * This operation is commutative: `union(a, b) === union(b, a)`.
   *
   * **Performance:** O(n + m) where n and m are the sizes of the input sets.
   *
   * @template K1 The type of elements in the first set.
   * @template K2 The type of elements in the second set.
   * @param a The first set.
   * @param b The second set.
   * @returns A new ISet instance containing all elements from both sets.
   *
   * @example
   * ```typescript
   * // Combining permissions from multiple sources
   * const userPermissions = ISet.create(["read", "write"]);
   * const rolePermissions = ISet.create(["write", "execute", "admin"]);
   *
   * const allPermissions = ISet.union(userPermissions, rolePermissions);
   * console.log(allPermissions.toArray().toSorted());
   * // Output: ["admin", "execute", "read", "write"]
   *
   * // Union with different types (type widening)
   * const numbers = ISet.create([1, 2, 3]);
   * const strings = ISet.create(["a", "b"]);
   * const mixed = ISet.union(numbers, strings); // ISet<number | string>
   * console.log(mixed.size); // 5
   *
   * // Union with empty set
   * const nonEmpty = ISet.create(["item1", "item2"]);
   * const empty = ISet.create<string>([]);
   * const withEmpty = ISet.union(nonEmpty, empty);
   * console.log(ISet.equal(withEmpty, nonEmpty)); // true
   *
   * // Overlapping sets
   * const featuresA = ISet.create(["feature1", "feature2", "feature3"]);
   * const featuresB = ISet.create(["feature2", "feature3", "feature4"]);
   * const allFeatures = ISet.union(featuresA, featuresB);
   * console.log(allFeatures.size); // 4 (duplicates removed)
   * ```
   */
  export const union = <K1 extends MapSetKeyType, K2 extends MapSetKeyType>(
    a: ISet<K1>,
    b: ISet<K2>,
  ): ISet<K1 | K2> => a.union(b);
}

/**
 * Internal class implementation for ISet providing immutable set operations.
 *
 * This class implements the ISet interface using JavaScript's native Set as the underlying
 * storage mechanism for optimal performance. All mutation operations create new instances
 * rather than modifying the existing set, ensuring immutability.
 *
 * **Implementation Details:**
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
   *                           are performed on non-existent elements. Useful for debugging.
   *                           Defaults to false for production use.
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
