[**ts-data-forge**](../../../README.md)

---

[ts-data-forge](../../../README.md) / [array/array-utils](../README.md) / Arr

# Arr

A comprehensive, immutable utility library for array manipulations in TypeScript.
Provides a wide range of functions for array creation, validation, transformation,
reduction, slicing, set operations, and more, with a focus on type safety and
leveraging TypeScript's type inference capabilities.
All functions operate on `readonly` arrays and return new `readonly` arrays,
ensuring immutability.

## Variables

### chunk()

> `const` **chunk**: \{\<`N`, `E`\>(`array`, `chunkSize`): readonly readonly `E`[][]; \<`N`\>(`chunkSize`): \<`E`\>(`array`) => readonly readonly `E`[][]; \} = `partition`

Defined in: [src/array/array-utils.mts:4779](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4779)

Alias for `partition`. Splits an array into chunks of a specified size.

#### Call Signature

> \<`N`, `E`\>(`array`, `chunkSize`): readonly readonly `E`[][]

Partitions an array into sub-arrays of a specified size.
The last partition may be smaller if the array length is not a multiple of `chunkSize`.
Returns an empty array if chunkSize < 2.

##### Type Parameters

###### N

`N` _extends_ `WithSmallInt`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `object`, `40`\>

The size of each partition (must be a number type, typically a literal for precise typing).

###### E

`E`

The type of elements in the array.

##### Parameters

###### array

readonly `E`[]

The input array.

###### chunkSize

`N`

The size of each partition.

##### Returns

readonly readonly `E`[][]

An array of arrays, where each inner array has up to `chunkSize` elements.

##### Example

```ts
Arr.partition([1, 2, 3, 4, 5, 6], 2); // [[1, 2], [3, 4], [5, 6]]
Arr.partition([1, 2, 3, 4, 5, 6, 7], 3); // [[1, 2, 3], [4, 5, 6], [7]]
```

#### Call Signature

> \<`N`\>(`chunkSize`): \<`E`\>(`array`) => readonly readonly `E`[][]

Partitions an array into sub-arrays of a specified size.
The last partition may be smaller if the array length is not a multiple of `chunkSize`.
Returns an empty array if chunkSize < 2.

##### Type Parameters

###### N

`N` _extends_ `WithSmallInt`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `object`, `40`\>

The size of each partition (must be a number type, typically a literal for precise typing).

##### Parameters

###### chunkSize

`N`

The size of each partition.

##### Returns

An array of arrays, where each inner array has up to `chunkSize` elements.

> \<`E`\>(`array`): readonly readonly `E`[][]

###### Type Parameters

###### E

`E`

###### Parameters

###### array

readonly `E`[]

###### Returns

readonly readonly `E`[][]

##### Example

```ts
Arr.partition([1, 2, 3, 4, 5, 6], 2); // [[1, 2], [3, 4], [5, 6]]
Arr.partition([1, 2, 3, 4, 5, 6, 7], 3); // [[1, 2, 3], [4, 5, 6], [7]]
```

#### See

[partition](#partition)

---

### drop()

> `const` **drop**: \{\<`Ar`, `N`\>(`array`, `num`): `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Skip`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]; \<`N`\>(`num`): \<`Ar`\>(`array`) => `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Skip`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]; \} = `skip`

Defined in: [src/array/array-utils.mts:4761](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4761)

Alias for `skip`. Skips the first N elements of an array.

#### Call Signature

> \<`Ar`, `N`\>(`array`, `num`): `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Skip`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

Skips the first N elements of an array.

- If the array is a tuple, the return type is inferred as a tuple with the first N elements removed.
- If the array is a non-empty array and N is a positive integer, returns a readonly array (may be empty).
- Otherwise, returns a readonly array with the first N elements skipped.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The number of elements to skip, constrained to `SmallUint`.

##### Parameters

###### array

`Ar`

The input array.

###### num

`N`

The number of elements to skip.

##### Returns

`N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Skip`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

A new array containing the elements after skipping the first N.

##### Example

```ts
// Regular usage
Arr.skip([1, 2, 3, 4] as const, 2); // [3, 4]

// Curried usage for pipe composition
const skipFirst2 = Arr.skip(2);
const result = pipe([1, 2, 3, 4, 5]).map(skipFirst2).value;
console.log(result); // [3, 4, 5]
```

#### Call Signature

> \<`N`\>(`num`): \<`Ar`\>(`array`) => `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Skip`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

Skips the first N elements of an array.

- If the array is a tuple, the return type is inferred as a tuple with the first N elements removed.
- If the array is a non-empty array and N is a positive integer, returns a readonly array (may be empty).
- Otherwise, returns a readonly array with the first N elements skipped.

##### Type Parameters

###### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The number of elements to skip, constrained to `SmallUint`.

##### Parameters

###### num

`N`

The number of elements to skip.

##### Returns

A new array containing the elements after skipping the first N.

> \<`Ar`\>(`array`): `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Skip`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

###### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### Parameters

###### array

`Ar`

###### Returns

`N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Skip`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

##### Example

```ts
// Regular usage
Arr.skip([1, 2, 3, 4] as const, 2); // [3, 4]

// Curried usage for pipe composition
const skipFirst2 = Arr.skip(2);
const result = pipe([1, 2, 3, 4, 5]).map(skipFirst2).value;
console.log(result); // [3, 4, 5]
```

#### See

