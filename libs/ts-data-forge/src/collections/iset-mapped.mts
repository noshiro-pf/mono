import { asUint32 } from '../number/index.mjs';

/**
 * Interface for an immutable set with custom element mapping and O(1) membership testing.
 *
 * ISetMapped allows you to use complex objects as set elements by providing transformation functions
 * that convert between your custom element type `K` and a primitive `MapSetKeyType` `KM` that can
 * be efficiently stored in JavaScript's native Set. This enables high-performance set operations
 * on complex elements while maintaining type safety and immutability.
 *
 * **Key Features:**
 * - **Custom Element Types**: Use any type as set elements by providing `toKey`/`fromKey` functions
 * - **O(1) Performance**: Maintains O(1) average-case performance for membership testing and mutations
 * - **Immutable**: All operations return new instances, preserving immutability
 * - **Set Operations**: Full support for union, intersection, difference, subset/superset checks
 * - **Type Safe**: Full TypeScript support with generic element types
 *
 * **Performance Characteristics:**
 * - has/add/delete: O(1) average case (plus element transformation overhead)
 * - Set operations (union, intersection, difference): O(n)
 * - map/filter operations: O(n)
 * - Iteration: O(n) (plus element transformation overhead)
 *
 * @template K The type of the custom elements in the set.
 * @template KM The type of the mapped primitive keys (string, number, etc.).
 *
 * @example
 * ```typescript
 * // Example with complex object elements
 * type User = { id: number; department: string; email: string };
 *
 * // Define transformation functions
 * const userToKey = (user: User): string => `${user.department}:${user.id}`;
 * const keyToUser = (key: string): User => {
 *   const [department, idStr] = key.split(':');
 *   // In practice, you might fetch from a cache or reconstruct more robustly
 *   return { id: Number(idStr), department, email: `user${idStr}@${department}.com` };
 * };
 *
 * declare const activeUsers: ISetMapped<User, string>;
 *
 * // All operations work with the complex element type
 * const user: User = { id: 123, department: "engineering", email: "alice@engineering.com" };
 * const hasUser = activeUsers.has(user);                    // O(1)
 * const withNewUser = activeUsers.add(user);                // O(1) - returns new ISetMapped
 * const withoutUser = activeUsers.delete(user);             // O(1) - returns new ISetMapped
 * ```
 */
type ISetMappedInterface<K, KM extends MapSetKeyType> = Readonly<{
  /**
   * Creates a new ISetMapped instance.
   * @param iterable An iterable of elements.
   * @param toKey A function that converts an element of type `K` to `KM`.
   * @param fromKey A function that converts a mapped key of type `KM` back to `K`.
   */
  new (iterable: Iterable<K>, toKey: (a: K) => KM, fromKey: (k: KM) => K): void;

  // Getting information
  /** The number of elements in the set. */
  size: SizeType.Arr;

  /** Checks if the set is empty. */
  isEmpty: boolean;

  /**
   * Checks if an element exists in the set.
   * @param key The element to check.
   * @returns `true` if the element exists, `false` otherwise.
   */
  has: (key: K) => boolean;

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
    (<L extends K>(
      predicate: (key: K) => key is L,
    ) => this is ISetMapped<L, KM>);
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
   * @returns A new ISetMapped instance with the element added.
   */
  add: (key: K) => ISetMapped<K, KM>;
  /**
   * Deletes an element from the set.
   * @param key The element to delete.
   * @returns A new ISetMapped instance without the specified element.
   */
  delete: (key: K) => ISetMapped<K, KM>;
  /**
   * Applies a series of mutations to the set.
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
   * Maps the elements of the set to new elements.
   * Note: The element type `K` cannot be changed because `toKey` and `fromKey` would become unusable if the mapped type `KM` changes.
   * @param mapFn A function that maps an element to a new element of the same type `K`.
   * @returns A new ISetMapped instance with mapped elements.
   */
  map: (mapFn: (key: K) => K) => ISetMapped<K, KM>;

  /**
   * Filters the elements of the set based on a predicate.
   * @param predicate A function to test each element.
   * @returns A new ISetMapped instance with elements that satisfy the predicate.
   */
  filter: (predicate: (value: K) => boolean) => ISetMapped<K, KM>;

  /**
   * Filters the elements of the set by excluding elements for which the predicate returns true.
   * @param predicate A function to test each element.
   * @returns A new ISetMapped instance with elements for which the predicate returned `false`.
   */
  filterNot: (predicate: (key: K) => boolean) => ISetMapped<K, KM>;

  // Side effects
  /**
   * Executes a callback function for each element in the set.
   * @param callbackfn A function to execute for each element.
   */
  forEach: (callbackfn: (key: K) => void) => void;

  // Comparison
  /**
   * Checks if this set is a subset of another set.
   * @param set The other set.
   * @returns `true` if this set is a subset of the other set, `false` otherwise.
   */
  isSubsetOf: (set: ISetMapped<K, KM>) => boolean;
  /**
   * Checks if this set is a superset of another set.
   * @param set The other set.
   * @returns `true` if this set is a superset of the other set, `false` otherwise.
   */
  isSupersetOf: (set: ISetMapped<K, KM>) => boolean;
  /**
   * Returns a new set with elements that are in this set but not in another set.
   * @param set The other set.
   * @returns A new ISetMapped instance representing the set difference.
   */
  subtract: (set: ISetMapped<K, KM>) => ISetMapped<K, KM>;
  /**
   * Returns a new set with elements that are common to both this set and another set.
   * @param set The other set.
   * @returns A new ISetMapped instance representing the set intersection.
   */
  intersect: (set: ISetMapped<K, KM>) => ISetMapped<K, KM>;
  /**
   * Returns a new set with all elements from both this set and another set.
   * @param set The other set.
   * @returns A new ISetMapped instance representing the set union.
   */
  union: (set: ISetMapped<K, KM>) => ISetMapped<K, KM>;

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
   * Returns the underlying readonly JavaScript Set of mapped keys.
   * @returns The raw ReadonlySet instance.
   */
  toRawSet: () => ReadonlySet<KM>;
}>;

