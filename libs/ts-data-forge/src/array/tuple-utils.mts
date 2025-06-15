/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
/**
 * A collection of tuple utility functions.
 *
 * Provides type-safe operations for working with tuples (fixed-length arrays).
 * Unlike regular arrays, tuples preserve their exact length and element types
 * at compile time, enabling precise type inference and validation.
 *
 * Key features:
 * - All operations preserve tuple length and element types
 * - Type-safe indexing with compile-time bounds checking
 * - Immutable operations that return new tuples
 * - Precise type inference for transformed elements
 *
 * @example
 * ```typescript
 * // Tuples preserve exact types and length
 * const tuple = [1, 'hello', true] as const;
 * type TupleType = typeof tuple; // readonly [1, 'hello', true]
 *
 * // Operations preserve tuple structure
 * const mapped = Tpl.map(tuple, (x) => String(x)); // readonly ['1', 'hello', 'true']
 * const reversed = Tpl.toReversed(tuple); // readonly [true, 'hello', 1]
 * ```
 */
export namespace Tpl {
  //   length: size,

  /**
   * Returns the length of a tuple as a literal type.
   *
   * Unlike `array.length` which returns `number`, this preserves
   * the exact length as a literal type (e.g., `3` not `number`).
   *
   * @template T - The tuple type whose length will be extracted
   * @param list - The input tuple
   * @returns The length of the tuple as a literal number type
   *
   * @example
   * ```typescript
   * const tpl = [1, 2, 3] as const;
   * const len = Tpl.size(tpl); // 3 (literal type, not just number)
   *
   * // Type-level length extraction
   * type Len = Length<typeof tpl>; // 3
   *
   * // Useful for compile-time validation
   * function requiresTriple<T extends readonly [unknown, unknown, unknown]>(t: T) {}
   * const pair = [1, 2] as const;
   * // requiresTriple(pair); // Error: length mismatch
   * ```
   */
  export const size = <const T extends readonly unknown[]>(
    list: T,
  ): Length<T> => list.length;

  export const length = size;

  /**
   * Helper type to refine the result of array search methods.
   *
   * Prevents overly specific number literal types when the search might not find an element.
   * - If T is exactly `number`, it remains `number`
   * - Otherwise, T is returned as-is (preserving literal types)
   *
   * This ensures that index types are practical while maintaining type safety.
   *
   * @template T - The type to map
   * @internal
   */
  type MapNumberToArraySearchResult<T> = T extends number
    ? TypeEq<T, number> extends true
      ? number // If T is the general number type, keep it as number
      : T // Otherwise (e.g., a number literal), keep the specific type
    : T;

  /**
   * Refines the `IndexOfTuple` type using `MapNumberToArraySearchResult`.
   *
   * Provides accurate types for indices found in a tuple, balancing between
   * type precision and practicality in handling search results.
   *
   * @template T - The tuple type whose indices are being refined
   * @internal
   */
  type IndexOfTupleRefined<T extends readonly unknown[]> =
    MapNumberToArraySearchResult<IndexOfTuple<T>>;

  /**
   * Finds the index of the first element in a tuple that satisfies the predicate.
   *
   * Returns a type-safe index that can be one of the valid tuple indices or -1.
   * The return type is precisely inferred based on the tuple's length.
   *
   * @template T - The tuple type to search within
   * @param tpl - The input tuple
   * @param predicate - A function to test each element for a condition
   * @returns The index of the first matching element, or -1 if not found
   *
   * @example
   * ```typescript
   * const tpl = [1, 2, 3, 4] as const;
   * const idx1 = Tpl.findIndex(tpl, (x) => x > 2); // 2 | 3 | -1
   * const idx2 = Tpl.findIndex(tpl, (x) => x > 10); // -1
   *
   * // Type-safe indexing
   * if (idx1 !== -1) {
   *   const value = tpl[idx1]; // Safe access, TypeScript knows idx1 is valid
   * }
   *
   * // With mixed types
   * const mixed = [1, 'hello', true, null] as const;
   * const strIndex = Tpl.findIndex(mixed, (x) => typeof x === 'string'); // 1 | -1
   * ```
   */
  export const findIndex = <const T extends readonly unknown[]>(
    tpl: T,
    predicate: (value: T[number], index: SizeType.Arr) => boolean,
  ): IndexOfTupleRefined<T> | -1 =>
    tpl.findIndex((value, index) => predicate(value, index as SizeType.Arr)) as
      | IndexOfTupleRefined<T>
      | -1;

