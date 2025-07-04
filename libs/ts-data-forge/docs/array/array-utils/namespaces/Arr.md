[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [array/array-utils](../README.md) / Arr

# Arr

A comprehensive, immutable utility library for array manipulations in TypeScript.
Provides a wide range of functions for array creation, validation, transformation,
reduction, slicing, set operations, and more, with a focus on type safety and
leveraging TypeScript's type inference capabilities.
All functions operate on `readonly` arrays and return new `readonly` arrays,
ensuring immutability.

## Variables

### at

> `const` **at**: `AtFnOverload`

Defined in: [src/array/array-utils.mts:947](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L947)

Safely retrieves an element at a given index from an array, returning an [Optional](../../../functional/optional/README.md#optional).

This function provides type-safe array access with support for negative indexing
(e.g., -1 for the last element). Unlike direct array access which can return
`undefined` for out-of-bounds indices, this function always returns a well-typed
[Optional](../../../functional/optional/README.md#optional) that explicitly represents the possibility of absence.

**Negative Indexing:** Negative indices count from the end of the array:

- `-1` refers to the last element
- `-2` refers to the second-to-last element, etc.

**Curried Usage:** This function supports currying - when called with only an index, it returns
a function that can be applied to arrays, making it ideal for use in pipe operations.

**Optional Return Type:** The return type is always [Optional](../../../functional/optional/README.md#optional)<E> which provides:

- Type-safe access without `undefined` in your business logic
- Explicit handling of \"not found\" cases
- Composable error handling with [Optional](../../../functional/optional/README.md#optional) utilities

#### Template

The type of elements in the array.

#### Param

The array to access (when using direct call syntax).

#### Param

The index to access. Must be a branded `SizeType.ArgArr` (safe integer). Can be:

- **Positive integer:** 0-based index from the start (0, 1, 2, ...)
- **Negative integer:** index from the end (-1 is last element, -2 is second-to-last, etc.)
- **Out of bounds:** any index beyond array bounds returns [Optional.None](../../../functional/optional/namespaces/Optional.md#none)

#### Returns

An [Optional](../../../functional/optional/README.md#optional)<E> containing:

- [Optional.Some](../../../functional/optional/namespaces/Optional.md#some)<E> with the element if the index is valid
- [Optional.None](../../../functional/optional/namespaces/Optional.md#none) if the index is out of bounds (including empty arrays)

#### Example

```typescript
// Direct usage with positive indices
const fruits = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
const first = Arr.at(fruits, 0); // Optional.Some('apple')
const third = Arr.at(fruits, 2); // Optional.Some('cherry')
const outOfBounds = Arr.at(fruits, 10); // Optional.None

// Negative indexing (accessing from the end)
const last = Arr.at(fruits, -1); // Optional.Some('elderberry')
const secondLast = Arr.at(fruits, -2); // Optional.Some('date')
const negativeOutOfBounds = Arr.at(fruits, -10); // Optional.None

// Edge cases
const emptyResult = Arr.at([], 0); // Optional.None
const negativeOnEmpty = Arr.at([], -1); // Optional.None
const singleElement = Arr.at(['only'], 0); // Optional.Some('only')
const singleNegative = Arr.at(['only'], -1); // Optional.Some('only')

// Safe access pattern with type-safe unwrapping
const maybeElement = Arr.at(fruits, 2);
if (Optional.isSome(maybeElement)) {
    console.log(`Found: ${maybeElement.value}`); // Type-safe access, no undefined
} else {
    console.log('Index out of bounds');
}

// Alternative unwrapping with default
const elementOrDefault = Optional.unwrapOr(Arr.at(fruits, 100), 'not found');
console.log(elementOrDefault); // 'not found'

// Curried usage for functional composition
const getSecondElement = Arr.at(1);
const getLastElement = Arr.at(-1);
const getMiddleElement = Arr.at(2);

const nestedArrays = [[10, 20, 30, 40], [50, 60], [70]];
const secondElements = nestedArrays.map(getSecondElement);
// [Optional.Some(20), Optional.None, Optional.None]

const lastElements = nestedArrays.map(getLastElement);
// [Optional.Some(40), Optional.Some(60), Optional.Some(70)]

// Pipe composition for data processing
const processArray = (arr: readonly string[]) =>
    pipe(arr)
        .map(getSecondElement)
        .map((opt) => Optional.map(opt, (s) => s.toUpperCase()))
        .map((opt) => Optional.unwrapOr(opt, 'MISSING')).value;

console.log(processArray(['a', 'b', 'c'])); // 'B'
console.log(processArray(['x'])); // 'MISSING'

// Advanced curried usage with transformation pipelines
const extractAndProcess = pipe([
    ['hello', 'world', 'typescript'],
    ['functional', 'programming'],
    ['type', 'safety', 'matters', 'most'],
])
    .map((arr) => arr.map(getSecondElement))
    .map((opts) =>
        opts.map((opt) => Optional.unwrapOr(opt, '[missing]')),
    ).value;
// [['world'], ['[missing]'], ['safety']]

// Type inference examples
expectType<typeof first, Optional<string>>('=');
expectType<typeof getSecondElement, <T>(array: readonly T[]) => Optional<T>>(
    '=',
);
expectType<typeof negativeOutOfBounds, Optional<string>>('=');
```

#### See

- [head](#head) for getting the first element specifically
- [last](#last) for getting the last element specifically
- [Optional](../../../functional/optional/README.md#optional) for working with the returned Optional values
- [Optional.unwrapOr](../../../functional/optional/namespaces/Optional.md#unwrapor) for safe unwrapping with defaults
- [Optional.map](../../../functional/optional/namespaces/Optional.md#map) for transforming Optional values

---

### chunk

> `const` **chunk**: `PartitionFnOverload` = `partition`

Defined in: [src/array/array-utils.mts:3966](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3966)

Alias for `partition`. Splits an array into chunks of a specified size.

#### See

[partition](#partition)

---

### count

> `const` **count**: `CountFnOverload`

Defined in: [src/array/array-utils.mts:2880](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2880)

Counts the number of elements in an array that satisfy a predicate.

#### Template

The type of elements in the array.

#### Param

The input array.

#### Param

A function `(value: A, index: number) => boolean` to test each element for a condition.

#### Returns

The number of elements that satisfy the predicate.

#### Example

```ts
// Regular usage
Arr.count([1, 2, 3, 4], (x) => x > 2); // 2

// Curried usage for pipe composition
const countEvens = Arr.count((x: number) => x % 2 === 0);
const result = pipe([1, 2, 3, 4, 5, 6]).map(countEvens).value;
console.log(result); // 3
```

---

### countBy

> `const` **countBy**: `CountByFnOverload`

Defined in: [src/array/array-utils.mts:2937](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2937)

Groups elements of an array by a key derived from each element and counts the elements in each group.

#### Template

The type of elements in the array.

#### Template

The type of the group key (must be a primitive type: `string`, `number`, `boolean`, `symbol`, `bigint`, `null`, or `undefined`).

#### Param

The input array.

#### Param

A function `(value: A, index: number) => G` that maps an element and its index to a group key.

#### Returns

An `IMap` where keys are group keys and values are the counts of elements in each group.

#### Example

```ts
// Regular usage
Arr.countBy([1, 2, 2, 3, 1, 1], (x) => x);
// IMap { 1 => 3, 2 => 2, 3 => 1 }

// Curried usage for pipe composition
const countByType = Arr.countBy((x: { type: string }) => x.type);
const data = [{ type: 'a' }, { type: 'b' }, { type: 'a' }];
const result = pipe(data).map(countByType).value;
// IMap { 'a' => 2, 'b' => 1 }
```

---

### create

> `const` **create**: `CreateFnOverload`

Defined in: [src/array/array-utils.mts:569](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L569)

Creates a new array of the specified length, with each position filled with the provided initial value.

This function provides compile-time type safety with precise return types and performs shallow copying
of the initial value (the same reference is used for all positions):

- When `len` is a compile-time known `SmallUint` (0-100), returns a tuple of exactly that length
- When `len` is a positive runtime value, returns a `NonEmptyArray<V>`
- Otherwise, returns a `readonly V[]` that may be empty

#### Template

The type of the initial value. The `const` constraint preserves literal types.

#### Template

The type of the length parameter when it's a `SmallUint` literal.

#### Param

The length of the array to create. Must be a non-negative integer.

#### Param

The value to fill each position with. The same reference is used for all positions.

#### Returns

An immutable array filled with the initial value. The exact return type depends on the length:

- `ArrayOfLength<N, V>` when `len` is a `SmallUint` literal
- `NonEmptyArray<V>` when `len` is a positive runtime value
- `readonly V[]` for general non-negative values

#### Example

```typescript
// Compile-time known lengths produce precise tuple types
const strings = Arr.create(3, 'hello'); // readonly ['hello', 'hello', 'hello']
const numbers = Arr.create(2, 42); // readonly [42, 42]
const empty = Arr.create(0, 'unused'); // readonly []

// Object references are shared (shallow copy behavior)
const obj = { id: 1, name: 'test' };
const objects = Arr.create(3, obj); // readonly [obj, obj, obj]
objects[0] === objects[1]; // true - same reference
objects[0].id = 999; // Mutates the shared object
console.log(objects[1].id); // 999 - all positions affected

// Runtime positive values produce non-empty arrays
const count = Math.floor(Math.random() * 5) + 1;
const nonEmpty = Arr.create(count, 'item'); // NonEmptyArray<string>

// Literal type preservation with const assertion
const literals = Arr.create(2, 'success' as const); // readonly ['success', 'success']

// Type inference examples
expectType<typeof strings, readonly ['hello', 'hello', 'hello']>('=');
expectType<typeof numbers, readonly [42, 42]>('=');
expectType<typeof empty, readonly []>('=');
```

#### See

- [zeros](#zeros) for creating arrays filled with zeros
- [seq](#seq) for creating sequences of consecutive integers

---

### drop

> `const` **drop**: `SkipFnOverload` = `skip`

Defined in: [src/array/array-utils.mts:3948](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3948)

Alias for `skip`. Skips the first N elements of an array.

#### See

[skip](#skip)

---

### equal()

> `const` **equal**: \<`E`\>(`array1`, `array2`, `equality`) => `boolean` = `eq`

Defined in: [src/array/array-utils.mts:3784](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3784)

Alias for `eq`.

Checks if two arrays are equal by performing a shallow comparison of their elements.

#### Type Parameters

##### E

`E`

The type of elements in the arrays.

#### Parameters

##### array1

readonly `E`[]

The first array.

##### array2

readonly `E`[]

The second array.

##### equality

(`a`, `b`) => `boolean`

An optional function `(a: T, b: T) => boolean` to compare elements. Defaults to `Object.is`.

#### Returns

`boolean`

`true` if the arrays have the same length and all corresponding elements are equal according to the `equality` function, `false` otherwise.

#### Example

```ts
Arr.eq([1, 2, 3], [1, 2, 3]); // true
Arr.eq([1, 2, 3], [1, 2, 4]); // false
Arr.eq([1, 2], [1, 2, 3]); // false
Arr.eq([{ a: 1 }], [{ a: 1 }]); // false (different object references)
Arr.eq([{ a: 1 }], [{ a: 1 }], (o1, o2) => o1.a === o2.a); // true
```

---

### filterNot

> `const` **filterNot**: `FilterNotFnOverload`

Defined in: [src/array/array-utils.mts:3121](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3121)

Filters an array by excluding elements for which the predicate returns true.
This is the opposite of `Array.prototype.filter`.

#### Template

The type of elements in the array.

#### Param

The input array.

#### Param

A function `(a: A, index: number) => boolean` that returns `true` for elements to be excluded.

#### Returns

A new array with elements for which the predicate returned `false`.

#### Example

```ts
// Regular usage
Arr.filterNot([1, 2, 3, 4], (x) => x % 2 === 0); // [1, 3] (excludes even numbers)

// Curried usage for pipe composition
const excludeEvens = Arr.filterNot((x: number) => x % 2 === 0);
const result = pipe([1, 2, 3, 4, 5, 6]).map(excludeEvens).value;
console.log(result); // [1, 3, 5]
```

---

### find

> `const` **find**: `FindFnOverload`

Defined in: [src/array/array-utils.mts:2131](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2131)

Safely finds the first element in an array that satisfies a predicate function.

This function provides type-safe searching with no risk of runtime errors. It returns
the first element that matches the predicate wrapped in an Optional, or Optional.None
if no element is found. The predicate receives the element, its index, and the entire array.

**Curried Usage:** This function supports currying - when called with only a predicate,
it returns a function that can be applied to arrays, making it ideal for functional composition.

#### Template

The type of elements in the array.

#### Param

The array to search through (when using direct call syntax).

#### Param

A function that tests each element. Called with:

- `value`: The current element being tested
- `index`: The index of the current element (branded as `SizeType.Arr`)
- `arr`: The entire array being searched

#### Returns

An `Optional<E>` containing:

- `Optional.Some<E>` with the first matching element if found
- `Optional.None` if no element satisfies the predicate

#### Example

```typescript
const numbers = [1, 2, 3, 4, 5];
const firstEven = Arr.find(numbers, (x) => x % 2 === 0);
if (Optional.isSome(firstEven)) {
    console.log(firstEven.value); // 2
}

const users = [
    { id: 1, name: 'Alice', age: 25 },
    { id: 2, name: 'Bob', age: 30 },
];
const adult = Arr.find(users, (user) => user.age >= 30);
// Optional.Some({ id: 2, name: 'Bob', age: 30 })
```

#### See

- [findIndex](#findindex) for finding the index instead of the element
- [indexOf](#indexof) for finding elements by equality
- [Optional](../../../functional/optional/README.md#optional) for working with the returned Optional values

---

### findIndex

> `const` **findIndex**: `FindIndexFnOverload`

Defined in: [src/array/array-utils.mts:2287](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2287)

Safely finds the index of the first element in an array that satisfies a predicate function.

This function provides type-safe index searching with no risk of runtime errors. It returns
the index of the first element that matches the predicate wrapped in an Optional, or Optional.None
if no element is found. The returned index is branded as `SizeType.Arr` for type safety.

**Curried Usage:** This function supports currying - when called with only a predicate,
it returns a function that can be applied to arrays, making it ideal for functional composition.

#### Template

The type of elements in the array.

#### Param

The array to search through (when using direct call syntax).

#### Param

A function that tests each element. Called with:

- `value`: The current element being tested
- `index`: The index of the current element (branded as `SizeType.Arr`)

#### Returns

An `Optional<SizeType.Arr>` containing:

- `Optional.Some<SizeType.Arr>` with the index of the first matching element if found
- `Optional.None` if no element satisfies the predicate

#### Example

```typescript
// Basic index finding
const fruits = ['apple', 'banana', 'cherry', 'banana'];
const bananaIndex = Arr.findIndex(fruits, (fruit) => fruit === 'banana');
if (Optional.isSome(bananaIndex)) {
    console.log(bananaIndex.value); // 1 - index of first 'banana'
}

// Finding with complex conditions
const numbers = [1, 5, 10, 15, 20];
const firstLargeIndex = Arr.findIndex(
    numbers,
    (value, index) => value > 10 && index > 1,
);
// Optional.Some(3) - index of 15 (first value > 10 after index 1)

// Finding objects by property
const users = [
    { id: 1, active: false },
    { id: 2, active: true },
    { id: 3, active: true },
];

const firstActiveIndex = Arr.findIndex(users, (user) => user.active);
// Optional.Some(1) - index of first active user

const inactiveAdminIndex = Arr.findIndex(
    users,
    (user) => !user.active && user.id > 5,
);
// Optional.None - no inactive user with id > 5

// Empty array handling
const emptyResult = Arr.findIndex([], (x) => x > 0); // Optional.None

// Curried usage for functional composition
const findNegativeIndex = Arr.findIndex((x: number) => x < 0);
const findLongStringIndex = Arr.findIndex((s: string) => s.length > 5);

const datasets = [
    [1, 2, -3, 4], // index 2 has negative
    [5, 6, 7, 8], // no negative
    [-1, 0, 1], // index 0 has negative
];

const negativeIndices = datasets.map(findNegativeIndex);
// [Optional.Some(2), Optional.None, Optional.Some(0)]

// Using found indices for further operations
const data = ['short', 'medium', 'very long string', 'tiny'];
const longStringIndex = Arr.findIndex(data, (s) => s.length > 8);

if (Optional.isSome(longStringIndex)) {
    const index = longStringIndex.value;
    console.log(`Found at position ${index}: ${data[index]}`);
    // "Found at position 2: very long string"
}

// Pipe composition
const result = pipe(['a', 'bb', 'ccc'])
    .map(findLongStringIndex)
    .map((opt) => Optional.unwrapOr(opt, -1)).value; // 2 (index of 'ccc')

// Comparing with native findIndex (which returns -1)
const nativeResult = fruits.findIndex((fruit) => fruit === 'grape'); // -1
const safeResult = Arr.findIndex(fruits, (fruit) => fruit === 'grape'); // Optional.None

// Safe index usage patterns
const maybeIndex = Arr.findIndex(numbers, (x) => x > 100);
const indexOrDefault = Optional.unwrapOr(maybeIndex, 0); // 0 (not found)

// Using index for array access
const foundIndex = Arr.findIndex(fruits, (f) => f.startsWith('c'));
const foundElement = Optional.isSome(foundIndex)
    ? fruits[foundIndex.value]
    : 'not found';
// 'cherry'

// Type inference examples
expectType<typeof bananaIndex, Optional<SizeType.Arr>>('=');
expectType<
    typeof findNegativeIndex,
    (array: readonly number[]) => Optional<SizeType.Arr>
>('=');
```

#### See

- [find](#find) for finding the element instead of its index
- [indexOf](#indexof) for finding elements by equality (not predicate)
- [lastIndexOf](#lastindexof) for finding the last occurrence
- [Optional](../../../functional/optional/README.md#optional) for working with the returned Optional values

---

### first

> `const` **first**: `HeadFnOverload` = `head`

Defined in: [src/array/array-utils.mts:3936](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3936)

Alias for `head`. Returns the first element of an array.

#### See

[head](#head)

---

### foldl

> `const` **foldl**: `FoldlFnOverload`

Defined in: [src/array/array-utils.mts:2514](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2514)

Applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value.
This is an alias for `Array.prototype.reduce`.

#### Template

The type of elements in the array.

#### Template

The type of the accumulated value.

#### Param

The input array.

#### Param

A function to execute on each element in the array: `(previousValue: S, currentValue: A, currentIndex: SizeType.Arr) => S`.

#### Param

The initial value of the accumulator.

#### Returns

The single value that results from the reduction.

#### Example

```ts
Arr.foldl([1, 2, 3], (sum, n) => sum + n, 0); // 6
Arr.foldl(['a', 'b', 'c'], (acc, str) => acc + str.toUpperCase(), ''); // 'ABC'
```

---

### foldr

> `const` **foldr**: `FoldrFnOverload`

Defined in: [src/array/array-utils.mts:2591](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2591)

Applies a function against an accumulator and each element in the array (from right to left) to reduce it to a single value.
This is an alias for `Array.prototype.reduceRight`.

#### Template

The type of elements in the array.

#### Template

The type of the accumulated value.

#### Param

The input array.

#### Param

A function to execute on each element in the array: `(previousValue: S, currentValue: A, currentIndex: SizeType.Arr) => S`.

#### Param

The initial value of the accumulator.

#### Returns

The single value that results from the reduction.

#### Example

```ts
// Regular usage
Arr.foldr([1, 2, 3], (sum, n) => sum + n, 0); // 6

// Curried usage for pipe composition
const concatRight = Arr.foldr((acc: string, curr: string) => curr + acc, '');
const result = pipe(['a', 'b', 'c']).map(concatRight).value;
console.log(result); // "abc"
```

---

### groupBy

> `const` **groupBy**: `GroupByFnOverload`

Defined in: [src/array/array-utils.mts:3645](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3645)

Groups elements of an array by a key derived from each element, returning an immutable [IMap](../../../collections/imap/README.md#imap).

This function categorizes array elements into groups based on a computed key, using the efficient
[IMap](../../../collections/imap/README.md#imap) data structure for the result. The grouper function receives both the element and its
index, enabling flexible grouping strategies.

**MapSetKeyType Constraint:** The group key type `G` must extend MapSetKeyType, which includes
primitive types that can be used as Map keys (string, number, boolean, symbol, null, undefined).
This constraint ensures type safety and efficient key-based operations.

**IMap Return Type:** Returns an [IMap](../../../collections/imap/README.md#imap)<G, readonly E[]> where:

- Keys are the computed group identifiers of type `G`
- Values are immutable arrays containing all elements that belong to each group
- Preserves insertion order of first occurrence of each group
- Maintains type safety with precise generic types

**Curried Usage:** Supports currying for functional composition - when called with only the grouper
function, returns a reusable function that can be applied to arrays.

#### Template

The type of elements in the input array.

#### Template

The type of the group key, constrained to MapSetKeyType (primitives usable as Map keys).
Must be one of: `string | number | boolean | symbol | null | undefined`

#### Param

The input array to group. Can be empty (returns empty [IMap](../../../collections/imap/README.md#imap)).

#### Param

A function `(value: E, index: SizeType.Arr) => G` that computes the group key for each element.

- **value:** The current array element
- **index:** The 0-based index of the element (typed as SizeType.Arr)
- **returns:** The group key (must be MapSetKeyType)

#### Returns

An [IMap](../../../collections/imap/README.md#imap)<G, readonly E[]> where:

- Keys are unique group identifiers computed by the grouper function
- Values are immutable arrays of elements belonging to each group
- Empty groups are not included (only groups with at least one element)
- Insertion order is preserved based on first occurrence of each group key

#### Example

```typescript
// Basic grouping by object property
const products = [
    { type: 'fruit', name: 'apple', price: 1.2 },
    { type: 'vegetable', name: 'carrot', price: 0.8 },
    { type: 'fruit', name: 'banana', price: 0.9 },
    { type: 'vegetable', name: 'broccoli', price: 2.1 },
    { type: 'fruit', name: 'orange', price: 1.5 },
];

const byType = Arr.groupBy(products, (item) => item.type);
// IMap<string, readonly Product[]> {
//   'fruit' => [
//     { type: 'fruit', name: 'apple', price: 1.2 },
//     { type: 'fruit', name: 'banana', price: 0.9 },
//     { type: 'fruit', name: 'orange', price: 1.5 }
//   ],
//   'vegetable' => [
//     { type: 'vegetable', name: 'carrot', price: 0.8 },
//     { type: 'vegetable', name: 'broccoli', price: 2.1 }
//   ]
// }

// Access grouped results with IMap methods
const fruits = IMap.get(byType, 'fruit'); // Optional<readonly Product[]>
const fruitCount = Optional.map(fruits, (arr) => arr.length); // Optional<number>
const fruitNames = Optional.map(fruits, (arr) => arr.map((p) => p.name)); // Optional<string[]>

// Grouping by computed values
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const byParity = Arr.groupBy(numbers, (n) => (n % 2 === 0 ? 'even' : 'odd'));
// IMap<string, readonly number[]> {
//   'odd' => [1, 3, 5, 7, 9],
//   'even' => [2, 4, 6, 8, 10]
// }

// Grouping by price ranges using index information
const byPriceRange = Arr.groupBy(products, (product, index) => {
    const category =
        product.price < 1.0
            ? 'cheap'
            : product.price < 2.0
              ? 'moderate'
              : 'expensive';
    return `${category}_${index < 2 ? 'early' : 'late'}`;
});

// MapSetKeyType constraint examples (valid key types)
const byStringKey = Arr.groupBy([1, 2, 3], (n) => `group_${n}`); // string keys
const byNumberKey = Arr.groupBy(['a', 'b', 'c'], (_, i) => i); // number keys
const byBooleanKey = Arr.groupBy([1, 2, 3, 4], (n) => n > 2); // boolean keys
const bySymbolKey = Arr.groupBy([1, 2], (n) => Symbol(n.toString())); // symbol keys

// Edge cases
const emptyGroup = Arr.groupBy([], (x) => x); // IMap<never, readonly never[]> (empty)
const singleGroup = Arr.groupBy([1, 2, 3], () => 'all'); // All elements in one group
const uniqueGroups = Arr.groupBy([1, 2, 3], (x) => x); // Each element in its own group

// Curried usage for functional composition
const groupByType = Arr.groupBy((item: { type: string }) => item.type);
const groupByLength = Arr.groupBy((str: string) => str.length);
const groupByFirstChar = Arr.groupBy((str: string) =>
    str.charAt(0).toLowerCase(),
);

const datasets = [
    [{ type: 'A' }, { type: 'B' }, { type: 'A' }],
    [{ type: 'C' }, { type: 'A' }],
    [{ type: 'B' }, { type: 'B' }, { type: 'C' }],
];
const allGrouped = datasets.map(groupByType);
// Array of IMap instances, each grouped by type

// Pipe composition for complex data processing
const words = [
    'apple',
    'banana',
    'apricot',
    'blueberry',
    'avocado',
    'blackberry',
];
const processedGroups = pipe(words)
    .map(groupByFirstChar)
    .map((groupMap) =>
        IMap.map(groupMap, (wordsInGroup, firstLetter) => ({
            letter: firstLetter,
            count: wordsInGroup.length,
            longest: wordsInGroup.reduce((longest, word) =>
                word.length > longest.length ? word : longest,
            ),
        })),
    ).value;
// IMap<string, {letter: string, count: number, longest: string}>

// Advanced: Grouping with complex transformations
const students = [
    { name: 'Alice', grade: 85, subject: 'Math' },
    { name: 'Bob', grade: 92, subject: 'Science' },
    { name: 'Charlie', grade: 78, subject: 'Math' },
    { name: 'Diana', grade: 96, subject: 'Science' },
];

const byGradeLevel = Arr.groupBy(students, (student) => {
    if (student.grade >= 90) return 'A';
    if (student.grade >= 80) return 'B';
    return 'C';
});

// Working with the grouped results
const aStudents = Optional.unwrapOr(IMap.get(byGradeLevel, 'A'), []);
const averageAGrade =
    aStudents.length > 0
        ? aStudents.reduce((sum, s) => sum + s.grade, 0) / aStudents.length
        : 0;

// Type inference examples
expectType<typeof byType, IMap<string, readonly (typeof products)[number][]>>(
    '=',
);
expectType<typeof byParity, IMap<string, readonly number[]>>('=');
expectType<
    typeof groupByType,
    <T extends { type: string }>(
        array: readonly T[],
    ) => IMap<string, readonly T[]>
>('=');
expectType<typeof emptyGroup, IMap<never, readonly never[]>>('=');
```

#### See

- [IMap](../../../collections/imap/README.md#imap) for working with the returned immutable map
- MapSetKeyType for understanding valid key types
- IMap.get for safely accessing grouped results
- IMap.map for transforming grouped data
- [Optional](../../../functional/optional/README.md#optional) for handling potentially missing groups

---

### head

> `const` **head**: `HeadFnOverload`

Defined in: [src/array/array-utils.mts:1052](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1052)

Returns the first element of an array wrapped in an Optional.

This function provides type-safe access to the first element with precise return types:

- For empty arrays: returns `Optional.None`
- For tuples with known first element: returns `Optional.Some<FirstElementType>`
- For non-empty arrays: returns `Optional.Some<ElementType>`
- For general arrays: returns `Optional<ElementType>`

The function leverages TypeScript's type system to provide the most precise return type
based on the input array type, making it safer than direct indexing.

#### Template

The type of elements in the array.

#### Param

The array to get the first element from.

#### Returns

An Optional containing the first element:

- `Optional.None` if the array is empty
- `Optional.Some<E>` containing the first element if the array is non-empty

#### Example

```typescript
// Empty array - precise None type
const emptyResult = Arr.head([]); // Optional.None
console.log(Optional.isNone(emptyResult)); // true

// Tuple with known structure - precise Some type
const tupleResult = Arr.head(['first', 'second', 'third'] as const);
// Type: Optional.Some<'first'>
if (Optional.isSome(tupleResult)) {
    console.log(tupleResult.value); // 'first' - TypeScript knows exact type
}

// Non-empty array - guaranteed Some type
const nonEmpty: NonEmptyArray<number> = [10, 20, 30] as NonEmptyArray<number>;
const guaranteedResult = Arr.head(nonEmpty); // Optional.Some<number>
// No need to check - always Some for NonEmptyArray

// General array - may be Some or None
const generalArray: number[] = [1, 2, 3];
const maybeResult = Arr.head(generalArray); // Optional<number>
if (Optional.isSome(maybeResult)) {
    console.log(`First element: ${maybeResult.value}`);
} else {
    console.log('Array is empty');
}

// Working with different types
const strings = ['hello', 'world'];
const firstString = Arr.head(strings); // Optional<string>

const objects = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
];
const firstObject = Arr.head(objects); // Optional<{id: number, name: string}>

// Functional composition
const getFirstElements = (arrays: readonly number[][]) =>
    arrays.map(Arr.head).filter(Optional.isSome);

const nestedArrays = [[1, 2], [3, 4], [], [5]];
const firstElements = getFirstElements(nestedArrays);
// [Optional.Some(1), Optional.Some(3), Optional.Some(5)]

// Type inference examples
expectType<typeof emptyResult, Optional.None>('=');
expectType<typeof tupleResult, Optional.Some<'first'>>('=');
expectType<typeof guaranteedResult, Optional.Some<number>>('=');
expectType<typeof maybeResult, Optional<number>>('=');
```

#### See

- [last](#last) for getting the last element
- [at](#at) for accessing elements at specific indices
- [tail](#tail) for getting all elements except the first

---

### indexOf

> `const` **indexOf**: `IndexOfFnOverload`

Defined in: [src/array/array-utils.mts:2346](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2346)

Gets the index of a value in an array.

#### Param

The array to search.

#### Param

The element to search for.

#### Param

The index to start searching from.

#### Returns

The index if found, -1 otherwise.

#### Example

```typescript
// Regular usage
const arr = ['a', 'b', 'c', 'b'];
const result = Arr.indexOf(arr, 'b');
if (Optional.isSome(result)) {
    console.log(result.value); // 1 (branded as SizeType.Arr)
}

// Curried usage for pipe composition
const findB = Arr.indexOf('b');
const result2 = pipe(['a', 'b', 'c']).map(findB).value;
console.log(Optional.unwrapOr(result2, -1)); // 1
```

---

### indexOfFrom

> `const` **indexOfFrom**: `IndexOfFromFnOverload`

Defined in: [src/array/array-utils.mts:2373](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2373)

---

### join

> `const` **join**: `JoinFnOverload`

Defined in: [src/array/array-utils.mts:3022](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3022)

Joins array elements into a string.

#### Param

The array to join.

#### Param

The separator string.

#### Returns

Result.Ok with the joined string, Result.Err if the operation throws.

#### Example

```typescript
// Regular usage
const arr = ['Hello', 'World'];
const result = Arr.join(arr, ' ');
if (Result.isOk(result)) {
    console.log(result.value); // "Hello World"
}

// Curried usage for pipe composition
const joinWithComma = Arr.join(',');
const result2 = pipe(['a', 'b', 'c']).map(joinWithComma).value;
console.log(Result.unwrapOr(result2, '')); // "a,b,c"
```

---

### last

> `const` **last**: `LastFnOverload`

Defined in: [src/array/array-utils.mts:1162](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1162)

Returns the last element of an array wrapped in an Optional.

This function provides type-safe access to the last element with precise return types:

- For empty arrays: returns `Optional.None`
- For tuples with known last element: returns `Optional.Some<LastElementType>`
- For non-empty arrays: returns `Optional.Some<ElementType>`
- For general arrays: returns `Optional<ElementType>`

The function leverages TypeScript's type system to provide the most precise return type
based on the input array type, making it safer than direct indexing.

#### Template

The type of elements in the array.

#### Param

The array to get the last element from.

#### Returns

An Optional containing the last element:

- `Optional.None` if the array is empty
- `Optional.Some<E>` containing the last element if the array is non-empty

#### Example

```typescript
// Empty array - precise None type
const emptyResult = Arr.last([]); // Optional.None
console.log(Optional.isNone(emptyResult)); // true

// Tuple with known structure - precise Some type
const tupleResult = Arr.last(['first', 'middle', 'last'] as const);
// Type: Optional.Some<'last'>
if (Optional.isSome(tupleResult)) {
    console.log(tupleResult.value); // 'last' - TypeScript knows exact type
}

// Non-empty array - guaranteed Some type
const nonEmpty: NonEmptyArray<number> = [10, 20, 30] as NonEmptyArray<number>;
const guaranteedResult = Arr.last(nonEmpty); // Optional.Some<number>
// No need to check - always Some for NonEmptyArray

// General array - may be Some or None
const generalArray: number[] = [1, 2, 3];
const maybeResult = Arr.last(generalArray); // Optional<number>
if (Optional.isSome(maybeResult)) {
    console.log(`Last element: ${maybeResult.value}`);
} else {
    console.log('Array is empty');
}

// Working with different types
const strings = ['hello', 'world', 'example'];
const lastString = Arr.last(strings); // Optional<string>

const coordinates = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
];
const lastCoordinate = Arr.last(coordinates); // Optional<{x: number, y: number}>

// Single element arrays
const single = [42];
const singleResult = Arr.last(single); // Optional<number> containing 42

// Functional composition with arrays of arrays
const getLastElements = (arrays: readonly string[][]) =>
    arrays.map(Arr.last).filter(Optional.isSome);

const nestedArrays = [['a', 'b'], ['c'], [], ['d', 'e', 'f']];
const lastElements = getLastElements(nestedArrays);
// [Optional.Some('b'), Optional.Some('c'), Optional.Some('f')]

// Common pattern: get last element or default
const data = [10, 20, 30];
const lastOrDefault = Optional.unwrapOr(Arr.last(data), 0); // 30
const emptyLastOrDefault = Optional.unwrapOr(Arr.last([]), 0); // 0

// Type inference examples
expectType<typeof emptyResult, Optional.None>('=');
expectType<typeof tupleResult, Optional.Some<'last'>>('=');
expectType<typeof guaranteedResult, Optional.Some<number>>('=');
expectType<typeof maybeResult, Optional<number>>('=');
```

#### See

- [head](#head) for getting the first element
- [at](#at) for accessing elements at specific indices with negative indexing support
- [butLast](#butlast) for getting all elements except the last

---

### lastIndexOf

> `const` **lastIndexOf**: `LastIndexOfFnOverload`

Defined in: [src/array/array-utils.mts:2432](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2432)

Gets the last index of a value in an array.

#### Param

The array to search.

#### Param

The element to search for.

#### Param

The index to start searching from (searches backwards).

#### Returns

Optional.Some with the index if found, Optional.None otherwise.

#### Example

```typescript
// Regular usage
const arr = ['a', 'b', 'c', 'b'];
const result = Arr.lastIndexOf(arr, 'b');
if (Optional.isSome(result)) {
    console.log(result.value); // 3 (branded as SizeType.Arr)
}

// Curried usage for pipe composition
const findLastB = Arr.lastIndexOf('b');
const result2 = pipe(['a', 'b', 'c', 'b']).map(findLastB).value;
console.log(Optional.unwrapOr(result2, -1)); // 3
```

---

### lastIndexOfFrom

> `const` **lastIndexOfFrom**: `LastIndexOfFromFnOverload`

Defined in: [src/array/array-utils.mts:2458](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2458)

---

### length

> `const` **length**: `SizeFnOverload` = `size`

Defined in: [src/array/array-utils.mts:119](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L119)

---

### max

> `const` **max**: `MaxFnOverload`

Defined in: [src/array/array-utils.mts:2719](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2719)

Finds the maximum value in an array.

- If the array is non-empty, returns the maximum value.
- If the array is empty, returns `Optional.none`.
- You can provide a custom comparator for arbitrary types.

#### Template

The type of elements in the array.

#### Param

The input array.

#### Param

An optional custom comparator function `(x: A, y: A) => number`. Should return < 0 if x is smaller, 0 if equal, > 0 if x is larger. Defaults to numeric comparison.

#### Returns

The maximum value in the array wrapped in Optional.

#### Example

```ts
Arr.max([3, 1, 4, 1, 5] as const); // Optional.some(5)
Arr.max([{ v: 3 }, { v: 1 }], (a, b) => a.v - b.v); // Optional.some({v:3})
Arr.max([]); // Optional.none
```

---

### maxBy

> `const` **maxBy**: `MaxByFnOverload`

Defined in: [src/array/array-utils.mts:2826](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2826)

Finds the element with the maximum value according to a mapped numeric value.

- If the array is non-empty, returns the element with the maximum mapped value.
- If the array is empty, returns `Optional.none`.
- You can provide a custom comparator for the mapped values.

#### Template

The type of elements in the array.

#### Template

The type of the value to compare by.

#### Param

The input array.

#### Param

A function that maps an element to a value for comparison.

#### Param

An optional custom comparator function for the mapped values.

#### Returns

The element with the maximum mapped value wrapped in Optional.

#### Example

```ts
const people = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 20 },
] as const;
Arr.maxBy(people, (p) => p.age); // Optional.some({ name: 'Alice', age: 30 })
Arr.maxBy([], (p) => p.age); // Optional.none
```

---

### min

> `const` **min**: `MinFnOverload`

Defined in: [src/array/array-utils.mts:2663](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2663)

Finds the minimum value in an array.

#### Template

The type of numbers in the array (must extend `number`).

#### Param

The input array.

#### Param

An optional custom comparator function `(x: N, y: N) => number`. Should return < 0 if x is smaller, 0 if equal, > 0 if x is larger. Defaults to `x - y`.

#### Returns

The minimum value in the array wrapped in Optional.

#### Example

```ts
Arr.min([3, 1, 4, 1, 5] as const); // Optional.some(1)
Arr.min([{ v: 3 }, { v: 1 }], (a, b) => a.v - b.v); // Optional.some({v:1})
Arr.min([]); // Optional.none
```

---

### minBy

> `const` **minBy**: `MinByFnOverload`

Defined in: [src/array/array-utils.mts:2769](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2769)

Finds the element with the minimum value according to a mapped numeric value.

- If the array is non-empty, returns the element with the minimum mapped value.
- If the array is empty, returns `Optional.none`.
- You can provide a custom comparator for the mapped values.

#### Template

The type of elements in the array.

#### Template

The type of the value to compare by.

#### Param

The input array.

#### Param

A function that maps an element to a value for comparison.

#### Param

An optional custom comparator function for the mapped values.

#### Returns

The element with the minimum mapped value wrapped in Optional.

#### Example

```ts
const people = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 20 },
] as const;
Arr.minBy(people, (p) => p.age); // Optional.some({ name: 'Bob', age: 20 })
Arr.minBy([], (p) => p.age); // Optional.none
```

---

### newArray

> `const` **newArray**: `CreateFnOverload` = `create`

Defined in: [src/array/array-utils.mts:583](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L583)

---

### partition

> `const` **partition**: `PartitionFnOverload`

Defined in: [src/array/array-utils.mts:3191](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3191)

Partitions an array into sub-arrays of a specified size.
The last partition may be smaller if the array length is not a multiple of `chunkSize`.
Returns an empty array if chunkSize < 2.

#### Template

The size of each partition (must be a number type, typically a literal for precise typing).

#### Template

The type of elements in the array.

#### Param

The input array.

#### Param

The size of each partition.

#### Returns

An array of arrays, where each inner array has up to `chunkSize` elements.

#### Example

```ts
Arr.partition([1, 2, 3, 4, 5, 6], 2); // [[1, 2], [3, 4], [5, 6]]
Arr.partition([1, 2, 3, 4, 5, 6, 7], 3); // [[1, 2, 3], [4, 5, 6], [7]]
```

---

### range

> `const` **range**: `RangeFnOverload`

Defined in: [src/array/array-utils.mts:807](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L807)

Creates an array of numbers within a specified range with optional step increment.

This function generates arithmetic sequences with advanced compile-time type inference:

- When `start` and `end` are SmallUint literals and `step` is 1 (or omitted), returns a precise tuple type
- When parameters are runtime values, returns appropriate array types based on sign constraints
- Empty arrays are returned for invalid ranges (e.g., start ≥ end with positive step)
- Never throws exceptions - invalid parameters result in empty arrays

**SmallUint Constraint:** The SmallUint constraint (0-255) enables precise tuple type inference
for compile-time known ranges. This allows TypeScript to compute exact tuple types like `readonly [1, 2, 3, 4]`
instead of generic `readonly number[]`.

**Type Inference Behavior:**

- Literal SmallUint values with step=1 → precise tuple type (`RangeList<S, E>`)
- Non-negative parameters → `readonly SafeUint[]`
- Mixed signs or negative parameters → `readonly SafeInt[]`
- Runtime values → lose precise typing but maintain safety

#### Template

The type of the start value. When a SmallUint literal (0-255), enables precise tuple typing.

#### Template

The type of the end value. When a SmallUint literal (0-255), enables precise tuple typing.

#### Param

The start of the range (inclusive). Must be a safe integer. Supports:

- **Literal SmallUint:** Enables precise tuple types (0-255)
- **Runtime SafeInt:** Fallback to general array types
- **Negative values:** Supported for countdown sequences

#### Param

The end of the range (exclusive). Must be a safe integer. Supports:

- **Literal SmallUint:** Enables precise tuple types (0-255)
- **Runtime SafeInt:** Fallback to general array types
- **Equal to start:** Results in empty array

#### Param

The step increment (default: 1). Must be a non-zero safe integer.

- **Positive step:** generates increasing sequence from start to end
- **Negative step:** generates decreasing sequence from start to end
- **Zero step:** Not allowed (branded type prevents this)

#### Returns

An immutable array containing the arithmetic sequence. Return type depends on parameters:

- `RangeList<S, E>` (precise tuple like `readonly [1, 2, 3, 4]`) when `S` and `E` are SmallUint literals and step is 1
- `readonly SafeUint[]` when all parameters are non-negative
- `readonly SafeInt[]` for general integer ranges including negative values

#### Example

```typescript
// Compile-time known ranges with step=1 produce precise tuple types
const range1to4 = Arr.range(1, 5); // readonly [1, 2, 3, 4]
const range0to2 = Arr.range(0, 3); // readonly [0, 1, 2]
const emptyRange = Arr.range(5, 5); // readonly []
const reverseEmpty = Arr.range(5, 1); // readonly [] (invalid with positive step)

// SmallUint constraint examples (0-255 for precise typing)
const small = Arr.range(0, 10); // readonly [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const maxSmall = Arr.range(250, 255); // readonly [250, 251, 252, 253, 254]
const beyondSmall = Arr.range(0, 300); // readonly SafeUint[] (loses precision)

// Custom step increments
const evens = Arr.range(0, 10, 2); // readonly SafeUint[] -> [0, 2, 4, 6, 8]
const odds = Arr.range(1, 10, 2); // readonly SafeUint[] -> [1, 3, 5, 7, 9]
const countdown = Arr.range(5, 0, -1); // readonly SafeInt[] -> [5, 4, 3, 2, 1]
const bigStep = Arr.range(0, 20, 5); // readonly SafeUint[] -> [0, 5, 10, 15]

// Edge cases that return empty arrays
const singleElement = Arr.range(3, 4); // readonly [3]
const invalidRange = Arr.range(10, 5, 2); // readonly [] (start > end with positive step)
const invalidReverse = Arr.range(1, 10, -1); // readonly [] (start < end with negative step)
const zeroRange = Arr.range(42, 42); // readonly [] (start equals end)

// Runtime ranges lose precise typing but maintain safety
const dynamicStart = Math.floor(Math.random() * 10) as SafeInt;
const dynamicEnd = (dynamicStart + 5) as SafeInt;
const dynamicRange = Arr.range(dynamicStart, dynamicEnd); // readonly SafeInt[]

// Negative numbers and mixed signs
const negativeRange = Arr.range(-5, 5); // readonly SafeInt[] -> [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4]
const negativeCountdown = Arr.range(0, -5, -1); // readonly SafeInt[] -> [0, -1, -2, -3, -4]

// Useful for generating index ranges and iteration
const indices = Arr.range(0, 10); // readonly [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const reversedIndices = Arr.range(9, -1, -1); // readonly SafeInt[] -> [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]

// Functional programming patterns
const squares = Arr.range(1, 6).map(x => x * x); // [1, 4, 9, 16, 25]
const fibonacci = Arr.range(0, 10).reduce((acc, _, i) => {\n   *   if (i <= 1) return [...acc, i];\n   *   return [...acc, acc[i-1] + acc[i-2]];\n   * }, [] as number[]); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// Type inference examples showing precise vs general types
expectType<typeof range1to4, readonly [1, 2, 3, 4]>('='); // Precise tuple
expectType<typeof emptyRange, readonly []>('='); // Precise empty tuple
expectType<typeof evens, readonly SafeUint[]>('='); // General positive array
expectType<typeof countdown, readonly SafeInt[]>('='); // General integer array
expectType<typeof negativeRange, readonly SafeInt[]>('='); // General integer array
expectType<typeof small, readonly [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]>('='); // Precise tuple
expectType<typeof beyondSmall, readonly SafeUint[]>('='); // General array (beyond SmallUint)
```

#### Throws

Never throws - invalid ranges simply return empty arrays

#### See

- [seq](#seq) for creating sequences starting from 0
- SmallUint for understanding the constraint that enables precise typing
- SafeInt and SafeUint for the safe integer types used

---

### reduce

> `const` **reduce**: `FoldlFnOverload` = `foldl`

Defined in: [src/array/array-utils.mts:3954](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3954)

Alias for `foldl`. Applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value.

#### See

[foldl](#foldl)

---

### reduceRight

> `const` **reduceRight**: `FoldrFnOverload` = `foldr`

Defined in: [src/array/array-utils.mts:3960](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3960)

Alias for `foldr`. Applies a function against an accumulator and each element in the array (from right to left) to reduce it to a single value.

#### See

[foldr](#foldr)

---

### rest()

> `const` **rest**: \<`Ar`\>(`array`) => `Tail`\<`Ar`\> = `tail`

Defined in: [src/array/array-utils.mts:3942](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3942)

Alias for `tail`. Returns all elements of an array except the first one.

Returns all elements of an array except the first one.

#### Type Parameters

##### Ar

`Ar` _extends_ readonly `unknown`[]

#### Parameters

##### array

`Ar`

The input array.

#### Returns

`Tail`\<`Ar`\>

A new array containing all elements except the first. The type is inferred as `List.Tail<T>`.

#### Example

```ts
Arr.tail([1, 2, 3] as const); // [2, 3]
Arr.tail([1] as const); // []
Arr.tail([]); // []
```

#### See

[tail](#tail)

---

### scan

> `const` **scan**: `ScanFnOverload`

Defined in: [src/array/array-utils.mts:3430](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3430)

Returns an array of successively reduced values from an array, starting with an initial value.

This function creates a \"running tally\" by applying a reducer function to each element and
accumulating the results. Unlike [reduce](#reduce) which returns a single final value, `scan`
returns all intermediate accumulated values, providing visibility into the reduction process.

**Key Differences from Reduce:**

- [reduce](#reduce): `[1, 2, 3] -> 6` (final sum only)
- `scan`: `[1, 2, 3] -> [0, 1, 3, 6]` (all intermediate sums including initial value)

**Guaranteed Non-Empty Return:** The result is always a NonEmptyArray<S> because it includes
the initial value as the first element, even for empty input arrays. This provides type safety
and eliminates the need for empty array checks.

**Array Length Relationship:** `result.length === array.length + 1` (includes initial value)

**Curried Usage:** Supports currying for functional composition - when called with only the reducer
and initial value, returns a reusable function that can be applied to arrays.

#### Template

The type of elements in the input array.

#### Template

The type of the accumulated values and the initial value.

#### Param

The input array to scan over. Can be empty (result will still contain the initial value).

#### Param

A function `(accumulator: S, currentValue: E, currentIndex: SizeType.Arr) => S` that:

- **accumulator:** The current accumulated value (starts with `init`, then previous results)
- **currentValue:** The current array element being processed
- **currentIndex:** The 0-based index of the current element (typed as SizeType.Arr)
- **returns:** The new accumulated value to include in the result array

#### Param

The initial accumulated value. Becomes the first element of the result array.

#### Returns

A NonEmptyArray<S> of accumulated values with length `array.length + 1`:

- `result[0]` is always the `init` value
- `result[i+1]` is the result of applying the reducer to `result[i]` and `array[i]`
- Guaranteed to be non-empty regardless of input array length

#### Example

```typescript
// Basic running sum example
const numbers = [1, 2, 3, 4];
const runningSum = Arr.scan(numbers, (acc, curr) => acc + curr, 0);
// NonEmptyArray<number> -> [0, 1, 3, 6, 10]
//                           ^  ^  ^  ^  ^
//                           |  |  |  |  └─ 0+1+2+3+4 = 10
//                           |  |  |  └─ 0+1+2+3 = 6
//                           |  |  └─ 0+1+2 = 3
//                           |  └─ 0+1 = 1
//                           └─ init = 0

// Difference from reduce
const reduced = numbers.reduce((acc, curr) => acc + curr, 0); // 10 (final only)
const scanned = Arr.scan(numbers, (acc, curr) => acc + curr, 0); // [0, 1, 3, 6, 10] (all steps)

// Running product
const factorial = Arr.scan([1, 2, 3, 4, 5], (acc, curr) => acc * curr, 1);
// [1, 1, 2, 6, 24, 120] - factorial sequence

// Running maximum
const temperatures = [20, 25, 18, 30, 22];
const runningMax = Arr.scan(
    temperatures,
    (max, temp) => Math.max(max, temp),
    -Infinity,
);
// [-Infinity, 20, 25, 25, 30, 30]

// Building strings incrementally
const words = ['Hello', 'beautiful', 'world'];
const sentences = Arr.scan(
    words,
    (sentence, word) => sentence + ' ' + word,
    '',
);
// ['', ' Hello', ' Hello beautiful', ' Hello beautiful world']

// Array accumulation (collecting elements)
const items = ['a', 'b', 'c'];
const growing = Arr.scan(items, (acc, item) => [...acc, item], [] as string[]);
// [[], ['a'], ['a', 'b'], ['a', 'b', 'c']]

// Financial running balance
const transactions = [100, -20, 50, -30];
const balances = Arr.scan(
    transactions,
    (balance, transaction) => balance + transaction,
    1000,
);
// [1000, 1100, 1080, 1130, 1100] - account balance after each transaction

// Using index information
const letters = ['a', 'b', 'c'];
const indexed = Arr.scan(
    letters,
    (acc, letter, index) => acc + `${index}:${letter} `,
    '',
);
// ['', '0:a ', '0:a 1:b ', '0:a 1:b 2:c ']

// Edge cases
const emptyArray: number[] = [];
const emptyResult = Arr.scan(emptyArray, (acc, curr) => acc + curr, 42);
// [42] - NonEmptyArray even for empty input

const singleElement = Arr.scan([5], (acc, curr) => acc * curr, 2);
// [2, 10] - init value plus one result

// Complex object accumulation
const sales = [
    { product: 'A', amount: 100 },
    { product: 'B', amount: 200 },
    { product: 'A', amount: 150 },
];

const runningSales = Arr.scan(
    sales,
    (totals, sale) => ({
        ...totals,
        [sale.product]: (totals[sale.product] || 0) + sale.amount,
    }),
    {} as Record<string, number>,
);
// [
//   {},
//   { A: 100 },
//   { A: 100, B: 200 },
//   { A: 250, B: 200 }
// ]

// Curried usage for functional composition
const runningSumFn = Arr.scan((acc: number, curr: number) => acc + curr, 0);
const runningProductFn = Arr.scan((acc: number, curr: number) => acc * curr, 1);
const collectingFn = Arr.scan(
    (acc: string[], curr: string) => [...acc, curr],
    [] as string[],
);

const datasets = [
    [1, 2, 3],
    [4, 5],
    [6, 7, 8, 9],
];
const allSums = datasets.map(runningSumFn);
// [
//   [0, 1, 3, 6],
//   [0, 4, 9],
//   [0, 6, 13, 21, 30]
// ]

// Pipe composition for data analysis
const analysisResult = pipe([10, 20, 30, 40])
    .map(runningSumFn)
    .map((sums) => sums.slice(1)) // Remove initial value to get pure running sums
    .map((sums) => sums.map((sum, i) => ({ step: i + 1, total: sum }))).value;
// [{ step: 1, total: 10 }, { step: 2, total: 30 }, { step: 3, total: 60 }, { step: 4, total: 100 }]

// Advanced: State machine simulation
type State = 'idle' | 'loading' | 'success' | 'error';
type Event = 'start' | 'complete' | 'fail' | 'reset';

const events: Event[] = ['start', 'complete', 'reset', 'start', 'fail'];
const stateTransition = (state: State, event: Event): State => {
    switch (state) {
        case 'idle':
            return event === 'start' ? 'loading' : state;
        case 'loading':
            return event === 'complete'
                ? 'success'
                : event === 'fail'
                  ? 'error'
                  : state;
        case 'success':
            return event === 'reset' ? 'idle' : state;
        case 'error':
            return event === 'reset' ? 'idle' : state;
    }
};

const stateHistory = Arr.scan(events, stateTransition, 'idle' as State);
// ['idle', 'loading', 'success', 'idle', 'loading', 'error']

// Type inference examples
expectType<typeof runningSum, NonEmptyArray<number>>('=');
expectType<typeof emptyResult, NonEmptyArray<number>>('=');
expectType<
    typeof runningSumFn,
    <T extends readonly number[]>(array: T) => NonEmptyArray<number>
>('=');
expectType<typeof stateHistory, NonEmptyArray<State>>('=');
```

#### See

- [reduce](#reduce) for getting only the final accumulated value
- NonEmptyArray for understanding the guaranteed non-empty return type
- SizeType.Arr for the index parameter type
- Array.prototype.reduce for the standard reduce function

---

### seq

> `const` **seq**: `SeqFnOverload`

Defined in: [src/array/array-utils.mts:507](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L507)

Creates a sequence of consecutive integers from 0 to `len-1`.

This function generates index sequences with precise compile-time typing:

- When `len` is a compile-time known `SmallUint` (0-100), returns a tuple of consecutive integers
- When `len` is a positive runtime value, returns a `NonEmptyArray<SizeType.Arr>`
- Otherwise, returns a `readonly SizeType.Arr[]` that may be empty

#### Template

The type of the length parameter. When a `SmallUint` literal is provided,
the return type will be a tuple containing the sequence [0, 1, 2, ..., N-1].

#### Param

The length of the sequence to create. Must be a non-negative integer.

#### Returns

An immutable array containing the sequence [0, 1, 2, ..., len-1].
The exact return type depends on the input:

- `Seq<N>` (precise tuple) when `N` is a `SmallUint` literal
- `NonEmptyArray<SizeType.Arr>` when `len` is a positive runtime value
- `readonly SizeType.Arr[]` for general non-negative values

#### Example

```typescript
// Compile-time known lengths produce precise tuple types
const indices = Arr.seq(4); // readonly [0, 1, 2, 3]
const empty = Arr.seq(0); // readonly []
const single = Arr.seq(1); // readonly [0]

// Runtime positive values produce non-empty arrays
const count = Math.floor(Math.random() * 5) + 1;
const nonEmpty = Arr.seq(count); // NonEmptyArray<SizeType.Arr>

// General runtime values may be empty
const maybeEmpty = Arr.seq(Math.floor(Math.random() * 5)); // readonly SizeType.Arr[]

// Useful for generating array indices
const data = ['a', 'b', 'c', 'd'];
const indexSequence = Arr.seq(data.length); // [0, 1, 2, 3]

// Type inference examples
expectType<typeof indices, readonly [0, 1, 2, 3]>('=');
expectType<typeof empty, readonly []>('=');
expectType<typeof single, readonly [0]>('=');
```

---

### size

> `const` **size**: `SizeFnOverload`

Defined in: [src/array/array-utils.mts:107](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L107)

Returns the size (length) of an array as a type-safe branded integer.

This function provides the array length with enhanced type safety through branded types:

- For arrays known to be non-empty at compile time: returns `PositiveNumber & SizeType.Arr`
- For general arrays that may be empty: returns `SizeType.Arr` (branded Uint32)

The returned value is always a non-negative integer that can be safely used for array indexing
and size comparisons. The branded type prevents common integer overflow issues and provides
better type checking than plain numbers.

#### Template

The exact type of the input array, used for precise return type inference.

#### Param

The array to measure. Can be any readonly array type.

#### Returns

The length of the array as a branded type:

- `IntersectBrand<PositiveNumber, SizeType.Arr>` for known non-empty arrays
- `SizeType.Arr` for general arrays (branded Uint32, may be 0)

#### Example

```typescript
// Known non-empty arrays get positive branded type
const tuple = [1, 2, 3] as const;
const tupleSize = Arr.size(tuple);
// Type: IntersectBrand<PositiveNumber, SizeType.Arr>
// Value: 3 (branded, guaranteed positive)

const nonEmpty: NonEmptyArray<string> = ['a', 'b'] as NonEmptyArray<string>;
const nonEmptySize = Arr.size(nonEmpty);
// Type: IntersectBrand<PositiveNumber, SizeType.Arr>
// Guaranteed to be > 0

// General arrays may be empty, get regular branded type
const generalArray: number[] = [1, 2, 3];
const generalSize = Arr.size(generalArray);
// Type: SizeType.Arr (branded Uint32)
// May be 0 or positive

// Empty arrays
const emptyArray = [] as const;
const emptySize = Arr.size(emptyArray);
// Type: SizeType.Arr
// Value: 0 (branded)

// Runtime arrays with unknown content
const dynamicArray = Array.from({ length: Math.random() * 10 }, (_, i) => i);
const dynamicSize = Arr.size(dynamicArray);
// Type: SizeType.Arr (may be 0)

// Using size for safe operations
const data = [10, 20, 30];
const dataSize = Arr.size(data);

// Safe for array creation
const indices = Arr.seq(dataSize); // Creates [0, 1, 2]
const zeros = Arr.zeros(dataSize); // Creates [0, 0, 0]

// Safe for bounds checking
const isValidIndex = (index: number) => index >= 0 && index < dataSize;

// Comparison with other sizes
const otherArray = ['a', 'b'];
const sizeDiff = Uint32.sub(Arr.size(data), Arr.size(otherArray)); // 1

// Functional composition
const arrays = [[1, 2], [3, 4, 5], [], [6]];
const sizes = arrays.map(Arr.size); // [2, 3, 0, 1] (all branded)
const totalElements = sizes.reduce(Uint32.add, 0); // 6

// Type guards work with size
if (Arr.size(data) > 0) {
    // TypeScript knows data is non-empty here
    const firstElement = data[0]; // Safe access
}

// Type inference examples
expectType<typeof tupleSize, IntersectBrand<PositiveNumber, SizeType.Arr>>('=');
expectType<typeof generalSize, SizeType.Arr>('=');
expectType<typeof emptySize, SizeType.Arr>('=');
```

#### See

- [length](#length) - Alias for this function
- [isEmpty](#isempty) for checking if size is 0
- [isNonEmpty](#isnonempty) for checking if size > 0

---

### skip

> `const` **skip**: `SkipFnOverload`

Defined in: [src/array/array-utils.mts:1507](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1507)

Skips the first N elements of an array.

- If the array is a tuple, the return type is inferred as a tuple with the first N elements removed.
- If the array is a non-empty array and N is a positive integer, returns a readonly array (may be empty).
- Otherwise, returns a readonly array with the first N elements skipped.

#### Template

The type of the array (can be a tuple for more precise typing).

#### Template

The number of elements to skip, constrained to `SmallUint`.

#### Param

The input array.

#### Param

The number of elements to skip.

#### Returns

A new array containing the elements after skipping the first N.

#### Example

```ts
// Regular usage
Arr.skip([1, 2, 3, 4] as const, 2); // [3, 4]

// Curried usage for pipe composition
const skipFirst2 = Arr.skip(2);
const result = pipe([1, 2, 3, 4, 5]).map(skipFirst2).value;
console.log(result); // [3, 4, 5]
```

---

### skipLast

> `const` **skipLast**: `SkipLastFnOverload`

Defined in: [src/array/array-utils.mts:1570](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1570)

Skips the last N elements of an array.

- If the array is a tuple, the return type is inferred as a tuple with the last N elements removed.
- If the array is a non-empty array and N is a positive integer, returns a readonly array (may be empty).
- Otherwise, returns a readonly array with the last N elements skipped.

#### Template

The type of the array (can be a tuple for more precise typing).

#### Template

The number of elements to skip, constrained to `SmallUint`.

#### Param

The input array.

#### Param

The number of elements to skip from the end.

#### Returns

A new array containing the elements after skipping the last N.

#### Example

```ts
// Regular usage
Arr.skipLast([1, 2, 3, 4] as const, 2); // [1, 2]

// Curried usage for pipe composition
const skipLast2 = Arr.skipLast(2);
const result = pipe([1, 2, 3, 4, 5]).map(skipLast2).value;
console.log(result); // [1, 2, 3]
```

---

### sliceClamped

> `const` **sliceClamped**: `SliceClampedFnOverload`

Defined in: [src/array/array-utils.mts:1277](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1277)

Slices an array with automatically clamped start and end indices for safe bounds handling.

This function provides a safer alternative to `Array.slice()` by automatically clamping
the start and end indices to valid bounds, preventing out-of-bounds access and ensuring
consistent behavior regardless of input values.

**Clamping Behavior:**

- `start` is clamped to `[0, array.length]`
- `end` is clamped to `[clampedStart, array.length]` (ensuring end ≥ start)
- Invalid ranges (start > end after clamping) return empty arrays
- Negative indices are clamped to 0, large indices are clamped to array.length

**Curried Usage:** This function supports currying - when called with only start and end
indices, it returns a function that can be applied to arrays.

#### Template

The type of elements in the array.

#### Param

The array to slice (when using direct call syntax).

#### Param

The start index for the slice (inclusive). Will be clamped to valid bounds.

#### Param

The end index for the slice (exclusive). Will be clamped to valid bounds.

#### Returns

A new immutable array containing the sliced elements. Always returns a valid array,
never throws for out-of-bounds indices.

#### Example

```typescript
const data = [10, 20, 30, 40, 50];

// Normal slicing
const middle = Arr.sliceClamped(data, 1, 4); // [20, 30, 40]
const beginning = Arr.sliceClamped(data, 0, 2); // [10, 20]
const end = Arr.sliceClamped(data, 3, 5); // [40, 50]

// Automatic clamping for out-of-bounds indices
const clampedStart = Arr.sliceClamped(data, -10, 3); // [10, 20, 30] (start clamped to 0)
const clampedEnd = Arr.sliceClamped(data, 2, 100); // [30, 40, 50] (end clamped to length)
const bothClamped = Arr.sliceClamped(data, -5, 100); // [10, 20, 30, 40, 50] (entire array)

// Invalid ranges become empty arrays
const emptyReversed = Arr.sliceClamped(data, 4, 1); // [] (start > end after clamping)
const emptyAtEnd = Arr.sliceClamped(data, 5, 10); // [] (start at end of array)

// Edge cases
const emptyArray = Arr.sliceClamped([], 0, 5); // [] (empty input)
const singleElement = Arr.sliceClamped([42], 0, 1); // [42]
const fullCopy = Arr.sliceClamped(data, 0, data.length); // [10, 20, 30, 40, 50]

// Curried usage for functional composition
const takeFirst3 = Arr.sliceClamped(0, 3);
const getMiddle2 = Arr.sliceClamped(1, 3);

const arrays = [
    [1, 2, 3, 4, 5],
    [10, 20],
    [100, 200, 300, 400, 500, 600],
];

const first3Elements = arrays.map(takeFirst3);
// [[1, 2, 3], [10, 20], [100, 200, 300]]

const middle2Elements = arrays.map(getMiddle2);
// [[2, 3], [20], [200, 300]]

// Pipe composition
const result = pipe([1, 2, 3, 4, 5, 6]).map(takeFirst3).map(Arr.sum).value; // 6 (sum of [1, 2, 3])

// Comparison with regular Array.slice (which can throw or behave unexpectedly)
try {
    // Regular slice with out-of-bounds - works but may be unintuitive
    const regularSlice = data.slice(-10, 100); // [10, 20, 30, 40, 50]
    // sliceClamped provides same safe behavior explicitly
    const clampedSlice = Arr.sliceClamped(data, -10, 100); // [10, 20, 30, 40, 50]
} catch (error) {
    // sliceClamped never throws
}
```

#### See

- [take](#take) for taking the first N elements
- [skip](#skip) for skipping the first N elements
- [takeLast](#takelast) for taking the last N elements

---

### sum

> `const` **sum**: `SumFnOverload`

Defined in: [src/array/array-utils.mts:2990](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2990)

Calculates the sum of numbers in an array.

#### Param

The input array of numbers.

#### Returns

The sum of the numbers. Returns 0 for an empty array.

#### Example

```ts
Arr.sum([1, 2, 3]); // 6
Arr.sum([]); // 0
Arr.sum([-1, 0, 1]); // 0
```

---

### take

> `const` **take**: `TakeFnOverload`

Defined in: [src/array/array-utils.mts:1371](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1371)

Takes the first N elements from an array.

- If the array is a tuple, the return type is inferred as a tuple of the first N elements.
- If the array is a NonEmptyArray and N is a SizeType.ArgArrPositive, returns a NonEmptyArray.
- Otherwise, returns a readonly array of up to N elements.

#### Template

The type of the array (can be a tuple for more precise typing).

#### Template

The number of elements to take, constrained to `SmallUint`.

#### Param

The input array.

#### Param

The number of elements to take.

#### Returns

A new array containing the first N elements.

#### Example

```ts
// Regular usage
Arr.take([1, 2, 3, 4] as const, 2); // [1, 2]

// Curried usage for pipe composition
const takeFirst3 = Arr.take(3);
const result = pipe([1, 2, 3, 4, 5]).map(takeFirst3).value;
console.log(result); // [1, 2, 3]
```

---

### takeLast

> `const` **takeLast**: `TakeLastFnOverload`

Defined in: [src/array/array-utils.mts:1439](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1439)

Takes the last N elements from an array.

- If the array is a tuple, the return type is inferred as a tuple of the last N elements.
- If the array is a non-empty array and N is a positive integer, returns a non-empty array.
- Otherwise, returns a readonly array of up to N elements.

#### Template

The type of the array (can be a tuple for more precise typing).

#### Template

The number of elements to take, constrained to `SmallUint`.

#### Param

The input array.

#### Param

The number of elements to take.

#### Returns

A new array containing the last N elements.

#### Example

```ts
// Regular usage
Arr.takeLast([1, 2, 3, 4] as const, 2); // [3, 4]

// Curried usage for pipe composition
const takeLast2 = Arr.takeLast(2);
const result = pipe([1, 2, 3, 4, 5]).map(takeLast2).value;
console.log(result); // [4, 5]
```

---

### toFilled

> `const` **toFilled**: `ToFilledFnOverload`

Defined in: [src/array/array-utils.mts:2025](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2025)

Fills an array with a value (creates a new filled array).

#### Param

The array.

#### Param

The value to fill with.

#### Param

The start index.

#### Param

The end index.

#### Returns

A new filled array.

#### Example

```typescript
// Regular usage
const arr = [1, 2, 3, 4, 5];
const result = Arr.toFilled(arr, 0, 1, 4);
console.log(result); // [1, 0, 0, 0, 5]

// Curried usage for pipe composition
const fillWithZeros = Arr.toFilled(0, 1, 3);
const result2 = pipe([1, 2, 3, 4]).map(fillWithZeros).value;
console.log(result2); // [1, 0, 0, 4]
```

---

### toInserted

> `const` **toInserted**: `ToInsertedFnOverload`

Defined in: [src/array/array-utils.mts:1818](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1818)

Returns a new array with a new value inserted at the specified index.
Index can be out of bounds (e.g., negative or greater than length), `toSpliced` handles this.

#### Template

The type of elements in the array.

#### Param

The input array.

#### Param

The index at which to insert the new value.

#### Param

The value to insert.

#### Returns

A new array with the value inserted.

#### Example

```ts
// Regular usage
Arr.toInserted([1, 2, 3], 1, 10); // [1, 10, 2, 3]

// Curried usage for pipe composition
const insertAtStart = Arr.toInserted(0, 99);
const result = pipe([1, 2, 3]).map(insertAtStart).value;
console.log(result); // [99, 1, 2, 3]
```

---

### toPushed

> `const` **toPushed**: `ToPushedFnOverload`

Defined in: [src/array/array-utils.mts:1923](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1923)

Returns a new array with a value added to the end.

#### Template

The type of the input array (can be a tuple).

#### Template

The type of the value to add.

#### Param

The input array.

#### Param

The value to add.

#### Returns

A new array with the value added to the end. Type is `readonly [...E, V]`.

#### Example

```ts
// Regular usage
Arr.toPushed([1, 2] as const, 3); // [1, 2, 3]

// Curried usage for pipe composition
const addZero = Arr.toPushed(0);
const result = pipe([1, 2, 3]).map(addZero).value;
console.log(result); // [1, 2, 3, 0]
```

---

### toRangeFilled

> `const` **toRangeFilled**: `ToRangeFilledFnOverload`

Defined in: [src/array/array-utils.mts:2050](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2050)

---

### toRemoved

> `const` **toRemoved**: `ToRemovedFnOverload`

Defined in: [src/array/array-utils.mts:1878](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1878)

Returns a new array with the element at the specified index removed.
If index is out of bounds, `toSpliced` handles this (usually by returning a copy).

#### Template

The type of elements in the array.

#### Param

The input array.

#### Param

The index of the element to remove.

#### Returns

A new array with the element removed.

#### Example

```ts
// Regular usage
Arr.toRemoved([1, 2, 3], 1); // [1, 3]

// Curried usage for pipe composition
const removeFirst = Arr.toRemoved(0);
const result = pipe([10, 20, 30]).map(removeFirst).value;
console.log(result); // [20, 30]
```

---

### toSortedBy

> `const` **toSortedBy**: `ToSortedByFnOverload`

Defined in: [src/array/array-utils.mts:3243](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3243)

Sorts an array by a value derived from its elements, using a numeric mapping.

#### Template

The type of elements in the array.

#### Param

The input array.

#### Param

A function `(value: A) => number` that maps an element to a number for comparison.

#### Param

An optional custom comparator function `(x: number, y: number) => number` for the mapped numbers. Defaults to ascending sort (x - y).

#### Returns

A new array sorted by the mapped values.

#### Example

```ts
const items = [
    { name: 'Eve', score: 70 },
    { name: 'Adam', score: 90 },
    { name: 'Bob', score: 80 },
];
Arr.toSortedBy(items, (item) => item.score);
// [{ name: 'Eve', score: 70 }, { name: 'Bob', score: 80 }, { name: 'Adam', score: 90 }]
Arr.toSortedBy(
    items,
    (item) => item.score,
    (a, b) => b - a,
); // Sort descending
// [{ name: 'Adam', score: 90 }, { name: 'Bob', score: 80 }, { name: 'Eve', score: 70 }]
```

---

### toUnshifted

> `const` **toUnshifted**: `ToUnshiftedFnOverload`

Defined in: [src/array/array-utils.mts:1973](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1973)

Returns a new array with a value added to the beginning.

#### Template

The type of the input array (can be a tuple).

#### Template

The type of the value to add.

#### Param

The input array.

#### Param

The value to add.

#### Returns

A new array with the value added to the beginning. Type is `readonly [V, ...E]`.

#### Example

```ts
// Regular usage
Arr.toUnshifted([1, 2] as const, 0); // [0, 1, 2]

// Curried usage for pipe composition
const prependZero = Arr.toUnshifted(0);
const result = pipe([1, 2, 3]).map(prependZero).value;
console.log(result); // [0, 1, 2, 3]
```

---

### toUpdated

> `const` **toUpdated**: `ToUpdatedFnOverload`

Defined in: [src/array/array-utils.mts:1760](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1760)

Returns a new array with the element at the specified index updated by a function.

This function provides immutable array updates with type-safe bounds checking. It applies an updater
function to the element at the given index and returns a new array with the transformed value.
The original array is never modified, ensuring immutability.

**Type Union Behavior:** When the updater function returns a different type `U` than the original
element type `E`, the result type becomes `readonly (E | U)[]` to accommodate both original and
updated element types. This ensures type safety when elements have different types after updating.

**Bounds Checking:** Unlike native array access which can cause runtime errors, this function
performs safe bounds checking:

- **Valid index:** Creates new array with updated element
- **Invalid index:** Returns the original array unchanged (no errors thrown)
- **Negative index:** Treated as invalid (returns original array)

**Curried Usage:** Supports currying for functional composition - when called with only index and
updater, returns a reusable function that can be applied to arrays.

#### Template

The type of elements in the original array.

#### Template

The type of the value returned by the updater function.

#### Param

The input array to update. Can be any readonly array.

#### Param

The index of the element to update. Must be a non-negative SizeType.ArgArrNonNegative.

- **Valid range:** `0 <= index < array.length`
- **Out of bounds:** Returns original array unchanged
- **Negative values:** Not allowed by type system (non-negative constraint)

#### Param

A function `(prev: E) => U` that transforms the existing element:

- **prev:** The current element at the specified index
- **returns:** The new value to place at that index (can be different type)

#### Returns

A new `readonly (E | U)[]` array where:

- All elements except the target index remain unchanged (type `E`)
- The element at the target index is replaced with the updater result (type `U`)
- Type union `E | U` accommodates both original and updated element types
- If index is out of bounds, returns the original array unchanged

#### Example

```typescript
// Basic usage with same type transformation
const numbers = [1, 2, 3, 4, 5];
const doubled = Arr.toUpdated(numbers, 2, (x) => x * 2);
// readonly number[] -> [1, 2, 6, 4, 5]

// Type union when updater returns different type
const mixed = Arr.toUpdated(numbers, 1, (x) => `value: ${x}`);
// readonly (number | string)[] -> [1, 'value: 2', 3, 4, 5]

// Complex object updates
const users = [
    { id: 1, name: 'Alice', active: true },
    { id: 2, name: 'Bob', active: false },
    { id: 3, name: 'Charlie', active: true },
];

const activatedUser = Arr.toUpdated(users, 1, (user) => ({
    ...user,
    active: true,
    lastUpdated: new Date(),
}));
// Bob is now active with lastUpdated field

// Bounds checking behavior
const safe1 = Arr.toUpdated([1, 2, 3], 10, (x) => x * 2); // [1, 2, 3] (index out of bounds)
const safe2 = Arr.toUpdated([1, 2, 3], 0, (x) => x * 2); // [2, 2, 3] (valid index)
const safe3 = Arr.toUpdated([], 0, (x) => x); // [] (empty array, index out of bounds)

// Functional transformations
const products = [
    { name: 'laptop', price: 1000 },
    { name: 'mouse', price: 25 },
    { name: 'keyboard', price: 75 },
];

const discounted = Arr.toUpdated(products, 0, (product) => ({
    ...product,
    price: Math.round(product.price * 0.8), // 20% discount
    onSale: true,
}));
// First product now has discounted price and onSale flag

// Curried usage for reusable updates
const doubleAtIndex2 = Arr.toUpdated(2, (x: number) => x * 2);
const capitalizeAtIndex0 = Arr.toUpdated(0, (s: string) => s.toUpperCase());
const markCompleteAtIndex = (index: number) =>
    Arr.toUpdated(index, (task: { done: boolean }) => ({
        ...task,
        done: true,
    }));

const numberArrays = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
];
const allDoubled = numberArrays.map(doubleAtIndex2);
// [[1, 2, 6], [4, 5, 12], [7, 8, 18]]

const words = [
    ['hello', 'world'],
    ['foo', 'bar'],
    ['type', 'script'],
];
const capitalized = words.map(capitalizeAtIndex0);
// [['HELLO', 'world'], ['FOO', 'bar'], ['TYPE', 'script']]

// Pipe composition for data processing
const processArray = (arr: readonly number[]) =>
    pipe(arr)
        .map(Arr.toUpdated(0, (x) => x * 10)) // Scale first element
        .map(Arr.toUpdated(1, (x) => (typeof x === 'number' ? x + 100 : x))) // Add to second if number
        .value;

console.log(processArray([1, 2, 3])); // [10, 102, 3]

// Multiple sequential updates
const pipeline = (data: readonly number[]) =>
    pipe(data)
        .map(Arr.toUpdated(0, (x) => x * 2))
        .map(Arr.toUpdated(1, (x) => (typeof x === 'number' ? x + 10 : x)))
        .map(
            Arr.toUpdated(2, (x) => (typeof x === 'number' ? x.toString() : x)),
        ).value;

console.log(pipeline([1, 2, 3])); // [2, 12, '3'] - readonly (number | string)[]

// Error-safe updates in data processing
const safeUpdate = <T, U>(
    array: readonly T[],
    index: number,
    updater: (value: T) => U,
) => {
    if (index < 0 || index >= array.length) {
        console.warn(
            `Index ${index} out of bounds for array of length ${array.length}`,
        );
        return array;
    }
    return Arr.toUpdated(array, index as SizeType.ArgArrNonNegative, updater);
};

// Advanced: State management pattern
type AppState = {
    users: Array<{ id: number; name: string }>;
    currentUserId: number;
};

const updateUserName = (
    state: AppState,
    userId: number,
    newName: string,
): AppState => {
    const userIndex = state.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return state;

    return {
        ...state,
        users: Arr.toUpdated(
            state.users,
            userIndex as SizeType.ArgArrNonNegative,
            (user) => ({
                ...user,
                name: newName,
            }),
        ),
    };
};

// Type inference examples showing union types
expectType<typeof doubled, readonly number[]>('='); // Same type
expectType<typeof mixed, readonly (number | string)[]>('='); // Union type
expectType<
    typeof doubleAtIndex2,
    <T extends readonly number[]>(array: T) => readonly (number | number)[]
>('=');
expectType<typeof safe1, readonly number[]>('='); // Bounds check preserves type
```

#### See

- Array.prototype.with for the native method with different error handling
- SizeType.ArgArrNonNegative for the index type constraint
- Immutable update patterns for functional programming approaches

---

### uniqBy

> `const` **uniqBy**: `UniqByFnOverload`

Defined in: [src/array/array-utils.mts:3726](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3726)

Creates a new array with unique elements from the input array, based on the values returned by `mapFn`.

- If the input is a non-empty array, returns a non-empty array.
- Otherwise, returns a readonly array.

#### Template

The type of elements in the array.

#### Template

The type of the mapped value (used for uniqueness comparison).

#### Param

The input array.

#### Param

A function `(value: A) => P` to map elements to values for uniqueness comparison.

#### Returns

A new array with unique elements based on the mapped values.

#### Example

```ts
const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 1, name: 'Alicia' }, // Duplicate id
];
Arr.uniqBy(users, (user) => user.id); // [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
```

---

### zeros

> `const` **zeros**: `ZerosFnOverload`

Defined in: [src/array/array-utils.mts:444](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L444)

Creates an array of zeros with the specified length.

This function provides compile-time type safety with precise return types:

- When `len` is a compile-time known `SmallUint` (0-100), returns a tuple with exact length
- When `len` is a positive runtime value, returns a `NonEmptyArray<0>`
- Otherwise, returns a `readonly 0[]` that may be empty

#### Template

The type of the length parameter. When a `SmallUint` literal is provided,
the return type will be a tuple of exactly that length filled with zeros.

#### Param

The length of the array to create. Must be a non-negative integer.

#### Returns

An immutable array of zeros. The exact return type depends on the input:

- `ArrayOfLength<N, 0>` when `N` is a `SmallUint` literal
- `NonEmptyArray<0>` when `len` is a positive runtime value
- `readonly 0[]` for general non-negative values

#### Example

```typescript
// Compile-time known lengths produce precise tuple types
const exactLength = Arr.zeros(3); // readonly [0, 0, 0]
const empty = Arr.zeros(0); // readonly []

// Runtime positive values produce non-empty arrays
const count = Math.floor(Math.random() * 5) + 1;
const nonEmpty = Arr.zeros(count); // NonEmptyArray<0>

// General runtime values may be empty
const maybeEmpty = Arr.zeros(Math.floor(Math.random() * 5)); // readonly 0[]

// Type inference examples
expectType<typeof exactLength, readonly [0, 0, 0]>('=');
expectType<typeof empty, readonly []>('=');
expectType<typeof nonEmpty, NonEmptyArray<0>>('=');
expectType<typeof maybeEmpty, readonly 0[]>('=');
```

## Functions

### butLast()

> **butLast**\<`Ar`\>(`array`): `ButLast`\<`Ar`\>

Defined in: [src/array/array-utils.mts:1341](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1341)

Returns all elements of an array except the last one.

#### Type Parameters

##### Ar

`Ar` _extends_ readonly `unknown`[]

#### Parameters

##### array

`Ar`

The input array.

#### Returns

`ButLast`\<`Ar`\>

A new array containing all elements except the last. The type is inferred as `List.ButLast<T>`.

#### Example

```ts
Arr.butLast([1, 2, 3] as const); // [1, 2]
Arr.butLast([1] as const); // []
Arr.butLast([]); // []
```

---

### concat()

> **concat**\<`Ar1`, `Ar2`\>(`array1`, `array2`): readonly \[`Ar1`, `Ar2`\]

Defined in: [src/array/array-utils.mts:3167](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3167)

Concatenates two arrays.

#### Type Parameters

##### Ar1

`Ar1` _extends_ readonly `unknown`[]

##### Ar2

`Ar2` _extends_ readonly `unknown`[]

#### Parameters

##### array1

`Ar1`

The first array.

##### array2

`Ar2`

The second array.

#### Returns

readonly \[`Ar1`, `Ar2`\]

A new array that is the concatenation of the two input arrays. Type is `readonly [...E1, ...E2]`.

#### Example

```ts
Arr.concat([1, 2] as const, [3, 4] as const); // [1, 2, 3, 4]
Arr.concat([], [1, 2]); // [1, 2]
Arr.concat([1, 2], []); // [1, 2]
```

---

### copy()

> **copy**\<`Ar`\>(`array`): `Ar`

Defined in: [src/array/array-utils.mts:672](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L672)

Creates a shallow copy of an array, preserving the exact type signature.

This function creates a new array with the same elements as the input, but with a new array reference.
Object references within the array are preserved (shallow copy), and the readonly/mutable status
of the array type is maintained.

#### Type Parameters

##### Ar

`Ar` _extends_ readonly `unknown`[]

The exact type of the input array, preserving tuple types, readonly status, and element types.

#### Parameters

##### array

`Ar`

The array to copy. Can be any array type: mutable, readonly, tuple, or general array.

#### Returns

`Ar`

A new array that is a shallow copy of the input. The return type exactly matches the input type,
preserving readonly status, tuple structure, and element types.

#### Example

```typescript
// Mutable arrays remain mutable
const mutableOriginal = [1, 2, 3];
const mutableCopy = Arr.copy(mutableOriginal); // number[]
mutableCopy[0] = 999; // OK - still mutable
mutableOriginal[0]; // 1 - original unchanged

// Readonly arrays remain readonly
const readonlyOriginal = [1, 2, 3] as const;
const readonlyCopy = Arr.copy(readonlyOriginal); // readonly [1, 2, 3]
// readonlyCopy[0] = 999; // Error - readonly array

// Tuple types are preserved
const tupleOriginal: [string, number, boolean] = ['hello', 42, true];
const tupleCopy = Arr.copy(tupleOriginal); // [string, number, boolean]

// Shallow copy behavior with objects
const objectArray = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
];
const objectCopy = Arr.copy(objectArray);
objectCopy[0].name = 'Charlie'; // Mutates the shared object reference
console.log(objectArray[0].name); // 'Charlie' - original affected
objectCopy.push({ id: 3, name: 'Dave' }); // Array structure changes don't affect original
console.log(objectArray.length); // 2 - original array length unchanged

// Empty arrays
const emptyArray: number[] = [];
const emptyCopy = Arr.copy(emptyArray); // number[]
const emptyTuple = [] as const;
const emptyTupleCopy = Arr.copy(emptyTuple); // readonly []

// Type inference examples
expectType<typeof mutableCopy, number[]>('=');
expectType<typeof readonlyCopy, readonly [1, 2, 3]>('=');
expectType<typeof tupleCopy, [string, number, boolean]>('=');
```

#### See

[Array.prototype.slice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
The underlying implementation uses `slice()` for efficient shallow copying

---

### eq()

> **eq**\<`E`\>(`array1`, `array2`, `equality`): `boolean`

Defined in: [src/array/array-utils.mts:3772](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3772)

Checks if two arrays are equal by performing a shallow comparison of their elements.

#### Type Parameters

##### E

`E`

The type of elements in the arrays.

#### Parameters

##### array1

readonly `E`[]

The first array.

##### array2

readonly `E`[]

The second array.

##### equality

(`a`, `b`) => `boolean`

An optional function `(a: T, b: T) => boolean` to compare elements. Defaults to `Object.is`.

#### Returns

`boolean`

`true` if the arrays have the same length and all corresponding elements are equal according to the `equality` function, `false` otherwise.

#### Example

```ts
Arr.eq([1, 2, 3], [1, 2, 3]); // true
Arr.eq([1, 2, 3], [1, 2, 4]); // false
Arr.eq([1, 2], [1, 2, 3]); // false
Arr.eq([{ a: 1 }], [{ a: 1 }]); // false (different object references)
Arr.eq([{ a: 1 }], [{ a: 1 }], (o1, o2) => o1.a === o2.a); // true
```

---

### generate()

> **generate**\<`T`\>(`generatorFn`): readonly `T`[]

Defined in: [src/array/array-utils.mts:616](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L616)

Creates an array from a generator function.

This utility function provides enhanced type safety by constraining the generator function
to prevent incorrect return values. The generator can only yield values of type T and
must return void, which helps catch common mistakes like returning values instead of yielding.

#### Type Parameters

##### T

`T`

The type of elements in the generated array

#### Parameters

##### generatorFn

() => `Generator`\<`T`, `void`, `unknown`\>

A function that returns a generator yielding elements of type T

#### Returns

readonly `T`[]

A readonly array containing all yielded values from the generator

#### Example

```typescript
const nums: readonly number[] = Arr.generate<number>(function* () {
    yield 1;
    yield* [2, 3];
});

assert.deepStrictEqual(nums, [1, 2, 3]);

// Type safety - prevents incorrect returns:
const nums2 = Arr.generate<number>(function* () {
    yield 1;
    if (someCondition) {
        return; // OK - returning is allowed, but must be void
    }
    yield* [2, 3];
    // return 1; // NG - TypeScript error, cannot return T
});
```

---

### indexIsInRange()

> **indexIsInRange**\<`E`\>(`array`, `index`): `boolean`

Defined in: [src/array/array-utils.mts:400](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L400)

Checks if an index is within the valid range of an array (i.e., `0 <= index < array.length`).

#### Type Parameters

##### E

`E`

The type of elements in the array.

#### Parameters

##### array

readonly `E`[]

The input array.

##### index

`ArgArrNonNegative`

The index to check.

#### Returns

`boolean`

`true` if the index is within the array bounds, `false` otherwise.

#### Example

```ts
Arr.indexIsInRange([10, 20], 0); // true
Arr.indexIsInRange([10, 20], 1); // true
Arr.indexIsInRange([10, 20], 2); // false
Arr.indexIsInRange([10, 20], -1); // false
Arr.indexIsInRange([], 0); // false
```

---

### isArray()

> **isArray**\<`E`\>(`value`): `value is FilterArray<E>`

Defined in: [src/array/array-utils.mts:143](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L143)

Type guard that checks if a value is an array, excluding types that cannot be arrays.
This function refines the type by filtering out non-array types from unions.

#### Type Parameters

##### E

`E`

The input type that may or may not be an array.

#### Parameters

##### value

`E`

The value to check.

#### Returns

`value is FilterArray<E>`

`true` if the value is an array, `false` otherwise.

#### Example

```ts
function processValue(value: string | number[] | null) {
    if (Arr.isArray(value)) {
        // value is now typed as number[]
        console.log(value.length);
    }
}

Arr.isArray([1, 2, 3]); // true
Arr.isArray('hello'); // false
Arr.isArray(null); // false
```

---

### isArrayAtLeastLength()

> **isArrayAtLeastLength**\<`E`, `N`\>(`array`, `len`): ``array is readonly [MakeTupleImpl<E, `${N}`, []>, E]``

Defined in: [src/array/array-utils.mts:380](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L380)

Checks if an array has at least a specific length.

#### Type Parameters

##### E

`E`

The type of elements in the array.

##### N

`N` _extends_ `ArgArrNonNegative`

The minimum expected length of the array (must be a number type).

#### Parameters

##### array

readonly `E`[]

The array to check.

##### len

`N`

The minimum expected length.

#### Returns

``array is readonly [MakeTupleImpl<E, `${N}`, []>, E]``

`true` if the array has at least the specified length, `false` otherwise.

#### Example

```ts
const arr: readonly number[] = [1, 2, 3];
if (Arr.isArrayAtLeastLength(arr, 2)) {
    // arr is now typed as readonly [number, number, ...number[]]
}
Arr.isArrayAtLeastLength([1], 2); // false
```

---

### isArrayOfLength()

> **isArrayOfLength**\<`E`, `N`\>(`array`, `len`): ``array is MakeTupleImpl<E, `${N}`, []>``

Defined in: [src/array/array-utils.mts:359](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L359)

Checks if an array has a specific length.

#### Type Parameters

##### E

`E`

The type of elements in the array.

##### N

`N` _extends_ `ArgArrNonNegative`

The expected length of the array (must be a number type).

#### Parameters

##### array

readonly `E`[]

The array to check.

##### len

`N`

The expected length.

#### Returns

``array is MakeTupleImpl<E, `${N}`, []>``

`true` if the array has the specified length, `false` otherwise.

#### Example

```ts
const arr: readonly number[] = [1, 2, 3];
if (Arr.isArrayOfLength(arr, 3)) {
    // arr is now typed as readonly [number, number, number]
}
Arr.isArrayOfLength([1, 2], 3); // false
```

---

### isEmpty()

> **isEmpty**\<`E`\>(`array`): `array is readonly []`

Defined in: [src/array/array-utils.mts:225](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L225)

Type guard that checks if an array is empty (has no elements).

This function serves as both a runtime check and a TypeScript type guard,
narrowing the array type to `readonly []` when the check passes. It's useful
for conditional logic and type-safe handling of potentially empty arrays.

#### Type Parameters

##### E

`E`

The type of elements in the array.

#### Parameters

##### array

readonly `E`[]

The array to check for emptiness.

#### Returns

`array is readonly []`

`true` if the array has length 0, `false` otherwise.
When `true`, TypeScript narrows the type to `readonly []`.

#### Example

```typescript
// Basic emptiness checking
const emptyArray: number[] = [];
const nonEmptyArray = [1, 2, 3];

console.log(Arr.isEmpty(emptyArray)); // true
console.log(Arr.isEmpty(nonEmptyArray)); // false

// Type guard behavior
function processArray(arr: readonly number[]) {
    if (Arr.isEmpty(arr)) {
        // arr is now typed as readonly []
        console.log('Array is empty');
        return 0;
    } else {
        // arr is now typed as NonEmptyArray<number>
        return arr[0]; // Safe access - TypeScript knows it's non-empty
    }
}

// Conditional processing
const data = [10, 20, 30];
if (!Arr.isEmpty(data)) {
    // Safe to access elements
    const firstElement = data[0]; // No undefined risk
    const lastElement = data[data.length - 1];
}

// Filtering empty arrays
const arrayList: readonly number[][] = [[1, 2], [], [3], []];
const nonEmptyArrays = arrayList.filter((arr) => !Arr.isEmpty(arr));
// nonEmptyArrays: [[1, 2], [3]]

// Early returns
function sumArray(numbers: readonly number[]): number {
    if (Arr.isEmpty(numbers)) {
        return 0; // Handle empty case early
    }
    return numbers.reduce((sum, n) => sum + n, 0);
}

// Type inference examples
const testEmpty = [] as const;
const testNonEmpty = [1, 2] as const;

expectType<Parameters<typeof Arr.isEmpty>[0], readonly unknown[]>('=');
expectType<ReturnType<typeof Arr.isEmpty>, boolean>('=');
```

#### See

- [isNonEmpty](#isnonempty) for the opposite check (non-empty arrays)
- [size](#size) for getting the exact length
- [isArrayOfLength](#isarrayoflength) for checking specific lengths

---

### isNonEmpty()

> **isNonEmpty**\<`E`\>(`array`): `array is readonly [E, E]`

Defined in: [src/array/array-utils.mts:339](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L339)

Type guard that checks if an array is non-empty (has at least one element).

This function serves as both a runtime check and a TypeScript type guard,
narrowing the array type to `NonEmptyArray<E>` when the check passes. This enables
safe access to array elements without undefined checks, as TypeScript knows the array
has at least one element.

#### Type Parameters

##### E

`E`

The type of elements in the array.

#### Parameters

##### array

readonly `E`[]

The array to check for non-emptiness.

#### Returns

`array is readonly [E, E]`

`true` if the array has length > 0, `false` otherwise.
When `true`, TypeScript narrows the type to `NonEmptyArray<E>`.

#### Example

```typescript
// Basic non-emptiness checking
const emptyArray: number[] = [];
const nonEmptyArray = [1, 2, 3];

console.log(Arr.isNonEmpty(emptyArray)); // false
console.log(Arr.isNonEmpty(nonEmptyArray)); // true

// Type guard behavior enables safe element access
function getFirstElement(arr: readonly number[]): number | undefined {
    if (Arr.isNonEmpty(arr)) {
        // arr is now typed as NonEmptyArray<number>
        return arr[0]; // Safe - no undefined, TypeScript knows this exists
    }
    return undefined;
}

// Safe operations on non-empty arrays
function processData(data: readonly string[]) {
    if (Arr.isNonEmpty(data)) {
        // All of these are now safe without undefined checks
        const first = data[0];
        const last = data[data.length - 1];
        const middle = data[Math.floor(data.length / 2)];

        // Can safely use non-empty array methods
        const joined = data.join(', ');
        const reduced = data.reduce((acc, item) => acc + item.length, 0);
    }
}

// Filtering and working with arrays
const possiblyEmptyArrays: readonly number[][] = [[1, 2, 3], [], [4, 5], []];

// Get only non-empty arrays with proper typing
const definitelyNonEmpty = possiblyEmptyArrays.filter(Arr.isNonEmpty);
// Type: NonEmptyArray<number>[]

// Now safe to access elements
const firstElements = definitelyNonEmpty.map((arr) => arr[0]); // [1, 4]

// Early validation
function calculateAverage(numbers: readonly number[]): number {
    if (!Arr.isNonEmpty(numbers)) {
        throw new Error('Cannot calculate average of empty array');
    }

    // numbers is now NonEmptyArray<number>
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

// Functional composition
const arrayGroups = [[1, 2], [], [3, 4, 5], []];

const nonEmptyGroups = arrayGroups
    .filter(Arr.isNonEmpty) // Filter to NonEmptyArray<number>[]
    .map((group) => group[0]); // Safe access to first element: [1, 3]

// Combined with other array operations
function processArraySafely<T>(
    arr: readonly T[],
    processor: (item: T) => string,
): string {
    if (Arr.isNonEmpty(arr)) {
        return arr.map(processor).join(' -> ');
    }
    return 'No items to process';
}

// Type inference examples
const testArray = [1, 2, 3];
const isNonEmptyResult = Arr.isNonEmpty(testArray);

expectType<typeof isNonEmptyResult, boolean>('=');
expectType<Parameters<typeof Arr.isNonEmpty>[0], readonly unknown[]>('=');

// Type narrowing in conditional
if (Arr.isNonEmpty(testArray)) {
    expectType<typeof testArray, NonEmptyArray<number>>('=');
}
```

#### See

- [isEmpty](#isempty) for the opposite check (empty arrays)
- [size](#size) for getting the exact length
- [head](#head) for safely getting the first element
- [last](#last) for safely getting the last element

---

### isSubset()

> **isSubset**\<`E1`, `E2`\>(`array1`, `array2`): `boolean`

Defined in: [src/array/array-utils.mts:3804](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3804)

Checks if the first array (`array1`) is a subset of the second array (`array2`).
An array `A` is a subset of `B` if all elements of `A` are also present in `B`.
Elements must be primitive types for `includes` to work reliably for comparison.

#### Type Parameters

##### E1

`E1` _extends_ `Primitive`

The type of elements in the first array (subset candidate), must be a primitive type.

##### E2

`E2` _extends_ `Primitive` = `E1`

The type of elements in the second array (superset candidate), must be a primitive type.

#### Parameters

##### array1

readonly `E1`[]

The first array.

##### array2

readonly `E2`[]

The second array.

#### Returns

`boolean`

`true` if `array1` is a subset of `array2`, `false` otherwise.

#### Remarks

`array1` ⊂ `array2`

#### Example

```ts
Arr.isSubset([1, 2], [1, 2, 3]); // true
Arr.isSubset([1, 2, 3], [1, 2]); // false
Arr.isSubset([], [1, 2, 3]); // true
Arr.isSubset([1, 5], [1, 2, 3]); // false
```

---

### isSuperset()

> **isSuperset**\<`E1`, `E2`\>(`array1`, `array2`): `boolean`

Defined in: [src/array/array-utils.mts:3830](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3830)

Checks if the first array (`array1`) is a superset of the second array (`array2`).
An array `A` is a superset of `B` if all elements of `B` are also present in `A`.
Elements must be primitive types.

#### Type Parameters

##### E1

`E1` _extends_ `Primitive`

The type of elements in the first array (superset candidate), must be a primitive type.

##### E2

`E2` _extends_ `Primitive` = `E1`

The type of elements in the second array (subset candidate), must be a primitive type.

#### Parameters

##### array1

readonly `E1`[]

The first array.

##### array2

readonly `E2`[]

The second array.

#### Returns

`boolean`

`true` if `array1` is a superset of `array2`, `false` otherwise.

#### Remarks

`array1` ⊃ `array2`

#### Example

```ts
Arr.isSuperset([1, 2, 3], [1, 2]); // true
Arr.isSuperset([1, 2], [1, 2, 3]); // false
Arr.isSuperset([1, 2, 3], []); // true
```

---

### setDifference()

> **setDifference**\<`E`\>(`array1`, `array2`): readonly `E`[]

Defined in: [src/array/array-utils.mts:3875](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3875)

Returns the set difference of two arrays (`array1` - `array2`).
The difference contains elements that are in `array1` but not in `array2`. Order is based on `array1`.
Elements must be primitive types.

#### Type Parameters

##### E

`E` _extends_ `Primitive`

The type of elements in the arrays (must be a primitive type).

#### Parameters

##### array1

readonly `E`[]

The first array.

##### array2

readonly `E`[]

The second array.

#### Returns

readonly `E`[]

A new array containing elements from `array1` that are not in `array2`.

#### Example

```ts
Arr.setDifference([1, 2, 3], [2, 3, 4]); // [1]
Arr.setDifference([1, 2, 3], [1, 2, 3]); // []
Arr.setDifference([1, 2], [3, 4]); // [1, 2]
```

---

### setIntersection()

> **setIntersection**\<`E1`, `E2`\>(`array1`, `array2`): readonly `E1` & `E2`[]

Defined in: [src/array/array-utils.mts:3850](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3850)

Returns the intersection of two arrays of primitive types.
The intersection contains elements that are present in both arrays. Order is based on `array1`.

#### Type Parameters

##### E1

`E1` _extends_ `Primitive`

The type of elements in the first array (must be a primitive type).

##### E2

`E2` _extends_ `Primitive` = `E1`

The type of elements in the second array (must be a primitive type).

#### Parameters

##### array1

readonly `E1`[]

The first array.

##### array2

readonly `E2`[]

The second array.

#### Returns

readonly `E1` & `E2`[]

A new array containing elements that are in both `array1` and `array2`.

#### Example

```ts
Arr.setIntersection([1, 2, 3], [2, 3, 4]); // [2, 3]
Arr.setIntersection(['a', 'b'], ['b', 'c']); // ['b']
Arr.setIntersection([1, 2], [3, 4]); // []
```

---

### sortedNumSetDifference()

> **sortedNumSetDifference**\<`E`\>(`sortedList1`, `sortedList2`): readonly `E`[]

Defined in: [src/array/array-utils.mts:3895](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3895)

Returns the set difference of two sorted arrays of numbers (`sortedList1` - `sortedList2`).
This operation is more efficient for sorted arrays than the generic `setDifference`.
The resulting array is also sorted.

#### Type Parameters

##### E

`E` _extends_ `number`

The type of numbers in the arrays (must extend `number`).

#### Parameters

##### sortedList1

readonly `E`[]

The first sorted array of numbers.

##### sortedList2

readonly `E`[]

The second sorted array of numbers.

#### Returns

readonly `E`[]

A new sorted array containing numbers from `sortedList1` that are not in `sortedList2`.

#### Example

```ts
Arr.sortedNumSetDifference([1, 2, 3, 5], [2, 4, 5]); // [1, 3]
Arr.sortedNumSetDifference([1, 2, 3], [1, 2, 3]); // []
Arr.sortedNumSetDifference([1, 2], [3, 4]); // [1, 2]
```

---

### tail()

> **tail**\<`Ar`\>(`array`): `Tail`\<`Ar`\>

Defined in: [src/array/array-utils.mts:1323](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1323)

Returns all elements of an array except the first one.

#### Type Parameters

##### Ar

`Ar` _extends_ readonly `unknown`[]

#### Parameters

##### array

`Ar`

The input array.

#### Returns

`Tail`\<`Ar`\>

A new array containing all elements except the first. The type is inferred as `List.Tail<T>`.

#### Example

```ts
Arr.tail([1, 2, 3] as const); // [2, 3]
Arr.tail([1] as const); // []
Arr.tail([]); // []
```

---

### uniq()

> **uniq**\<`P`\>(`array`): readonly `P`[]

Defined in: [src/array/array-utils.mts:3700](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3700)

Creates a new array with unique elements from the input array. Order is preserved from the first occurrence.
Uses `Set` internally for efficient uniqueness checking.

#### Type Parameters

##### P

`P` _extends_ `Primitive`

The type of elements in the array.

#### Parameters

##### array

readonly `P`[]

The input array.

#### Returns

readonly `P`[]

A new array with unique elements from the input array. Returns `[]` for an empty input.

#### Example

```ts
Arr.uniq([1, 2, 2, 3, 1, 4]); // [1, 2, 3, 4]
```

---

### zip()

> **zip**\<`Ar1`, `Ar2`\>(`array1`, `array2`): `Zip`\<`Ar1`, `Ar2`\>

Defined in: [src/array/array-utils.mts:3088](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3088)

Creates an array of tuples by pairing up corresponding elements from two arrays.
The resulting array has a length equal to the minimum of the two input array lengths.

#### Type Parameters

##### Ar1

`Ar1` _extends_ readonly `unknown`[]

##### Ar2

`Ar2` _extends_ readonly `unknown`[]

#### Parameters

##### array1

`Ar1`

The first array.

##### array2

`Ar2`

The second array.

#### Returns

`Zip`\<`Ar1`, `Ar2`\>

An array of tuples where each tuple contains corresponding elements from both arrays.

#### Example

```ts
Arr.zip([1, 2, 3] as const, ['a', 'b', 'c'] as const); // [[1, 'a'], [2, 'b'], [3, 'c']]
Arr.zip([1, 2], ['a', 'b', 'c']); // [[1, 'a'], [2, 'b']]
Arr.zip([1, 2, 3], ['a']); // [[1, 'a']]
Arr.zip([], ['a']); // []
```