/**
 * Represents an immutable set with custom element transformation and high-performance operations.
 *
 * ISetMapped is a specialized persistent data structure that enables using complex objects as set elements
 * while maintaining the performance benefits of JavaScript's native Set. It achieves this by requiring
 * bidirectional transformation functions that convert between your custom element type and a primitive type
 * that can be efficiently stored and compared for uniqueness.
 *
 * **Key Features:**
 * - **Complex Elements**: Use objects, arrays, or any custom type as set elements
 * - **High Performance**: O(1) operations through efficient element transformation
 * - **Immutable**: All mutation operations return new instances
 * - **Type Safe**: Full TypeScript support with compile-time element type checking
 * - **Bidirectional**: Maintains ability to reconstruct original elements from mapped keys
 * - **Set Algebra**: Complete support for mathematical set operations
 *
 * **Use Cases:**
 * - Sets of entities with complex identifiers
 * - Deduplication of objects based on specific properties
 * - Performance-critical sets with non-primitive elements
 * - Mathematical set operations on complex data structures
 *
 * @template K The type of the custom elements in the set.
 * @template KM The type of the mapped primitive keys (string, number, etc.).
 *
 * @example
 * ```typescript
 * // Example: User management with composite identity
 * type User = { id: number; department: string; username: string; email: string };
 *
 * // Define bidirectional transformation functions
 * const userToKey = (user: User): string => `${user.department}:${user.id}`;
 * const keyToUser = (key: string): User => {
 *   const [department, idStr] = key.split(':');
 *   const id = Number(idStr);
 *   // In practice, this might fetch from a user service or cache
 *   return {
 *     id,
 *     department,
 *     username: `user${id}`,
 *     email: `user${id}@${department}.company.com`
 *   };
 * };
 *
 * // Create a set with complex elements
 * let activeUsers = ISetMapped.create<User, string>([], userToKey, keyToUser);
 *
 * // Use complex objects as elements naturally
 * const alice: User = { id: 1, department: "engineering", username: "alice", email: "alice@engineering.company.com" };
 * const bob: User = { id: 2, department: "marketing", username: "bob", email: "bob@marketing.company.com" };
 * const charlie: User = { id: 3, department: "engineering", username: "charlie", email: "charlie@engineering.company.com" };
 *
 * activeUsers = activeUsers
 *   .add(alice)
 *   .add(bob)
 *   .add(charlie);
 *
 * // All operations work with the original element type
 * console.log(activeUsers.has(alice)); // Output: true
 * console.log(activeUsers.size); // Output: 3
 *
 * // Set operations preserve element types
 * const engineeringUsers = ISetMapped.create<User, string>([alice, charlie], userToKey, keyToUser);
 * const marketingUsers = ISetMapped.create<User, string>([bob], userToKey, keyToUser);
 *
 * const allUsers = ISetMapped.union(engineeringUsers, marketingUsers);
 * const engineeringOnly = activeUsers.intersect(engineeringUsers);
 *
 * // Iteration preserves original element types
 * for (const user of engineeringOnly) {
 *   console.log(`${user.username} works in ${user.department}`);
 * }
 * // Output:
 * // alice works in engineering
 * // charlie works in engineering
 *
 * // Functional transformations work seamlessly
 * const updatedUsers = activeUsers.map(user => ({
 *   ...user,
 *   email: user.email.replace('.company.com', '.example.com')
 * }));
 * ```
 */