  /**
   * Returns the first index at which a given element can be found in the tuple.
   *
   * Performs strict equality checking (===) and returns a type-safe index.
   * The return type precisely reflects the possible indices of the tuple.
   *
   * @template T - The tuple type to search within
   * @param tpl - The input tuple
   * @param searchElement - Element to locate in the tuple (must be assignable to tuple's element types)
   * @param fromIndex - Optional index to start the search at (defaults to 0)
   * @returns The first index of the element, or -1 if not found
   *
   * @example
   * ```typescript
   * const tpl = ['a', 'b', 'c', 'b'] as const;
   * const idx1 = Tpl.indexOf(tpl, 'b'); // 1 | 3 | -1 (type shows possible indices)
   * const idx2 = Tpl.indexOf(tpl, 'b', 2); // 3 | -1 (search from index 2)
   * const idx3 = Tpl.indexOf(tpl, 'd'); // -1
   *
   * // Type safety with literal types
   * const nums = [1, 2, 3, 2] as const;
   * const twoIndex = Tpl.indexOf(nums, 2); // 1 | 3 | -1
   * // Tpl.indexOf(nums, '2'); // Error: string not assignable to 1 | 2 | 3
   *
   * // Works with mixed types
   * const mixed = [1, 'hello', true, 1] as const;
   * const oneIndex = Tpl.indexOf(mixed, 1); // 0 | 3 | -1
   * ```
   */
  export const indexOf = <const T extends readonly unknown[]>(
    tpl: T,
    searchElement: T[number],
    fromIndex?: IndexOfTupleRefined<T>,
  ): IndexOfTupleRefined<T> | -1 =>
    tpl.indexOf(searchElement, fromIndex) as
      | MapNumberToArraySearchResult<IndexOfTuple<T>>
      | -1;

  /**
   * Returns the last index at which a given element can be found in the tuple.
   *
   * Searches backwards from the end (or from `fromIndex` if provided) and
   * returns a type-safe index reflecting the tuple's structure.
   *
   * @template T - The tuple type to search within
   * @param tpl - The input tuple
   * @param searchElement - Element to locate in the tuple
   * @param fromIndex - Optional index to start searching backwards from (defaults to last index)
   * @returns The last index of the element, or -1 if not found
   *
   * @example
   * ```typescript
   * const tpl = ['a', 'b', 'c', 'b'] as const;
   * const idx1 = Tpl.lastIndexOf(tpl, 'b'); // 3 | 1 | -1
   * const idx2 = Tpl.lastIndexOf(tpl, 'b', 2); // 1 | -1 (search up to index 2)
   * const idx3 = Tpl.lastIndexOf(tpl, 'd'); // -1
   *
   * // With duplicate values
   * const nums = [1, 2, 3, 2, 1] as const;
   * const lastOne = Tpl.lastIndexOf(nums, 1); // 4 | 0 | -1
   * const lastTwo = Tpl.lastIndexOf(nums, 2); // 3 | 1 | -1
   *
   * // Type safety preserved
   * const mixed = [true, 42, 'str', 42] as const;
   * const last42 = Tpl.lastIndexOf(mixed, 42); // 3 | 1 | -1
   * // Tpl.lastIndexOf(mixed, false); // Error: false not in tuple type
   * ```
   */
  export const lastIndexOf = <const T extends readonly unknown[]>(
    tpl: T,
    searchElement: T[number],
    fromIndex?: IndexOfTupleRefined<T>,
  ): IndexOfTupleRefined<T> | -1 =>
    tpl.lastIndexOf(searchElement, fromIndex) as IndexOfTupleRefined<T> | -1;

