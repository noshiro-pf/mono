import { asUint32 } from '../number/index.mjs';

/**
 * Interface for an immutable set with custom element mapping and membership
 * testing.
 *
 * ISetMapped allows you to use complex objects as set elements by providing
 * transformation functions that convert between your custom element type `K`
 * and a primitive `MapSetKeyType` `KM` that can be efficiently stored in
 * JavaScript's native Set. This enables set operations on complex elements
 * while maintaining type safety and immutability.
 *
 * **Key Features:**
 *
 * - **Custom Element Types**: Use any type as set elements by providing
 *   `toKey`/`fromKey` functions
 * - **Immutable**: All operations return new instances, preserving immutability
 * - **Set Operations**: Full support for union, intersection, difference,
 *   subset/superset checks
 * - **Type Safe**: Full TypeScript support with generic element types
 *
 * **Performance Characteristics:**
 *
 * - has: O(1) average case (plus element transformation overhead)
 * - add/delete: O(n) due to copying for immutability (plus element
 *   transformation overhead)
 * - set operations (union, intersection, difference): O(n)
 * - map/filter operations: O(n)
 * - iteration: O(n) (plus element transformation overhead)
 *
 * @template K The type of the custom elements in the set.
 * @template KM The type of the mapped primitive keys (string, number, etc.).
 */