export type ISetMapped<K, KM extends MapSetKeyType> = Iterable<K> &
  Readonly<ISetMappedInterface<K, KM>>;

/**
 * Provides utility functions for ISetMapped.
 */
export namespace ISetMapped {
  /**
   * Creates a new ISetMapped instance with custom element transformation functions.
   *
   * This factory function creates an immutable set that can use complex objects as elements
   * by providing bidirectional transformation functions. The `toKey` function converts
   * your custom element type to a primitive type that can be efficiently stored, while
   * `fromKey` reconstructs the original element type for iteration and access.
   *
   * **Performance:** O(n) where n is the number of elements in the iterable.
   *
   * @template K The type of the custom elements.
   * @template KM The type of the mapped primitive keys.
   * @param iterable An iterable of elements using the custom element type.
   * @param toKey A function that converts a custom element `K` to a primitive key `KM`.
   *              This function must be deterministic and produce unique values for unique elements.
   * @param fromKey A function that converts a primitive key `KM` back to the custom element `K`.
   *                This should be the inverse of `toKey`.
   * @returns A new ISetMapped instance containing all unique elements from the iterable.
   *
   * @example
   * ```typescript
   * // Example 1: Product catalog with SKU-based identity
   * type Product = { sku: string; name: string; price: number; category: string };
   *
   * const productToKey = (product: Product): string => product.sku;
   * const keyToProduct = (sku: string): Product => {
   *   // In practice, this might fetch from a product service or cache
   *   return {
   *     sku,
   *     name: `Product ${sku}`,
   *     price: 0,
   *     category: "unknown"
   *   };
   * };
   *
   * const productSet = ISetMapped.create<Product, string>(
   *   [
   *     { sku: "LAPTOP-001", name: "Gaming Laptop", price: 1299, category: "electronics" },
   *     { sku: "MOUSE-002", name: "Wireless Mouse", price: 49, category: "accessories" },
   *     { sku: "LAPTOP-001", name: "Gaming Laptop", price: 1299, category: "electronics" } // Duplicate SKU
   *   ],
   *   productToKey,
   *   keyToProduct
   * );
   *
   * console.log(productSet.size); // Output: 2 (duplicate removed)
   * console.log(productSet.has({ sku: "LAPTOP-001", name: "Gaming Laptop", price: 1299, category: "electronics" })); // true
   *
   * // Example 2: Geographic locations with coordinate-based identity
   * type Location = { name: string; lat: number; lng: number; type: string };
   *
   * const locationToKey = (loc: Location): string => `${loc.lat.toFixed(6)},${loc.lng.toFixed(6)}`;
   * const keyToLocation = (key: string): Location => {
   *   const [latStr, lngStr] = key.split(',');
   *   return {
   *     name: "Unknown Location",
   *     lat: parseFloat(latStr),
   *     lng: parseFloat(lngStr),
   *     type: "point"
   *   };
   * };
   *
   * const locationSet = ISetMapped.create<Location, string>(
   *   [
   *     { name: "Statue of Liberty", lat: 40.689247, lng: -74.044502, type: "monument" },
   *     { name: "Empire State Building", lat: 40.748817, lng: -73.985428, type: "building" }
   *   ],
   *   locationToKey,
   *   keyToLocation
   * );
   *
   * // Example 3: User entities with multi-part identity
   * type User = { id: number; tenant: string; email: string; active: boolean };
   *
   * const userToKey = (user: User): string => `${user.tenant}:${user.id}`;
   * const keyToUser = (key: string): User => {
   *   const [tenant, idStr] = key.split(':');
   *   return {
   *     id: Number(idStr),
   *     tenant,
   *     email: `user${idStr}@${tenant}.com`,
   *     active: true
   *   };
   * };
   *
   * const userSet = ISetMapped.create<User, string>(
   *   [],
   *   userToKey,
   *   keyToUser
   * )
   * .add({ id: 1, tenant: "acme", email: "alice@acme.com", active: true })
   * .add({ id: 2, tenant: "acme", email: "bob@acme.com", active: false });
   *
   * console.log(userSet.size); // Output: 2
   *
   * // Example 4: Empty set with type specification
   * const emptyProductSet = ISetMapped.create<Product, string>(
   *   [],
   *   productToKey,
   *   keyToProduct
   * );
   * console.log(emptyProductSet.isEmpty); // Output: true
   * ```
   */
  export const create = <K, KM extends MapSetKeyType>(
    iterable: Iterable<K>,
    toKey: (a: K) => KM,
    fromKey: (k: KM) => K,
  ): ISetMapped<K, KM> => new ISetMappedClass<K, KM>(iterable, toKey, fromKey);