  /**
   * Creates a new tuple by transforming each element with a mapping function.
   *
   * Preserves the tuple's length while allowing element type transformation.
   * The resulting tuple has the same structure but with transformed element types.
   *
   * @template T - The type of the input tuple
   * @template B - The type that elements will be transformed to
   * @param tpl - The input tuple
   * @param mapFn - Function that transforms each element (receives element and index)
   * @returns A new tuple with transformed elements, preserving the original length
   *
   * @example
   * ```typescript
   * // Basic transformation
   * const nums = [1, 2, 3] as const;
   * const doubled = Tpl.map(nums, (x) => x * 2); // readonly [2, 4, 6]
   * const strings = Tpl.map(nums, (x) => String(x)); // readonly ['1', '2', '3']
   *
   * // With index
   * const indexed = Tpl.map(nums, (x, i) => `${i}:${x}`);
   * // readonly ['0:1', '1:2', '2:3']
   *
   * // Mixed type tuples
   * const mixed = [1, 'hello', true] as const;
   * const descriptions = Tpl.map(mixed, (x) => `Value: ${x}`);
   * // readonly ['Value: 1', 'Value: hello', 'Value: true']
   *
   * // Type transformation preserves tuple structure
   * type Original = readonly [number, string, boolean];
   * type Mapped = { readonly [K in keyof Original]: string };
   * // Mapped = readonly [string, string, string]
   * ```
   */
  export const map = <const T extends readonly unknown[], const B>(
    tpl: T,
    mapFn: (a: T[number], index: SizeType.Arr) => B,
  ): { readonly [K in keyof T]: B } =>
    tpl.map((a, index) => mapFn(a as T[number], index as SizeType.Arr)) as {
      readonly [K in keyof T]: B;
    };

  // modification (returns new array)

  /**
   * Returns a new tuple with the element at the specified index replaced.
   *
   * This operation is type-safe with compile-time index validation.
   * The resulting tuple type reflects that the element at the given index
   * may be either the new type or the original type.
   *
   * @template T - The type of the input tuple
   * @template N - The type of the new value to set
   * @param tpl - The input tuple
   * @param index - The index to update (must be valid for the tuple length)
   * @param newValue - The new value to place at the index
   * @returns A new tuple with the updated element
   *
   * @example
   * ```typescript
   * // Basic usage
   * const tpl = ['a', 'b', 'c'] as const;
   * const updated = Tpl.set(tpl, 1, 'B'); // readonly ['a', 'B', 'c']
   *
   * // Type changes are reflected
   * const mixed = [1, 'hello', true] as const;
   * const withNumber = Tpl.set(mixed, 1, 42);
   * // readonly [1, 42 | 'hello', true]
   *
   * // Compile-time index validation
   * const short = [1, 2] as const;
   * // Tpl.set(short, 2, 3); // Error: index 2 is out of bounds
   *
   * // Different value types
   * const nums = [1, 2, 3] as const;
   * const withString = Tpl.set(nums, 0, 'first');
   * // readonly ['first' | 1, 2, 3]
   * ```
   */
  export const set = <const T extends readonly unknown[], const N>(
    tpl: T,
    index: Index<Length<T>>,
    newValue: N,
  ): { readonly [K in keyof T]: N | T[K] } =>
    map(tpl, (a, i) => (i === index ? newValue : a)) as {
      readonly [K in keyof T]: N | T[K];
    };

