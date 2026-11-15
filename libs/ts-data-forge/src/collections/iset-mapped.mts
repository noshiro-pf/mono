import type { FixedLengthTuple, WidenLiteral } from 'ts-type-forge';
import type { MapSetKeyType, SizeType } from '../types.mjs';
// The interface below names `ISetMapped` through this type-only import of its
// own module: here the name is also the `export * as ISetMapped` namespace, and
// declaration emit refuses the interface naming the type alias directly
// (TS4081).
// oxlint-disable-next-line import/no-self-import
import type { ISetMapped as Self } from './iset-mapped.mjs';

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
 *
 * @internal The method set `ISetMapped` is made of; a consumer spells
 * `ISetMapped`.
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
   * ] as const;
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
  has: (key: K | (WidenLiteral<K> & {})) => boolean;

  // Reducing a value

  /**
   * Checks if all elements in the set satisfy a type predicate. Narrows the
   * type of elements in the set if the predicate returns true for all elements.
   *
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
   *   (point): point is Readonly<{ x: 2 | 4; tag: 'even' }> =>
   *     point.x % 2 === 0,
   * );
   *
   * assert.isTrue(allEven);
   *
   * assert.isTrue(narrowed);
   * ```
   *
   * @template L The narrowed type of the elements.
   * @param predicate A function to test each element.
   * @returns `true` if all elements satisfy the predicate, `false` otherwise.
   */
  every: ((predicate: (key: K) => boolean) => boolean) &
    (<L extends K>(predicate: (key: K) => key is L) => this is Self<L, KM>);

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
  add: (key: K) => Self<K, KM>;

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
  delete: (key: K) => Self<K, KM>;

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
   * ] as const;
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
  ) => Self<K, KM>;

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
  map: (mapFn: (key: K) => K) => Self<K, KM>;

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
  filter: (predicate: (value: K) => boolean) => Self<K, KM>;

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
  filterNot: (predicate: (key: K) => boolean) => Self<K, KM>;

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
   * const mut_collected: Point[] = [];
   *
   * set.forEach((point) => {
   *   mut_collected.push(point);
   * });
   *
   * assert.deepStrictEqual(mut_collected, [
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
  isSubsetOf: (set: Self<K, KM>) => boolean;

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
  isSupersetOf: (set: Self<K, KM>) => boolean;

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
  subtract: (set: Self<K, KM>) => Self<K, KM>;

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
  intersect: (set: Self<K, KM>) => Self<K, KM>;

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
  union: (set: Self<K, KM>) => Self<K, KM>;

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
  entries: () => IterableIterator<FixedLengthTuple<2, K>>;

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
   * assert.isTrue(isSet(raw));
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
export * as ISetMapped from './iset-mapped-impl.mjs';