  /**
   * Checks if two ISetMapped instances are structurally equal.
   *
   * Two ISetMapped instances are considered equal if they have the same size and contain
   * exactly the same elements. The comparison is performed on the underlying mapped keys,
   * so the transformation functions themselves don't need to be identical. Elements are
   * compared based on their mapped key representations.
   *
   * **Performance:** O(n) where n is the size of the smaller set.
   *
   * @template K The type of the custom elements.
   * @template KM The type of the mapped primitive keys.
   * @param a The first ISetMapped instance to compare.
   * @param b The second ISetMapped instance to compare.
   * @returns `true` if the sets contain exactly the same elements, `false` otherwise.
   *
   * @example
   * ```typescript
   * // Example with coordinate-based elements
   * type Point = { x: number; y: number; label?: string };
   * const pointToKey = (p: Point): string => `${p.x},${p.y}`;
   * const keyToPoint = (s: string): Point => {
   *   const [x, y] = s.split(',').map(Number);
   *   return { x, y };
   * };
   *
   * const set1 = ISetMapped.create<Point, string>(
   *   [{ x: 1, y: 2, label: "A" }, { x: 3, y: 4, label: "B" }],
   *   pointToKey,
   *   keyToPoint
   * );
   *
   * const set2 = ISetMapped.create<Point, string>(
   *   [{ x: 3, y: 4, label: "Different" }, { x: 1, y: 2, label: "Labels" }], // Order doesn't matter
   *   pointToKey,
   *   keyToPoint
   * );
   *
   * const set3 = ISetMapped.create<Point, string>(
   *   [{ x: 1, y: 2 }, { x: 5, y: 6 }], // Different point
   *   pointToKey,
   *   keyToPoint
   * );
   *
   * console.log(ISetMapped.equal(set1, set2)); // true (same coordinates, labels don't affect equality)
   * console.log(ISetMapped.equal(set1, set3)); // false (different coordinates)
   *
   * // Example with user entities
   * type User = { id: number; department: string; name: string };
   * const userToKey = (u: User): string => `${u.department}:${u.id}`;
   * const keyToUser = (k: string): User => {
   *   const [department, idStr] = k.split(':');
   *   return { id: Number(idStr), department, name: "" };
   * };
   *
   * const users1 = ISetMapped.create<User, string>(
   *   [
   *     { id: 1, department: "eng", name: "Alice" },
   *     { id: 2, department: "sales", name: "Bob" }
   *   ],
   *   userToKey,
   *   keyToUser
   * );
   *
   * const users2 = ISetMapped.create<User, string>(
   *   [
   *     { id: 2, department: "sales", name: "Robert" }, // Different name, same identity
   *     { id: 1, department: "eng", name: "Alicia" }    // Different name, same identity
   *   ],
   *   userToKey,
   *   keyToUser
   * );
   *
   * console.log(ISetMapped.equal(users1, users2)); // true (same department:id combinations)
   *
   * // Empty sets
   * const empty1 = ISetMapped.create<Point, string>([], pointToKey, keyToPoint);
   * const empty2 = ISetMapped.create<Point, string>([], pointToKey, keyToPoint);
   * console.log(ISetMapped.equal(empty1, empty2)); // true
   *
   * // Sets with different transformation functions but same logical content
   * const alternativePointToKey = (p: Point): string => `(${p.x},${p.y})`; // Different format
   * const alternativeKeyToPoint = (s: string): Point => {
   *   const match = s.match(/\((\d+),(\d+)\)/)!;
   *   return { x: Number(match[1]), y: Number(match[2]) };
   * };
   *
   * const set4 = ISetMapped.create<Point, string>(
   *   [{ x: 1, y: 2 }, { x: 3, y: 4 }],
   *   alternativePointToKey,
   *   alternativeKeyToPoint
   * );
   *
   * // This would be false because the underlying mapped keys are different
   * console.log(ISetMapped.equal(set1, set4)); // false
   * ```
   */
  export const equal = <K, KM extends MapSetKeyType>(
    a: ISetMapped<K, KM>,
    b: ISetMapped<K, KM>,
  ): boolean => a.size === b.size && a.every((e) => b.has(e));