type ISetMappedInterface<K, KM extends MapSetKeyType> = Readonly<{
  /**
   * Creates a new ISetMapped instance.
   *
   * @param iterable An iterable of elements.
   * @param toKey A function that converts an element of type `K` to `KM`.
   * @param fromKey A function that converts a mapped key of type `KM` back to
   *   `K`.
   */
  new (iterable: Iterable<K>, toKey: (a: K) => KM, fromKey: (k: KM) => K): void;

  // Getting information

  /**
   * The number of elements in the set.
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
   * const points: readonly Point[] = [
   *   { x: 1, tag: 'a' },
   *   { x: 2, tag: 'b' },
   * ];
   *
   * const set = ISetMapped.create<Point, string>(points, toKey, fromKey);
   *
   * assert.isTrue(set.size === 2);
   * ```
   */
  size: SizeType.Arr;

  /**
   * Checks if the set is empty.
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
   * const empty = ISetMapped.create<Point, string>([], toKey, fromKey);
   *
   * const points = ISetMapped.create<Point, string>(
   *   [{ x: 1, tag: 'a' }],
   *   toKey,
   *   fromKey,
   * );
   *
   * assert.isTrue(empty.isEmpty);
   *
   * assert.isFalse(points.isEmpty);
   * ```
   */
  isEmpty: boolean;

  /**
   * Checks if an element exists in the set.
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
   *   [{ x: 1, tag: 'a' }],
   *   toKey,
   *   fromKey,
   * );
   *
   * assert.isTrue(set.has({ x: 1, tag: 'a' }));
   *
   * assert.isFalse(set.has({ x: 2, tag: 'b' }));
   * ```
   *
   * @param key The element to check.
   * @returns `true` if the element exists, `false` otherwise.
   */
  has: (key: K) => boolean;

  // Reducing a value

  /**
   * Checks if all elements in the set satisfy a predicate.
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
   *     { x: 2, tag: 'even' },
   *     { x: 4, tag: 'even' },
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const allEven = set.every((point) => point.x % 2 === 0);
   *
   * const narrowed = set.every(
   *   (point): point is Readonly<{ x: 2 | 4; tag: 'even' }> => point.x % 2 === 0,
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
    (<L extends K>(
      predicate: (key: K) => key is L,
    ) => this is ISetMapped<L, KM>);

  /**
   * Checks if at least one element in the set satisfies a predicate.
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
   *     { x: 5, tag: 'b' },
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * assert.isTrue(set.some((point) => point.x > 4));
   *
   * assert.isFalse(set.some((point) => point.x > 10));
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
   * type Point = Readonly<{ x: number; tag: string }>;
   *
   * const toKey = (point: Point) => JSON.stringify(point);
   *
   * // eslint-disable-next-line total-functions/no-unsafe-type-assertion
   * const fromKey = (key: string) => JSON.parse(key) as Point;
   *
   * const base = ISetMapped.create<Point, string>(
   *   [{ x: 1, tag: 'a' }],
   *   toKey,
   *   fromKey,
   * );
   *
   * const withNew = base.add({ x: 2, tag: 'b' });
   *
   * const unchanged = base.add({ x: 1, tag: 'a' });
   *
   * assert.deepStrictEqual(Array.from(withNew), [
   *   { x: 1, tag: 'a' },
   *   { x: 2, tag: 'b' },
   * ]);
   *
   * assert.isTrue(unchanged === base);
   * ```
   *
   * @param key The element to add.
   * @returns A new ISetMapped instance with the element added.
   */
  add: (key: K) => ISetMapped<K, KM>;

  /**
   * Deletes an element from the set.
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
   * const base = ISetMapped.create<Point, string>(
   *   [
   *     { x: 1, tag: 'a' },
   *     { x: 2, tag: 'b' },
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const withoutSecond = base.delete({ x: 2, tag: 'b' });
   *
   * const unchanged = base.delete({ x: 3, tag: 'c' });
   *
   * assert.deepStrictEqual(Array.from(withoutSecond), [{ x: 1, tag: 'a' }]);
   *
   * assert.isTrue(unchanged === base);
   * ```
   *
   * @param key The element to delete.
   * @returns A new ISetMapped instance without the specified element.
   */
  delete: (key: K) => ISetMapped<K, KM>;

  /**
   * Applies a series of mutations to the set.
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
   * const base = ISetMapped.create<Point, string>(
   *   [
   *     { x: 1, tag: 'a' },
   *     { x: 2, tag: 'b' },
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const actions: readonly Readonly<
   *   { type: 'add'; key: Point } | { type: 'delete'; key: Point }
   * >[] = [
   *   { type: 'add', key: { x: 3, tag: 'c' } },
   *   { type: 'delete', key: { x: 1, tag: 'a' } },
   * ];
   *
   * const mutated = base.withMutations(actions);
   *
   * assert.deepStrictEqual(Array.from(mutated), [
   *   { x: 2, tag: 'b' },
   *   { x: 3, tag: 'c' },
   * ]);
   *
   * assert.deepStrictEqual(Array.from(base), [
   *   { x: 1, tag: 'a' },
   *   { x: 2, tag: 'b' },
   * ]);
   * ```
   *
   * @param actions An array of mutation actions (add or delete).
   * @returns A new ISetMapped instance with all mutations applied.
   */
  withMutations: (
    actions: readonly Readonly<
      { type: 'add'; key: K } | { type: 'delete'; key: K }
    >[],
  ) => ISetMapped<K, KM>;

  // Sequence algorithms

  /**
   * Maps the elements of the set to new elements. Note: The element type `K`
   * cannot be changed because `toKey` and `fromKey` would become unusable if
   * the mapped type `KM` changes.
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
   *     { x: 2, tag: 'b' },
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const shifted = set.map((point) => ({
   *   x: point.x + 10,
   *   tag: point.tag.toUpperCase(),
   * }));
   *
   * assert.deepStrictEqual(Array.from(shifted), [
   *   { x: 11, tag: 'A' },
   *   { x: 12, tag: 'B' },
   * ]);
   * ```
   *
   * @param mapFn A function that maps an element to a new element of the same
   *   type `K`.
   * @returns A new ISetMapped instance with mapped elements.
   */
  map: (mapFn: (key: K) => K) => ISetMapped<K, KM>;

  /**
   * Filters the elements of the set based on a predicate.
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
   *     { x: 2, tag: 'b' },
   *     { x: 3, tag: 'c' },
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const evenPoints = set.filter((point) => point.x % 2 === 0);
   *
   * assert.deepStrictEqual(Array.from(evenPoints), [{ x: 2, tag: 'b' }]);
   * ```
   *
   * @param predicate A function to test each element.
   * @returns A new ISetMapped instance with elements that satisfy the
   *   predicate.
   */
  filter: (predicate: (value: K) => boolean) => ISetMapped<K, KM>;

  /**
   * Filters the elements of the set by excluding elements for which the
   * predicate returns true.
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
   *     { x: 2, tag: 'b' },
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const withoutEven = set.filterNot((point) => point.x % 2 === 0);
   *
   * assert.deepStrictEqual(Array.from(withoutEven), [{ x: 1, tag: 'a' }]);
   * ```
   *
   * @param predicate A function to test each element.
   * @returns A new ISetMapped instance with elements for which the predicate
   *   returned `false`.
   */
  filterNot: (predicate: (key: K) => boolean) => ISetMapped<K, KM>;

  // Side effects

  /**
   * Executes a callback function for each element in the set.
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
   *     { x: 2, tag: 'b' },
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const collected: Point[] = [];
   *
   * for (const point of set) {
   *   collected.push(point);
   * }
   *
   * assert.deepStrictEqual(collected, [
   *   { x: 1, tag: 'a' },
   *   { x: 2, tag: 'b' },
   * ]);
   * ```
   *
   * @param callbackfn A function to execute for each element.
   */
  forEach: (callbackfn: (key: K) => void) => void;

  // Comparison

  /**
   * Checks if this set is a subset of another set.
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
   * const subset = ISetMapped.create<Point, string>(
   *   [{ x: 1, tag: 'a' }],
   *   toKey,
   *   fromKey,
   * );
   *
   * const superset = ISetMapped.create<Point, string>(
   *   [
   *     { x: 1, tag: 'a' },
   *     { x: 2, tag: 'b' },
   *   ],
   *   toKey,
   *   fromKey,
   * );
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
  isSubsetOf: (set: ISetMapped<K, KM>) => boolean;

  /**
   * Checks if this set is a superset of another set.
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
   * const superset = ISetMapped.create<Point, string>(
   *   [
   *     { x: 1, tag: 'a' },
   *     { x: 2, tag: 'b' },
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * const subset = ISetMapped.create<Point, string>(
   *   [{ x: 2, tag: 'b' }],
   *   toKey,
   *   fromKey,
   * );
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
  isSupersetOf: (set: ISetMapped<K, KM>) => boolean;

  /**
   * Returns a new set with elements that are in this set but not in another
   * set.
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
   *     { x: 3, tag: 'c' },
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
   * const difference = left.subtract(right);
   *
   * assert.deepStrictEqual(Array.from(difference), [
   *   { x: 1, tag: 'a' },
   *   { x: 3, tag: 'c' },
   * ]);
   * ```
   *
   * @param set The other set.
   * @returns A new ISetMapped instance representing the set difference.
   */
  subtract: (set: ISetMapped<K, KM>) => ISetMapped<K, KM>;

  /**
   * Returns a new set with elements that are common to both this set and
   * another set.
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
   * const intersection = left.intersect(right);
   *
   * assert.deepStrictEqual(Array.from(intersection), [{ x: 2, tag: 'b' }]);
   * ```
   *
   * @param set The other set.
   * @returns A new ISetMapped instance representing the set intersection.
   */
  intersect: (set: ISetMapped<K, KM>) => ISetMapped<K, KM>;

  /**
   * Returns a new set with all elements from both this set and another set.
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
   * const combined = left.union(right);
   *
   * assert.deepStrictEqual(Array.from(combined), [
   *   { x: 1, tag: 'a' },
   *   { x: 2, tag: 'b' },
   * ]);
   * ```
   *
   * @param set The other set.
   * @returns A new ISetMapped instance representing the set union.
   */
  union: (set: ISetMapped<K, KM>) => ISetMapped<K, KM>;

  // Iterators

  /**
   * Returns an iterator for the elements in the set (alias for values).
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
   *     { x: 2, tag: 'b' },
   *   ],
   *   toKey,
   *   fromKey,
   * );
   *
   * assert.deepStrictEqual(Array.from(set.keys()), [
   *   { x: 1, tag: 'a' },
   *   { x: 2, tag: 'b' },
   * ]);
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
   * assert.deepStrictEqual(Array.from(set.values()), [
   *   { x: 1, tag: 'a' },
   *   { x: 2, tag: 'b' },
   * ]);
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
   * assert.deepStrictEqual(Array.from(set.entries()), [
   *   [
   *     { x: 1, tag: 'a' },
   *     { x: 1, tag: 'a' },
   *   ],
   *   [
   *     { x: 2, tag: 'b' },
   *     { x: 2, tag: 'b' },
   *   ],
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
   * assert.deepStrictEqual(set.toArray(), [
   *   { x: 1, tag: 'a' },
   *   { x: 2, tag: 'b' },
   * ]);
   * ```
   *
   * @returns A readonly array of elements.
   */
  toArray: () => readonly K[];

  /**
   * Returns the underlying readonly JavaScript Set of mapped keys.
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
   *   [{ x: 1, tag: 'a' }],
   *   toKey,
   *   fromKey,
   * );
   *
   * const raw = set.toRawSet();
   *
   * assert.isTrue(is.set(raw));
   *
   * assert.isTrue(raw.has(toKey({ x: 1, tag: 'a' })));
   * ```
   *
   * @returns The raw ReadonlySet instance.
   */
  toRawSet: () => ReadonlySet<KM>;
}>;

