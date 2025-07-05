[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [array/tuple-utils](../README.md) / Tpl

# Tpl

A collection of tuple utility functions.

Provides type-safe operations for working with tuples (fixed-length arrays).
Unlike regular arrays, tuples preserve their exact length and element types
at compile time, enabling precise type inference and validation.

Key features:

- All operations preserve tuple length and element types
- Type-safe indexing with compile-time bounds checking
- Immutable operations that return new tuples
- Precise type inference for transformed elements

## Example

```typescript
// Tuples preserve exact types and length
const tuple = [1, 'hello', true] as const;
type TupleType = typeof tuple; // readonly [1, 'hello', true]

// Operations preserve tuple structure
const mapped = Tpl.map(tuple, (x) => String(x)); // readonly ['1', 'hello', 'true']
const reversed = Tpl.toReversed(tuple); // readonly [true, 'hello', 1]
```

## Variables

### length()

> `const` **length**: \<`T`\>(`list`) => `Length`\<`T`\> = `size`

Defined in: [src/array/tuple-utils.mts:57](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/tuple-utils.mts#L57)

Returns the length of a tuple as a literal type.

Unlike `array.length` which returns `number`, this preserves
the exact length as a literal type (e.g., `3` not `number`).

#### Type Parameters

##### T

`T` _extends_ readonly `unknown`[]

The tuple type whose length will be extracted

#### Parameters

##### list

`T`

The input tuple

#### Returns

`Length`\<`T`\>

The length of the tuple as a literal number type

#### Example

```typescript
const tpl = [1, 2, 3] as const;
const len = Tpl.size(tpl); // 3 (literal type, not just number)

// Type-level length extraction
type Len = Length<typeof tpl>; // 3

// Useful for compile-time validation
function requiresTriple<T extends readonly [unknown, unknown, unknown]>(t: T) {}
const pair = [1, 2] as const;
// requiresTriple(pair); // Error: length mismatch
```

## Functions

### findIndex()

> **findIndex**\<`T`\>(`tpl`, `predicate`): `-1` \| `MapNumberToArraySearchResult`\<`IndexOfTupleImpl`\<`T`, keyof `T`\>\>

Defined in: [src/array/tuple-utils.mts:116](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/tuple-utils.mts#L116)

Finds the index of the first element in a tuple that satisfies the predicate.

Returns a type-safe index that can be one of the valid tuple indices or -1.
The return type is precisely inferred based on the tuple's length.

#### Type Parameters

##### T

`T` _extends_ readonly `unknown`[]

The tuple type to search within

#### Parameters

##### tpl

`T`

The input tuple

##### predicate

(`value`, `index`) => `boolean`

A function to test each element for a condition

#### Returns

`-1` \| `MapNumberToArraySearchResult`\<`IndexOfTupleImpl`\<`T`, keyof `T`\>\>

The index of the first matching element, or -1 if not found

#### Example

```typescript
const tpl = [1, 2, 3, 4] as const;
const idx1 = Tpl.findIndex(tpl, (x) => x > 2); // 2 | 3 | -1
const idx2 = Tpl.findIndex(tpl, (x) => x > 10); // -1

// Type-safe indexing
if (idx1 !== -1) {
    const value = tpl[idx1]; // Safe access, TypeScript knows idx1 is valid
}

// With mixed types
const mixed = [1, 'hello', true, null] as const;
const strIndex = Tpl.findIndex(mixed, (x) => typeof x === 'string'); // 1 | -1
```

---

### indexOf()

> **indexOf**\<`T`\>(`tpl`, `searchElement`, `fromIndex?`): `-1` \| `MapNumberToArraySearchResult`\<`IndexOfTupleImpl`\<`T`, keyof `T`\>\>

Defined in: [src/array/tuple-utils.mts:153](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/tuple-utils.mts#L153)

Returns the first index at which a given element can be found in the tuple.

Performs strict equality checking (===) and returns a type-safe index.
The return type precisely reflects the possible indices of the tuple.

#### Type Parameters

##### T

`T` _extends_ readonly `unknown`[]

The tuple type to search within

#### Parameters

##### tpl

`T`

The input tuple

##### searchElement

`T`\[`number`\]

Element to locate in the tuple (must be assignable to tuple's element types)

##### fromIndex?

`MapNumberToArraySearchResult`\<`IndexOfTupleImpl`\<`T`, keyof `T`\>\>

Optional index to start the search at (defaults to 0)

#### Returns

`-1` \| `MapNumberToArraySearchResult`\<`IndexOfTupleImpl`\<`T`, keyof `T`\>\>

The first index of the element, or -1 if not found

#### Example

```typescript
const tpl = ['a', 'b', 'c', 'b'] as const;
const idx1 = Tpl.indexOf(tpl, 'b'); // 1 | 3 | -1 (type shows possible indices)
const idx2 = Tpl.indexOf(tpl, 'b', 2); // 3 | -1 (search from index 2)
const idx3 = Tpl.indexOf(tpl, 'd'); // -1

// Type safety with literal types
const nums = [1, 2, 3, 2] as const;
const twoIndex = Tpl.indexOf(nums, 2); // 1 | 3 | -1
// Tpl.indexOf(nums, '2'); // Error: string not assignable to 1 | 2 | 3

// Works with mixed types
const mixed = [1, 'hello', true, 1] as const;
const oneIndex = Tpl.indexOf(mixed, 1); // 0 | 3 | -1
```

---

### lastIndexOf()

> **lastIndexOf**\<`T`\>(`tpl`, `searchElement`, `fromIndex?`): `-1` \| `MapNumberToArraySearchResult`\<`IndexOfTupleImpl`\<`T`, keyof `T`\>\>

Defined in: [src/array/tuple-utils.mts:192](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/tuple-utils.mts#L192)

Returns the last index at which a given element can be found in the tuple.

Searches backwards from the end (or from `fromIndex` if provided) and
returns a type-safe index reflecting the tuple's structure.

#### Type Parameters

##### T

`T` _extends_ readonly `unknown`[]

The tuple type to search within

#### Parameters

##### tpl

`T`

The input tuple

##### searchElement

`T`\[`number`\]

Element to locate in the tuple

##### fromIndex?

`MapNumberToArraySearchResult`\<`IndexOfTupleImpl`\<`T`, keyof `T`\>\>

Optional index to start searching backwards from (defaults to last index)

#### Returns

`-1` \| `MapNumberToArraySearchResult`\<`IndexOfTupleImpl`\<`T`, keyof `T`\>\>

The last index of the element, or -1 if not found

#### Example

```typescript
const tpl = ['a', 'b', 'c', 'b'] as const;
const idx1 = Tpl.lastIndexOf(tpl, 'b'); // 3 | 1 | -1
const idx2 = Tpl.lastIndexOf(tpl, 'b', 2); // 1 | -1 (search up to index 2)
const idx3 = Tpl.lastIndexOf(tpl, 'd'); // -1

// With duplicate values
const nums = [1, 2, 3, 2, 1] as const;
const lastOne = Tpl.lastIndexOf(nums, 1); // 4 | 0 | -1
const lastTwo = Tpl.lastIndexOf(nums, 2); // 3 | 1 | -1

// Type safety preserved
const mixed = [true, 42, 'str', 42] as const;
const last42 = Tpl.lastIndexOf(mixed, 42); // 3 | 1 | -1
// Tpl.lastIndexOf(mixed, false); // Error: false not in tuple type
```

---

### map()

> **map**\<`T`, `B`\>(`tpl`, `mapFn`): \{ readonly \[K in string \| number \| symbol\]: B \}

Defined in: [src/array/tuple-utils.mts:233](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/tuple-utils.mts#L233)

Creates a new tuple by transforming each element with a mapping function.

Preserves the tuple's length while allowing element type transformation.
The resulting tuple has the same structure but with transformed element types.

#### Type Parameters

##### T

`T` _extends_ readonly `unknown`[]

The type of the input tuple

##### B

`B`

The type that elements will be transformed to

#### Parameters

##### tpl

`T`

The input tuple

##### mapFn

(`a`, `index`) => `B`

Function that transforms each element (receives element and index)

#### Returns

\{ readonly \[K in string \| number \| symbol\]: B \}

A new tuple with transformed elements, preserving the original length

#### Example

```typescript
// Basic transformation
const nums = [1, 2, 3] as const;
const doubled = Tpl.map(nums, (x) => x * 2); // readonly [2, 4, 6]
const strings = Tpl.map(nums, (x) => String(x)); // readonly ['1', '2', '3']

// With index
const indexed = Tpl.map(nums, (x, i) => `${i}:${x}`);
// readonly ['0:1', '1:2', '2:3']

// Mixed type tuples
const mixed = [1, 'hello', true] as const;
const descriptions = Tpl.map(mixed, (x) => `Value: ${x}`);
// readonly ['Value: 1', 'Value: hello', 'Value: true']

// Type transformation preserves tuple structure
type Original = readonly [number, string, boolean];
type Mapped = { readonly [K in keyof Original]: string };
// Mapped = readonly [string, string, string]
```

---

### set()

> **set**\<`T`, `N`\>(`tpl`, `index`, `newValue`): \{ readonly \[K in string \| number \| symbol\]: N \| T\[K\<K\>\] \}

Defined in: [src/array/tuple-utils.mts:278](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/tuple-utils.mts#L278)

Returns a new tuple with the element at the specified index replaced.

This operation is type-safe with compile-time index validation.
The resulting tuple type reflects that the element at the given index
may be either the new type or the original type.

#### Type Parameters

##### T

`T` _extends_ readonly `unknown`[]

The type of the input tuple

##### N

`N`

The type of the new value to set

#### Parameters

##### tpl

`T`

The input tuple

##### index

`IndexOfTupleImpl`\<`MakeTupleImpl`\<`0`, `` `${Length<T>}` ``, \[\]\>\>

The index to update (must be valid for the tuple length)

##### newValue

`N`

The new value to place at the index

#### Returns

\{ readonly \[K in string \| number \| symbol\]: N \| T\[K\<K\>\] \}

A new tuple with the updated element

#### Example

```typescript
// Basic usage
const tpl = ['a', 'b', 'c'] as const;
const updated = Tpl.set(tpl, 1, 'B'); // readonly ['a', 'B', 'c']

// Type changes are reflected
const mixed = [1, 'hello', true] as const;
const withNumber = Tpl.set(mixed, 1, 42);
// readonly [1, 42 | 'hello', true]

// Compile-time index validation
const short = [1, 2] as const;
// Tpl.set(short, 2, 3); // Error: index 2 is out of bounds

// Different value types
const nums = [1, 2, 3] as const;
const withString = Tpl.set(nums, 0, 'first');
// readonly ['first' | 1, 2, 3]
```

---

### size()

> **size**\<`T`\>(`list`): `Length`\<`T`\>

Defined in: [src/array/tuple-utils.mts:53](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/tuple-utils.mts#L53)

Returns the length of a tuple as a literal type.

Unlike `array.length` which returns `number`, this preserves
the exact length as a literal type (e.g., `3` not `number`).

#### Type Parameters

##### T

`T` _extends_ readonly `unknown`[]

The tuple type whose length will be extracted

#### Parameters

##### list

`T`

The input tuple

#### Returns

`Length`\<`T`\>

The length of the tuple as a literal number type

#### Example

```typescript
const tpl = [1, 2, 3] as const;
const len = Tpl.size(tpl); // 3 (literal type, not just number)

// Type-level length extraction
type Len = Length<typeof tpl>; // 3

// Useful for compile-time validation
function requiresTriple<T extends readonly [unknown, unknown, unknown]>(t: T) {}
const pair = [1, 2] as const;
// requiresTriple(pair); // Error: length mismatch
```

---

### toReversed()

> **toReversed**\<`T`\>(`tpl`): `ReverseImpl`\<`T`\>

Defined in: [src/array/tuple-utils.mts:369](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/tuple-utils.mts#L369)

Reverses a tuple, preserving element types in their new positions.

The type system precisely tracks the reversal, so the returned tuple
has its element types in the exact reverse order. This is more precise
than array reversal which loses positional type information.

#### Type Parameters

##### T

`T` _extends_ readonly `unknown`[]

The tuple type to reverse

#### Parameters

##### tpl

`T`

The input tuple

#### Returns

`ReverseImpl`\<`T`\>

A new tuple with elements in reverse order and precise typing

#### Example

```typescript
// Basic reversal
const nums = [1, 2, 3] as const;
const reversed = Tpl.toReversed(nums); // readonly [3, 2, 1]

// Mixed types preserved in reverse positions
const mixed = [1, 'hello', true, null] as const;
const revMixed = Tpl.toReversed(mixed);
// readonly [null, true, 'hello', 1]

// Type-level reversal
type Original = readonly [number, string, boolean];
type Reversed = Tuple.Reverse<Original>;
// Reversed = readonly [boolean, string, number]

// Empty and single-element tuples
const empty = [] as const;
const revEmpty = Tpl.toReversed(empty); // readonly []
const single = [42] as const;
const revSingle = Tpl.toReversed(single); // readonly [42]
```

---

### toSorted()

> **toSorted**\<`T`\>(`tpl`, `comparator?`): `Readonly`\<`{ [K in keyof T]: T[number] }`\>

Defined in: [src/array/tuple-utils.mts:413](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/tuple-utils.mts#L413)

Sorts a tuple's elements, returning a new tuple with the same length.

Unlike array sorting, this preserves the tuple's length but loses
positional type information (all positions can contain any element
from the original tuple). Default comparison is numeric ascending.

#### Type Parameters

##### T

`T` _extends_ readonly `unknown`[]

The tuple type to sort

#### Parameters

##### tpl

`T`

The input tuple

##### comparator?

(`x`, `y`) => `number`

Optional comparison function (defaults to numeric comparison)

#### Returns

`Readonly`\<`{ [K in keyof T]: T[number] }`\>

A new tuple with sorted elements

#### Example

```typescript
// Default numeric sorting
const nums = [3, 1, 4, 1, 5] as const;
const sorted = Tpl.toSorted(nums); // readonly [1, 1, 3, 4, 5]

// Custom comparator
const descending = Tpl.toSorted(nums, (a, b) => b - a);
// readonly [5, 4, 3, 1, 1]

// String sorting with comparator
const strs = ['banana', 'apple', 'cherry'] as const;
const alphaSorted = Tpl.toSorted(strs, (a, b) => a.localeCompare(b));
// readonly ['apple', 'banana', 'cherry']

// Mixed types require explicit comparator
const mixed = [3, '2', 1, '4'] as const;
const mixedSorted = Tpl.toSorted(mixed, (a, b) => Number(a) - Number(b));
// readonly ['1', '2', '3', '4'] but typed as (3 | '2' | 1 | '4')[]

// Note: Element types become union of all elements
type Original = readonly [1, 2, 3];
type Sorted = { readonly [K in keyof Original]: Original[number] };
// Sorted = readonly [1 | 2 | 3, 1 | 2 | 3, 1 | 2 | 3]
```

---

### toSortedBy()

#### Call Signature

> **toSortedBy**\<`T`\>(`tpl`, `comparatorValueMapper`, `comparator?`): `Readonly`\<`{ [K in keyof T]: T[number] }`\>

Defined in: [src/array/tuple-utils.mts:474](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/tuple-utils.mts#L474)

Sorts a tuple by derived values from its elements.

Allows sorting complex objects by extracting a sortable value from each.
Like `toSorted`, this preserves tuple length but element types become
a union of all possible elements.

##### Type Parameters

###### T

`T` _extends_ readonly `unknown`[]

The tuple type to sort

##### Parameters

###### tpl

`T`

The input tuple

###### comparatorValueMapper

(`value`) => `number`

Function to extract comparison value from each element

###### comparator?

(`x`, `y`) => `number`

Optional comparator for the extracted values

##### Returns

`Readonly`\<`{ [K in keyof T]: T[number] }`\>

A new sorted tuple

##### Example

```typescript
// Sort objects by numeric property
const users = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 20 },
    { name: 'Charlie', age: 25 },
] as const;
const byAge = Tpl.toSortedBy(users, (user) => user.age);
// [{name: 'Bob', age: 20}, {name: 'Charlie', age: 25}, {name: 'Alice', age: 30}]

// Sort by string property with custom comparator
const byNameDesc = Tpl.toSortedBy(
    users,
    (user) => user.name,
    (a, b) => b.localeCompare(a),
);
// Sorted by name in descending order

// Sort by computed values
const points = [
    { x: 3, y: 4 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
] as const;
const byDistance = Tpl.toSortedBy(points, (p) =>
    Math.sqrt(p.x ** 2 + p.y ** 2),
);
// Sorted by distance from origin

// Custom comparator for complex sorting
const items = [
    { priority: 1, name: 'A' },
    { priority: 1, name: 'B' },
] as const;
const sorted = Tpl.toSortedBy(
    items,
    (item) => item.priority,
    (a, b) => b - a, // High priority first
);
```

#### Call Signature

> **toSortedBy**\<`T`, `B`\>(`tpl`, `comparatorValueMapper`, `comparator`): `Readonly`\<`{ [K in keyof T]: T[number] }`\>

Defined in: [src/array/tuple-utils.mts:480](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/tuple-utils.mts#L480)

Sorts a tuple by derived values from its elements.

Allows sorting complex objects by extracting a sortable value from each.
Like `toSorted`, this preserves tuple length but element types become
a union of all possible elements.

##### Type Parameters

###### T

`T` _extends_ readonly `unknown`[]

The tuple type to sort

###### B

`B`

The type of values used for comparison

##### Parameters

###### tpl

`T`

The input tuple

###### comparatorValueMapper

(`value`) => `B`

Function to extract comparison value from each element

###### comparator

(`x`, `y`) => `number`

Optional comparator for the extracted values

##### Returns

`Readonly`\<`{ [K in keyof T]: T[number] }`\>

A new sorted tuple

##### Example

```typescript
// Sort objects by numeric property
const users = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 20 },
    { name: 'Charlie', age: 25 },
] as const;
const byAge = Tpl.toSortedBy(users, (user) => user.age);
// [{name: 'Bob', age: 20}, {name: 'Charlie', age: 25}, {name: 'Alice', age: 30}]

// Sort by string property with custom comparator
const byNameDesc = Tpl.toSortedBy(
    users,
    (user) => user.name,
    (a, b) => b.localeCompare(a),
);
// Sorted by name in descending order

// Sort by computed values
const points = [
    { x: 3, y: 4 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
] as const;
const byDistance = Tpl.toSortedBy(points, (p) =>
    Math.sqrt(p.x ** 2 + p.y ** 2),
);
// Sorted by distance from origin

// Custom comparator for complex sorting
const items = [
    { priority: 1, name: 'A' },
    { priority: 1, name: 'B' },
] as const;
const sorted = Tpl.toSortedBy(
    items,
    (item) => item.priority,
    (a, b) => b - a, // High priority first
);
```

---

### toUpdated()

> **toUpdated**\<`T`, `N`\>(`tpl`, `index`, `updater`): \{ readonly \[K in string \| number \| symbol\]: N \| T\[K\<K\>\] \}

Defined in: [src/array/tuple-utils.mts:324](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/tuple-utils.mts#L324)

Returns a new tuple with an element updated by applying a function.

Similar to `set`, but instead of providing a new value directly,
you provide a function that transforms the existing value.
Useful for computed updates based on the current value.

#### Type Parameters

##### T

`T` _extends_ readonly `unknown`[]

The type of the input tuple

##### N

`N`

The type returned by the updater function

#### Parameters

##### tpl

`T`

The input tuple

##### index

The index of the element to update

`ArgArrNonNegative` | IndexOfTupleImpl\<MakeTupleImpl\<0, \`$\{Length\<T\>\}\`, \[\]\>, keyof MakeTupleImpl\<0, \`$\{Length\<T\>\}\`, \[\]\>\> & (0 \| ... 38 more ... \| 39)

##### updater

(`prev`) => `N`

Function that transforms the current value to a new value

#### Returns

\{ readonly \[K in string \| number \| symbol\]: N \| T\[K\<K\>\] \}

A new tuple with the updated element

#### Example

```typescript
// Numeric updates
const nums = [1, 2, 3] as const;
const doubled = Tpl.toUpdated(nums, 1, (x) => x * 10);
// readonly [1, 20, 3]

// String transformations
const strs = ['hello', 'world', '!'] as const;
const uppercased = Tpl.toUpdated(strs, 0, (s) => s.toUpperCase());
// readonly ['HELLO', 'world', '!']

// Complex transformations
const data = [{ count: 1 }, { count: 2 }, { count: 3 }] as const;
const incremented = Tpl.toUpdated(data, 1, (obj) => ({ count: obj.count + 1 }));
// Updates the second object's count to 3

// Type changes through updater
const mixed = [1, 'hello', true] as const;
const stringified = Tpl.toUpdated(mixed, 0, (n) => `Number: ${n}`);
// readonly ['Number: 1' | 1, 'hello', true]
```
