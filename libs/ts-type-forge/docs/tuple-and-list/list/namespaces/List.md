[**ts-type-forge**](../../../README.md)

***

[ts-type-forge](../../../README.md) / [tuple-and-list/list](../README.md) / List

# List

## Type Aliases

### Head

> **Head**\<`T`, `D`\> = `Tuple.Head`\<`T`, `D`\>

Defined in: [src/tuple-and-list/list.d.mts:15](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/list.d.mts#L15)

Gets the type of the first element of a readonly array or tuple `T`.
If the array is empty, it returns the default type `D` (defaults to `never`).
Delegates to `Tuple.Head`.

#### Type Parameters

##### T

`T` *extends* readonly `unknown`[]

The readonly array or tuple type.

##### D

`D` = `never`

The default type to return if `T` is empty. Defaults to `never`.

#### Returns

The type of the first element, or `D` if `T` is empty.

#### Example

```ts
type H1 = List.Head<[1, 2, 3]>; // 1
type H2 = List.Head<readonly string[]>; // string
type H3 = List.Head<[]>; // never
type H4 = List.Head<[], 'default'>; // 'default'
```

***

### Last

> **Last**\<`T`\> = `Tuple.Last`\<`T`\>

Defined in: [src/tuple-and-list/list.d.mts:28](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/list.d.mts#L28)

Gets the type of the last element of a readonly array or tuple `T`.
If the array is empty, it returns `never`.

#### Type Parameters

##### T

`T` *extends* readonly `unknown`[]

The readonly array or tuple type.

#### Returns

The type of the last element, or `never` if `T` is empty.

#### Example

```ts
type L1 = List.Last<[1, 2, 3]>; // 3
type L2 = List.Last<readonly string[]>; // string
type L3 = List.Last<[]>; // never
type L4 = List.Last<[1]>; // 1
```

***

### ButLast

> **ButLast**\<`A`\> = `Tuple.ButLast`\<`A`\>

Defined in: [src/tuple-and-list/list.d.mts:41](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/list.d.mts#L41)

Gets a new tuple/array type containing all elements of `A` except the last one.
Delegates to `Tuple.ButLast`.

#### Type Parameters

##### A

`A` *extends* readonly `unknown`[]

The readonly array or tuple type.

#### Returns

A new type with the last element removed.

#### Example

```ts
type BL1 = List.ButLast<[1, 2, 3]>; // readonly [1, 2]
type BL2 = List.ButLast<readonly string[]>; // readonly string[] (unchanged for general arrays)
type BL3 = List.ButLast<[1]>; // readonly []
type BL4 = List.ButLast<[]>; // readonly []
```

***

### Tail

> **Tail**\<`A`\> = `Tuple.Tail`\<`A`\>

Defined in: [src/tuple-and-list/list.d.mts:54](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/list.d.mts#L54)

Gets a new tuple/array type containing all elements of `A` except the first one.
Delegates to `Tuple.Tail`.

#### Type Parameters

##### A

`A` *extends* readonly `unknown`[]

The readonly array or tuple type.

#### Returns

A new type with the first element removed.

#### Example

```ts
type T1 = List.Tail<[1, 2, 3]>; // readonly [2, 3]
type T2 = List.Tail<readonly string[]>; // readonly string[] (unchanged for general arrays)
type T3 = List.Tail<[1]>; // readonly []
type T4 = List.Tail<[]>; // readonly []
```

***

### Reverse

> **Reverse**\<`L`\> = `L` *extends* readonly \[\] ? readonly \[\] : [`IsFixedLengthList`](../../../condition/is-fixed-length-list.md#isfixedlengthlist)\<`L`\> *extends* `true` ? `Tuple.Reverse`\<`L`\> : `L` *extends* readonly \[`unknown`, `...readonly unknown[]`\] ? readonly \[`...Reverse<Tail<L>>`, [`Head`](#head)\<`L`\>\] : `Readonly`\<`L`\>

Defined in: [src/tuple-and-list/list.d.mts:67](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/list.d.mts#L67)

Reverses the order of elements in a readonly array or tuple `L`.
For fixed-length tuples, it returns a tuple with elements in reverse order.
For general arrays, it returns a readonly array of the same element type.

#### Type Parameters

##### L

`L` *extends* readonly `unknown`[]

The readonly array or tuple type.

#### Returns

A new type with elements reversed.

#### Example

```ts
type R1 = List.Reverse<[1, 2, 3]>; // readonly [3, 2, 1]
type R2 = List.Reverse<readonly string[]>; // readonly string[]
type R3 = List.Reverse<[]>; // readonly []
```

***

### Take

> **Take**\<`N`, `T`\> = [`IsFixedLengthList`](../../../condition/is-fixed-length-list.md#isfixedlengthlist)\<`T`\> *extends* `true` ? `Tuple.Take`\<`N`, `T`\> : `T`

Defined in: [src/tuple-and-list/list.d.mts:87](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/list.d.mts#L87)

Takes the first `N` elements from a readonly array or tuple `T`.
If `T` is a tuple, it returns a new tuple containing the first `N` elements.
If `T` is a general array, it returns the original array type `T`.

#### Type Parameters

##### N

`N` *extends* `number`

The number of elements to take.

##### T

`T` *extends* readonly `unknown`[]

The readonly array or tuple type.

#### Returns

A new type containing the first `N` elements (for tuples) or `T` (for arrays).

#### Example

```ts
type TK1 = List.Take<2, [1, 2, 3]>; // readonly [1, 2]
type TK2 = List.Take<5, [1, 2, 3]>; // readonly [1, 2, 3]
type TK3 = List.Take<2, readonly string[]>; // readonly string[]
```

***

### Skip

> **Skip**\<`N`, `T`\> = [`IsFixedLengthList`](../../../condition/is-fixed-length-list.md#isfixedlengthlist)\<`T`\> *extends* `true` ? `Tuple.Skip`\<`N`, `T`\> : `T`

Defined in: [src/tuple-and-list/list.d.mts:102](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/list.d.mts#L102)

Skips the first `N` elements from a readonly array or tuple `T`.
If `T` is a tuple, it returns a new tuple containing the elements after the first `N`.
If `T` is a general array, it returns the original array type `T`.

#### Type Parameters

##### N

`N` *extends* `number`

The number of elements to skip.

##### T

`T` *extends* readonly `unknown`[]

The readonly array or tuple type.

#### Returns

A new type containing elements after the first `N` (for tuples) or `T` (for arrays).

#### Example

```ts
type SK1 = List.Skip<1, [1, 2, 3]>; // readonly [2, 3]
type SK2 = List.Skip<3, [1, 2, 3]>; // readonly []
type SK3 = List.Skip<1, readonly string[]>; // readonly string[]
```

***

### TakeLast

> **TakeLast**\<`N`, `T`\> = [`IsFixedLengthList`](../../../condition/is-fixed-length-list.md#isfixedlengthlist)\<`T`\> *extends* `true` ? `Tuple.TakeLast`\<`N`, `T`\> : `T`

Defined in: [src/tuple-and-list/list.d.mts:117](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/list.d.mts#L117)

Takes the last `N` elements from a readonly array or tuple `T`.
If `T` is a tuple, it returns a new tuple containing the last `N` elements.
If `T` is a general array, it returns the original array type `T`.

#### Type Parameters

##### N

`N` *extends* `number`

The number of elements to take.

##### T

`T` *extends* readonly `unknown`[]

The readonly array or tuple type.

#### Returns

A new type containing the last `N` elements (for tuples) or `T` (for arrays).

#### Example

```ts
type TL1 = List.TakeLast<2, [1, 2, 3]>; // readonly [2, 3]
type TL2 = List.TakeLast<5, [1, 2, 3]>; // readonly [1, 2, 3]
type TL3 = List.TakeLast<2, readonly string[]>; // readonly string[]
```

***

### SkipLast

> **SkipLast**\<`N`, `T`\> = [`IsFixedLengthList`](../../../condition/is-fixed-length-list.md#isfixedlengthlist)\<`T`\> *extends* `true` ? `Tuple.SkipLast`\<`N`, `T`\> : `T`

Defined in: [src/tuple-and-list/list.d.mts:132](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/list.d.mts#L132)

Skips the last `N` elements from a readonly array or tuple `T`.
If `T` is a tuple, it returns a new tuple containing the elements before the last `N`.
If `T` is a general array, it returns the original array type `T`.

#### Type Parameters

##### N

`N` *extends* `number`

The number of elements to skip.

##### T

`T` *extends* readonly `unknown`[]

The readonly array or tuple type.

#### Returns

A new type containing elements before the last `N` (for tuples) or `T` (for arrays).

#### Example

```ts
type SL1 = List.SkipLast<1, [1, 2, 3]>; // readonly [1, 2]
type SL2 = List.SkipLast<3, [1, 2, 3]>; // readonly []
type SL3 = List.SkipLast<1, readonly string[]>; // readonly string[]
```

***

### SetAt

> **SetAt**\<`T`, `I`, `V`\> = [`IsFixedLengthList`](../../../condition/is-fixed-length-list.md#isfixedlengthlist)\<`T`\> *extends* `true` ? `Tuple.SetAt`\<`T`, `I`, `V`\> : readonly (`T`\[`number`\] \| `V`)[]

Defined in: [src/tuple-and-list/list.d.mts:148](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/list.d.mts#L148)

Creates a new array/tuple type where the element at index `I` in `T` is replaced with type `V`.
If `T` is a tuple, it returns a new tuple type with the element at `I` updated.
If `T` is a general array, it returns a general array type `readonly (T[number] | V)[]`.

#### Type Parameters

##### T

`T` *extends* readonly `unknown`[]

The readonly array or tuple type.

##### I

`I` *extends* `number`

The index to update (must be a valid index for `T` if `T` is a tuple).

##### V

`V`

The new type for the element at index `I`.

#### Returns

A new array/tuple type with the element at index `I` updated.

#### Example

```ts
type SA1 = List.SetAt<[1, 2, 3], 1, 'x'>; // readonly [1, 'x', 3]
type SA2 = List.SetAt<readonly number[], 1, 'x'>; // readonly (string | number)[]
// type SA3 = List.SetAt<[1, 2], 2, 'x'>; // Error if I is out of bounds for tuple
```

***

### Flatten

> **Flatten**\<`T`\> = `Tuple.Flatten`\<`T`\>

Defined in: [src/tuple-and-list/list.d.mts:163](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/list.d.mts#L163)

Flattens a nested readonly array/tuple `T` by one level.
Delegates to `Tuple.Flatten`.

#### Type Parameters

##### T

`T` *extends* readonly readonly `unknown`[][]

A readonly array/tuple where elements are themselves readonly arrays/tuples.

#### Returns

A new flattened array/tuple type.

#### Example

```ts
type F1 = List.Flatten<[[1, 2], [3, 4]]>; // readonly [1, 2, 3, 4]
type F2 = List.Flatten<[readonly number[], readonly string[]]>; // readonly (string | number)[]
type F3 = List.Flatten<[[1], [2, [3]]]>; // readonly [1, 2, [3]] (only flattens one level)
```

***

### Concat

> **Concat**\<`A`, `B`\> = `Tuple.Concat`\<`A`, `B`\>

Defined in: [src/tuple-and-list/list.d.mts:176](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/list.d.mts#L176)

Concatenates two readonly arrays or tuples `A` and `B`.
Delegates to `Tuple.Concat`.

#### Type Parameters

##### A

`A` *extends* readonly `unknown`[]

The first readonly array or tuple.

##### B

`B` *extends* readonly `unknown`[]

The second readonly array or tuple.

#### Returns

A new type representing the concatenation of `A` and `B`.

#### Example

```ts
type C1 = List.Concat<[1, 2], [3, 4]>; // readonly [1, 2, 3, 4]
type C2 = List.Concat<readonly number[], readonly string[]>; // readonly (string | number)[]
type C3 = List.Concat<[1], readonly number[]>; // readonly [1, ...number[]]
```

***

### Zip

> **Zip**\<`A`, `B`\> = `A` *extends* readonly \[\] ? readonly \[\] : `B` *extends* readonly \[\] ? readonly \[\] : `A` *extends* [`NonEmptyArray`](../../array.md#nonemptyarray)\<`unknown`\> ? `B` *extends* [`NonEmptyArray`](../../array.md#nonemptyarray)\<`unknown`\> ? readonly \[readonly \[[`Head`](#head)\<`A`\>, [`Head`](#head)\<`B`\>\], `...Zip<Tail<A>, Tail<B>>`\] : readonly \[readonly \[[`Head`](#head)\<`A`\>, `B`\[`number`\]\], `...Zip<Tail<A>, Tail<B>>`\] : `B` *extends* [`NonEmptyArray`](../../array.md#nonemptyarray)\<`unknown`\> ? readonly \[readonly \[`A`\[`number`\], [`Head`](#head)\<`B`\>\], `...Zip<Tail<A>, Tail<B>>`\] : readonly readonly \[`A`\[`number`\], `B`\[`number`\]\][]

Defined in: [src/tuple-and-list/list.d.mts:195](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/list.d.mts#L195)

Creates pairs of elements from two readonly arrays or tuples `A` and `B`.
If the arrays/tuples have different lengths, the resulting type reflects pairing up to the shortest length,
potentially using the general element type for the longer array if one is a general array.

#### Type Parameters

##### A

`A` *extends* readonly `unknown`[]

The first readonly array or tuple.

##### B

`B` *extends* readonly `unknown`[]

The second readonly array or tuple.

#### Returns

A readonly array/tuple of pairs `readonly [A[i], B[i]]`.

#### Example

```ts
type Z1 = List.Zip<[1, 2], ['a', 'b']>; // readonly [[1, 'a'], [2, 'b']]
type Z2 = List.Zip<[1, 2, 3], ['a', 'b']>; // readonly [[1, 'a'], [2, 'b']]
type Z3 = List.Zip<readonly number[], readonly string[]>; // readonly (readonly [number, string])[]
type Z4 = List.Zip<[1, 2], readonly string[]>; // readonly [[1, string], [2, string]]
type Z5 = List.Zip<readonly number[], ['a', 'b']>; // readonly [[number, 'a'], [number, 'b']]
```

***

### Partition

> **Partition**\<`N`, `T`\> = `Tuple.Partition`\<`N`, `T`\>

Defined in: [src/tuple-and-list/list.d.mts:221](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/list.d.mts#L221)

Partitions a readonly array or tuple `T` into sub-arrays/tuples of length `N`.
Delegates to `Tuple.Partition`.

#### Type Parameters

##### N

`N` *extends* `number`

The desired size of each partition (must be a positive integer literal).

##### T

`T` *extends* readonly `unknown`[]

The readonly array or tuple type to partition.

#### Returns

A readonly array/tuple where each element is a sub-array/tuple of length `N`.

#### Example

```ts
type P1 = List.Partition<2, [1, 2, 3, 4, 5]>; // readonly [[1, 2], [3, 4], [5]]
type P2 = List.Partition<3, readonly number[]>; // readonly (readonly number[])[]
type P3 = List.Partition<1, [1, 2]>; // readonly [[1], [2]]
```