/**
 * Represents an immutable set with custom element transformation and
 * high-performance operations.
 *
 * ISetMapped is a specialized persistent data structure that enables using
 * complex objects as set elements while maintaining the performance benefits of
 * JavaScript's native Set. It achieves this by requiring bidirectional
 * transformation functions that convert between your custom element type and a
 * primitive type that can be efficiently stored and compared for uniqueness.
 *
 * **Key Features:**
 *
 * - **Complex Elements**: Use objects, arrays, or any custom type as set elements
 * - **Immutable**: All mutation operations return new instances
 * - **Type Safe**: Full TypeScript support with compile-time element type
 *   checking
 * - **Bidirectional**: Maintains ability to reconstruct original elements from
 *   mapped keys
 * - **Set Algebra**: Complete support for mathematical set operations
 *
 * **Use Cases:**
 *
 * - Sets of entities with complex identifiers
 * - Deduplication of objects based on specific properties
 * - Performance-critical sets with non-primitive elements
 * - Mathematical set operations on complex data structures
 *
 * @template K The type of the custom elements in the set.
 * @template KM The type of the mapped primitive keys (string, number, etc.).
 */
export type ISetMapped<K, KM extends MapSetKeyType> = Iterable<K> &
  Readonly<ISetMappedInterface<K, KM>>;