  /**
   * Returns a new tuple with an element updated by applying a function.
   *
   * Similar to `set`, but instead of providing a new value directly,
   * you provide a function that transforms the existing value.
   * Useful for computed updates based on the current value.
   *
   * @template T - The type of the input tuple
   * @template N - The type returned by the updater function
   * @param tpl - The input tuple
   * @param index - The index of the element to update
   * @param updater - Function that transforms the current value to a new value
   * @returns A new tuple with the updated element
   *
   * @example
   * ```typescript
   * // Numeric updates
   * const nums = [1, 2, 3] as const;
   * const doubled = Tpl.toUpdated(nums, 1, (x) => x * 10);
   * // readonly [1, 20, 3]
   *
   * // String transformations
   * const strs = ['hello', 'world', '!'] as const;
   * const uppercased = Tpl.toUpdated(strs, 0, (s) => s.toUpperCase());
   * // readonly ['HELLO', 'world', '!']
   *
   * // Complex transformations
   * const data = [{count: 1}, {count: 2}, {count: 3}] as const;
   * const incremented = Tpl.toUpdated(data, 1, (obj) => ({count: obj.count + 1}));
   * // Updates the second object's count to 3
   *
   * // Type changes through updater
   * const mixed = [1, 'hello', true] as const;
   * const stringified = Tpl.toUpdated(mixed, 0, (n) => `Number: ${n}`);
   * // readonly ['Number: 1' | 1, 'hello', true]
   * ```
   */
  export const toUpdated = <const T extends readonly unknown[], const N>(
    tpl: T,
    index: SizeType.ArgArrNonNegative | (Index<Length<T>> & SmallUint),
    updater: (prev: T[number]) => N,
  ): { readonly [K in keyof T]: N | T[K] } =>
    map(tpl, (a, i) => (i === index ? updater(a) : a)) as {
      readonly [K in keyof T]: N | T[K];
    };

  // transformation

  /**
   * Reverses a tuple, preserving element types in their new positions.
   *
   * The type system precisely tracks the reversal, so the returned tuple
   * has its element types in the exact reverse order. This is more precise
   * than array reversal which loses positional type information.
   *
   * @template T - The tuple type to reverse
   * @param tpl - The input tuple
   * @returns A new tuple with elements in reverse order and precise typing
   *
   * @example
   * ```typescript
   * // Basic reversal
   * const nums = [1, 2, 3] as const;
   * const reversed = Tpl.toReversed(nums); // readonly [3, 2, 1]
   *
   * // Mixed types preserved in reverse positions
   * const mixed = [1, 'hello', true, null] as const;
   * const revMixed = Tpl.toReversed(mixed);
   * // readonly [null, true, 'hello', 1]
   *
   * // Type-level reversal
   * type Original = readonly [number, string, boolean];
   * type Reversed = Tuple.Reverse<Original>;
   * // Reversed = readonly [boolean, string, number]
   *
   * // Empty and single-element tuples
   * const empty = [] as const;
   * const revEmpty = Tpl.toReversed(empty); // readonly []
   * const single = [42] as const;
   * const revSingle = Tpl.toReversed(single); // readonly [42]
   * ```
   */
  export const toReversed = <const T extends readonly unknown[]>(
    tpl: T,
  ): Tuple.Reverse<T> =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    tpl.toReversed() as Tuple.Reverse<T>;

  /**
   * Sorts a tuple's elements, returning a new tuple with the same length.
   *
   * Unlike array sorting, this preserves the tuple's length but loses
   * positional type information (all positions can contain any element
   * from the original tuple). Default comparison is numeric ascending.
   *
   * @template T - The tuple type to sort
   * @param tpl - The input tuple
   * @param comparator - Optional comparison function (defaults to numeric comparison)
   * @returns A new tuple with sorted elements
   *
   * @example
   * ```typescript
   * // Default numeric sorting
   * const nums = [3, 1, 4, 1, 5] as const;
   * const sorted = Tpl.toSorted(nums); // readonly [1, 1, 3, 4, 5]
   *
   * // Custom comparator
   * const descending = Tpl.toSorted(nums, (a, b) => b - a);
   * // readonly [5, 4, 3, 1, 1]
   *
   * // String sorting with comparator
   * const strs = ['banana', 'apple', 'cherry'] as const;
   * const alphaSorted = Tpl.toSorted(strs, (a, b) => a.localeCompare(b));
   * // readonly ['apple', 'banana', 'cherry']
   *
   * // Mixed types require explicit comparator
   * const mixed = [3, '2', 1, '4'] as const;
   * const mixedSorted = Tpl.toSorted(mixed, (a, b) => Number(a) - Number(b));
   * // readonly ['1', '2', '3', '4'] but typed as (3 | '2' | 1 | '4')[]
   *
   * // Note: Element types become union of all elements
   * type Original = readonly [1, 2, 3];
   * type Sorted = { readonly [K in keyof Original]: Original[number] };
   * // Sorted = readonly [1 | 2 | 3, 1 | 2 | 3, 1 | 2 | 3]
   * ```
   */
  export const toSorted: ToSortedFnOverload = (<
    const T extends readonly unknown[],
  >(
    tpl: T,
    comparator?: (x: T[number], y: T[number]) => number,
  ): { readonly [K in keyof T]: T[number] } => {
    const cmp = comparator ?? ((x, y) => Number(x) - Number(y));

    return tpl.toSorted(cmp) as {
      readonly [K in keyof T]: T[number];
    };
  }) as ToSortedFnOverload;

