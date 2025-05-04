[**Documentation**](../README.md)

---

[Documentation](../README.md) / type-level-integer/index-type

# type-level-integer/index-type

## Type Aliases

### Index\<N\>

> **Index**\<`N`\> = [`IndexOfTuple`](../tuple-and-list/index-of-tuple.md#indexoftuple)\<[`MakeTuple`](../tuple-and-list/make-tuple.md#maketuple)\<`0`, `N`\>\>

Defined in: [type-level-integer/index-type.d.mts:13](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/type-level-integer/index-type.d.mts#L13)

Creates a union of non-negative integer literals from 0 up to (but not including) `N`.
Equivalent to `0 | 1 | ... | N-1`.
Requires `N` to be a non-negative integer literal.

#### Type Parameters

##### N

`N` _extends_ `number`

The upper bound (exclusive). Must be a non-negative integer literal.

#### Returns

A union type `0 | 1 | ... | N-1`. Returns `never` if `N` is 0.

#### Example

```ts
type Idx3 = Index<3>; // 0 | 1 | 2
type Idx0 = Index<0>; // never
type Idx1 = Index<1>; // 0
```

---

### IndexInclusive\<N\>

> **IndexInclusive**\<`N`\> = [`IndexOfTuple`](../tuple-and-list/index-of-tuple.md#indexoftuple)\<\[`...MakeTuple<0, N>`, `0`\]\>

Defined in: [type-level-integer/index-type.d.mts:26](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/type-level-integer/index-type.d.mts#L26)

Creates a union of non-negative integer literals from 0 up to (and including) `N`.
Equivalent to `0 | 1 | ... | N`.
Requires `N` to be a non-negative integer literal.

#### Type Parameters

##### N

`N` _extends_ `number`

The upper bound (inclusive). Must be a non-negative integer literal.

#### Returns

A union type `0 | 1 | ... | N`.

#### Example

```ts
type IdxInc3 = IndexInclusive<3>; // 0 | 1 | 2 | 3
type IdxInc0 = IndexInclusive<0>; // 0
```

---

### NegativeIndex\<N\>

> **NegativeIndex**\<`N`\> = `TSTypeForgeInternals.MapIdx`\<[`RelaxedExclude`](../record/std.md#relaxedexclude)\<[`IndexInclusive`](#indexinclusive)\<`N`\>, `0`\>\>

Defined in: [type-level-integer/index-type.d.mts:40](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/type-level-integer/index-type.d.mts#L40)

Creates a union of negative integer literals from -1 down to (and including) `-N`.
Equivalent to `-1 | -2 | ... | -N`.
Requires `N` to be a non-negative integer literal.

#### Type Parameters

##### N

`N` _extends_ `number`

The absolute value of the lower bound (inclusive). Must be a non-negative integer literal.

#### Returns

A union type `-1 | -2 | ... | -N`. Returns `never` if `N` is 0.

#### Example

```ts
type NegIdx3 = NegativeIndex<3>; // -1 | -2 | -3
type NegIdx0 = NegativeIndex<0>; // never
type NegIdx1 = NegativeIndex<1>; // -1
```