/** Provides utility functions for ISetMapped. */
export namespace ISetMapped {
  /**
   * Creates a new ISetMapped instance with custom element transformation
   * functions.
   *
   * This factory function creates an immutable set that can use complex objects
   * as elements by providing bidirectional transformation functions. The
   * `toKey` function converts your custom element type to a primitive type that
   * can be efficiently stored, while `fromKey` reconstructs the original
   * element type for iteration and access.
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
   * Two ISetMapped instances are considered equal if they have the same size
   * and contain exactly the same elements. The comparison is performed on the
   * underlying mapped keys, so the transformation functions themselves don't
   * need to be identical. Elements are compared based on their mapped key
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
  ): ReadonlyRecord<'added' | 'deleted', ISetMapped<K, KM>> => ({
    deleted: oldSet.subtract(newSet),
    added: newSet.subtract(oldSet),
  });

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
}

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
  readonly #showNotFoundMessage: boolean;

  /**
   * Constructs an ISetMappedClass instance with custom element transformation.
   *
   * @param iterable An iterable of elements using the custom element type K.
   * @param toKey A function that converts a custom element K to a primitive key
   *   KM. Must be deterministic and produce unique values for unique elements.
   * @param fromKey A function that converts a primitive key KM back to the
   *   custom element K. Should be the inverse of the toKey function.
   * @param showNotFoundMessage Whether to log warning messages when operations
   *   are performed on non-existent elements. Useful for debugging. Defaults to
   *   false for production use.
   * @internal Use ISetMapped.create() instead of calling this constructor directly.
   */
  constructor(
    iterable: Iterable<K>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K,
    showNotFoundMessage: boolean = false,
  ) {
    this.#set = new Set(Array.from(iterable, toKey));

    this.#toKey = toKey;

    this.#fromKey = fromKey;

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
  has(key: K): boolean {
    return this.#set.has(this.#toKey(key));
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
  add(key: K): ISetMapped<K, KM> {
    if (this.has(key)) return this;

    return ISetMapped.create(
      [...this.#set, this.#toKey(key)].map(this.#fromKey),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  delete(key: K): ISetMapped<K, KM> {
    if (!this.has(key)) {
      if (this.#showNotFoundMessage) {
        console.warn(
          `ISetMapped.delete: key not found: ${String(this.#toKey(key))}`,
        );
      }

      return this;
    }

    const keyMapped = this.#toKey(key);

    return ISetMapped.create(
      Array.from(this.#set)
        .filter((k) => !Object.is(k, keyMapped))
        .map(this.#fromKey),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  withMutations(
    actions: readonly Readonly<
      { type: 'add'; key: K } | { type: 'delete'; key: K }
    >[],
  ): ISetMapped<K, KM> {
    const mut_result = new Set<KM>(this.#set);

    for (const action of actions) {
      const key = this.#toKey(action.key);

      switch (action.type) {
        case 'delete':
          mut_result.delete(key);

          break;

        case 'add':
          mut_result.add(key);

          break;
      }
    }

    return ISetMapped.create<K, KM>(
      Array.from(mut_result, this.#fromKey),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  map(mapFn: (key: K) => K): ISetMapped<K, KM> {
    return ISetMapped.create(
      this.toArray().map(mapFn),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  filter(predicate: (key: K) => boolean): ISetMapped<K, KM> {
    return ISetMapped.create(
      this.toArray().filter(predicate),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  filterNot(predicate: (key: K) => boolean): ISetMapped<K, KM> {
    return ISetMapped.create(
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
    return ISetMapped.create(
      this.toArray().filter((k) => !set.has(k)),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  intersect(set: ISetMapped<K, KM>): ISetMapped<K, KM> {
    return ISetMapped.create(
      this.toArray().filter((k) => set.has(k)),
      this.#toKey,
      this.#fromKey,
    );
  }

  /** @inheritdoc */
  union(set: ISetMapped<K, KM>): ISetMapped<K, KM> {
    return ISetMapped.create(
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
    for (const km of this.#set.keys()) {
      yield this.#fromKey(km);
    }
  }

  /** @inheritdoc */
  *values(): IterableIterator<K> {
    for (const km of this.#set.keys()) {
      // JavaScript Set's values() is an alias for keys()
      yield this.#fromKey(km);
    }
  }

  /** @inheritdoc */
  *entries(): IterableIterator<readonly [K, K]> {
    for (const km of this.#set.keys()) {
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