  type ToSortedFnOverload =
    /**
     * Sort tuple with optional comparator function.
     */
    <const T extends readonly unknown[]>(
      tpl: T,
      comparator?: (x: T[number], y: T[number]) => number,
    ) => { readonly [K in keyof T]: T[number] };

  /**
   * Sorts a tuple by derived values from its elements.
   *
   * Allows sorting complex objects by extracting a sortable value from each.
   * Like `toSorted`, this preserves tuple length but element types become
   * a union of all possible elements.
   *
   * @template T - The tuple type to sort
   * @template B - The type of values used for comparison
   * @param tpl - The input tuple
   * @param comparatorValueMapper - Function to extract comparison value from each element
   * @param comparator - Optional comparator for the extracted values
   * @returns A new sorted tuple
   *
   * @example
   * ```typescript
   * // Sort objects by numeric property
   * const users = [
   *   {name: 'Alice', age: 30},
   *   {name: 'Bob', age: 20},
   *   {name: 'Charlie', age: 25}
   * ] as const;
   * const byAge = Tpl.toSortedBy(users, (user) => user.age);
   * // [{name: 'Bob', age: 20}, {name: 'Charlie', age: 25}, {name: 'Alice', age: 30}]
   *
   * // Sort by string property with custom comparator
   * const byNameDesc = Tpl.toSortedBy(
   *   users,
   *   (user) => user.name,
   *   (a, b) => b.localeCompare(a)
   * );
   * // Sorted by name in descending order
   *
   * // Sort by computed values
   * const points = [{x: 3, y: 4}, {x: 1, y: 1}, {x: 2, y: 2}] as const;
   * const byDistance = Tpl.toSortedBy(
   *   points,
   *   (p) => Math.sqrt(p.x ** 2 + p.y ** 2)
   * );
   * // Sorted by distance from origin
   *
   * // Custom comparator for complex sorting
   * const items = [{priority: 1, name: 'A'}, {priority: 1, name: 'B'}] as const;
   * const sorted = Tpl.toSortedBy(
   *   items,
   *   (item) => item.priority,
   *   (a, b) => b - a // High priority first
   * );
   * ```
   */
  export const toSortedBy: ToSortedByFnOverload = (<
    const T extends readonly unknown[],
    const B,
  >(
    tpl: T,
    comparatorValueMapper: (value: T[number]) => B,
    comparator?: (x: B, y: B) => number,
  ): Readonly<{ [K in keyof T]: T[number] }> =>
    toSorted(tpl, (x, y) =>
      comparator === undefined
        ? (comparatorValueMapper(x) as number) -
          (comparatorValueMapper(y) as number)
        : comparator(comparatorValueMapper(x), comparatorValueMapper(y)),
    )) as ToSortedByFnOverload;

  type ToSortedByFnOverload = {
    /**
     * Sort by numeric values (default numeric comparison).
     */
    <const T extends readonly unknown[]>(
      tpl: T,
      comparatorValueMapper: (value: T[number]) => number,
      comparator?: (x: number, y: number) => number,
    ): Readonly<{ [K in keyof T]: T[number] }>;

    /**
     * Sort by any comparable values with required comparator.
     */
    <const T extends readonly unknown[], const B>(
      tpl: T,
      comparatorValueMapper: (value: T[number]) => B,
      comparator: (x: B, y: B) => number,
    ): Readonly<{ [K in keyof T]: T[number] }>;
  };
}