  /**
   * Computes the difference between two ISetMapped instances.
   * @template K The type of the elements.
   * @template KM The type of the mapped keys.
   * @param oldSet The original set.
   * @param newSet The new set.
   * @returns An object containing sets of added and deleted elements.
   * @example
   * ```typescript
   * type Tag = { name: string };
   * const tagToKey = (t: Tag): string => t.name;
   * const keyToTag = (name: string): Tag => ({ name });
   *
   * const oldTags = ISetMapped.create<Tag, string>(
   *   [{ name: "typescript" }, { name: "javascript" }],
   *   tagToKey,
   *   keyToTag
   * );
   * const newTags = ISetMapped.create<Tag, string>(
   *   [{ name: "javascript" }, { name: "react" }, { name: "nextjs" }],
   *   tagToKey,
   *   keyToTag
   * );
   *
   * const diffResult = ISetMapped.diff(oldTags, newTags);
   *
   * console.log("Deleted tags:", diffResult.deleted.toArray().map(t => t.name));
   * // Output: Deleted tags: ["typescript"]
   *
   * console.log("Added tags:", diffResult.added.toArray().map(t => t.name));
   * // Output: Added tags: ["react", "nextjs"]
   * ```
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
   * @template K The type of the elements.
   * @template KM The type of the mapped keys.
   * @param a The first set.
   * @param b The second set.
   * @returns A new ISetMapped instance representing the intersection.
   * @example
   * ```typescript
   * type Permission = { id: string };
   * const permToKey = (p: Permission): string => p.id;
   * const keyToPerm = (id: string): Permission => ({ id });
   *
   * const userPermissions = ISetMapped.create<Permission, string>(
   *   [{ id: "read" }, { id: "write" }, { id: "delete" }],
   *   permToKey,
   *   keyToPerm
   * );
   * const rolePermissions = ISetMapped.create<Permission, string>(
   *   [{ id: "read" }, { id: "comment" }, { id: "write" }],
   *   permToKey,
   *   keyToPerm
   * );
   *
   * const commonPermissions = ISetMapped.intersection(userPermissions, rolePermissions);
   * console.log(commonPermissions.toArray().map(p => p.id)); // Output: ["read", "write"]
   * ```
   */
  export const intersection = <K, KM extends MapSetKeyType>(
    a: ISetMapped<K, KM>,
    b: ISetMapped<K, KM>,
  ): ISetMapped<K, KM> => a.intersect(b);

  /**
   * Computes the union of two ISetMapped instances.
   * @template K The type of the elements.
   * @template KM The type of the mapped keys.
   * @param a The first set.
   * @param b The second set.
   * @returns A new ISetMapped instance representing the union.
   * @example
   * ```typescript
   * type FeatureFlag = { flagName: string };
   * const flagToKey = (f: FeatureFlag): string => f.flagName;
   * const keyToFlag = (name: string): FeatureFlag => ({ flagName: name });
   *
   * const setA = ISetMapped.create<FeatureFlag, string>(
   *   [{ flagName: "newUI" }, { flagName: "betaFeature" }],
   *   flagToKey,
   *   keyToFlag
   * );
   * const setB = ISetMapped.create<FeatureFlag, string>(
   *   [{ flagName: "betaFeature" }, { flagName: "darkMode" }],
   *   flagToKey,
   *   keyToFlag
   * );
   *
   * const combinedFlags = ISetMapped.union(setA, setB);
   * // The order might vary as sets are unordered internally.
   * console.log(combinedFlags.toArray().map(f => f.flagName).sort());
   * // Output: ["betaFeature", "darkMode", "newUI"]
   * ```
   */
  export const union = <K, KM extends MapSetKeyType>(
    a: ISetMapped<K, KM>,
    b: ISetMapped<K, KM>,
  ): ISetMapped<K, KM> => a.union(b);
}

/**
 * Internal class implementation for ISetMapped providing immutable set operations with element transformation.
 *
 * This class implements the ISetMapped interface by maintaining a JavaScript Set with primitive keys
 * internally while exposing an API that works with custom element types. The transformation between
 * custom and primitive elements is handled transparently through the provided `toKey` and `fromKey` functions.
 *
 * **Implementation Details:**
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
   * @param toKey A function that converts a custom element K to a primitive key KM.
   *              Must be deterministic and produce unique values for unique elements.
   * @param fromKey A function that converts a primitive key KM back to the custom element K.
   *                Should be the inverse of the toKey function.
   * @param showNotFoundMessage Whether to log warning messages when operations
   *                           are performed on non-existent elements. Useful for debugging.
   *                           Defaults to false for production use.
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