[skip](#skip)

---

### equal()

> `const` **equal**: \<`E`\>(`array1`, `array2`, `equality`) => `boolean` = `eq`

Defined in: [src/array/array-utils.mts:4503](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4503)

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

### first()

> `const` **first**: \<`Ar`\>(`array`) => `Ar` _extends_ readonly \[\] ? `Readonly`\<\{ \}\> : `Ar` _extends_ readonly \[`E`, `unknown`\] ? `Readonly`\<\{ `value`: `E`; \}\> : `Ar` _extends_ readonly \[`E`, `E`\] ? `Readonly`\<\{ `value`: `E`; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\> = `head`

Defined in: [src/array/array-utils.mts:4749](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4749)

Alias for `head`. Returns the first element of an array.

Returns the first element of an array wrapped in an Optional.

This function provides type-safe access to the first element with precise return types:

- For empty arrays: returns `Optional.None`
- For tuples with known first element: returns `Optional.Some<FirstElementType>`
- For non-empty arrays: returns `Optional.Some<ElementType>`
- For general arrays: returns `Optional<ElementType>`

The function leverages TypeScript's type system to provide the most precise return type
based on the input array type, making it safer than direct indexing.

#### Type Parameters

##### Ar

`Ar` _extends_ readonly `unknown`[]

#### Parameters

##### array

`Ar`

The array to get the first element from.

#### Returns

`Ar` _extends_ readonly \[\] ? `Readonly`\<\{ \}\> : `Ar` _extends_ readonly \[`E`, `unknown`\] ? `Readonly`\<\{ `value`: `E`; \}\> : `Ar` _extends_ readonly \[`E`, `E`\] ? `Readonly`\<\{ `value`: `E`; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

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

#### See

[head](#head)

---

### keys()

> `const` **keys**: \<`E`\>(`array`) => `ArrayIterator`\<`Uint32`\> = `indices`

Defined in: [src/array/array-utils.mts:4797](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4797)

Alias for `indices`. Returns an iterable of keys in the array.

Returns an iterable of keys in the array.

This function returns an array of branded indices (`SizeType.Arr`) for type safety.

#### Type Parameters

##### E

`E`

#### Parameters

##### array

readonly `E`[]

The array to get indices from.

#### Returns

`ArrayIterator`\<`Uint32`\>

An array of indices.

#### Example

```typescript
// Direct usage
const fruits = ['apple', 'banana', 'cherry'];
const indices = Arr.indices(fruits); // [0, 1, 2]

// Curried usage
const getIndices = Arr.indices;
const result = getIndices(['a', 'b']); // [0, 1]

// Empty array
const empty: string[] = [];
const emptyIndices = Arr.indices(empty); // []
```

#### See

[indices](#indices)

---

### length()

> `const` **length**: \<`Ar`\>(`array`) => `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `IntersectBrand`\<`PositiveNumber`, `Uint32`\> : `Uint32` = `size`

Defined in: [src/array/array-utils.mts:4791](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4791)

Alias for `size`. Returns the length of an array.

Returns the size (length) of an array as a type-safe branded integer.

This function provides the array length with enhanced type safety through branded types:

- For arrays known to be non-empty at compile time: returns `PositiveNumber & SizeType.Arr`
- For general arrays that may be empty: returns `SizeType.Arr` (branded Uint32)

The returned value is always a non-negative integer that can be safely used for array indexing
and size comparisons. The branded type prevents common integer overflow issues and provides
better type checking than plain numbers.

#### Type Parameters

##### Ar

`Ar` _extends_ readonly `unknown`[]

The exact type of the input array, used for precise return type inference.

#### Parameters

##### array

`Ar`

The array to measure. Can be any readonly array type.

#### Returns

`Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `IntersectBrand`\<`PositiveNumber`, `Uint32`\> : `Uint32`

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

const nonEmpty: NonEmptyArray<string> = ['a', 'b'];
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

#### See

[size](#size)

---

### newArray()

> `const` **newArray**: \<`V`, `N`\>(`len`, `init`) => `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `MakeTupleImpl`\<`V`, `` `${N<N>}` ``, \[\]\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? readonly \[`V`, `V`\] : readonly `V`[] = `create`

Defined in: [src/array/array-utils.mts:4785](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4785)

Alias for `create`. Creates a new array of the specified length, with each position filled with the provided initial value.

Creates a new array of the specified length, with each position filled with the provided initial value.

This function provides compile-time type safety with precise return types and performs shallow copying
of the initial value (the same reference is used for all positions):

- When `len` is a compile-time known `SmallUint` (0-100), returns a tuple of exactly that length
- When `len` is a positive runtime value, returns a `NonEmptyArray<V>`
- Otherwise, returns a `readonly V[]` that may be empty

#### Type Parameters

##### V

`V`

The type of the initial value. The `const` constraint preserves literal types.

##### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The type of the length parameter when it's a `SmallUint` literal.

#### Parameters

##### len

`N`

The length of the array to create. Must be a non-negative integer.

##### init

`V`

The value to fill each position with. The same reference is used for all positions.

#### Returns

`N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `MakeTupleImpl`\<`V`, `` `${N<N>}` ``, \[\]\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? readonly \[`V`, `V`\] : readonly `V`[]

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

#### See

[create](#create)

---

### reduce()

> `const` **reduce**: \{\<`Ar`, `P`\>(`array`, `callbackfn`, `initialValue`): `P`; \<`E`, `P`\>(`callbackfn`, `initialValue`): (`array`) => `P`; \} = `foldl`

Defined in: [src/array/array-utils.mts:4767](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4767)

Alias for `foldl`. Applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value.

#### Call Signature

> \<`Ar`, `P`\>(`array`, `callbackfn`, `initialValue`): `P`

Applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value.
This is an alias for `Array.prototype.reduce`.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### P

`P`

##### Parameters

###### array

`Ar`

The input array.

###### callbackfn

(`previousValue`, `currentValue`, `currentIndex`) => `P`

A function to execute on each element in the array: `(previousValue: S, currentValue: A, currentIndex: SizeType.Arr) => S`.

###### initialValue

`P`

The initial value of the accumulator.

##### Returns

`P`

The single value that results from the reduction.

##### Example

```ts
Arr.foldl([1, 2, 3], (sum, n) => sum + n, 0); // 6
Arr.foldl(['a', 'b', 'c'], (acc, str) => acc + str.toUpperCase(), ''); // 'ABC'
```

#### Call Signature

> \<`E`, `P`\>(`callbackfn`, `initialValue`): (`array`) => `P`

Applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value.
This is an alias for `Array.prototype.reduce`.

##### Type Parameters

###### E

`E`

The type of elements in the array.

###### P

`P`

##### Parameters

###### callbackfn

(`previousValue`, `currentValue`, `currentIndex`) => `P`

A function to execute on each element in the array: `(previousValue: S, currentValue: A, currentIndex: SizeType.Arr) => S`.

###### initialValue

`P`

The initial value of the accumulator.

##### Returns

The single value that results from the reduction.

> (`array`): `P`

###### Parameters

###### array

readonly `E`[]

###### Returns

`P`

##### Example

```ts
Arr.foldl([1, 2, 3], (sum, n) => sum + n, 0); // 6
Arr.foldl(['a', 'b', 'c'], (acc, str) => acc + str.toUpperCase(), ''); // 'ABC'
```

#### See

[foldl](#foldl)

---

### reduceRight()

> `const` **reduceRight**: \{\<`Ar`, `P`\>(`array`, `callbackfn`, `initialValue`): `P`; \<`E`, `P`\>(`callbackfn`, `initialValue`): (`array`) => `P`; \} = `foldr`

Defined in: [src/array/array-utils.mts:4773](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4773)

Alias for `foldr`. Applies a function against an accumulator and each element in the array (from right to left) to reduce it to a single value.

#### Call Signature

> \<`Ar`, `P`\>(`array`, `callbackfn`, `initialValue`): `P`

Applies a function against an accumulator and each element in the array (from right to left) to reduce it to a single value.
This is an alias for `Array.prototype.reduceRight`.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### P

`P`

##### Parameters

###### array

`Ar`

The input array.

###### callbackfn

(`previousValue`, `currentValue`, `currentIndex`) => `P`

A function to execute on each element in the array: `(previousValue: S, currentValue: A, currentIndex: SizeType.Arr) => S`.

###### initialValue

`P`

The initial value of the accumulator.

##### Returns

`P`

The single value that results from the reduction.

##### Example

```ts
// Regular usage
Arr.foldr([1, 2, 3], (sum, n) => sum + n, 0); // 6

// Curried usage for pipe composition
const concatRight = Arr.foldr((acc: string, curr: string) => curr + acc, '');
const result = pipe(['a', 'b', 'c']).map(concatRight).value;
console.log(result); // "abc"
```

#### Call Signature

> \<`E`, `P`\>(`callbackfn`, `initialValue`): (`array`) => `P`

Applies a function against an accumulator and each element in the array (from right to left) to reduce it to a single value.
This is an alias for `Array.prototype.reduceRight`.

##### Type Parameters

###### E

`E`

The type of elements in the array.

###### P

`P`

##### Parameters

###### callbackfn

(`previousValue`, `currentValue`, `currentIndex`) => `P`

A function to execute on each element in the array: `(previousValue: S, currentValue: A, currentIndex: SizeType.Arr) => S`.

###### initialValue

`P`

The initial value of the accumulator.

##### Returns

The single value that results from the reduction.

> (`array`): `P`

###### Parameters

###### array

readonly `E`[]

###### Returns

`P`

##### Example

```ts
// Regular usage
Arr.foldr([1, 2, 3], (sum, n) => sum + n, 0); // 6

// Curried usage for pipe composition
const concatRight = Arr.foldr((acc: string, curr: string) => curr + acc, '');
const result = pipe(['a', 'b', 'c']).map(concatRight).value;
console.log(result); // "abc"
```

#### See

[foldr](#foldr)

---

### rest()

> `const` **rest**: \<`Ar`\>(`array`) => `Tail`\<`Ar`\> = `tail`

Defined in: [src/array/array-utils.mts:4755](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4755)

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

## Functions

### at()

#### Call Signature

> **at**\<`Ar`\>(`array`, `index`): [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

Defined in: [src/array/array-utils.mts:899](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L899)

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

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

The array to access (when using direct call syntax).

###### index

`ArgArrayIndexWithNegative`\<`Ar`\>

The index to access. Must be a branded `SizeType.ArgArr` (safe integer). Can be:

- **Positive integer:** 0-based index from the start (0, 1, 2, ...)
- **Negative integer:** index from the end (-1 is last element, -2 is second-to-last, etc.)
- **Out of bounds:** any index beyond array bounds returns [Optional.None](../../../functional/optional/namespaces/Optional.md#none)

##### Returns

[`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

An [Optional](../../../functional/optional/README.md#optional)<E> containing:

- [Optional.Some](../../../functional/optional/namespaces/Optional.md#some)<E> with the element if the index is valid
- [Optional.None](../../../functional/optional/namespaces/Optional.md#none) if the index is out of bounds (including empty arrays)

##### Example

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

##### See

- [head](#head) for getting the first element specifically
- [last](#last) for getting the last element specifically
- [Optional](../../../functional/optional/README.md#optional) for working with the returned Optional values
- [Optional.unwrapOr](../../../functional/optional/namespaces/Optional.md#unwrapor) for safe unwrapping with defaults
- [Optional.map](../../../functional/optional/namespaces/Optional.md#map) for transforming Optional values

#### Call Signature

> **at**(`index`): \<`E`\>(`array`) => [`Optional`](../../../functional/optional/README.md#optional)\<`E`\>

Defined in: [src/array/array-utils.mts:906](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L906)

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

##### Parameters

###### index

[`ArgArrWithNegative`](../../../globals/namespaces/SizeType.md#argarrwithnegative)

The index to access. Must be a branded `SizeType.ArgArr` (safe integer). Can be:

- **Positive integer:** 0-based index from the start (0, 1, 2, ...)
- **Negative integer:** index from the end (-1 is last element, -2 is second-to-last, etc.)
- **Out of bounds:** any index beyond array bounds returns [Optional.None](../../../functional/optional/namespaces/Optional.md#none)

##### Returns

An [Optional](../../../functional/optional/README.md#optional)<E> containing:

- [Optional.Some](../../../functional/optional/namespaces/Optional.md#some)<E> with the element if the index is valid
- [Optional.None](../../../functional/optional/namespaces/Optional.md#none) if the index is out of bounds (including empty arrays)

> \<`E`\>(`array`): [`Optional`](../../../functional/optional/README.md#optional)\<`E`\>

###### Type Parameters

###### E

`E`

###### Parameters

###### array

readonly `E`[]

###### Returns

[`Optional`](../../../functional/optional/README.md#optional)\<`E`\>

##### Example

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

##### See

- [head](#head) for getting the first element specifically
- [last](#last) for getting the last element specifically
- [Optional](../../../functional/optional/README.md#optional) for working with the returned Optional values
- [Optional.unwrapOr](../../../functional/optional/namespaces/Optional.md#unwrapor) for safe unwrapping with defaults
- [Optional.map](../../../functional/optional/namespaces/Optional.md#map) for transforming Optional values

---

### butLast()

> **butLast**\<`Ar`\>(`array`): `ButLast`\<`Ar`\>

Defined in: [src/array/array-utils.mts:1258](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1258)

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

Defined in: [src/array/array-utils.mts:3820](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3820)

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

Defined in: [src/array/array-utils.mts:624](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L624)

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

### count()

#### Call Signature

> **count**\<`Ar`\>(`array`, `predicate`): `Uint32`

Defined in: [src/array/array-utils.mts:3283](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3283)

Counts the number of elements in an array that satisfy a predicate.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

The input array.

###### predicate

(`value`, `index`) => `boolean`

A function `(value: A, index: number) => boolean` to test each element for a condition.

##### Returns

`Uint32`

The number of elements that satisfy the predicate.

##### Example

```ts
// Regular usage
Arr.count([1, 2, 3, 4], (x) => x > 2); // 2

// Curried usage for pipe composition
const countEvens = Arr.count((x: number) => x % 2 === 0);
const result = pipe([1, 2, 3, 4, 5, 6]).map(countEvens).value;
console.log(result); // 3
```

#### Call Signature

> **count**\<`E`\>(`predicate`): (`array`) => `Uint32`

Defined in: [src/array/array-utils.mts:3288](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3288)

Counts the number of elements in an array that satisfy a predicate.

##### Type Parameters

###### E

`E`

The type of elements in the array.

##### Parameters

###### predicate

(`value`, `index`) => `boolean`

A function `(value: A, index: number) => boolean` to test each element for a condition.

##### Returns

The number of elements that satisfy the predicate.

> (`array`): `Uint32`

###### Parameters

###### array

readonly `E`[]

###### Returns

`Uint32`

##### Example

```ts
// Regular usage
Arr.count([1, 2, 3, 4], (x) => x > 2); // 2

// Curried usage for pipe composition
const countEvens = Arr.count((x: number) => x % 2 === 0);
const result = pipe([1, 2, 3, 4, 5, 6]).map(countEvens).value;
console.log(result); // 3
```

---

### countBy()

#### Call Signature

> **countBy**\<`Ar`, `G`\>(`array`, `grouper`): [`IMap`](../../../collections/imap/README.md#imap)\<`G`, `ArrayIndex`\<`Ar`\>\>

Defined in: [src/array/array-utils.mts:3336](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3336)

Groups elements of an array by a key derived from each element and counts the elements in each group.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### G

`G` _extends_ `Primitive`

The type of the group key (must be a primitive type: `string`, `number`, `boolean`, `symbol`, `bigint`, `null`, or `undefined`).

##### Parameters

###### array

`Ar`

The input array.

###### grouper

(`value`, `index`) => `G`

A function `(value: A, index: number) => G` that maps an element and its index to a group key.

##### Returns

[`IMap`](../../../collections/imap/README.md#imap)\<`G`, `ArrayIndex`\<`Ar`\>\>

An `IMap` where keys are group keys and values are the counts of elements in each group.

##### Example

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

#### Call Signature

> **countBy**\<`E`, `G`\>(`grouper`): (`array`) => [`IMap`](../../../collections/imap/README.md#imap)\<`G`, `Uint32`\>

Defined in: [src/array/array-utils.mts:3344](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3344)

Groups elements of an array by a key derived from each element and counts the elements in each group.

##### Type Parameters

###### E

`E`

The type of elements in the array.

###### G

`G` _extends_ `Primitive`

The type of the group key (must be a primitive type: `string`, `number`, `boolean`, `symbol`, `bigint`, `null`, or `undefined`).

##### Parameters

###### grouper

(`value`, `index`) => `G`

A function `(value: A, index: number) => G` that maps an element and its index to a group key.

##### Returns

An `IMap` where keys are group keys and values are the counts of elements in each group.

> (`array`): [`IMap`](../../../collections/imap/README.md#imap)\<`G`, `Uint32`\>

###### Parameters

###### array

readonly `E`[]

###### Returns

[`IMap`](../../../collections/imap/README.md#imap)\<`G`, `Uint32`\>

##### Example

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

### create()

> **create**\<`V`, `N`\>(`len`, `init`): `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `MakeTupleImpl`\<`V`, `` `${N<N>}` ``, \[\]\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? readonly \[`V`, `V`\] : readonly `V`[]

Defined in: [src/array/array-utils.mts:526](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L526)

Creates a new array of the specified length, with each position filled with the provided initial value.

This function provides compile-time type safety with precise return types and performs shallow copying
of the initial value (the same reference is used for all positions):

- When `len` is a compile-time known `SmallUint` (0-100), returns a tuple of exactly that length
- When `len` is a positive runtime value, returns a `NonEmptyArray<V>`
- Otherwise, returns a `readonly V[]` that may be empty

#### Type Parameters

##### V

`V`

The type of the initial value. The `const` constraint preserves literal types.

##### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The type of the length parameter when it's a `SmallUint` literal.

#### Parameters

##### len

`N`

The length of the array to create. Must be a non-negative integer.

##### init

`V`

The value to fill each position with. The same reference is used for all positions.

#### Returns

`N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `MakeTupleImpl`\<`V`, `` `${N<N>}` ``, \[\]\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? readonly \[`V`, `V`\] : readonly `V`[]

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

### entries()

> **entries**\<`E`\>(`array`): `ArrayIterator`\<readonly \[`Uint32`, `E`\]\>

Defined in: [src/array/array-utils.mts:4676](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4676)

Returns an iterable of key-value pairs for every entry in the array.

This function returns an array where each element is a tuple containing the index and value.
The indices are branded as `SizeType.Arr` for type safety.

#### Type Parameters

##### E

`E`

#### Parameters

##### array

readonly `E`[]

The array to get entries from.

#### Returns

`ArrayIterator`\<readonly \[`Uint32`, `E`\]\>

An array of `[index, value]` pairs.

#### Example

```typescript
// Direct usage
const fruits = ['apple', 'banana', 'cherry'];
const entries = Arr.entries(fruits); // [[0, 'apple'], [1, 'banana'], [2, 'cherry']]

// Curried usage
const getEntries = Arr.entries;
const result = getEntries(['a', 'b']); // [[0, 'a'], [1, 'b']]

// With tuples
const tuple = [10, 20, 30] as const;
const tupleEntries = Arr.entries(tuple); // [[0, 10], [1, 20], [2, 30]]
```

---

### eq()

> **eq**\<`E`\>(`array1`, `array2`, `equality`): `boolean`

Defined in: [src/array/array-utils.mts:4491](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4491)

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

### every()

#### Call Signature

> **every**\<`E`, `S`\>(`array`, `predicate`): `array is readonly S[]`

Defined in: [src/array/array-utils.mts:2839](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2839)

Tests whether all elements in an array pass a test implemented by a predicate function.

This function returns `true` if all elements satisfy the predicate, `false` otherwise.
For empty arrays, it returns `true` (vacuous truth).
Supports type guard predicates for type narrowing of the entire array.

##### Type Parameters

###### E

`E`

The type of elements in the array.

###### S

`S`

The narrowed type when using type guard predicates.

##### Parameters

###### array

readonly `E`[]

The array to test.

###### predicate

(`a`, `index`) => `a is S`

A function that tests each element.

##### Returns

`array is readonly S[]`

`true` if all elements pass the test, `false` otherwise.

##### Example

```typescript
// Direct usage
const numbers = [2, 4, 6, 8];
const allEven = Arr.every(numbers, (n) => n % 2 === 0); // true

// Type guard usage - narrows entire array type
const mixed: (string | number)[] = ['hello', 'world'];
if (Arr.every(mixed, (x): x is string => typeof x === 'string')) {
    // TypeScript knows mixed is string[] here
    console.log(mixed.map((s) => s.toUpperCase()));
}

// Curried usage with type guards
const isString = (x: unknown): x is string => typeof x === 'string';
const allStrings = Arr.every(isString);
const data: unknown[] = ['a', 'b', 'c'];
if (allStrings(data)) {
    // TypeScript knows data is string[] here
    console.log(data.join(''));
}

// Empty array
const empty: number[] = [];
const result2 = Arr.every(empty, (n) => n > 0); // true
```

#### Call Signature

> **every**\<`E`, `S`\>(`predicate`): (`array`) => `array is readonly S[]`

Defined in: [src/array/array-utils.mts:2844](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2844)

Tests whether all elements in an array pass a test implemented by a predicate function.

This function returns `true` if all elements satisfy the predicate, `false` otherwise.
For empty arrays, it returns `true` (vacuous truth).
Supports type guard predicates for type narrowing of the entire array.

##### Type Parameters

###### E

`E`

The type of elements in the array.

###### S

`S`

The narrowed type when using type guard predicates.

##### Parameters

###### predicate

(`a`, `index`) => `a is S`

A function that tests each element.

##### Returns

`true` if all elements pass the test, `false` otherwise.

> (`array`): `array is readonly S[]`

###### Parameters

###### array

readonly `E`[]

###### Returns

`array is readonly S[]`

##### Example

```typescript
// Direct usage
const numbers = [2, 4, 6, 8];
const allEven = Arr.every(numbers, (n) => n % 2 === 0); // true

// Type guard usage - narrows entire array type
const mixed: (string | number)[] = ['hello', 'world'];
if (Arr.every(mixed, (x): x is string => typeof x === 'string')) {
    // TypeScript knows mixed is string[] here
    console.log(mixed.map((s) => s.toUpperCase()));
}

// Curried usage with type guards
const isString = (x: unknown): x is string => typeof x === 'string';
const allStrings = Arr.every(isString);
const data: unknown[] = ['a', 'b', 'c'];
if (allStrings(data)) {
    // TypeScript knows data is string[] here
    console.log(data.join(''));
}

// Empty array
const empty: number[] = [];
const result2 = Arr.every(empty, (n) => n > 0); // true
```

#### Call Signature

> **every**\<`Ar`\>(`array`, `predicate`): `boolean`

Defined in: [src/array/array-utils.mts:2849](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2849)

Tests whether all elements in an array pass a test implemented by a predicate function.

This function returns `true` if all elements satisfy the predicate, `false` otherwise.
For empty arrays, it returns `true` (vacuous truth).
Supports type guard predicates for type narrowing of the entire array.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

The exact type of the input array.

##### Parameters

###### array

`Ar`

The array to test.

###### predicate

(`a`, `index`) => `boolean`

A function that tests each element.

##### Returns

`boolean`

`true` if all elements pass the test, `false` otherwise.

##### Example

```typescript
// Direct usage
const numbers = [2, 4, 6, 8];
const allEven = Arr.every(numbers, (n) => n % 2 === 0); // true

// Type guard usage - narrows entire array type
const mixed: (string | number)[] = ['hello', 'world'];
if (Arr.every(mixed, (x): x is string => typeof x === 'string')) {
    // TypeScript knows mixed is string[] here
    console.log(mixed.map((s) => s.toUpperCase()));
}

// Curried usage with type guards
const isString = (x: unknown): x is string => typeof x === 'string';
const allStrings = Arr.every(isString);
const data: unknown[] = ['a', 'b', 'c'];
if (allStrings(data)) {
    // TypeScript knows data is string[] here
    console.log(data.join(''));
}

// Empty array
const empty: number[] = [];
const result2 = Arr.every(empty, (n) => n > 0); // true
```

#### Call Signature

> **every**\<`E`\>(`predicate`): (`array`) => `boolean`

Defined in: [src/array/array-utils.mts:2854](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2854)

Tests whether all elements in an array pass a test implemented by a predicate function.

This function returns `true` if all elements satisfy the predicate, `false` otherwise.
For empty arrays, it returns `true` (vacuous truth).
Supports type guard predicates for type narrowing of the entire array.

##### Type Parameters

###### E

`E`

The type of elements in the array.

##### Parameters

###### predicate

(`a`, `index`) => `boolean`

A function that tests each element.

##### Returns

`true` if all elements pass the test, `false` otherwise.

> (`array`): `boolean`

###### Parameters

###### array

readonly `E`[]

###### Returns

`boolean`

##### Example

```typescript
// Direct usage
const numbers = [2, 4, 6, 8];
const allEven = Arr.every(numbers, (n) => n % 2 === 0); // true

// Type guard usage - narrows entire array type
const mixed: (string | number)[] = ['hello', 'world'];
if (Arr.every(mixed, (x): x is string => typeof x === 'string')) {
    // TypeScript knows mixed is string[] here
    console.log(mixed.map((s) => s.toUpperCase()));
}

// Curried usage with type guards
const isString = (x: unknown): x is string => typeof x === 'string';
const allStrings = Arr.every(isString);
const data: unknown[] = ['a', 'b', 'c'];
if (allStrings(data)) {
    // TypeScript knows data is string[] here
    console.log(data.join(''));
}

// Empty array
const empty: number[] = [];
const result2 = Arr.every(empty, (n) => n > 0); // true
```

---

### filter()

#### Call Signature

> **filter**\<`Ar`, `S`\>(`array`, `predicate`): readonly `S`[]

Defined in: [src/array/array-utils.mts:3600](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3600)

Filters an array based on a predicate function.

This function returns a new array containing only the elements that satisfy the predicate.
It provides both direct usage and curried versions for functional composition.
Supports type guard predicates for type narrowing.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

The exact type of the input array, used for precise return type inference.

###### S

`S` _extends_ `unknown`

The narrowed type when using type guard predicates.

##### Parameters

###### array

`Ar`

The array to filter.

###### predicate

(`a`, `index`) => `a is S`

A function that tests each element. Returns `true` to keep the element, `false` to filter it out.

##### Returns

readonly `S`[]

A new array containing only the elements that satisfy the predicate.

##### Example

```typescript
// Direct usage
const numbers = [1, 2, 3, 4, 5];
const evens = Arr.filter(numbers, (n) => n % 2 === 0); // [2, 4]

// Type guard usage
const mixed: (string | number | null)[] = ['hello', 42, null, 'world'];
const strings = Arr.filter(mixed, (x): x is string => typeof x === 'string'); // string[]
const notNull = Arr.filter(mixed, (x): x is NonNullable<typeof x> => x != null); // (string | number)[]

// Curried usage with type guards
const isString = (x: unknown): x is string => typeof x === 'string';
const filterStrings = Arr.filter(isString);
const result = filterStrings(['a', 1, 'b', 2]); // string[]

// Functional composition
const processNumbers = pipe(
    Arr.filter((n: number) => n > 0),
    Arr.map((n) => n * 2),
);
```

##### See

- [filterNot](#filternot) for filtering with negated predicate
- [every](#every) for testing if all elements satisfy a predicate
- [some](#some) for testing if any elements satisfy a predicate
- [find](#find) for finding the first element that satisfies a predicate

#### Call Signature

> **filter**\<`E`, `S`\>(`predicate`): (`array`) => readonly `S`[]

Defined in: [src/array/array-utils.mts:3605](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3605)

Filters an array based on a predicate function.

This function returns a new array containing only the elements that satisfy the predicate.
It provides both direct usage and curried versions for functional composition.
Supports type guard predicates for type narrowing.

##### Type Parameters

###### E

`E`

The type of elements in the array.

###### S

`S`

The narrowed type when using type guard predicates.

##### Parameters

###### predicate

(`a`, `index`) => `a is S`

A function that tests each element. Returns `true` to keep the element, `false` to filter it out.

##### Returns

A new array containing only the elements that satisfy the predicate.

> (`array`): readonly `S`[]

###### Parameters

###### array

readonly `E`[]

###### Returns

readonly `S`[]

##### Example

```typescript
// Direct usage
const numbers = [1, 2, 3, 4, 5];
const evens = Arr.filter(numbers, (n) => n % 2 === 0); // [2, 4]

// Type guard usage
const mixed: (string | number | null)[] = ['hello', 42, null, 'world'];
const strings = Arr.filter(mixed, (x): x is string => typeof x === 'string'); // string[]
const notNull = Arr.filter(mixed, (x): x is NonNullable<typeof x> => x != null); // (string | number)[]

// Curried usage with type guards
const isString = (x: unknown): x is string => typeof x === 'string';
const filterStrings = Arr.filter(isString);
const result = filterStrings(['a', 1, 'b', 2]); // string[]

// Functional composition
const processNumbers = pipe(
    Arr.filter((n: number) => n > 0),
    Arr.map((n) => n * 2),
);
```

##### See

- [filterNot](#filternot) for filtering with negated predicate
- [every](#every) for testing if all elements satisfy a predicate
- [some](#some) for testing if any elements satisfy a predicate
- [find](#find) for finding the first element that satisfies a predicate

#### Call Signature

> **filter**\<`Ar`\>(`array`, `predicate`): readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:3610](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3610)

Filters an array based on a predicate function.

This function returns a new array containing only the elements that satisfy the predicate.
It provides both direct usage and curried versions for functional composition.
Supports type guard predicates for type narrowing.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

The exact type of the input array, used for precise return type inference.

##### Parameters

###### array

`Ar`

The array to filter.

###### predicate

(`a`, `index`) => `boolean`

A function that tests each element. Returns `true` to keep the element, `false` to filter it out.

##### Returns

readonly `Ar`\[`number`\][]

A new array containing only the elements that satisfy the predicate.

##### Example

```typescript
// Direct usage
const numbers = [1, 2, 3, 4, 5];
const evens = Arr.filter(numbers, (n) => n % 2 === 0); // [2, 4]

// Type guard usage
const mixed: (string | number | null)[] = ['hello', 42, null, 'world'];
const strings = Arr.filter(mixed, (x): x is string => typeof x === 'string'); // string[]
const notNull = Arr.filter(mixed, (x): x is NonNullable<typeof x> => x != null); // (string | number)[]

// Curried usage with type guards
const isString = (x: unknown): x is string => typeof x === 'string';
const filterStrings = Arr.filter(isString);
const result = filterStrings(['a', 1, 'b', 2]); // string[]

// Functional composition
const processNumbers = pipe(
    Arr.filter((n: number) => n > 0),
    Arr.map((n) => n * 2),
);
```

##### See

- [filterNot](#filternot) for filtering with negated predicate
- [every](#every) for testing if all elements satisfy a predicate
- [some](#some) for testing if any elements satisfy a predicate
- [find](#find) for finding the first element that satisfies a predicate

#### Call Signature

> **filter**\<`E`\>(`predicate`): (`array`) => readonly `E`[]

Defined in: [src/array/array-utils.mts:3615](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3615)

Filters an array based on a predicate function.

This function returns a new array containing only the elements that satisfy the predicate.
It provides both direct usage and curried versions for functional composition.
Supports type guard predicates for type narrowing.

##### Type Parameters

###### E

`E`

The type of elements in the array.

##### Parameters

###### predicate

(`a`, `index`) => `boolean`

A function that tests each element. Returns `true` to keep the element, `false` to filter it out.

##### Returns

A new array containing only the elements that satisfy the predicate.

> (`array`): readonly `E`[]

###### Parameters

###### array

readonly `E`[]

###### Returns

readonly `E`[]

##### Example

```typescript
// Direct usage
const numbers = [1, 2, 3, 4, 5];
const evens = Arr.filter(numbers, (n) => n % 2 === 0); // [2, 4]

// Type guard usage
const mixed: (string | number | null)[] = ['hello', 42, null, 'world'];
const strings = Arr.filter(mixed, (x): x is string => typeof x === 'string'); // string[]
const notNull = Arr.filter(mixed, (x): x is NonNullable<typeof x> => x != null); // (string | number)[]

// Curried usage with type guards
const isString = (x: unknown): x is string => typeof x === 'string';
const filterStrings = Arr.filter(isString);
const result = filterStrings(['a', 1, 'b', 2]); // string[]

// Functional composition
const processNumbers = pipe(
    Arr.filter((n: number) => n > 0),
    Arr.map((n) => n * 2),
);
```

##### See

- [filterNot](#filternot) for filtering with negated predicate
- [every](#every) for testing if all elements satisfy a predicate
- [some](#some) for testing if any elements satisfy a predicate
- [find](#find) for finding the first element that satisfies a predicate

---

### filterNot()

#### Call Signature

> **filterNot**\<`Ar`\>(`array`, `predicate`): readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:3657](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3657)

Filters an array by excluding elements for which the predicate returns true.
This is the opposite of `Array.prototype.filter`.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

The input array.

###### predicate

(`a`, `index`) => `boolean`

A function `(a: A, index: number) => boolean` that returns `true` for elements to be excluded.

##### Returns

readonly `Ar`\[`number`\][]

A new array with elements for which the predicate returned `false`.

##### Example

```ts
// Regular usage
Arr.filterNot([1, 2, 3, 4], (x) => x % 2 === 0); // [1, 3] (excludes even numbers)

// Curried usage for pipe composition
const excludeEvens = Arr.filterNot((x: number) => x % 2 === 0);
const result = pipe([1, 2, 3, 4, 5, 6]).map(excludeEvens).value;
console.log(result); // [1, 3, 5]
```

#### Call Signature

> **filterNot**\<`E`\>(`predicate`): (`array`) => readonly `E`[]

Defined in: [src/array/array-utils.mts:3662](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3662)

Filters an array by excluding elements for which the predicate returns true.
This is the opposite of `Array.prototype.filter`.

##### Type Parameters

###### E

`E`

The type of elements in the array.

##### Parameters

###### predicate

(`a`, `index`) => `boolean`

A function `(a: A, index: number) => boolean` that returns `true` for elements to be excluded.

##### Returns

A new array with elements for which the predicate returned `false`.

> (`array`): readonly `E`[]

###### Parameters

###### array

readonly `E`[]

###### Returns

readonly `E`[]

##### Example

```ts
// Regular usage
Arr.filterNot([1, 2, 3, 4], (x) => x % 2 === 0); // [1, 3] (excludes even numbers)

// Curried usage for pipe composition
const excludeEvens = Arr.filterNot((x: number) => x % 2 === 0);
const result = pipe([1, 2, 3, 4, 5, 6]).map(excludeEvens).value;
console.log(result); // [1, 3, 5]
```

---

### find()

#### Call Signature

> **find**\<`E`, `F`\>(`array`, `predicate`): [`Optional`](../../../functional/optional/README.md#optional)\<`F`\>

Defined in: [src/array/array-utils.mts:2186](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2186)

Safely finds the first element in an array that satisfies a predicate function.

This function provides type-safe searching with no risk of runtime errors. It returns
the first element that matches the predicate wrapped in an Optional, or Optional.None
if no element is found. The predicate receives the element, its index, and the entire array.

**Curried Usage:** This function supports currying - when called with only a predicate,
it returns a function that can be applied to arrays, making it ideal for functional composition.

##### Type Parameters

###### E

`E`

The type of elements in the array.

###### F

`F`

##### Parameters

###### array

readonly `E`[]

The array to search through (when using direct call syntax).

###### predicate

(`value`, `index`, `arr`) => `value is F`

A function that tests each element. Called with:

- `value`: The current element being tested
- `index`: The index of the current element (branded as `SizeType.Arr`)
- `arr`: The entire array being searched

##### Returns

[`Optional`](../../../functional/optional/README.md#optional)\<`F`\>

An `Optional<E>` containing:

- `Optional.Some<E>` with the first matching element if found
- `Optional.None` if no element satisfies the predicate

##### Example

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

##### See

- [findIndex](#findindex) for finding the index instead of the element
- [indexOf](#indexof) for finding elements by equality
- [Optional](../../../functional/optional/README.md#optional) for working with the returned Optional values

#### Call Signature

> **find**\<`Ar`\>(`array`, `predicate`): [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

Defined in: [src/array/array-utils.mts:2191](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2191)

Safely finds the first element in an array that satisfies a predicate function.

This function provides type-safe searching with no risk of runtime errors. It returns
the first element that matches the predicate wrapped in an Optional, or Optional.None
if no element is found. The predicate receives the element, its index, and the entire array.

**Curried Usage:** This function supports currying - when called with only a predicate,
it returns a function that can be applied to arrays, making it ideal for functional composition.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

The array to search through (when using direct call syntax).

###### predicate

(`value`, `index`, `arr`) => `boolean`

A function that tests each element. Called with:

- `value`: The current element being tested
- `index`: The index of the current element (branded as `SizeType.Arr`)
- `arr`: The entire array being searched

##### Returns

[`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

An `Optional<E>` containing:

- `Optional.Some<E>` with the first matching element if found
- `Optional.None` if no element satisfies the predicate

##### Example

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

##### See

- [findIndex](#findindex) for finding the index instead of the element
- [indexOf](#indexof) for finding elements by equality
- [Optional](../../../functional/optional/README.md#optional) for working with the returned Optional values

#### Call Signature

> **find**\<`E`\>(`predicate`): (`array`) => [`Optional`](../../../functional/optional/README.md#optional)\<`E`\>

Defined in: [src/array/array-utils.mts:2196](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2196)

Safely finds the first element in an array that satisfies a predicate function.

This function provides type-safe searching with no risk of runtime errors. It returns
the first element that matches the predicate wrapped in an Optional, or Optional.None
if no element is found. The predicate receives the element, its index, and the entire array.

**Curried Usage:** This function supports currying - when called with only a predicate,
it returns a function that can be applied to arrays, making it ideal for functional composition.

##### Type Parameters

###### E

`E`

The type of elements in the array.

##### Parameters

###### predicate

(`value`, `index`, `arr`) => `boolean`

A function that tests each element. Called with:

- `value`: The current element being tested
- `index`: The index of the current element (branded as `SizeType.Arr`)
- `arr`: The entire array being searched

##### Returns

An `Optional<E>` containing:

- `Optional.Some<E>` with the first matching element if found
- `Optional.None` if no element satisfies the predicate

> (`array`): [`Optional`](../../../functional/optional/README.md#optional)\<`E`\>

###### Parameters

###### array

readonly `E`[]

###### Returns

[`Optional`](../../../functional/optional/README.md#optional)\<`E`\>

##### Example

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

##### See

- [findIndex](#findindex) for finding the index instead of the element
- [indexOf](#indexof) for finding elements by equality
- [Optional](../../../functional/optional/README.md#optional) for working with the returned Optional values

---

### findIndex()

#### Call Signature

> **findIndex**\<`Ar`\>(`array`, `predicate`): `-1` \| `ArrayIndex`\<`Ar`\>

Defined in: [src/array/array-utils.mts:2454](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2454)

Safely finds the index of the first element in an array that satisfies a predicate function.

This function provides type-safe index searching with no risk of runtime errors. It returns
the index of the first element that matches the predicate wrapped in an Optional, or Optional.None
if no element is found. The returned index is branded as `SizeType.Arr` for type safety.

**Curried Usage:** This function supports currying - when called with only a predicate,
it returns a function that can be applied to arrays, making it ideal for functional composition.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

The array to search through (when using direct call syntax).

###### predicate

(`value`, `index`, `arr`) => `boolean`

A function that tests each element. Called with:

- `value`: The current element being tested
- `index`: The index of the current element (branded as `SizeType.Arr`)

##### Returns

`-1` \| `ArrayIndex`\<`Ar`\>

An `Optional<SizeType.Arr>` containing:

- `Optional.Some<SizeType.Arr>` with the index of the first matching element if found
- `Optional.None` if no element satisfies the predicate

##### Example

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

##### See

- [find](#find) for finding the element instead of its index
- [indexOf](#indexof) for finding elements by equality (not predicate)
- [lastIndexOf](#lastindexof) for finding the last occurrence
- [Optional](../../../functional/optional/README.md#optional) for working with the returned Optional values

#### Call Signature

> **findIndex**\<`E`\>(`predicate`): (`array`) => `-1` \| `Uint32`

Defined in: [src/array/array-utils.mts:2459](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2459)

Safely finds the index of the first element in an array that satisfies a predicate function.

This function provides type-safe index searching with no risk of runtime errors. It returns
the index of the first element that matches the predicate wrapped in an Optional, or Optional.None
if no element is found. The returned index is branded as `SizeType.Arr` for type safety.

**Curried Usage:** This function supports currying - when called with only a predicate,
it returns a function that can be applied to arrays, making it ideal for functional composition.

##### Type Parameters

###### E

`E`

The type of elements in the array.

##### Parameters

###### predicate

(`value`, `index`, `arr`) => `boolean`

A function that tests each element. Called with:

- `value`: The current element being tested
- `index`: The index of the current element (branded as `SizeType.Arr`)

##### Returns

An `Optional<SizeType.Arr>` containing:

- `Optional.Some<SizeType.Arr>` with the index of the first matching element if found
- `Optional.None` if no element satisfies the predicate

> (`array`): `-1` \| `Uint32`

###### Parameters

###### array

readonly `E`[]

###### Returns

`-1` \| `Uint32`

##### Example

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

##### See

- [find](#find) for finding the element instead of its index
- [indexOf](#indexof) for finding elements by equality (not predicate)
- [lastIndexOf](#lastindexof) for finding the last occurrence
- [Optional](../../../functional/optional/README.md#optional) for working with the returned Optional values

---

### findLast()

#### Call Signature

> **findLast**\<`E`, `F`\>(`array`, `predicate`): [`Optional`](../../../functional/optional/README.md#optional)\<`F`\>

Defined in: [src/array/array-utils.mts:2281](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2281)

Returns the last element in an array that satisfies a predicate function.

This function searches from the end of the array and returns an Optional containing
the first element found that satisfies the predicate, or None if no such element exists.

##### Type Parameters

###### E

`E`

The type of elements in the array.

###### F

`F`

##### Parameters

###### array

readonly `E`[]

The array to search.

###### predicate

(`value`, `index`, `arr`) => `value is F`

A function that tests each element.

##### Returns

[`Optional`](../../../functional/optional/README.md#optional)\<`F`\>

An Optional containing the found element, or None if no element satisfies the predicate.

##### Example

```typescript
// Direct usage
const numbers = [1, 2, 3, 4, 5];
const lastEven = Arr.findLast(numbers, (n) => n % 2 === 0); // Optional.some(4)

// Curried usage
const isPositive = (n: number) => n > 0;
const findLastPositive = Arr.findLast(isPositive);
const result = findLastPositive([-1, 2, -3, 4]); // Optional.some(4)

// No match
const noMatch = Arr.findLast([1, 3, 5], (n) => n % 2 === 0); // Optional.none
```

#### Call Signature

> **findLast**\<`Ar`\>(`array`, `predicate`): [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

Defined in: [src/array/array-utils.mts:2286](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2286)

Returns the last element in an array that satisfies a predicate function.

This function searches from the end of the array and returns an Optional containing
the first element found that satisfies the predicate, or None if no such element exists.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

The exact type of the input array.

##### Parameters

###### array

`Ar`

The array to search.

###### predicate

(`value`, `index`, `arr`) => `boolean`

A function that tests each element.

##### Returns

[`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

An Optional containing the found element, or None if no element satisfies the predicate.

##### Example

```typescript
// Direct usage
const numbers = [1, 2, 3, 4, 5];
const lastEven = Arr.findLast(numbers, (n) => n % 2 === 0); // Optional.some(4)

// Curried usage
const isPositive = (n: number) => n > 0;
const findLastPositive = Arr.findLast(isPositive);
const result = findLastPositive([-1, 2, -3, 4]); // Optional.some(4)

// No match
const noMatch = Arr.findLast([1, 3, 5], (n) => n % 2 === 0); // Optional.none
```

#### Call Signature

> **findLast**\<`E`\>(`predicate`): (`array`) => [`Optional`](../../../functional/optional/README.md#optional)\<`E`\>

Defined in: [src/array/array-utils.mts:2291](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2291)

Returns the last element in an array that satisfies a predicate function.

This function searches from the end of the array and returns an Optional containing
the first element found that satisfies the predicate, or None if no such element exists.

##### Type Parameters

###### E

`E`

The type of elements in the array.

##### Parameters

###### predicate

(`value`, `index`, `arr`) => `boolean`

A function that tests each element.

##### Returns

An Optional containing the found element, or None if no element satisfies the predicate.

> (`array`): [`Optional`](../../../functional/optional/README.md#optional)\<`E`\>

###### Parameters

###### array

readonly `E`[]

###### Returns

[`Optional`](../../../functional/optional/README.md#optional)\<`E`\>

##### Example

```typescript
// Direct usage
const numbers = [1, 2, 3, 4, 5];
const lastEven = Arr.findLast(numbers, (n) => n % 2 === 0); // Optional.some(4)

// Curried usage
const isPositive = (n: number) => n > 0;
const findLastPositive = Arr.findLast(isPositive);
const result = findLastPositive([-1, 2, -3, 4]); // Optional.some(4)

// No match
const noMatch = Arr.findLast([1, 3, 5], (n) => n % 2 === 0); // Optional.none
```

---

### findLastIndex()

#### Call Signature

> **findLastIndex**\<`Ar`\>(`array`, `predicate`): `-1` \| `ArrayIndex`\<`Ar`\>

Defined in: [src/array/array-utils.mts:2588](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2588)

Safely finds the index of the last element in an array that satisfies a predicate function.

This function provides type-safe index searching with no risk of runtime errors. It searches
from the end of the array backwards and returns the index of the last element that matches
the predicate, or -1 if no element is found. The returned index is branded as `SizeType.Arr`
for type safety.

**Curried Usage:** This function supports currying - when called with only a predicate,
it returns a function that can be applied to arrays, making it ideal for functional composition.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

The exact type of the input array, used for precise return type inference.

##### Parameters

###### array

`Ar`

The array to search through (when using direct call syntax).

###### predicate

(`value`, `index`, `arr`) => `boolean`

A function that tests each element. Called with:

- `value`: The current element being tested
- `index`: The index of the current element (branded as `SizeType.Arr`)
- `arr`: The array being searched

##### Returns

`-1` \| `ArrayIndex`\<`Ar`\>

The index of the last matching element as `SizeType.Arr`, or -1 if no element satisfies the predicate.

##### Example

```typescript
// Basic last index finding
const fruits = ['apple', 'banana', 'cherry', 'banana'];
const lastBananaIndex = Arr.findLastIndex(
    fruits,
    (fruit) => fruit === 'banana',
);
console.log(lastBananaIndex); // 3 - index of last 'banana'

// Finding with complex conditions
const numbers = [1, 5, 10, 15, 20, 10, 5];
const lastLargeIndex = Arr.findLastIndex(
    numbers,
    (value, index) => value > 8 && index < 5,
);
console.log(lastLargeIndex); // 3 - index of last value > 8 before index 5 (15)

// Finding objects by property
const users = [
    { id: 1, active: true },
    { id: 2, active: false },
    { id: 3, active: true },
    { id: 4, active: false },
];

const lastActiveIndex = Arr.findLastIndex(users, (user) => user.active);
console.log(lastActiveIndex); // 2 - index of last active user

const lastInactiveIndex = Arr.findLastIndex(users, (user) => !user.active);
console.log(lastInactiveIndex); // 3 - index of last inactive user

// Empty array handling
const emptyResult = Arr.findLastIndex([], (x: number) => x > 0); // -1

// Curried usage for functional composition
const findLastNegativeIndex = Arr.findLastIndex((x: number) => x < 0);
const findLastLongStringIndex = Arr.findLastIndex((s: string) => s.length > 5);

const datasets = [
    [1, 2, -3, 4, -5], // last negative at index 4
    [5, 6, 7, 8], // no negative
    [-1, 0, 1, -2], // last negative at index 3
];

const lastNegativeIndices = datasets.map(findLastNegativeIndex);
// [4, -1, 3]

// Functional composition
const data = [
    'short',
    'medium',
    'very long string',
    'tiny',
    'another long one',
];
const lastLongIndex = Arr.findLastIndex(data, (s) => s.length > 8);
console.log(lastLongIndex); // 4 - index of 'another long one'

// Using with pipe
const result = pipe(['a', 'bb', 'ccc', 'bb']).map(
    Arr.findLastIndex((s: string) => s.length === 2),
).value; // 3 (last occurrence of 'bb')

// Comparing with findIndex
const values = [1, 2, 3, 2, 4];
const firstTwo = Arr.findIndex(values, (x) => x === 2); // 1
const lastTwo = Arr.findLastIndex(values, (x) => x === 2); // 3

// Type safety with tuples
const tuple = [10, 20, 30, 20] as const;
const lastTwentyIndex = Arr.findLastIndex(tuple, (x) => x === 20);
// Type: ArrayIndex<readonly [10, 20, 30, 20]> | -1
// Value: 3
```

##### See

- [findLast](#findlast) for finding the element instead of its index
- [findIndex](#findindex) for finding the first occurrence
- [lastIndexOf](#lastindexof) for finding elements by equality (not predicate)

#### Call Signature

> **findLastIndex**\<`E`\>(`predicate`): (`array`) => `-1` \| `Uint32`

Defined in: [src/array/array-utils.mts:2593](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2593)

Safely finds the index of the last element in an array that satisfies a predicate function.

This function provides type-safe index searching with no risk of runtime errors. It searches
from the end of the array backwards and returns the index of the last element that matches
the predicate, or -1 if no element is found. The returned index is branded as `SizeType.Arr`
for type safety.

**Curried Usage:** This function supports currying - when called with only a predicate,
it returns a function that can be applied to arrays, making it ideal for functional composition.

##### Type Parameters

###### E

`E`

The type of elements in the array.

##### Parameters

###### predicate

(`value`, `index`, `arr`) => `boolean`

A function that tests each element. Called with:

- `value`: The current element being tested
- `index`: The index of the current element (branded as `SizeType.Arr`)
- `arr`: The array being searched

##### Returns

The index of the last matching element as `SizeType.Arr`, or -1 if no element satisfies the predicate.

> (`array`): `-1` \| `Uint32`

###### Parameters

###### array

readonly `E`[]

###### Returns

`-1` \| `Uint32`

##### Example

```typescript
// Basic last index finding
const fruits = ['apple', 'banana', 'cherry', 'banana'];
const lastBananaIndex = Arr.findLastIndex(
    fruits,
    (fruit) => fruit === 'banana',
);
console.log(lastBananaIndex); // 3 - index of last 'banana'

// Finding with complex conditions
const numbers = [1, 5, 10, 15, 20, 10, 5];
const lastLargeIndex = Arr.findLastIndex(
    numbers,
    (value, index) => value > 8 && index < 5,
);
console.log(lastLargeIndex); // 3 - index of last value > 8 before index 5 (15)

// Finding objects by property
const users = [
    { id: 1, active: true },
    { id: 2, active: false },
    { id: 3, active: true },
    { id: 4, active: false },
];

const lastActiveIndex = Arr.findLastIndex(users, (user) => user.active);
console.log(lastActiveIndex); // 2 - index of last active user

const lastInactiveIndex = Arr.findLastIndex(users, (user) => !user.active);
console.log(lastInactiveIndex); // 3 - index of last inactive user

// Empty array handling
const emptyResult = Arr.findLastIndex([], (x: number) => x > 0); // -1

// Curried usage for functional composition
const findLastNegativeIndex = Arr.findLastIndex((x: number) => x < 0);
const findLastLongStringIndex = Arr.findLastIndex((s: string) => s.length > 5);

const datasets = [
    [1, 2, -3, 4, -5], // last negative at index 4
    [5, 6, 7, 8], // no negative
    [-1, 0, 1, -2], // last negative at index 3
];

const lastNegativeIndices = datasets.map(findLastNegativeIndex);
// [4, -1, 3]

// Functional composition
const data = [
    'short',
    'medium',
    'very long string',
    'tiny',
    'another long one',
];
const lastLongIndex = Arr.findLastIndex(data, (s) => s.length > 8);
console.log(lastLongIndex); // 4 - index of 'another long one'

// Using with pipe
const result = pipe(['a', 'bb', 'ccc', 'bb']).map(
    Arr.findLastIndex((s: string) => s.length === 2),
).value; // 3 (last occurrence of 'bb')

// Comparing with findIndex
const values = [1, 2, 3, 2, 4];
const firstTwo = Arr.findIndex(values, (x) => x === 2); // 1
const lastTwo = Arr.findLastIndex(values, (x) => x === 2); // 3

// Type safety with tuples
const tuple = [10, 20, 30, 20] as const;
const lastTwentyIndex = Arr.findLastIndex(tuple, (x) => x === 20);
// Type: ArrayIndex<readonly [10, 20, 30, 20]> | -1
// Value: 3
```

##### See

- [findLast](#findlast) for finding the element instead of its index
- [findIndex](#findindex) for finding the first occurrence
- [lastIndexOf](#lastindexof) for finding elements by equality (not predicate)

---

### flat()

#### Call Signature

> **flat**\<`Ar`, `D`\>(`array`, `depth?`): readonly `FlatArray`\<`Ar`, `D`\>[]

Defined in: [src/array/array-utils.mts:3714](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3714)

Creates a new array with all sub-array elements concatenated into it recursively up to the specified depth.

This function flattens nested arrays to the specified depth level.
A depth of 1 flattens one level, Number.POSITIVE_INFINITY flattens all levels.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

The exact type of the input array.

###### D

`D` _extends_ `SafeUintWithSmallInt` = `1`

The depth of flattening.

##### Parameters

###### array

`Ar`

The array to flatten.

###### depth?

`D`

The depth level specifying how deep a nested array structure should be flattened.

##### Returns

readonly `FlatArray`\<`Ar`, `D`\>[]

A new array with the sub-array elements concatenated.

##### Example

```typescript
// Direct usage
const nested = [1, [2, [3, 4]], 5];
const flat1 = Arr.flat(nested, 1); // [1, 2, [3, 4], 5]
const flat2 = Arr.flat(nested, 2); // [1, 2, 3, 4, 5]

// Curried usage
const flattenOnceLevel = Arr.flat(1);
const result = flattenOnceLevel([
    [1, 2],
    [3, 4],
]); // [1, 2, 3, 4]

// Flatten all levels
const deepNested = [1, [2, [3, [4, 5]]]];
const allFlat = Arr.flat(deepNested, SafeUint.MAX_VALUE); // [1, 2, 3, 4, 5]
```

#### Call Signature

> **flat**\<`D`\>(`depth?`): \<`Ar`\>(`array`) => readonly `FlatArray`\<`Ar`, `D`\>[]

Defined in: [src/array/array-utils.mts:3719](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3719)

Creates a new array with all sub-array elements concatenated into it recursively up to the specified depth.

This function flattens nested arrays to the specified depth level.
A depth of 1 flattens one level, Number.POSITIVE_INFINITY flattens all levels.

##### Type Parameters

###### D

`D` _extends_ `SafeUintWithSmallInt` = `1`

The depth of flattening.

##### Parameters

###### depth?

`number`

The depth level specifying how deep a nested array structure should be flattened.

##### Returns

A new array with the sub-array elements concatenated.

> \<`Ar`\>(`array`): readonly `FlatArray`\<`Ar`, `D`\>[]

###### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### Parameters

###### array

`Ar`

###### Returns

readonly `FlatArray`\<`Ar`, `D`\>[]

##### Example

```typescript
// Direct usage
const nested = [1, [2, [3, 4]], 5];
const flat1 = Arr.flat(nested, 1); // [1, 2, [3, 4], 5]
const flat2 = Arr.flat(nested, 2); // [1, 2, 3, 4, 5]

// Curried usage
const flattenOnceLevel = Arr.flat(1);
const result = flattenOnceLevel([
    [1, 2],
    [3, 4],
]); // [1, 2, 3, 4]

// Flatten all levels
const deepNested = [1, [2, [3, [4, 5]]]];
const allFlat = Arr.flat(deepNested, SafeUint.MAX_VALUE); // [1, 2, 3, 4, 5]
```

---

### flatMap()

#### Call Signature

> **flatMap**\<`Ar`, `B`\>(`array`, `mapFn`): readonly `B`[]

Defined in: [src/array/array-utils.mts:3777](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3777)

Creates a new array with all sub-array elements concatenated into it recursively up to the specified depth,
after first mapping each element using a mapping function.

This function is equivalent to calling `map` followed by `flat` with depth 1.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

The exact type of the input array.

###### B

`B`

The type of elements returned by the mapping function.

##### Parameters

###### array

`Ar`

The array to map and flatten.

###### mapFn

(`a`, `index`) => readonly `B`[]

A function that produces new elements for the new array.

##### Returns

readonly `B`[]

A new array with mapped elements flattened.

##### Example

```typescript
// Direct usage
const words = ['hello', 'world'];
const chars = Arr.flatMap(words, (word) => word.split('')); // ['h','e','l','l','o','w','o','r','l','d']

// Curried usage
const splitWords = Arr.flatMap((word: string) => word.split(''));
const result = splitWords(['foo', 'bar']); // ['f','o','o','b','a','r']

// With numbers
const numbers = [1, 2, 3];
const doubled = Arr.flatMap(numbers, (n) => [n, n * 2]); // [1, 2, 2, 4, 3, 6]
```

#### Call Signature

> **flatMap**\<`A`, `B`\>(`mapFn`): (`array`) => readonly `B`[]

Defined in: [src/array/array-utils.mts:3782](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3782)

Creates a new array with all sub-array elements concatenated into it recursively up to the specified depth,
after first mapping each element using a mapping function.

This function is equivalent to calling `map` followed by `flat` with depth 1.

##### Type Parameters

###### A

`A`

###### B

`B`

The type of elements returned by the mapping function.

##### Parameters

###### mapFn

(`a`, `index`) => readonly `B`[]

A function that produces new elements for the new array.

##### Returns

A new array with mapped elements flattened.

> (`array`): readonly `B`[]

###### Parameters

###### array

readonly `A`[]

###### Returns

readonly `B`[]

##### Example

```typescript
// Direct usage
const words = ['hello', 'world'];
const chars = Arr.flatMap(words, (word) => word.split('')); // ['h','e','l','l','o','w','o','r','l','d']

// Curried usage
const splitWords = Arr.flatMap((word: string) => word.split(''));
const result = splitWords(['foo', 'bar']); // ['f','o','o','b','a','r']

// With numbers
const numbers = [1, 2, 3];
const doubled = Arr.flatMap(numbers, (n) => [n, n * 2]); // [1, 2, 2, 4, 3, 6]
```

---

### foldl()

#### Call Signature

> **foldl**\<`Ar`, `P`\>(`array`, `callbackfn`, `initialValue`): `P`

Defined in: [src/array/array-utils.mts:2952](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2952)

Applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value.
This is an alias for `Array.prototype.reduce`.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### P

`P`

##### Parameters

###### array

`Ar`

The input array.

###### callbackfn

(`previousValue`, `currentValue`, `currentIndex`) => `P`

A function to execute on each element in the array: `(previousValue: S, currentValue: A, currentIndex: SizeType.Arr) => S`.

###### initialValue

`P`

The initial value of the accumulator.

##### Returns

`P`

The single value that results from the reduction.

##### Example

```ts
Arr.foldl([1, 2, 3], (sum, n) => sum + n, 0); // 6
Arr.foldl(['a', 'b', 'c'], (acc, str) => acc + str.toUpperCase(), ''); // 'ABC'
```

#### Call Signature

> **foldl**\<`E`, `P`\>(`callbackfn`, `initialValue`): (`array`) => `P`

Defined in: [src/array/array-utils.mts:2962](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2962)

Applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value.
This is an alias for `Array.prototype.reduce`.

##### Type Parameters

###### E

`E`

The type of elements in the array.

###### P

`P`

##### Parameters

###### callbackfn

(`previousValue`, `currentValue`, `currentIndex`) => `P`

A function to execute on each element in the array: `(previousValue: S, currentValue: A, currentIndex: SizeType.Arr) => S`.

###### initialValue

`P`

The initial value of the accumulator.

##### Returns

The single value that results from the reduction.

> (`array`): `P`

###### Parameters

###### array

readonly `E`[]

###### Returns

`P`

##### Example

```ts
Arr.foldl([1, 2, 3], (sum, n) => sum + n, 0); // 6
Arr.foldl(['a', 'b', 'c'], (acc, str) => acc + str.toUpperCase(), ''); // 'ABC'
```

---

### foldr()

#### Call Signature

> **foldr**\<`Ar`, `P`\>(`array`, `callbackfn`, `initialValue`): `P`

Defined in: [src/array/array-utils.mts:3026](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3026)

Applies a function against an accumulator and each element in the array (from right to left) to reduce it to a single value.
This is an alias for `Array.prototype.reduceRight`.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### P

`P`

##### Parameters

###### array

`Ar`

The input array.

###### callbackfn

(`previousValue`, `currentValue`, `currentIndex`) => `P`

A function to execute on each element in the array: `(previousValue: S, currentValue: A, currentIndex: SizeType.Arr) => S`.

###### initialValue

`P`

The initial value of the accumulator.

##### Returns

`P`

The single value that results from the reduction.

##### Example

```ts
// Regular usage
Arr.foldr([1, 2, 3], (sum, n) => sum + n, 0); // 6

// Curried usage for pipe composition
const concatRight = Arr.foldr((acc: string, curr: string) => curr + acc, '');
const result = pipe(['a', 'b', 'c']).map(concatRight).value;
console.log(result); // "abc"
```

#### Call Signature

> **foldr**\<`E`, `P`\>(`callbackfn`, `initialValue`): (`array`) => `P`

Defined in: [src/array/array-utils.mts:3036](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3036)

Applies a function against an accumulator and each element in the array (from right to left) to reduce it to a single value.
This is an alias for `Array.prototype.reduceRight`.

##### Type Parameters

###### E

`E`

The type of elements in the array.

###### P

`P`

##### Parameters

###### callbackfn

(`previousValue`, `currentValue`, `currentIndex`) => `P`

A function to execute on each element in the array: `(previousValue: S, currentValue: A, currentIndex: SizeType.Arr) => S`.

###### initialValue

`P`

The initial value of the accumulator.

##### Returns

The single value that results from the reduction.

> (`array`): `P`

###### Parameters

###### array

readonly `E`[]

###### Returns

`P`

##### Example

```ts
// Regular usage
Arr.foldr([1, 2, 3], (sum, n) => sum + n, 0); // 6

// Curried usage for pipe composition
const concatRight = Arr.foldr((acc: string, curr: string) => curr + acc, '');
const result = pipe(['a', 'b', 'c']).map(concatRight).value;
console.log(result); // "abc"
```

---

### generate()

> **generate**\<`T`\>(`generatorFn`): readonly `T`[]

Defined in: [src/array/array-utils.mts:568](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L568)

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

### groupBy()

#### Call Signature

> **groupBy**\<`Ar`, `G`\>(`array`, `grouper`): [`IMap`](../../../collections/imap/README.md#imap)\<`G`, readonly `Ar`\[`number`\][]\>

Defined in: [src/array/array-utils.mts:4370](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4370)

Groups elements of an array by a key derived from each element, returning an immutable [IMap](../../../collections/imap/README.md#imap).

This function categorizes array elements into groups based on a computed key, using the efficient
[IMap](../../../collections/imap/README.md#imap) data structure for the result. The grouper function receives both the element and its
index, enabling flexible grouping strategies.

**MapSetKeyType Constraint:** The group key type `G` must extend [MapSetKeyType](../../../globals/README.md#mapsetkeytype), which includes
primitive types that can be used as Map keys (string, number, boolean, symbol, null, undefined).
This constraint ensures type safety and efficient key-based operations.

**IMap Return Type:** Returns an [IMap](../../../collections/imap/README.md#imap)<G, readonly E[]> where:

- Keys are the computed group identifiers of type `G`
- Values are immutable arrays containing all elements that belong to each group
- Preserves insertion order of first occurrence of each group
- Maintains type safety with precise generic types

**Curried Usage:** Supports currying for functional composition - when called with only the grouper
function, returns a reusable function that can be applied to arrays.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### G

`G` _extends_ `Primitive`

The type of the group key, constrained to [MapSetKeyType](../../../globals/README.md#mapsetkeytype) (primitives usable as Map keys).
Must be one of: `string | number | boolean | symbol | null | undefined`

##### Parameters

###### array

`Ar`

The input array to group. Can be empty (returns empty [IMap](../../../collections/imap/README.md#imap)).

###### grouper

(`value`, `index`) => `G`

A function `(value: E, index: SizeType.Arr) => G` that computes the group key for each element.

- **value:** The current array element
- **index:** The 0-based index of the element (typed as [SizeType.Arr](../../../globals/namespaces/SizeType.md#arr))
- **returns:** The group key (must be [MapSetKeyType](../../../globals/README.md#mapsetkeytype))

##### Returns

[`IMap`](../../../collections/imap/README.md#imap)\<`G`, readonly `Ar`\[`number`\][]\>

An [IMap](../../../collections/imap/README.md#imap)<G, readonly E[]> where:

- Keys are unique group identifiers computed by the grouper function
- Values are immutable arrays of elements belonging to each group
- Empty groups are not included (only groups with at least one element)
- Insertion order is preserved based on first occurrence of each group key

##### Example

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

##### See

- [IMap](../../../collections/imap/README.md#imap) for working with the returned immutable map
- [MapSetKeyType](../../../globals/README.md#mapsetkeytype) for understanding valid key types
- IMap.get for safely accessing grouped results
- IMap.map for transforming grouped data
- [Optional](../../../functional/optional/README.md#optional) for handling potentially missing groups

#### Call Signature

> **groupBy**\<`E`, `G`\>(`grouper`): (`array`) => [`IMap`](../../../collections/imap/README.md#imap)\<`G`, readonly `E`[]\>

Defined in: [src/array/array-utils.mts:4378](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4378)

Groups elements of an array by a key derived from each element, returning an immutable [IMap](../../../collections/imap/README.md#imap).

This function categorizes array elements into groups based on a computed key, using the efficient
[IMap](../../../collections/imap/README.md#imap) data structure for the result. The grouper function receives both the element and its
index, enabling flexible grouping strategies.

**MapSetKeyType Constraint:** The group key type `G` must extend [MapSetKeyType](../../../globals/README.md#mapsetkeytype), which includes
primitive types that can be used as Map keys (string, number, boolean, symbol, null, undefined).
This constraint ensures type safety and efficient key-based operations.

**IMap Return Type:** Returns an [IMap](../../../collections/imap/README.md#imap)<G, readonly E[]> where:

- Keys are the computed group identifiers of type `G`
- Values are immutable arrays containing all elements that belong to each group
- Preserves insertion order of first occurrence of each group
- Maintains type safety with precise generic types

**Curried Usage:** Supports currying for functional composition - when called with only the grouper
function, returns a reusable function that can be applied to arrays.

##### Type Parameters

###### E

`E`

The type of elements in the input array.

###### G

`G` _extends_ `Primitive`

The type of the group key, constrained to [MapSetKeyType](../../../globals/README.md#mapsetkeytype) (primitives usable as Map keys).
Must be one of: `string | number | boolean | symbol | null | undefined`

##### Parameters

###### grouper

(`value`, `index`) => `G`

A function `(value: E, index: SizeType.Arr) => G` that computes the group key for each element.

- **value:** The current array element
- **index:** The 0-based index of the element (typed as [SizeType.Arr](../../../globals/namespaces/SizeType.md#arr))
- **returns:** The group key (must be [MapSetKeyType](../../../globals/README.md#mapsetkeytype))

##### Returns

An [IMap](../../../collections/imap/README.md#imap)<G, readonly E[]> where:

- Keys are unique group identifiers computed by the grouper function
- Values are immutable arrays of elements belonging to each group
- Empty groups are not included (only groups with at least one element)
- Insertion order is preserved based on first occurrence of each group key

> (`array`): [`IMap`](../../../collections/imap/README.md#imap)\<`G`, readonly `E`[]\>

###### Parameters

###### array

readonly `E`[]

###### Returns

[`IMap`](../../../collections/imap/README.md#imap)\<`G`, readonly `E`[]\>

##### Example

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

##### See

- [IMap](../../../collections/imap/README.md#imap) for working with the returned immutable map
- [MapSetKeyType](../../../globals/README.md#mapsetkeytype) for understanding valid key types
- IMap.get for safely accessing grouped results
- IMap.map for transforming grouped data
- [Optional](../../../functional/optional/README.md#optional) for handling potentially missing groups

---

### head()

> **head**\<`Ar`\>(`array`): `Ar` _extends_ readonly \[\] ? `Readonly`\<\{ \}\> : `Ar` _extends_ readonly \[`E`, `unknown`\] ? `Readonly`\<\{ `value`: `E`; \}\> : `Ar` _extends_ readonly \[`E`, `E`\] ? `Readonly`\<\{ `value`: `E`; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

Defined in: [src/array/array-utils.mts:1004](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1004)

Returns the first element of an array wrapped in an Optional.

This function provides type-safe access to the first element with precise return types:

- For empty arrays: returns `Optional.None`
- For tuples with known first element: returns `Optional.Some<FirstElementType>`
- For non-empty arrays: returns `Optional.Some<ElementType>`
- For general arrays: returns `Optional<ElementType>`

The function leverages TypeScript's type system to provide the most precise return type
based on the input array type, making it safer than direct indexing.

#### Type Parameters

##### Ar

`Ar` _extends_ readonly `unknown`[]

#### Parameters

##### array

`Ar`

The array to get the first element from.

#### Returns

`Ar` _extends_ readonly \[\] ? `Readonly`\<\{ \}\> : `Ar` _extends_ readonly \[`E`, `unknown`\] ? `Readonly`\<\{ `value`: `E`; \}\> : `Ar` _extends_ readonly \[`E`, `E`\] ? `Readonly`\<\{ `value`: `E`; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

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

### indexIsInRange()

> **indexIsInRange**\<`E`\>(`array`, `index`): `boolean`

Defined in: [src/array/array-utils.mts:374](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L374)

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

[`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

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

### indexOf()

#### Call Signature

> **indexOf**\<`Ar`\>(`array`, `searchElement`): `-1` \| `ArrayIndex`\<`Ar`\>

Defined in: [src/array/array-utils.mts:2653](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2653)

Gets the index of a value in an array.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

The array to search.

###### searchElement

`Ar`\[`number`\]

The element to search for.

##### Returns

`-1` \| `ArrayIndex`\<`Ar`\>

The index if found, -1 otherwise.

##### Example

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

#### Call Signature

> **indexOf**\<`E`\>(`searchElement`): (`array`) => `-1` \| `Uint32`

Defined in: [src/array/array-utils.mts:2658](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2658)

Gets the index of a value in an array.

##### Type Parameters

###### E

`E`

##### Parameters

###### searchElement

`E`

The element to search for.

##### Returns

The index if found, -1 otherwise.

> (`array`): `-1` \| `Uint32`

###### Parameters

###### array

readonly `E`[]

###### Returns

`-1` \| `Uint32`

##### Example

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

### indexOfFrom()

#### Call Signature

> **indexOfFrom**\<`Ar`\>(`array`, `searchElement`, `fromIndex`): `-1` \| `ArrayIndex`\<`Ar`\>

Defined in: [src/array/array-utils.mts:2681](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2681)

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

###### searchElement

`Ar`\[`number`\]

###### fromIndex

`ArgArrayIndexWithNegative`\<`Ar`\>

##### Returns

`-1` \| `ArrayIndex`\<`Ar`\>

#### Call Signature

> **indexOfFrom**\<`E`\>(`searchElement`, `fromIndex`): (`array`) => `-1` \| `Uint32`

Defined in: [src/array/array-utils.mts:2687](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2687)

##### Type Parameters

###### E

`E`

##### Parameters

###### searchElement

`E`

###### fromIndex

[`ArgArrWithNegative`](../../../globals/namespaces/SizeType.md#argarrwithnegative)

##### Returns

> (`array`): `-1` \| `Uint32`

###### Parameters

###### array

readonly `E`[]

###### Returns

`-1` \| `Uint32`

---

### indices()

> **indices**\<`E`\>(`array`): `ArrayIterator`\<`Uint32`\>

Defined in: [src/array/array-utils.mts:4735](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4735)

Returns an iterable of keys in the array.

This function returns an array of branded indices (`SizeType.Arr`) for type safety.

#### Type Parameters

##### E

`E`

#### Parameters

##### array

readonly `E`[]

The array to get indices from.

#### Returns

`ArrayIterator`\<`Uint32`\>

An array of indices.

#### Example

```typescript
// Direct usage
const fruits = ['apple', 'banana', 'cherry'];
const indices = Arr.indices(fruits); // [0, 1, 2]

// Curried usage
const getIndices = Arr.indices;
const result = getIndices(['a', 'b']); // [0, 1]

// Empty array
const empty: string[] = [];
const emptyIndices = Arr.indices(empty); // []
```

---

### isArray()

> **isArray**\<`E`\>(`value`): `value is FilterArray<E>`

Defined in: [src/array/array-utils.mts:140](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L140)

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

Defined in: [src/array/array-utils.mts:354](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L354)

Checks if an array has at least a specific length.

#### Type Parameters

##### E

`E`

The type of elements in the array.

##### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

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

Defined in: [src/array/array-utils.mts:333](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L333)

Checks if an array has a specific length.

#### Type Parameters

##### E

`E`

The type of elements in the array.

##### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

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

Defined in: [src/array/array-utils.mts:201](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L201)

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
        // arr[0]; // type error!
        return 0;
    }
}

// Early returns
function sumArray(numbers: readonly number[]): number {
    if (Arr.isEmpty(numbers)) {
        return 0; // Handle empty case early
    }
    return numbers.reduce((sum, n) => sum + n, 0);
}
```

#### See

- [isNonEmpty](#isnonempty) for the opposite check (non-empty arrays)
- [size](#size) for getting the exact length
- [isArrayOfLength](#isarrayoflength) for checking specific lengths

---

### isNonEmpty()

> **isNonEmpty**\<`E`\>(`array`): `array is readonly [E, E]`

Defined in: [src/array/array-utils.mts:313](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L313)

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
    if (!Arr.isNonEmpty(data)) return; // early return pattern

    // This is now safe without undefined checks
    const first = data[0];

    // Can safely use non-empty array methods
    const lastElement = Arr.last(data);
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
    return Arr.sum(numbers) / Arr.size(numbers);
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

Defined in: [src/array/array-utils.mts:4523](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4523)

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

Defined in: [src/array/array-utils.mts:4549](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4549)

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

### join()

#### Call Signature

> **join**\<`E`\>(`array`, `separator?`): [`Result`](../../../functional/result/README.md#result)\<`string`, `Error`\>

Defined in: [src/array/array-utils.mts:3422](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3422)

Joins array elements into a string.

##### Type Parameters

###### E

`E`

##### Parameters

###### array

readonly `E`[]

The array to join.

###### separator?

`string`

The separator string.

##### Returns

[`Result`](../../../functional/result/README.md#result)\<`string`, `Error`\>

Result.Ok with the joined string, Result.Err if the operation throws.

##### Example

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

#### Call Signature

> **join**(`separator?`): \<`E`\>(`array`) => [`Result`](../../../functional/result/README.md#result)\<`string`, `Error`\>

Defined in: [src/array/array-utils.mts:3427](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3427)

Joins array elements into a string.

##### Parameters

###### separator?

`string`

The separator string.

##### Returns

Result.Ok with the joined string, Result.Err if the operation throws.

> \<`E`\>(`array`): [`Result`](../../../functional/result/README.md#result)\<`string`, `Error`\>

###### Type Parameters

###### E

`E`

###### Parameters

###### array

readonly `E`[]

###### Returns

[`Result`](../../../functional/result/README.md#result)\<`string`, `Error`\>

##### Example

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

### last()

> **last**\<`Ar`\>(`array`): `Ar` _extends_ readonly \[\] ? `Readonly`\<\{ \}\> : `Ar` _extends_ readonly \[`unknown`, `E`\] ? `Readonly`\<\{ `value`: `E`; \}\> : `Ar` _extends_ readonly \[`E`, `E`\] ? `Readonly`\<\{ `value`: `E`; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

Defined in: [src/array/array-utils.mts:1096](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1096)

Returns the last element of an array wrapped in an Optional.

This function provides type-safe access to the last element with precise return types:

- For empty arrays: returns `Optional.None`
- For tuples with known last element: returns `Optional.Some<LastElementType>`
- For non-empty arrays: returns `Optional.Some<ElementType>`
- For general arrays: returns `Optional<ElementType>`

The function leverages TypeScript's type system to provide the most precise return type
based on the input array type, making it safer than direct indexing.

#### Type Parameters

##### Ar

`Ar` _extends_ readonly `unknown`[]

#### Parameters

##### array

`Ar`

The array to get the last element from.

#### Returns

`Ar` _extends_ readonly \[\] ? `Readonly`\<\{ \}\> : `Ar` _extends_ readonly \[`unknown`, `E`\] ? `Readonly`\<\{ `value`: `E`; \}\> : `Ar` _extends_ readonly \[`E`, `E`\] ? `Readonly`\<\{ `value`: `E`; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

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

### lastIndexOf()

#### Call Signature

> **lastIndexOf**\<`Ar`\>(`array`, `searchElement`): `-1` \| `ArrayIndex`\<`Ar`\>

Defined in: [src/array/array-utils.mts:2735](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2735)

Gets the last index of a value in an array.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

The array to search.

###### searchElement

`Ar`\[`number`\]

The element to search for.

##### Returns

`-1` \| `ArrayIndex`\<`Ar`\>

Optional.Some with the index if found, Optional.None otherwise.

##### Example

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

#### Call Signature

> **lastIndexOf**\<`E`\>(`searchElement`): (`array`) => `-1` \| `Uint32`

Defined in: [src/array/array-utils.mts:2740](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2740)

Gets the last index of a value in an array.

##### Type Parameters

###### E

`E`

##### Parameters

###### searchElement

`E`

The element to search for.

##### Returns

Optional.Some with the index if found, Optional.None otherwise.

> (`array`): `-1` \| `Uint32`

###### Parameters

###### array

readonly `E`[]

###### Returns

`-1` \| `Uint32`

##### Example

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

### lastIndexOfFrom()

#### Call Signature

> **lastIndexOfFrom**\<`Ar`\>(`array`, `searchElement`, `fromIndex`): `-1` \| `ArrayIndex`\<`Ar`\>

Defined in: [src/array/array-utils.mts:2762](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2762)

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

###### searchElement

`Ar`\[`number`\]

###### fromIndex

`ArgArrayIndexWithNegative`\<`Ar`\>

##### Returns

`-1` \| `ArrayIndex`\<`Ar`\>

#### Call Signature

> **lastIndexOfFrom**\<`E`\>(`searchElement`, `fromIndex`): (`array`) => `-1` \| `Uint32`

Defined in: [src/array/array-utils.mts:2768](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2768)

##### Type Parameters

###### E

`E`

##### Parameters

###### searchElement

`E`

###### fromIndex

[`ArgArrWithNegative`](../../../globals/namespaces/SizeType.md#argarrwithnegative)

##### Returns

> (`array`): `-1` \| `Uint32`

###### Parameters

###### array

readonly `E`[]

###### Returns

`-1` \| `Uint32`

---

### map()

#### Call Signature

> **map**\<`Ar`, `B`\>(`array`, `mapFn`): `Readonly`\<`{ [K in keyof Ar]: B }`\>

Defined in: [src/array/array-utils.mts:3529](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3529)

Creates a new tuple by transforming each element with a mapping function.

Preserves the tuple's length while allowing element type transformation.
The resulting tuple has the same structure but with transformed element types.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### B

`B`

The type that elements will be transformed to

##### Parameters

###### array

`Ar`

The input tuple

###### mapFn

(`a`, `index`) => `B`

Function that transforms each element (receives element and index)

##### Returns

`Readonly`\<`{ [K in keyof Ar]: B }`\>

A new tuple with transformed elements, preserving the original length

##### Example

```typescript
// Basic transformation
const nums = [1, 2, 3] as const;
const doubled = Arr.map(nums, (x) => x * 2); // readonly [2, 4, 6]
const strings = Arr.map(nums, (x) => String(x)); // readonly ['1', '2', '3']

// With index
const indexed = Arr.map(nums, (x, i) => `${i}:${x}`);
// readonly ['0:1', '1:2', '2:3']

// Mixed type tuples
const mixed = [1, 'hello', true] as const;
const descriptions = Arr.map(mixed, (x) => `Value: ${x}`);
// readonly ['Value: 1', 'Value: hello', 'Value: true']
```

#### Call Signature

> **map**\<`A`, `B`\>(`mapFn`): \<`Ar`\>(`array`) => `Readonly`\<`{ [K in keyof Ar]: B }`\>

Defined in: [src/array/array-utils.mts:3535](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3535)

Creates a new tuple by transforming each element with a mapping function.

Preserves the tuple's length while allowing element type transformation.
The resulting tuple has the same structure but with transformed element types.

##### Type Parameters

###### A

`A`

###### B

`B`

The type that elements will be transformed to

##### Parameters

###### mapFn

(`a`, `index`) => `B`

Function that transforms each element (receives element and index)

##### Returns

A new tuple with transformed elements, preserving the original length

> \<`Ar`\>(`array`): `Readonly`\<`{ [K in keyof Ar]: B }`\>

###### Type Parameters

###### Ar

`Ar` _extends_ readonly `A`[]

###### Parameters

###### array

`Ar`

###### Returns

`Readonly`\<`{ [K in keyof Ar]: B }`\>

##### Example

```typescript
// Basic transformation
const nums = [1, 2, 3] as const;
const doubled = Arr.map(nums, (x) => x * 2); // readonly [2, 4, 6]
const strings = Arr.map(nums, (x) => String(x)); // readonly ['1', '2', '3']

// With index
const indexed = Arr.map(nums, (x, i) => `${i}:${x}`);
// readonly ['0:1', '1:2', '2:3']

// Mixed type tuples
const mixed = [1, 'hello', true] as const;
const descriptions = Arr.map(mixed, (x) => `Value: ${x}`);
// readonly ['Value: 1', 'Value: hello', 'Value: true']
```

---

### max()

#### Call Signature

> **max**\<`Ar`\>(`array`, `comparator?`): `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

Defined in: [src/array/array-utils.mts:3144](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3144)

Finds the maximum value in an array.

- If the array is non-empty, returns the maximum value.
- If the array is empty, returns `Optional.none`.
- You can provide a custom comparator for arbitrary types.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `number`[]

##### Parameters

###### array

`Ar`

The input array.

###### comparator?

(`x`, `y`) => `number`

An optional custom comparator function `(x: A, y: A) => number`. Should return < 0 if x is smaller, 0 if equal, > 0 if x is larger. Defaults to numeric comparison.

##### Returns

`Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

The maximum value in the array wrapped in Optional.

##### Example

```ts
Arr.max([3, 1, 4, 1, 5] as const); // Optional.some(5)
Arr.max([{ v: 3 }, { v: 1 }], (a, b) => a.v - b.v); // Optional.some({v:3})
Arr.max([]); // Optional.none
```

#### Call Signature

> **max**\<`Ar`\>(`array`, `comparator`): `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

Defined in: [src/array/array-utils.mts:3152](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3152)

Finds the maximum value in an array.

- If the array is non-empty, returns the maximum value.
- If the array is empty, returns `Optional.none`.
- You can provide a custom comparator for arbitrary types.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

The input array.

###### comparator

(`x`, `y`) => `number`

An optional custom comparator function `(x: A, y: A) => number`. Should return < 0 if x is smaller, 0 if equal, > 0 if x is larger. Defaults to numeric comparison.

##### Returns

`Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

The maximum value in the array wrapped in Optional.

##### Example

```ts
Arr.max([3, 1, 4, 1, 5] as const); // Optional.some(5)
Arr.max([{ v: 3 }, { v: 1 }], (a, b) => a.v - b.v); // Optional.some({v:3})
Arr.max([]); // Optional.none
```

---

### maxBy()

#### Call Signature

> **maxBy**\<`Ar`\>(`array`, `comparatorValueMapper`): `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

Defined in: [src/array/array-utils.mts:3237](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3237)

Finds the element with the maximum value according to a mapped numeric value.

- If the array is non-empty, returns the element with the maximum mapped value.
- If the array is empty, returns `Optional.none`.
- You can provide a custom comparator for the mapped values.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

The input array.

###### comparatorValueMapper

(`value`) => `number`

A function that maps an element to a value for comparison.

##### Returns

`Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

The element with the maximum mapped value wrapped in Optional.

##### Example

```ts
const people = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 20 },
] as const;
Arr.maxBy(people, (p) => p.age); // Optional.some({ name: 'Alice', age: 30 })
Arr.maxBy([], (p) => p.age); // Optional.none
```

#### Call Signature

> **maxBy**\<`Ar`, `V`\>(`array`, `comparatorValueMapper`, `comparator`): `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

Defined in: [src/array/array-utils.mts:3245](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3245)

Finds the element with the maximum value according to a mapped numeric value.

- If the array is non-empty, returns the element with the maximum mapped value.
- If the array is empty, returns `Optional.none`.
- You can provide a custom comparator for the mapped values.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### V

`V`

The type of the value to compare by.

##### Parameters

###### array

`Ar`

The input array.

###### comparatorValueMapper

(`value`) => `V`

A function that maps an element to a value for comparison.

###### comparator

(`x`, `y`) => `number`

An optional custom comparator function for the mapped values.

##### Returns

`Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

The element with the maximum mapped value wrapped in Optional.

##### Example

```ts
const people = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 20 },
] as const;
Arr.maxBy(people, (p) => p.age); // Optional.some({ name: 'Alice', age: 30 })
Arr.maxBy([], (p) => p.age); // Optional.none
```

---

### min()

#### Call Signature

> **min**\<`Ar`\>(`array`, `comparator?`): `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

Defined in: [src/array/array-utils.mts:3093](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3093)

Finds the minimum value in an array.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `number`[]

##### Parameters

###### array

`Ar`

The input array.

###### comparator?

(`x`, `y`) => `number`

An optional custom comparator function `(x: N, y: N) => number`. Should return < 0 if x is smaller, 0 if equal, > 0 if x is larger. Defaults to `x - y`.

##### Returns

`Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

The minimum value in the array wrapped in Optional.

##### Example

```ts
Arr.min([3, 1, 4, 1, 5] as const); // Optional.some(1)
Arr.min([{ v: 3 }, { v: 1 }], (a, b) => a.v - b.v); // Optional.some({v:1})
Arr.min([]); // Optional.none
```

#### Call Signature

> **min**\<`Ar`\>(`array`, `comparator`): `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

Defined in: [src/array/array-utils.mts:3101](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3101)

Finds the minimum value in an array.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

The input array.

###### comparator

(`x`, `y`) => `number`

An optional custom comparator function `(x: N, y: N) => number`. Should return < 0 if x is smaller, 0 if equal, > 0 if x is larger. Defaults to `x - y`.

##### Returns

`Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

The minimum value in the array wrapped in Optional.

##### Example

```ts
Arr.min([3, 1, 4, 1, 5] as const); // Optional.some(1)
Arr.min([{ v: 3 }, { v: 1 }], (a, b) => a.v - b.v); // Optional.some({v:1})
Arr.min([]); // Optional.none
```

---

### minBy()

#### Call Signature

> **minBy**\<`Ar`\>(`array`, `comparatorValueMapper`): `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

Defined in: [src/array/array-utils.mts:3188](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3188)

Finds the element with the minimum value according to a mapped numeric value.

- If the array is non-empty, returns the element with the minimum mapped value.
- If the array is empty, returns `Optional.none`.
- You can provide a custom comparator for the mapped values.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

The input array.

###### comparatorValueMapper

(`value`) => `number`

A function that maps an element to a value for comparison.

##### Returns

`Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

The element with the minimum mapped value wrapped in Optional.

##### Example

```ts
const people = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 20 },
] as const;
Arr.minBy(people, (p) => p.age); // Optional.some({ name: 'Bob', age: 20 })
Arr.minBy([], (p) => p.age); // Optional.none
```

#### Call Signature

> **minBy**\<`Ar`, `V`\>(`array`, `comparatorValueMapper`, `comparator`): `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

Defined in: [src/array/array-utils.mts:3196](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3196)

Finds the element with the minimum value according to a mapped numeric value.

- If the array is non-empty, returns the element with the minimum mapped value.
- If the array is empty, returns `Optional.none`.
- You can provide a custom comparator for the mapped values.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### V

`V`

The type of the value to compare by.

##### Parameters

###### array

`Ar`

The input array.

###### comparatorValueMapper

(`value`) => `V`

A function that maps an element to a value for comparison.

###### comparator

(`x`, `y`) => `number`

An optional custom comparator function for the mapped values.

##### Returns

`Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `Readonly`\<\{ `value`: `Ar`\<`Ar`\>\[`number`\]; \}\> : [`Optional`](../../../functional/optional/README.md#optional)\<`Ar`\[`number`\]\>

The element with the minimum mapped value wrapped in Optional.

##### Example

```ts
const people = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 20 },
] as const;
Arr.minBy(people, (p) => p.age); // Optional.some({ name: 'Bob', age: 20 })
Arr.minBy([], (p) => p.age); // Optional.none
```

---

### partition()

#### Call Signature

> **partition**\<`N`, `E`\>(`array`, `chunkSize`): readonly readonly `E`[][]

Defined in: [src/array/array-utils.mts:3843](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3843)

Partitions an array into sub-arrays of a specified size.
The last partition may be smaller if the array length is not a multiple of `chunkSize`.
Returns an empty array if chunkSize < 2.

##### Type Parameters

###### N

`N` _extends_ `WithSmallInt`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `object`, `40`\>

The size of each partition (must be a number type, typically a literal for precise typing).

###### E

`E`

The type of elements in the array.

##### Parameters

###### array

readonly `E`[]

The input array.

###### chunkSize

`N`

The size of each partition.

##### Returns

readonly readonly `E`[][]

An array of arrays, where each inner array has up to `chunkSize` elements.

##### Example

```ts
Arr.partition([1, 2, 3, 4, 5, 6], 2); // [[1, 2], [3, 4], [5, 6]]
Arr.partition([1, 2, 3, 4, 5, 6, 7], 3); // [[1, 2, 3], [4, 5, 6], [7]]
```

#### Call Signature

> **partition**\<`N`\>(`chunkSize`): \<`E`\>(`array`) => readonly readonly `E`[][]

Defined in: [src/array/array-utils.mts:3848](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3848)

Partitions an array into sub-arrays of a specified size.
The last partition may be smaller if the array length is not a multiple of `chunkSize`.
Returns an empty array if chunkSize < 2.

##### Type Parameters

###### N

`N` _extends_ `WithSmallInt`\<`number` & `object` & `Readonly`\<\{ `TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3`: `unknown`; \}\> & `object`, `40`\>

The size of each partition (must be a number type, typically a literal for precise typing).

##### Parameters

###### chunkSize

`N`

The size of each partition.

##### Returns

An array of arrays, where each inner array has up to `chunkSize` elements.

> \<`E`\>(`array`): readonly readonly `E`[][]

###### Type Parameters

###### E

`E`

###### Parameters

###### array

readonly `E`[]

###### Returns

readonly readonly `E`[][]

##### Example

```ts
Arr.partition([1, 2, 3, 4, 5, 6], 2); // [[1, 2], [3, 4], [5, 6]]
Arr.partition([1, 2, 3, 4, 5, 6, 7], 3); // [[1, 2, 3], [4, 5, 6], [7]]
```

---

### range()

#### Call Signature

> **range**\<`S`, `E`\>(`start`, `end`, `step?`): `RangeList`\<`S`, `E`\>

Defined in: [src/array/array-utils.mts:761](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L761)

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

##### Type Parameters

###### S

`S` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39`

The type of the start value. When a SmallUint literal (0-255), enables precise tuple typing.

###### E

`E` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39`

The type of the end value. When a SmallUint literal (0-255), enables precise tuple typing.

##### Parameters

###### start

`S`

The start of the range (inclusive). Must be a safe integer. Supports:

- **Literal SmallUint:** Enables precise tuple types (0-255)
- **Runtime SafeInt:** Fallback to general array types
- **Negative values:** Supported for countdown sequences

###### end

`E`

The end of the range (exclusive). Must be a safe integer. Supports:

- **Literal SmallUint:** Enables precise tuple types (0-255)
- **Runtime SafeInt:** Fallback to general array types
- **Equal to start:** Results in empty array

###### step?

`1`

The step increment (default: 1). Must be a non-zero safe integer.

- **Positive step:** generates increasing sequence from start to end
- **Negative step:** generates decreasing sequence from start to end
- **Zero step:** Not allowed (branded type prevents this)

##### Returns

`RangeList`\<`S`, `E`\>

An immutable array containing the arithmetic sequence. Return type depends on parameters:

- `RangeList<S, E>` (precise tuple like `readonly [1, 2, 3, 4]`) when `S` and `E` are SmallUint literals and step is 1
- `readonly SafeUint[]` when all parameters are non-negative
- `readonly SafeInt[]` for general integer ranges including negative values

##### Example

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
const squares = Arr.range(1, 6).map((x) => x * x); // [1, 4, 9, 16, 25]
const fibonacci = Arr.range(0, 10).reduce((acc, _, i) => {
    if (i <= 1) return [...acc, i];
    return [...acc, acc[i - 1] + acc[i - 2]];
}, [] as number[]); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// Type inference examples showing precise vs general types
expectType<typeof range1to4, readonly [1, 2, 3, 4]>('='); // Precise tuple
expectType<typeof emptyRange, readonly []>('='); // Precise empty tuple
expectType<typeof evens, readonly SafeUint[]>('='); // General positive array
expectType<typeof countdown, readonly SafeInt[]>('='); // General integer array
expectType<typeof negativeRange, readonly SafeInt[]>('='); // General integer array
expectType<typeof small, readonly [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]>('='); // Precise tuple
expectType<typeof beyondSmall, readonly SafeUint[]>('='); // General array (beyond SmallUint)
```

##### Throws

Never throws - invalid ranges simply return empty arrays

##### See

- [seq](#seq) for creating sequences starting from 0
- SmallUint for understanding the constraint that enables precise typing
- SafeInt and SafeUint for the safe integer types used

#### Call Signature

> **range**(`start`, `end`, `step?`): readonly `SafeUint`[]

Defined in: [src/array/array-utils.mts:767](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L767)

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

##### Parameters

###### start

`SafeUintWithSmallInt`

The start of the range (inclusive). Must be a safe integer. Supports:

- **Literal SmallUint:** Enables precise tuple types (0-255)
- **Runtime SafeInt:** Fallback to general array types
- **Negative values:** Supported for countdown sequences

###### end

`SafeUintWithSmallInt`

The end of the range (exclusive). Must be a safe integer. Supports:

- **Literal SmallUint:** Enables precise tuple types (0-255)
- **Runtime SafeInt:** Fallback to general array types
- **Equal to start:** Results in empty array

###### step?

`PositiveSafeIntWithSmallInt`

The step increment (default: 1). Must be a non-zero safe integer.

- **Positive step:** generates increasing sequence from start to end
- **Negative step:** generates decreasing sequence from start to end
- **Zero step:** Not allowed (branded type prevents this)

##### Returns

readonly `SafeUint`[]

An immutable array containing the arithmetic sequence. Return type depends on parameters:

- `RangeList<S, E>` (precise tuple like `readonly [1, 2, 3, 4]`) when `S` and `E` are SmallUint literals and step is 1
- `readonly SafeUint[]` when all parameters are non-negative
- `readonly SafeInt[]` for general integer ranges including negative values

##### Example

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
const squares = Arr.range(1, 6).map((x) => x * x); // [1, 4, 9, 16, 25]
const fibonacci = Arr.range(0, 10).reduce((acc, _, i) => {
    if (i <= 1) return [...acc, i];
    return [...acc, acc[i - 1] + acc[i - 2]];
}, [] as number[]); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// Type inference examples showing precise vs general types
expectType<typeof range1to4, readonly [1, 2, 3, 4]>('='); // Precise tuple
expectType<typeof emptyRange, readonly []>('='); // Precise empty tuple
expectType<typeof evens, readonly SafeUint[]>('='); // General positive array
expectType<typeof countdown, readonly SafeInt[]>('='); // General integer array
expectType<typeof negativeRange, readonly SafeInt[]>('='); // General integer array
expectType<typeof small, readonly [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]>('='); // Precise tuple
expectType<typeof beyondSmall, readonly SafeUint[]>('='); // General array (beyond SmallUint)
```

##### Throws

Never throws - invalid ranges simply return empty arrays

##### See

- [seq](#seq) for creating sequences starting from 0
- SmallUint for understanding the constraint that enables precise typing
- SafeInt and SafeUint for the safe integer types used

#### Call Signature

> **range**(`start`, `end`, `step?`): readonly `SafeInt`[]

Defined in: [src/array/array-utils.mts:773](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L773)

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

##### Parameters

###### start

`SafeIntWithSmallInt`

The start of the range (inclusive). Must be a safe integer. Supports:

- **Literal SmallUint:** Enables precise tuple types (0-255)
- **Runtime SafeInt:** Fallback to general array types
- **Negative values:** Supported for countdown sequences

###### end

`SafeIntWithSmallInt`

The end of the range (exclusive). Must be a safe integer. Supports:

- **Literal SmallUint:** Enables precise tuple types (0-255)
- **Runtime SafeInt:** Fallback to general array types
- **Equal to start:** Results in empty array

###### step?

`NonZeroSafeIntWithSmallInt`

The step increment (default: 1). Must be a non-zero safe integer.

- **Positive step:** generates increasing sequence from start to end
- **Negative step:** generates decreasing sequence from start to end
- **Zero step:** Not allowed (branded type prevents this)

##### Returns

readonly `SafeInt`[]

An immutable array containing the arithmetic sequence. Return type depends on parameters:

- `RangeList<S, E>` (precise tuple like `readonly [1, 2, 3, 4]`) when `S` and `E` are SmallUint literals and step is 1
- `readonly SafeUint[]` when all parameters are non-negative
- `readonly SafeInt[]` for general integer ranges including negative values

##### Example

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
const squares = Arr.range(1, 6).map((x) => x * x); // [1, 4, 9, 16, 25]
const fibonacci = Arr.range(0, 10).reduce((acc, _, i) => {
    if (i <= 1) return [...acc, i];
    return [...acc, acc[i - 1] + acc[i - 2]];
}, [] as number[]); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// Type inference examples showing precise vs general types
expectType<typeof range1to4, readonly [1, 2, 3, 4]>('='); // Precise tuple
expectType<typeof emptyRange, readonly []>('='); // Precise empty tuple
expectType<typeof evens, readonly SafeUint[]>('='); // General positive array
expectType<typeof countdown, readonly SafeInt[]>('='); // General integer array
expectType<typeof negativeRange, readonly SafeInt[]>('='); // General integer array
expectType<typeof small, readonly [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]>('='); // Precise tuple
expectType<typeof beyondSmall, readonly SafeUint[]>('='); // General array (beyond SmallUint)
```

##### Throws

Never throws - invalid ranges simply return empty arrays

##### See

- [seq](#seq) for creating sequences starting from 0
- SmallUint for understanding the constraint that enables precise typing
- SafeInt and SafeUint for the safe integer types used

---

### scan()

#### Call Signature

> **scan**\<`Ar`, `S`\>(`array`, `reducer`, `init`): readonly \[`S`, `S`\]

Defined in: [src/array/array-utils.mts:4163](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4163)

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

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### S

`S`

The type of the accumulated values and the initial value.

##### Parameters

###### array

`Ar`

The input array to scan over. Can be empty (result will still contain the initial value).

###### reducer

(`accumulator`, `currentValue`, `currentIndex`) => `S`

A function `(accumulator: S, currentValue: E, currentIndex: SizeType.Arr) => S` that:

- **accumulator:** The current accumulated value (starts with `init`, then previous results)
- **currentValue:** The current array element being processed
- **currentIndex:** The 0-based index of the current element (typed as [SizeType.Arr](../../../globals/namespaces/SizeType.md#arr))
- **returns:** The new accumulated value to include in the result array

###### init

`S`

The initial accumulated value. Becomes the first element of the result array.

##### Returns

readonly \[`S`, `S`\]

A NonEmptyArray<S> of accumulated values with length `array.length + 1`:

- `result[0]` is always the `init` value
- `result[i+1]` is the result of applying the reducer to `result[i]` and `array[i]`
- Guaranteed to be non-empty regardless of input array length

##### Example

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
    Number.NEGATIVE_INFINITY,
);
// [Number.NEGATIVE_INFINITY, 20, 25, 25, 30, 30]

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

##### See

- [reduce](#reduce) for getting only the final accumulated value
- NonEmptyArray for understanding the guaranteed non-empty return type
- [SizeType.Arr](../../../globals/namespaces/SizeType.md#arr) for the index parameter type
- Array.prototype.reduce for the standard reduce function

#### Call Signature

> **scan**\<`E`, `S`\>(`reducer`, `init`): (`array`) => readonly \[`S`, `S`\]

Defined in: [src/array/array-utils.mts:4173](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4173)

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

##### Type Parameters

###### E

`E`

The type of elements in the input array.

###### S

`S`

The type of the accumulated values and the initial value.

##### Parameters

###### reducer

(`accumulator`, `currentValue`, `currentIndex`) => `S`

A function `(accumulator: S, currentValue: E, currentIndex: SizeType.Arr) => S` that:

- **accumulator:** The current accumulated value (starts with `init`, then previous results)
- **currentValue:** The current array element being processed
- **currentIndex:** The 0-based index of the current element (typed as [SizeType.Arr](../../../globals/namespaces/SizeType.md#arr))
- **returns:** The new accumulated value to include in the result array

###### init

`S`

The initial accumulated value. Becomes the first element of the result array.

##### Returns

A NonEmptyArray<S> of accumulated values with length `array.length + 1`:

- `result[0]` is always the `init` value
- `result[i+1]` is the result of applying the reducer to `result[i]` and `array[i]`
- Guaranteed to be non-empty regardless of input array length

> (`array`): readonly \[`S`, `S`\]

###### Parameters

###### array

readonly `E`[]

###### Returns

readonly \[`S`, `S`\]

##### Example

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
    Number.NEGATIVE_INFINITY,
);
// [Number.NEGATIVE_INFINITY, 20, 25, 25, 30, 30]

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

##### See

- [reduce](#reduce) for getting only the final accumulated value
- NonEmptyArray for understanding the guaranteed non-empty return type
- [SizeType.Arr](../../../globals/namespaces/SizeType.md#arr) for the index parameter type
- Array.prototype.reduce for the standard reduce function

---

### seq()

> **seq**\<`N`\>(`len`): `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `SeqImpl`\<`MakeTupleImpl`\<`unknown`, `` `${N<N>}` ``, \[\]\>\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? readonly \[`Uint32`, `Uint32`\] : readonly `Uint32`[]

Defined in: [src/array/array-utils.mts:468](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L468)

Creates a sequence of consecutive integers from 0 to `len-1`.

This function generates index sequences with precise compile-time typing:

- When `len` is a compile-time known `SmallUint` (0-100), returns a tuple of consecutive integers
- When `len` is a positive runtime value, returns a `NonEmptyArray<SizeType.Arr>`
- Otherwise, returns a `readonly SizeType.Arr[]` that may be empty

#### Type Parameters

##### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The type of the length parameter. When a `SmallUint` literal is provided,
the return type will be a tuple containing the sequence [0, 1, 2, ..., N-1].

#### Parameters

##### len

`N`

The length of the sequence to create. Must be a non-negative integer.

#### Returns

`N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `SeqImpl`\<`MakeTupleImpl`\<`unknown`, `` `${N<N>}` ``, \[\]\>\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? readonly \[`Uint32`, `Uint32`\] : readonly `Uint32`[]

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

### set()

#### Call Signature

> **set**\<`Ar`, `V`\>(`array`, `index`, `newValue`): `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `Readonly`\<\{ \[K in string \| number \| symbol\]: V \| Ar\[K\<K\>\] \}\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`Ar`\[`number`\] \| `V`)[]

Defined in: [src/array/array-utils.mts:1543](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1543)

Returns a new tuple with the element at the specified index replaced.

This operation is type-safe with compile-time index validation.
The resulting tuple type reflects that the element at the given index
may be either the new type or the original type.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### V

`V` = `Ar`\[`number`\]

##### Parameters

###### array

`Ar`

###### index

`ArgArrayIndex`\<`Ar`\>

The index to update (must be valid for the tuple length)

###### newValue

`V`

The new value to place at the index

##### Returns

`IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `Readonly`\<\{ \[K in string \| number \| symbol\]: V \| Ar\[K\<K\>\] \}\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`Ar`\[`number`\] \| `V`)[]

A new tuple with the updated element

##### Example

```typescript
// Basic usage
const tpl = ['a', 'b', 'c'] as const;
const updated = Arr.set(tpl, 1, 'B'); // readonly ['a', 'B', 'c']

// Type changes are reflected
const mixed = [1, 'hello', true] as const;
const withNumber = Arr.set(mixed, 1, 42);
// readonly [1, 42 | 'hello', true]

// Compile-time index validation
const short = [1, 2] as const;
// Arr.set(short, 2, 3); // Error: index 2 is out of bounds

// Different value types
const nums = [1, 2, 3] as const;
const withString = Arr.set(nums, 0, 'first');
// readonly ['first' | 1, 2, 3]
```

#### Call Signature

> **set**\<`V`\>(`index`, `newValue`): \<`Ar`\>(`array`) => `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `Readonly`\<\{ \[K in string \| number \| symbol\]: V \| Ar\[K\<K\>\] \}\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`V` \| `Ar`\[`number`\])[]

Defined in: [src/array/array-utils.mts:1557](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1557)

Returns a new tuple with the element at the specified index replaced.

This operation is type-safe with compile-time index validation.
The resulting tuple type reflects that the element at the given index
may be either the new type or the original type.

##### Type Parameters

###### V

`V`

##### Parameters

###### index

[`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The index to update (must be valid for the tuple length)

###### newValue

`V`

The new value to place at the index

##### Returns

A new tuple with the updated element

> \<`Ar`\>(`array`): `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `Readonly`\<\{ \[K in string \| number \| symbol\]: V \| Ar\[K\<K\>\] \}\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`V` \| `Ar`\[`number`\])[]

###### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### Parameters

###### array

`Ar`

###### Returns

`IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `Readonly`\<\{ \[K in string \| number \| symbol\]: V \| Ar\[K\<K\>\] \}\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`V` \| `Ar`\[`number`\])[]

##### Example

```typescript
// Basic usage
const tpl = ['a', 'b', 'c'] as const;
const updated = Arr.set(tpl, 1, 'B'); // readonly ['a', 'B', 'c']

// Type changes are reflected
const mixed = [1, 'hello', true] as const;
const withNumber = Arr.set(mixed, 1, 42);
// readonly [1, 42 | 'hello', true]

// Compile-time index validation
const short = [1, 2] as const;
// Arr.set(short, 2, 3); // Error: index 2 is out of bounds

// Different value types
const nums = [1, 2, 3] as const;
const withString = Arr.set(nums, 0, 'first');
// readonly ['first' | 1, 2, 3]
```

---

### setDifference()

> **setDifference**\<`E`\>(`array1`, `array2`): readonly `E`[]

Defined in: [src/array/array-utils.mts:4594](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4594)

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

Defined in: [src/array/array-utils.mts:4569](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4569)

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

### size()

> **size**\<`Ar`\>(`array`): `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `IntersectBrand`\<`PositiveNumber`, `Uint32`\> : `Uint32`

Defined in: [src/array/array-utils.mts:110](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L110)

Returns the size (length) of an array as a type-safe branded integer.

This function provides the array length with enhanced type safety through branded types:

- For arrays known to be non-empty at compile time: returns `PositiveNumber & SizeType.Arr`
- For general arrays that may be empty: returns `SizeType.Arr` (branded Uint32)

The returned value is always a non-negative integer that can be safely used for array indexing
and size comparisons. The branded type prevents common integer overflow issues and provides
better type checking than plain numbers.

#### Type Parameters

##### Ar

`Ar` _extends_ readonly `unknown`[]

The exact type of the input array, used for precise return type inference.

#### Parameters

##### array

`Ar`

The array to measure. Can be any readonly array type.

#### Returns

`Ar` _extends_ readonly \[`unknown`, `unknown`\] ? `IntersectBrand`\<`PositiveNumber`, `Uint32`\> : `Uint32`

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

const nonEmpty: NonEmptyArray<string> = ['a', 'b'];
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

### skip()

#### Call Signature

> **skip**\<`Ar`, `N`\>(`array`, `num`): `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Skip`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:1419](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1419)

Skips the first N elements of an array.

- If the array is a tuple, the return type is inferred as a tuple with the first N elements removed.
- If the array is a non-empty array and N is a positive integer, returns a readonly array (may be empty).
- Otherwise, returns a readonly array with the first N elements skipped.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The number of elements to skip, constrained to `SmallUint`.

##### Parameters

###### array

`Ar`

The input array.

###### num

`N`

The number of elements to skip.

##### Returns

`N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Skip`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

A new array containing the elements after skipping the first N.

##### Example

```ts
// Regular usage
Arr.skip([1, 2, 3, 4] as const, 2); // [3, 4]

// Curried usage for pipe composition
const skipFirst2 = Arr.skip(2);
const result = pipe([1, 2, 3, 4, 5]).map(skipFirst2).value;
console.log(result); // [3, 4, 5]
```

#### Call Signature

> **skip**\<`N`\>(`num`): \<`Ar`\>(`array`) => `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Skip`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:1428](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1428)

Skips the first N elements of an array.

- If the array is a tuple, the return type is inferred as a tuple with the first N elements removed.
- If the array is a non-empty array and N is a positive integer, returns a readonly array (may be empty).
- Otherwise, returns a readonly array with the first N elements skipped.

##### Type Parameters

###### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The number of elements to skip, constrained to `SmallUint`.

##### Parameters

###### num

`N`

The number of elements to skip.

##### Returns

A new array containing the elements after skipping the first N.

> \<`Ar`\>(`array`): `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Skip`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

###### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### Parameters

###### array

`Ar`

###### Returns

`N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Skip`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

##### Example

```ts
// Regular usage
Arr.skip([1, 2, 3, 4] as const, 2); // [3, 4]

// Curried usage for pipe composition
const skipFirst2 = Arr.skip(2);
const result = pipe([1, 2, 3, 4, 5]).map(skipFirst2).value;
console.log(result); // [3, 4, 5]
```

---

### skipLast()

#### Call Signature

> **skipLast**\<`Ar`, `N`\>(`array`, `num`): `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `SkipLast`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:1474](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1474)

Skips the last N elements of an array.

- If the array is a tuple, the return type is inferred as a tuple with the last N elements removed.
- If the array is a non-empty array and N is a positive integer, returns a readonly array (may be empty).
- Otherwise, returns a readonly array with the last N elements skipped.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The number of elements to skip, constrained to `SmallUint`.

##### Parameters

###### array

`Ar`

The input array.

###### num

`N`

The number of elements to skip from the end.

##### Returns

`N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `SkipLast`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

A new array containing the elements after skipping the last N.

##### Example

```ts
// Regular usage
Arr.skipLast([1, 2, 3, 4] as const, 2); // [1, 2]

// Curried usage for pipe composition
const skipLast2 = Arr.skipLast(2);
const result = pipe([1, 2, 3, 4, 5]).map(skipLast2).value;
console.log(result); // [1, 2, 3]
```

#### Call Signature

> **skipLast**\<`N`\>(`num`): \<`Ar`\>(`array`) => `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `SkipLast`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:1483](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1483)

Skips the last N elements of an array.

- If the array is a tuple, the return type is inferred as a tuple with the last N elements removed.
- If the array is a non-empty array and N is a positive integer, returns a readonly array (may be empty).
- Otherwise, returns a readonly array with the last N elements skipped.

##### Type Parameters

###### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The number of elements to skip, constrained to `SmallUint`.

##### Parameters

###### num

`N`

The number of elements to skip from the end.

##### Returns

A new array containing the elements after skipping the last N.

> \<`Ar`\>(`array`): `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `SkipLast`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

###### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### Parameters

###### array

`Ar`

###### Returns

`N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `SkipLast`\<`N`\<`N`\>, `Ar`\> : readonly `Ar`\[`number`\][]

##### Example

```ts
// Regular usage
Arr.skipLast([1, 2, 3, 4] as const, 2); // [1, 2]

// Curried usage for pipe composition
const skipLast2 = Arr.skipLast(2);
const result = pipe([1, 2, 3, 4, 5]).map(skipLast2).value;
console.log(result); // [1, 2, 3]
```

---

### sliceClamped()

#### Call Signature

> **sliceClamped**\<`Ar`\>(`array`, `start`, `end`): readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:1193](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1193)

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

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

The array to slice (when using direct call syntax).

###### start

`ArgArrayIndexWithNegative`\<`Ar`\>

The start index for the slice (inclusive). Will be clamped to valid bounds.

###### end

`ArgArrayIndexWithNegative`\<`Ar`\>

The end index for the slice (exclusive). Will be clamped to valid bounds.

##### Returns

readonly `Ar`\[`number`\][]

A new immutable array containing the sliced elements. Always returns a valid array,
never throws for out-of-bounds indices.

##### Example

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

##### See

- [take](#take) for taking the first N elements
- [skip](#skip) for skipping the first N elements
- [takeLast](#takelast) for taking the last N elements

#### Call Signature

> **sliceClamped**(`start`, `end`): \<`E`\>(`array`) => readonly `E`[]

Defined in: [src/array/array-utils.mts:1199](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1199)

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

##### Parameters

###### start

[`ArgArrWithNegative`](../../../globals/namespaces/SizeType.md#argarrwithnegative)

The start index for the slice (inclusive). Will be clamped to valid bounds.

###### end

[`ArgArrWithNegative`](../../../globals/namespaces/SizeType.md#argarrwithnegative)

The end index for the slice (exclusive). Will be clamped to valid bounds.

##### Returns

A new immutable array containing the sliced elements. Always returns a valid array,
never throws for out-of-bounds indices.

> \<`E`\>(`array`): readonly `E`[]

###### Type Parameters

###### E

`E`

###### Parameters

###### array

readonly `E`[]

###### Returns

readonly `E`[]

##### Example

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

##### See

- [take](#take) for taking the first N elements
- [skip](#skip) for skipping the first N elements
- [takeLast](#takelast) for taking the last N elements

---

### some()

#### Call Signature

> **some**\<`Ar`\>(`array`, `predicate`): `boolean`

Defined in: [src/array/array-utils.mts:2906](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2906)

Tests whether at least one element in an array passes a test implemented by a predicate function.

This function returns `true` if at least one element satisfies the predicate, `false` otherwise.
For empty arrays, it returns `false`.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

The exact type of the input array.

##### Parameters

###### array

`Ar`

The array to test.

###### predicate

(`a`, `index`) => `boolean`

A function that tests each element.

##### Returns

`boolean`

`true` if at least one element passes the test, `false` otherwise.

##### Example

```typescript
// Direct usage
const numbers = [1, 3, 5, 8];
const hasEven = Arr.some(numbers, (n) => n % 2 === 0); // true

// Curried usage
const isNegative = (n: number) => n < 0;
const hasNegative = Arr.some(isNegative);
const result = hasNegative([1, 2, -3]); // true

// Empty array
const empty: number[] = [];
const result2 = Arr.some(empty, (n) => n > 0); // false
```

#### Call Signature

> **some**\<`E`\>(`predicate`): (`array`) => `boolean`

Defined in: [src/array/array-utils.mts:2911](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2911)

Tests whether at least one element in an array passes a test implemented by a predicate function.

This function returns `true` if at least one element satisfies the predicate, `false` otherwise.
For empty arrays, it returns `false`.

##### Type Parameters

###### E

`E`

The type of elements in the array.

##### Parameters

###### predicate

(`a`, `index`) => `boolean`

A function that tests each element.

##### Returns

`true` if at least one element passes the test, `false` otherwise.

> (`array`): `boolean`

###### Parameters

###### array

readonly `E`[]

###### Returns

`boolean`

##### Example

```typescript
// Direct usage
const numbers = [1, 3, 5, 8];
const hasEven = Arr.some(numbers, (n) => n % 2 === 0); // true

// Curried usage
const isNegative = (n: number) => n < 0;
const hasNegative = Arr.some(isNegative);
const result = hasNegative([1, 2, -3]); // true

// Empty array
const empty: number[] = [];
const result2 = Arr.some(empty, (n) => n > 0); // false
```

---

### sortedNumSetDifference()

> **sortedNumSetDifference**\<`E`\>(`sortedList1`, `sortedList2`): readonly `E`[]

Defined in: [src/array/array-utils.mts:4614](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4614)

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

### sum()

#### Call Signature

> **sum**(`array`): `0`

Defined in: [src/array/array-utils.mts:3388](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3388)

Calculates the sum of numbers in an array.

##### Parameters

###### array

readonly \[\]

The input array of numbers.

##### Returns

`0`

The sum of the numbers. Returns 0 for an empty array.

##### Example

```ts
Arr.sum([1, 2, 3]); // 6
Arr.sum([]); // 0
Arr.sum([-1, 0, 1]); // 0
```

#### Call Signature

> **sum**\<`N`\>(`array`): `N`

Defined in: [src/array/array-utils.mts:3390](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3390)

Calculates the sum of numbers in an array.

##### Type Parameters

###### N

`N` _extends_ `number`

##### Parameters

###### array

readonly \[`N`\]

The input array of numbers.

##### Returns

`N`

The sum of the numbers. Returns 0 for an empty array.

##### Example

```ts
Arr.sum([1, 2, 3]); // 6
Arr.sum([]); // 0
Arr.sum([-1, 0, 1]); // 0
```

#### Call Signature

> **sum**(`array`): `NonNegativeInt`

Defined in: [src/array/array-utils.mts:3392](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3392)

Calculates the sum of numbers in an array.

##### Parameters

###### array

readonly `NonNegativeInt`[]

The input array of numbers.

##### Returns

`NonNegativeInt`

The sum of the numbers. Returns 0 for an empty array.

##### Example

```ts
Arr.sum([1, 2, 3]); // 6
Arr.sum([]); // 0
Arr.sum([-1, 0, 1]); // 0
```

#### Call Signature

> **sum**(`array`): `Int`

Defined in: [src/array/array-utils.mts:3394](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3394)

Calculates the sum of numbers in an array.

##### Parameters

###### array

readonly `Int`[]

The input array of numbers.

##### Returns

`Int`

The sum of the numbers. Returns 0 for an empty array.

##### Example

```ts
Arr.sum([1, 2, 3]); // 6
Arr.sum([]); // 0
Arr.sum([-1, 0, 1]); // 0
```

#### Call Signature

> **sum**(`array`): `number`

Defined in: [src/array/array-utils.mts:3396](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3396)

Calculates the sum of numbers in an array.

##### Parameters

###### array

readonly `number`[]

The input array of numbers.

##### Returns

`number`

The sum of the numbers. Returns 0 for an empty array.

##### Example

```ts
Arr.sum([1, 2, 3]); // 6
Arr.sum([]); // 0
Arr.sum([-1, 0, 1]); // 0
```

---

### tail()

> **tail**\<`Ar`\>(`array`): `Tail`\<`Ar`\>

Defined in: [src/array/array-utils.mts:1240](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1240)

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

### take()

#### Call Signature

> **take**\<`Ar`, `N`\>(`array`, `num`): `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Take`\<`N`\<`N`\>, `Ar`\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][] : readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:1287](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1287)

Takes the first N elements from an array.

- If the array is a tuple, the return type is inferred as a tuple of the first N elements.
- If the array is a NonEmptyArray and N is a SizeType.ArgArrPositive, returns a NonEmptyArray.
- Otherwise, returns a readonly array of up to N elements.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The number of elements to take, constrained to `SmallUint`.

##### Parameters

###### array

`Ar`

The input array.

###### num

`N`

The number of elements to take.

##### Returns

`N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Take`\<`N`\<`N`\>, `Ar`\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][] : readonly `Ar`\[`number`\][]

A new array containing the first N elements.

##### Example

```ts
// Regular usage
Arr.take([1, 2, 3, 4] as const, 2); // [1, 2]

// Curried usage for pipe composition
const takeFirst3 = Arr.take(3);
const result = pipe([1, 2, 3, 4, 5]).map(takeFirst3).value;
console.log(result); // [1, 2, 3]
```

#### Call Signature

> **take**\<`N`\>(`num`): \<`Ar`\>(`array`) => `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Take`\<`N`\<`N`\>, `Ar`\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][] : readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:1301](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1301)

Takes the first N elements from an array.

- If the array is a tuple, the return type is inferred as a tuple of the first N elements.
- If the array is a NonEmptyArray and N is a SizeType.ArgArrPositive, returns a NonEmptyArray.
- Otherwise, returns a readonly array of up to N elements.

##### Type Parameters

###### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The number of elements to take, constrained to `SmallUint`.

##### Parameters

###### num

`N`

The number of elements to take.

##### Returns

A new array containing the first N elements.

> \<`Ar`\>(`array`): `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Take`\<`N`\<`N`\>, `Ar`\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][] : readonly `Ar`\[`number`\][]

###### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### Parameters

###### array

`Ar`

###### Returns

`N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `Take`\<`N`\<`N`\>, `Ar`\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][] : readonly `Ar`\[`number`\][]

##### Example

```ts
// Regular usage
Arr.take([1, 2, 3, 4] as const, 2); // [1, 2]

// Curried usage for pipe composition
const takeFirst3 = Arr.take(3);
const result = pipe([1, 2, 3, 4, 5]).map(takeFirst3).value;
console.log(result); // [1, 2, 3]
```

---

### takeLast()

#### Call Signature

> **takeLast**\<`Ar`, `N`\>(`array`, `num`): `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `TakeLast`\<`N`\<`N`\>, `Ar`\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][] : readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:1353](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1353)

Takes the last N elements from an array.

- If the array is a tuple, the return type is inferred as a tuple of the last N elements.
- If the array is a non-empty array and N is a positive integer, returns a non-empty array.
- Otherwise, returns a readonly array of up to N elements.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The number of elements to take, constrained to `SmallUint`.

##### Parameters

###### array

`Ar`

The input array.

###### num

`N`

The number of elements to take.

##### Returns

`N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `TakeLast`\<`N`\<`N`\>, `Ar`\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][] : readonly `Ar`\[`number`\][]

A new array containing the last N elements.

##### Example

```ts
// Regular usage
Arr.takeLast([1, 2, 3, 4] as const, 2); // [3, 4]

// Curried usage for pipe composition
const takeLast2 = Arr.takeLast(2);
const result = pipe([1, 2, 3, 4, 5]).map(takeLast2).value;
console.log(result); // [4, 5]
```

#### Call Signature

> **takeLast**\<`N`\>(`num`): \<`Ar`\>(`array`) => `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `TakeLast`\<`N`\<`N`\>, `Ar`\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][] : readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:1367](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1367)

Takes the last N elements from an array.

- If the array is a tuple, the return type is inferred as a tuple of the last N elements.
- If the array is a non-empty array and N is a positive integer, returns a non-empty array.
- Otherwise, returns a readonly array of up to N elements.

##### Type Parameters

###### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The number of elements to take, constrained to `SmallUint`.

##### Parameters

###### num

`N`

The number of elements to take.

##### Returns

A new array containing the last N elements.

> \<`Ar`\>(`array`): `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `TakeLast`\<`N`\<`N`\>, `Ar`\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][] : readonly `Ar`\[`number`\][]

###### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### Parameters

###### array

`Ar`

###### Returns

`N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `TakeLast`\<`N`\<`N`\>, `Ar`\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][] : readonly `Ar`\[`number`\][]

##### Example

```ts
// Regular usage
Arr.takeLast([1, 2, 3, 4] as const, 2); // [3, 4]

// Curried usage for pipe composition
const takeLast2 = Arr.takeLast(2);
const result = pipe([1, 2, 3, 4, 5]).map(takeLast2).value;
console.log(result); // [4, 5]
```

---

### toFilled()

#### Call Signature

> **toFilled**\<`Ar`, `V`\>(`array`, `value`): `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`V`, `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V`, `V`\] : readonly `V`[]

Defined in: [src/array/array-utils.mts:2022](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2022)

Creates a new array of the same length filled with a specified value.

This function replaces all elements in the array with the provided value,
maintaining the original array's length and structure. It provides type-safe
array filling with precise return types.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

The exact type of the input array.

###### V

`V`

The type of the fill value.

##### Parameters

###### array

`Ar`

The array to fill.

###### value

`V`

The value to fill the array with.

##### Returns

`IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`V`, `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V`, `V`\] : readonly `V`[]

A new array of the same length filled with the specified value:

- For fixed-length arrays: returns `ArrayOfLength<Ar['length'], V>`
- For non-empty arrays: returns `NonEmptyArray<V>`
- For general arrays: returns `readonly V[]`

##### Example

```typescript
// Regular usage
const numbers = [1, 2, 3, 4, 5];
const zeros = Arr.toFilled(numbers, 0); // [0, 0, 0, 0, 0]

// Curried usage for pipe composition
const fillWithX = Arr.toFilled('X');
const result = pipe(['a', 'b', 'c']).map(fillWithX).value; // ['X', 'X', 'X']
```

##### See

- [toRangeFilled](#torangefilled) for filling only a specific range
- [create](#create) for creating new arrays filled with a value

#### Call Signature

> **toFilled**\<`V`\>(`value`): \<`Ar`\>(`array`) => `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`V`, `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V`, `V`\] : readonly `V`[]

Defined in: [src/array/array-utils.mts:2032](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2032)

Creates a new array of the same length filled with a specified value.

This function replaces all elements in the array with the provided value,
maintaining the original array's length and structure. It provides type-safe
array filling with precise return types.

##### Type Parameters

###### V

`V`

The type of the fill value.

##### Parameters

###### value

`V`

The value to fill the array with.

##### Returns

A new array of the same length filled with the specified value:

- For fixed-length arrays: returns `ArrayOfLength<Ar['length'], V>`
- For non-empty arrays: returns `NonEmptyArray<V>`
- For general arrays: returns `readonly V[]`

> \<`Ar`\>(`array`): `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`V`, `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V`, `V`\] : readonly `V`[]

###### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### Parameters

###### array

`Ar`

###### Returns

`IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`V`, `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V`, `V`\] : readonly `V`[]

##### Example

```typescript
// Regular usage
const numbers = [1, 2, 3, 4, 5];
const zeros = Arr.toFilled(numbers, 0); // [0, 0, 0, 0, 0]

// Curried usage for pipe composition
const fillWithX = Arr.toFilled('X');
const result = pipe(['a', 'b', 'c']).map(fillWithX).value; // ['X', 'X', 'X']
```

##### See

- [toRangeFilled](#torangefilled) for filling only a specific range
- [create](#create) for creating new arrays filled with a value

---

### toInserted()

#### Call Signature

> **toInserted**\<`Ar`, `V`\>(`array`, `index`, `newValue`): `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`Ar`\[`number`\] \| `V`, `` `${CastToNumber<Increment<Ar["length"]>>}` ``, \[\]\> : readonly \[`Ar`\[`number`\] \| `V`, `Ar`\[`number`\] \| `V`\]

Defined in: [src/array/array-utils.mts:1806](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1806)

Returns a new array with a new value inserted at the specified index.
Index can be out of bounds (e.g., negative or greater than length), `toSpliced` handles this.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### V

`V` = `Ar`\[`number`\]

##### Parameters

###### array

`Ar`

The input array.

###### index

`ArgArrayIndexWithNegative`\<`Ar`\>

The index at which to insert the new value.

###### newValue

`V`

The value to insert.

##### Returns

`IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`Ar`\[`number`\] \| `V`, `` `${CastToNumber<Increment<Ar["length"]>>}` ``, \[\]\> : readonly \[`Ar`\[`number`\] \| `V`, `Ar`\[`number`\] \| `V`\]

A new array with the value inserted.

##### Example

```ts
// Regular usage
Arr.toInserted([1, 2, 3], 1, 10); // [1, 10, 2, 3]

// Curried usage for pipe composition
const insertAtStart = Arr.toInserted(0, 99);
const result = pipe([1, 2, 3]).map(insertAtStart).value;
console.log(result); // [99, 1, 2, 3]
```

#### Call Signature

> **toInserted**\<`V`\>(`index`, `newValue`): \<`Ar`\>(`array`) => `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`V` \| `Ar`\[`number`\], `` `${CastToNumber<Increment<Ar["length"]>>}` ``, \[\]\> : readonly \[`V` \| `Ar`\[`number`\], `V` \| `Ar`\[`number`\]\]

Defined in: [src/array/array-utils.mts:1818](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1818)

Returns a new array with a new value inserted at the specified index.
Index can be out of bounds (e.g., negative or greater than length), `toSpliced` handles this.

##### Type Parameters

###### V

`V`

##### Parameters

###### index

[`ArgArrWithNegative`](../../../globals/namespaces/SizeType.md#argarrwithnegative)

The index at which to insert the new value.

###### newValue

`V`

The value to insert.

##### Returns

A new array with the value inserted.

> \<`Ar`\>(`array`): `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`V` \| `Ar`\[`number`\], `` `${CastToNumber<Increment<Ar["length"]>>}` ``, \[\]\> : readonly \[`V` \| `Ar`\[`number`\], `V` \| `Ar`\[`number`\]\]

###### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### Parameters

###### array

`Ar`

###### Returns

`IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`V` \| `Ar`\[`number`\], `` `${CastToNumber<Increment<Ar["length"]>>}` ``, \[\]\> : readonly \[`V` \| `Ar`\[`number`\], `V` \| `Ar`\[`number`\]\]

##### Example

```ts
// Regular usage
Arr.toInserted([1, 2, 3], 1, 10); // [1, 10, 2, 3]

// Curried usage for pipe composition
const insertAtStart = Arr.toInserted(0, 99);
const result = pipe([1, 2, 3]).map(insertAtStart).value;
console.log(result); // [99, 1, 2, 3]
```

---

### toPushed()

#### Call Signature

> **toPushed**\<`Ar`, `V`\>(`array`, `newValue`): readonly \[`Ar`, `V`\]

Defined in: [src/array/array-utils.mts:1917](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1917)

Returns a new array with a value added to the end.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### V

`V`

The type of the value to add.

##### Parameters

###### array

`Ar`

The input array.

###### newValue

`V`

The value to add.

##### Returns

readonly \[`Ar`, `V`\]

A new array with the value added to the end. Type is `readonly [...E, V]`.

##### Example

```ts
// Regular usage
Arr.toPushed([1, 2] as const, 3); // [1, 2, 3]

// Curried usage for pipe composition
const addZero = Arr.toPushed(0);
const result = pipe([1, 2, 3]).map(addZero).value;
console.log(result); // [1, 2, 3, 0]
```

#### Call Signature

> **toPushed**\<`V`\>(`newValue`): \<`Ar`\>(`array`) => readonly \[`Ar`, `V`\]

Defined in: [src/array/array-utils.mts:1922](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1922)

Returns a new array with a value added to the end.

##### Type Parameters

###### V

`V`

The type of the value to add.

##### Parameters

###### newValue

`V`

The value to add.

##### Returns

A new array with the value added to the end. Type is `readonly [...E, V]`.

> \<`Ar`\>(`array`): readonly \[`Ar`, `V`\]

###### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### Parameters

###### array

`Ar`

###### Returns

readonly \[`Ar`, `V`\]

##### Example

```ts
// Regular usage
Arr.toPushed([1, 2] as const, 3); // [1, 2, 3]

// Curried usage for pipe composition
const addZero = Arr.toPushed(0);
const result = pipe([1, 2, 3]).map(addZero).value;
console.log(result); // [1, 2, 3, 0]
```

---

### toRangeFilled()

#### Call Signature

> **toRangeFilled**\<`Ar`, `V`\>(`array`, `value`, `fillRange`): `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`V` \| `Ar`\[`number`\], `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`V` \| `Ar`\[`number`\])[]

Defined in: [src/array/array-utils.mts:2087](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2087)

Creates a new array with a specific range filled with a specified value.

This function fills only the specified range of indices with the provided value,
leaving other elements unchanged. It provides type-safe range filling with
precise return types.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

The exact type of the input array.

###### V

`V`

The type of the fill value.

##### Parameters

###### array

`Ar`

The array to fill a range of.

###### value

`V`

The value to fill the range with.

###### fillRange

readonly \[`ArgArrayIndexWithNegative`\<`Ar`\>, `ArgArrayIndexWithNegative`\<`Ar`\>\]

A tuple containing [start, end] indices for the range to fill.

##### Returns

`IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`V` \| `Ar`\[`number`\], `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`V` \| `Ar`\[`number`\])[]

A new array with the specified range filled:

- For fixed-length arrays: returns `ArrayOfLength<Ar['length'], V | Ar[number]>`
- For non-empty arrays: returns `NonEmptyArray<V | Ar[number]>`
- For general arrays: returns `readonly (V | Ar[number])[]`

##### Example

```typescript
// Regular usage
const numbers = [1, 2, 3, 4, 5];
const result = Arr.toRangeFilled(numbers, 0, [1, 4]); // [1, 0, 0, 0, 5]

// Curried usage for pipe composition
const fillMiddleWithX = Arr.toRangeFilled('X', [1, 3]);
const result2 = pipe(['a', 'b', 'c', 'd']).map(fillMiddleWithX).value; // ['a', 'X', 'X', 'd']
```

##### See

[toFilled](#tofilled) for filling the entire array

#### Call Signature

> **toRangeFilled**\<`V`\>(`value`, `fillRange`): \<`Ar`\>(`array`) => `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`V` \| `Ar`\[`number`\], `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`V` \| `Ar`\[`number`\])[]

Defined in: [src/array/array-utils.mts:2101](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L2101)

Creates a new array with a specific range filled with a specified value.

This function fills only the specified range of indices with the provided value,
leaving other elements unchanged. It provides type-safe range filling with
precise return types.

##### Type Parameters

###### V

`V`

The type of the fill value.

##### Parameters

###### value

`V`

The value to fill the range with.

###### fillRange

readonly \[[`ArgArrWithNegative`](../../../globals/namespaces/SizeType.md#argarrwithnegative), [`ArgArrWithNegative`](../../../globals/namespaces/SizeType.md#argarrwithnegative)\]

A tuple containing [start, end] indices for the range to fill.

##### Returns

A new array with the specified range filled:

- For fixed-length arrays: returns `ArrayOfLength<Ar['length'], V | Ar[number]>`
- For non-empty arrays: returns `NonEmptyArray<V | Ar[number]>`
- For general arrays: returns `readonly (V | Ar[number])[]`

> \<`Ar`\>(`array`): `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`V` \| `Ar`\[`number`\], `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`V` \| `Ar`\[`number`\])[]

###### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### Parameters

###### array

`Ar`

###### Returns

`IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`V` \| `Ar`\[`number`\], `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`V` \| `Ar`\[`number`\])[]

##### Example

```typescript
// Regular usage
const numbers = [1, 2, 3, 4, 5];
const result = Arr.toRangeFilled(numbers, 0, [1, 4]); // [1, 0, 0, 0, 5]

// Curried usage for pipe composition
const fillMiddleWithX = Arr.toRangeFilled('X', [1, 3]);
const result2 = pipe(['a', 'b', 'c', 'd']).map(fillMiddleWithX).value; // ['a', 'X', 'X', 'd']
```

##### See

[toFilled](#tofilled) for filling the entire array

---

### toRemoved()

#### Call Signature

> **toRemoved**\<`Ar`\>(`array`, `index`): readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:1873](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1873)

Returns a new array with the element at the specified index removed.
If index is out of bounds, `toSpliced` handles this (usually by returning a copy).

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

The input array.

###### index

`ArgArrayIndexWithNegative`\<`Ar`\>

The index of the element to remove.

##### Returns

readonly `Ar`\[`number`\][]

A new array with the element removed.

##### Example

```ts
// Regular usage
Arr.toRemoved([1, 2, 3], 1); // [1, 3]

// Curried usage for pipe composition
const removeFirst = Arr.toRemoved(0);
const result = pipe([10, 20, 30]).map(removeFirst).value;
console.log(result); // [20, 30]
```

#### Call Signature

> **toRemoved**(`index`): \<`E`\>(`array`) => readonly `E`[]

Defined in: [src/array/array-utils.mts:1878](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1878)

Returns a new array with the element at the specified index removed.
If index is out of bounds, `toSpliced` handles this (usually by returning a copy).

##### Parameters

###### index

[`ArgArrWithNegative`](../../../globals/namespaces/SizeType.md#argarrwithnegative)

The index of the element to remove.

##### Returns

A new array with the element removed.

> \<`E`\>(`array`): readonly `E`[]

###### Type Parameters

###### E

`E`

###### Parameters

###### array

readonly `E`[]

###### Returns

readonly `E`[]

##### Example

```ts
// Regular usage
Arr.toRemoved([1, 2, 3], 1); // [1, 3]

// Curried usage for pipe composition
const removeFirst = Arr.toRemoved(0);
const result = pipe([10, 20, 30]).map(removeFirst).value;
console.log(result); // [20, 30]
```

---

### toReversed()

> **toReversed**\<`Ar`\>(`array`): `Reverse`\<`Ar`\>

Defined in: [src/array/array-utils.mts:3907](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3907)

Reverses a tuple, preserving element types in their new positions.

The type system precisely tracks the reversal, so the returned tuple
has its element types in the exact reverse order. This is more precise
than array reversal which loses positional type information.

#### Type Parameters

##### Ar

`Ar` _extends_ readonly `unknown`[]

#### Parameters

##### array

`Ar`

The input tuple

#### Returns

`Reverse`\<`Ar`\>

A new tuple with elements in reverse order and precise typing

#### Example

```typescript
// Basic reversal
const nums = [1, 2, 3] as const;
const reversed = Arr.toReversed(nums); // readonly [3, 2, 1]

// Mixed types preserved in reverse positions
const mixed = [1, 'hello', true, null] as const;
const revMixed = Arr.toReversed(mixed);
// readonly [null, true, 'hello', 1]

// Empty and single-element tuples
const empty = [] as const;
const revEmpty = Arr.toReversed(empty); // readonly []
const single = [42] as const;
const revSingle = Arr.toReversed(single); // readonly [42]
```

---

### toSorted()

> **toSorted**\<`Ar`\>(...`__namedParameters`): `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`Ar`\[`number`\], `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:3929](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3929)

Sorts an array by a value derived from its elements, using a numeric mapping.

#### Type Parameters

##### Ar

`Ar` _extends_ readonly `unknown`[]

#### Parameters

##### \_\_namedParameters

...`Ar` _extends_ readonly `number`[] ? readonly \[`Ar`\<`Ar`\<`Ar`\>\>, `undefined` \| (`x`, `y`) => `number`\] : readonly \[`Ar`, (`x`, `y`) => `number`\]

#### Returns

`IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`Ar`\[`number`\], `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][]

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

### toSortedBy()

#### Call Signature

> **toSortedBy**\<`Ar`\>(`array`, `comparatorValueMapper`, `comparator?`): `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`Ar`\[`number`\], `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:3969](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3969)

Sorts an array by a value derived from its elements, using a numeric mapping.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

##### Parameters

###### array

`Ar`

The input array.

###### comparatorValueMapper

(`value`) => `number`

A function `(value: A) => number` that maps an element to a number for comparison.

###### comparator?

(`x`, `y`) => `number`

An optional custom comparator function `(x: number, y: number) => number` for the mapped numbers. Defaults to ascending sort (x - y).

##### Returns

`IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`Ar`\[`number`\], `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][]

A new array sorted by the mapped values.

##### Example

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

#### Call Signature

> **toSortedBy**\<`Ar`, `V`\>(`array`, `comparatorValueMapper`, `comparator`): `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`Ar`\[`number`\], `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:3980](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3980)

Sorts an array by a value derived from its elements, using a numeric mapping.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### V

`V`

##### Parameters

###### array

`Ar`

The input array.

###### comparatorValueMapper

(`value`) => `V`

A function `(value: A) => number` that maps an element to a number for comparison.

###### comparator

(`x`, `y`) => `number`

An optional custom comparator function `(x: number, y: number) => number` for the mapped numbers. Defaults to ascending sort (x - y).

##### Returns

`IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `MakeTupleImpl`\<`Ar`\[`number`\], `` `${Ar["length"]}` ``, \[\]\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][]

A new array sorted by the mapped values.

##### Example

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

### toUnshifted()

#### Call Signature

> **toUnshifted**\<`Ar`, `V`\>(`array`, `newValue`): readonly \[`V`, `Ar`\]

Defined in: [src/array/array-utils.mts:1964](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1964)

Returns a new array with a value added to the beginning.

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### V

`V`

The type of the value to add.

##### Parameters

###### array

`Ar`

The input array.

###### newValue

`V`

The value to add.

##### Returns

readonly \[`V`, `Ar`\]

A new array with the value added to the beginning. Type is `readonly [V, ...E]`.

##### Example

```ts
// Regular usage
Arr.toUnshifted([1, 2] as const, 0); // [0, 1, 2]

// Curried usage for pipe composition
const prependZero = Arr.toUnshifted(0);
const result = pipe([1, 2, 3]).map(prependZero).value;
console.log(result); // [0, 1, 2, 3]
```

#### Call Signature

> **toUnshifted**\<`V`\>(`newValue`): \<`Ar`\>(`array`) => readonly \[`V`, `Ar`\]

Defined in: [src/array/array-utils.mts:1969](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1969)

Returns a new array with a value added to the beginning.

##### Type Parameters

###### V

`V`

The type of the value to add.

##### Parameters

###### newValue

`V`

The value to add.

##### Returns

A new array with the value added to the beginning. Type is `readonly [V, ...E]`.

> \<`Ar`\>(`array`): readonly \[`V`, `Ar`\]

###### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### Parameters

###### array

`Ar`

###### Returns

readonly \[`V`, `Ar`\]

##### Example

```ts
// Regular usage
Arr.toUnshifted([1, 2] as const, 0); // [0, 1, 2]

// Curried usage for pipe composition
const prependZero = Arr.toUnshifted(0);
const result = pipe([1, 2, 3]).map(prependZero).value;
console.log(result); // [0, 1, 2, 3]
```

---

### toUpdated()

#### Call Signature

> **toUpdated**\<`Ar`, `V`\>(`array`, `index`, `updater`): `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `Readonly`\<\{ \[K in string \| number \| symbol\]: V \| Ar\[K\<K\>\] \}\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`Ar`\[`number`\] \| `V`)[]

Defined in: [src/array/array-utils.mts:1740](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1740)

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

##### Type Parameters

###### Ar

`Ar` _extends_ readonly `unknown`[]

###### V

`V` = `Ar`\[`number`\]

The type of the value returned by the updater function.

##### Parameters

###### array

`Ar`

The input array to update. Can be any readonly array.

###### index

`ArgArrayIndex`\<`Ar`\>

The index of the element to update. Must be a non-negative [SizeType.ArgArr](../../../globals/namespaces/SizeType.md#argarr).

- **Valid range:** `0 <= index < array.length`
- **Out of bounds:** Returns original array unchanged
- **Negative values:** Not allowed by type system (non-negative constraint)

###### updater

(`prev`) => `V`

A function `(prev: E) => U` that transforms the existing element:

- **prev:** The current element at the specified index
- **returns:** The new value to place at that index (can be different type)

##### Returns

`IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `Readonly`\<\{ \[K in string \| number \| symbol\]: V \| Ar\[K\<K\>\] \}\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`Ar`\[`number`\] \| `V`)[]

A new `readonly (E | U)[]` array where:

- All elements except the target index remain unchanged (type `E`)
- The element at the target index is replaced with the updater result (type `U`)
- Type union `E | U` accommodates both original and updated element types
- If index is out of bounds, returns the original array unchanged

##### Example

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

##### See

- Array.prototype.with for the native method with different error handling
- [SizeType.ArgArr](../../../globals/namespaces/SizeType.md#argarr) for the index type constraint
- Immutable update patterns for functional programming approaches

#### Call Signature

> **toUpdated**\<`E`, `V`\>(`index`, `updater`): \<`Ar`\>(`array`) => `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `Readonly`\<\{ \[K in string \| number \| symbol\]: V \| Ar\[K\<K\>\] \}\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`V` \| `Ar`\[`number`\])[]

Defined in: [src/array/array-utils.mts:1754](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L1754)

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

##### Type Parameters

###### E

`E`

The type of elements in the original array.

###### V

`V` = `E`

The type of the value returned by the updater function.

##### Parameters

###### index

[`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The index of the element to update. Must be a non-negative [SizeType.ArgArr](../../../globals/namespaces/SizeType.md#argarr).

- **Valid range:** `0 <= index < array.length`
- **Out of bounds:** Returns original array unchanged
- **Negative values:** Not allowed by type system (non-negative constraint)

###### updater

(`prev`) => `V`

A function `(prev: E) => U` that transforms the existing element:

- **prev:** The current element at the specified index
- **returns:** The new value to place at that index (can be different type)

##### Returns

A new `readonly (E | U)[]` array where:

- All elements except the target index remain unchanged (type `E`)
- The element at the target index is replaced with the updater result (type `U`)
- Type union `E | U` accommodates both original and updated element types
- If index is out of bounds, returns the original array unchanged

> \<`Ar`\>(`array`): `IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `Readonly`\<\{ \[K in string \| number \| symbol\]: V \| Ar\[K\<K\>\] \}\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`V` \| `Ar`\[`number`\])[]

###### Type Parameters

###### Ar

`Ar` _extends_ readonly `E`[]

###### Parameters

###### array

`Ar`

###### Returns

`IsFixedLengthList`\<`Ar`\> _extends_ `true` ? `Readonly`\<\{ \[K in string \| number \| symbol\]: V \| Ar\[K\<K\>\] \}\> : `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`V` \| `Ar`\<`Ar`\>\[`number`\], `V` \| `Ar`\<`Ar`\>\[`number`\]\] : readonly (`V` \| `Ar`\[`number`\])[]

##### Example

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

##### See

- Array.prototype.with for the native method with different error handling
- [SizeType.ArgArr](../../../globals/namespaces/SizeType.md#argarr) for the index type constraint
- Immutable update patterns for functional programming approaches

---

### uniq()

> **uniq**\<`Ar`\>(`array`): `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:4425](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4425)

Creates a new array with unique elements from the input array. Order is preserved from the first occurrence.
Uses `Set` internally for efficient uniqueness checking.

#### Type Parameters

##### Ar

`Ar` _extends_ readonly `Primitive`[]

#### Parameters

##### array

`Ar`

The input array.

#### Returns

`Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][]

A new array with unique elements from the input array. Returns `[]` for an empty input.

#### Example

```ts
Arr.uniq([1, 2, 2, 3, 1, 4]); // [1, 2, 3, 4]
```

---

### uniqBy()

> **uniqBy**\<`Ar`, `P`\>(`array`, `mapFn`): `Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][]

Defined in: [src/array/array-utils.mts:4454](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4454)

Creates a new array with unique elements from the input array, based on the values returned by `mapFn`.

- If the input is a non-empty array, returns a non-empty array.
- Otherwise, returns a readonly array.

#### Type Parameters

##### Ar

`Ar` _extends_ readonly `unknown`[]

##### P

`P` _extends_ `Primitive`

The type of the mapped value (used for uniqueness comparison).

#### Parameters

##### array

`Ar`

The input array.

##### mapFn

(`value`) => `P`

A function `(value: A) => P` to map elements to values for uniqueness comparison.

#### Returns

`Ar` _extends_ readonly \[`unknown`, `unknown`\] ? readonly \[`Ar`\<`Ar`\>\[`number`\], `Ar`\<`Ar`\>\[`number`\]\] : readonly `Ar`\[`number`\][]

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

### values()

> **values**\<`E`\>(`array`): `ArrayIterator`\<`E`\>

Defined in: [src/array/array-utils.mts:4705](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L4705)

Returns an iterable of values in the array.

This function is essentially an identity function that returns a copy of the array.
It's included for API completeness and consistency with native Array methods.

#### Type Parameters

##### E

`E`

#### Parameters

##### array

readonly `E`[]

The array to get values from.

#### Returns

`ArrayIterator`\<`E`\>

A copy of the input array.

#### Example

```typescript
// Direct usage
const numbers = [1, 2, 3];
const values = Arr.values(numbers); // [1, 2, 3]

// Curried usage
const getValues = Arr.values;
const result = getValues(['a', 'b']); // ['a', 'b']
```

---

### zeros()

> **zeros**\<`N`\>(`len`): `N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `MakeTupleImpl`\<`0`, `` `${N<N>}` ``, \[\]\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? readonly \[`0`, `0`\] : readonly `0`[]

Defined in: [src/array/array-utils.mts:417](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L417)

Creates an array of zeros with the specified length.

This function provides compile-time type safety with precise return types:

- When `len` is a compile-time known `SmallUint` (0-100), returns a tuple with exact length
- When `len` is a positive runtime value, returns a `NonEmptyArray<0>`
- Otherwise, returns a `readonly 0[]` that may be empty

#### Type Parameters

##### N

`N` _extends_ [`ArgArr`](../../../globals/namespaces/SizeType.md#argarr)

The type of the length parameter. When a `SmallUint` literal is provided,
the return type will be a tuple of exactly that length filled with zeros.

#### Parameters

##### len

`N`

The length of the array to create. Must be a non-negative integer.

#### Returns

`N` _extends_ `0` \| `1` \| `2` \| `3` \| `4` \| `5` \| `6` \| `7` \| `8` \| `9` \| `10` \| `11` \| `12` \| `13` \| `14` \| `15` \| `16` \| `17` \| `18` \| `19` \| `20` \| `21` \| `22` \| `23` \| `24` \| `25` \| `26` \| `27` \| `28` \| `29` \| `30` \| `31` \| `32` \| `33` \| `34` \| `35` \| `36` \| `37` \| `38` \| `39` ? `MakeTupleImpl`\<`0`, `` `${N<N>}` ``, \[\]\> : `N` _extends_ [`ArgArrPositive`](../../../globals/namespaces/SizeType.md#argarrpositive) ? readonly \[`0`, `0`\] : readonly `0`[]

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

---

### zip()

> **zip**\<`Ar1`, `Ar2`\>(`array1`, `array2`): `Zip`\<`Ar1`, `Ar2`\>

Defined in: [src/array/array-utils.mts:3486](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/array/array-utils.mts#L3486)

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
