[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / tuple-and-list/index-of-tuple

# tuple-and-list/index-of-tuple

## Type Aliases

### IndexOfTuple\<T\>

> **IndexOfTuple**\<`T`\> = `TSTypeForgeInternals.IndexOfTupleImpl`\<`T`, keyof `T`\>

Defined in: [tuple-and-list/index-of-tuple.d.mts:14](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/index-of-tuple.d.mts#L14)

Extracts the numeric index type from a readonly array or tuple type `T`.
If `T` is a tuple (fixed length), it returns a union of its numeric index literals (e.g., `0 | 1 | 2`).
If `T` is a regular array (variable length), it returns `number`.

#### Type Parameters

##### T

`T` _extends_ readonly `unknown`[]

The readonly array or tuple type.

#### Returns

A union of number literals representing the indices if `T` is a tuple, otherwise `number`.

#### Example

```ts
type TupleIndices = IndexOfTuple<[string, boolean, number]>; // 0 | 1 | 2
type ArrayIndices = IndexOfTuple<string[]>; // number
type EmptyTupleIndices = IndexOfTuple<[]>; // never
type ReadonlyArrayIndices = IndexOfTuple<readonly number[]>; // number
```

---

### NegativeIndexOfTuple\<T\>

> **NegativeIndexOfTuple**\<`T`\> = `TSTypeForgeInternals.MapIdx`\<[`RelaxedExclude`](../record/std.md#relaxedexclude)\<[`IndexOfTuple`](#indexoftuple)\<\[`...T`, `0`\]\>, `0`\>\>

Defined in: [tuple-and-list/index-of-tuple.d.mts:31](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/tuple-and-list/index-of-tuple.d.mts#L31)

Extracts the negative index type from a readonly array or tuple type `T`.
Negative indices allow accessing elements from the end of the array (e.g., `-1` for last element).
If `T` is a tuple (fixed length), it returns a union of its negative index literals (e.g., `-1 | -2 | -3`).
If `T` is a regular array (variable length), it returns `number`.

#### Type Parameters

##### T

`T` _extends_ readonly `unknown`[]

The readonly array or tuple type.

#### Returns

A union of negative number literals representing the indices if `T` is a tuple, otherwise `number`.

#### Example

```ts
type TupleNegativeIndices = NegativeIndexOfTuple<[string, boolean, number]>; // -1 | -2 | -3
type ArrayNegativeIndices = NegativeIndexOfTuple<string[]>; // number
type EmptyTupleNegativeIndices = NegativeIndexOfTuple<[]>; // never
type ReadonlyArrayNegativeIndices = NegativeIndexOfTuple<readonly number[]>; // number
```

## References

### TSTypeForgeInternals

Re-exports [TSTypeForgeInternals](../branded-types/brand/namespaces/TSTypeForgeInternals/README.md)
