[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / tuple-and-list/array

# tuple-and-list/array

## Type Aliases

### MutableNonEmptyArray

> **MutableNonEmptyArray**\<`A`\> = \[`A`, `...A[]`\]

Defined in: [src/tuple-and-list/array.d.mts:12](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/array.d.mts#L12)

Represents a mutable array that is guaranteed to have at least one element.

#### Type Parameters

##### A

`A`

The type of elements in the array.

#### Example

```ts
type NA = MutableNonEmptyArray<string>; // [string, ...string[]]
const valid: NA = ['hello'];
const alsoValid: NA = ['hello', 'world'];
// const invalid: NA = []; // Error
```

---

### NonEmptyArray

> **NonEmptyArray**\<`A`\> = readonly \[`A`, `...readonly A[]`\]

Defined in: [src/tuple-and-list/array.d.mts:24](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/array.d.mts#L24)

Represents a readonly array that is guaranteed to have at least one element.

#### Type Parameters

##### A

`A`

The type of elements in the array.

#### Example

```ts
type NA = NonEmptyArray<number>; // readonly [number, ...number[]]
const valid: NA = [1];
const alsoValid: NA = [1, 2, 3];
// const invalid: NA = []; // Error
// valid.push(4); // Error: Property 'push' does not exist on type 'readonly [number, ...number[]]'.
```

---

### ArrayElement

> **ArrayElement**\<`S`\> = `S` _extends_ readonly infer T[] ? `T` : `never`

Defined in: [src/tuple-and-list/array.d.mts:37](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/array.d.mts#L37)

Extracts the element type from a readonly array or tuple type `S`.
If `S` is not an array or tuple type, it resolves to `never`.

#### Type Parameters

##### S

`S`

The array or tuple type.

#### Returns

The type of the elements within the array/tuple.

#### Example

```ts
type StrElm = ArrayElement<string[]>; // string
type NumElm = ArrayElement<readonly number[]>; // number
type TupleElm = ArrayElement<[string, boolean]>; // string | boolean
type NotArray = ArrayElement<{ a: number }>; // never
```

---

### ArrayOfLength

> **ArrayOfLength**\<`N`, `Elm`\> = [`MakeTuple`](make-tuple.md#maketuple)\<`Elm`, `N`\>

Defined in: [src/tuple-and-list/array.d.mts:51](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/array.d.mts#L51)

Creates a readonly tuple type of a specific length `N` with elements of type `Elm`.
Alias for `MakeTuple<Elm, N>`.

#### Type Parameters

##### N

`N` _extends_ `number`

The desired length of the tuple (must be a non-negative integer literal).

##### Elm

`Elm`

The type of elements in the tuple.

#### Returns

A readonly tuple type `readonly [Elm, Elm, ..., Elm]` of length `N`.

#### Example

```ts
type TupleOf3Strings = ArrayOfLength<3, string>; // readonly [string, string, string]
type TupleOf0Numbers = ArrayOfLength<0, number>; // readonly []
```

---

### MutableArrayOfLength

> **MutableArrayOfLength**\<`N`, `Elm`\> = [`Mutable`](../others/mutable.md#mutable)\<[`ArrayOfLength`](#arrayoflength)\<`N`, `Elm`\>\>

Defined in: [src/tuple-and-list/array.d.mts:61](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/array.d.mts#L61)

Creates a mutable tuple type of a specific length `N` with elements of type `Elm`.

#### Type Parameters

##### N

`N` _extends_ `number`

The desired length of the tuple (must be a non-negative integer literal).

##### Elm

`Elm`

The type of elements in the tuple.

#### Returns

A mutable tuple type `[Elm, Elm, ..., Elm]` of length `N`.

#### Example

```ts
type MutableTupleOf2Booleans = MutableArrayOfLength<2, boolean>; // [boolean, boolean]
```

---

### MutableArrayAtLeastLen

> **MutableArrayAtLeastLen**\<`N`, `Elm`\> = [`Mutable`](../others/mutable.md#mutable)\<[`ArrayAtLeastLen`](#arrayatleastlen)\<`N`, `Elm`\>\>

Defined in: [src/tuple-and-list/array.d.mts:80](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/array.d.mts#L80)

Creates a mutable array type that is guaranteed to have at least `N` elements of type `Elm`.

#### Type Parameters

##### N

`N` _extends_ `number`

The minimum length of the array (must be a non-negative integer literal).

##### Elm

`Elm`

The type of elements in the array.

#### Returns

A mutable array type `[Elm, ..., Elm, ...Elm[]]` with at least `N` elements.

#### Example

```ts
type AtLeast2Numbers = MutableArrayAtLeastLen<2, number>; // [number, number, ...number[]]
const valid: AtLeast2Numbers = [1, 2];
const alsoValid: AtLeast2Numbers = [1, 2, 3, 4];
// const invalid: AtLeast2Numbers = [1]; // Error
```

---

### ArrayAtLeastLen

> **ArrayAtLeastLen**\<`N`, `Elm`\> = readonly \[`...MakeTuple<Elm, N>`, `...Elm[]`\]

Defined in: [src/tuple-and-list/array.d.mts:95](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/array.d.mts#L95)

Creates a readonly array type that is guaranteed to have at least `N` elements of type `Elm`.

#### Type Parameters

##### N

`N` _extends_ `number`

The minimum length of the array (must be a non-negative integer literal).

##### Elm

`Elm`

The type of elements in the array.

#### Returns

A readonly array type `readonly [Elm, ..., Elm, ...Elm[]]` with at least `N` elements.

#### Example

```ts
type AtLeast3Strings = ArrayAtLeastLen<3, string>; // readonly [string, string, string, ...string[]]
const valid: AtLeast3Strings = ['a', 'b', 'c'];
const alsoValid: AtLeast3Strings = ['a', 'b', 'c', 'd'];
// const invalid: AtLeast3Strings = ["a", "b"]; // Error
```
