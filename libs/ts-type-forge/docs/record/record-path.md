[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / record/record-path

# record/record-path

## Type Aliases

### RecordPathsWithIndex\<R\>

> **RecordPathsWithIndex**\<`R`\> = [`RecordPathPrefixes`](../branded-types/brand/namespaces/TSTypeForgeInternals/README.md#recordpathprefixes)\<[`RecordLeafPathsWithIndex`](#recordleafpathswithindex)\<`R`\>\>

Defined in: [record/record-path.d.mts:11](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/record-path.d.mts#L11)

Calculates all possible paths (including intermediate paths and the root `[]`) within a nested record `R`,
allowing `number` as an index type for arrays.

#### Type Parameters

##### R

`R`

The record or array type.

#### Returns

A union of readonly tuples representing all possible paths. Each tuple element is a key (string) or an index (number).

#### Example

```ts
type Data = { a: { b: string[]; c: number } };
type P = PathsWithIndex<Data>;
// P = readonly [] | readonly ["a"] | readonly ["a", "b"] | readonly ["a", "b", number] | readonly ["a", "c"]
```

---

### RecordPaths\<R\>

> **RecordPaths**\<`R`\> = [`RecordPathPrefixes`](../branded-types/brand/namespaces/TSTypeForgeInternals/README.md#recordpathprefixes)\<[`RecordLeafPaths`](#recordleafpaths)\<`R`\>\>

Defined in: [record/record-path.d.mts:25](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/record-path.d.mts#L25)

Calculates all possible paths (including intermediate paths and the root `[]`) within a nested record `R`,
using specific number literal indices for tuples.

#### Type Parameters

##### R

`R`

The record or tuple type.

#### Returns

A union of readonly tuples representing all possible paths. Each tuple element is a key (string) or a specific index (number literal).

#### Example

```ts
type Data = { a: { b: [string, boolean]; c: number } };
type P = Paths<Data>;
// P = readonly [] | readonly ["a"] | readonly ["a", "b"] | readonly ["a", "b", 0] | readonly ["a", "b", 1] | readonly ["a", "c"]
```

---

### RecordPathAndValueTypeTuple\<R\>

> **RecordPathAndValueTypeTuple**\<`R`\> = `TSTypeForgeInternals.AttachValueTypeAtPath`\<`R`, [`RecordPaths`](#recordpaths)\<`R`\>\>

Defined in: [record/record-path.d.mts:69](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/record-path.d.mts#L69)

Generates a union of tuples, where each tuple contains a possible path in `R` (using specific tuple indices)
and the type of the value located at that path.

#### Type Parameters

##### R

`R`

The record or tuple type.

#### Returns

A union of `readonly [Path, ValueType]` tuples.

#### Example

```ts
type Data = { a: string; b: [number] };
type KPV = KeyPathAndValueTypeAtPathTuple<Data>;
// KPV = | readonly [readonly [], { a: string; b: [number] }]
//       | readonly [readonly ["a"], string]
//       | readonly [readonly ["b"], [number]]
//       | readonly [readonly ["b", 0], number]
```

---

### RecordLeafPaths\<R\>

> **RecordLeafPaths**\<`R`\> = `R` _extends_ readonly `unknown`[] ? `TSTypeForgeInternals.LeafPathsImplListCase`\<`R`, keyof `R`\> : `R` _extends_ [`UnknownRecord`](../constants/record.md#unknownrecord) ? `TSTypeForgeInternals.LeafPathsImplRecordCase`\<`R`, keyof `R`\> : readonly \[\]

Defined in: [record/record-path.d.mts:82](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/record-path.d.mts#L82)

Calculates all possible paths from the root to the _leaf_ nodes within a nested record `R`,
using specific number literal indices for tuples. Leaf nodes are values that are not records or tuples.

#### Type Parameters

##### R

`R`

The record or tuple type.

#### Returns

A union of readonly tuples representing paths to leaf nodes.

#### Example

```ts
type Data = { a: { b: [string, { d: boolean }]; c: number } };
type LP = LeafPaths<Data>;
// LP = readonly ["a", "b", 0] | readonly ["a", "b", 1, "d"] | readonly ["a", "c"]
```

---

### RecordLeafPathsWithIndex\<R\>

> **RecordLeafPathsWithIndex**\<`R`\> = `R` _extends_ readonly `unknown`[] ? `TSTypeForgeInternals.LeafPathsWithIndexImplListCase`\<`R`, keyof `R`\> : `R` _extends_ [`UnknownRecord`](../constants/record.md#unknownrecord) ? `TSTypeForgeInternals.LeafPathsWithIndexImplRecordCase`\<`R`, keyof `R`\> : readonly \[\]

Defined in: [record/record-path.d.mts:135](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/record-path.d.mts#L135)

Calculates all possible paths from the root to the _leaf_ nodes within a nested record `R`,
allowing `number` as an index type for arrays. Leaf nodes are values that are not records or arrays.

#### Type Parameters

##### R

`R`

The record or array type.

#### Returns

A union of readonly tuples representing paths to leaf nodes, using `number` for array indices.

#### Example

```ts
type Data = { a: { b: string[]; c: number } };
type LP = LeafPathsWithIndex<Data>;
// LP = readonly ["a", "b", number] | readonly ["a", "c"]
```

---

### RecordUpdated\<R, Path, ValueAfter\>

> **RecordUpdated**\<`R`, `Path`, `ValueAfter`\> = `Path` _extends_ readonly \[\] ? `ValueAfter` : `R` _extends_ readonly `unknown`[] ? `TSTypeForgeInternals.RecordUpdatedImplTupleCase`\<`R`, `Path`, `ValueAfter`\> : `R` _extends_ [`UnknownRecord`](../constants/record.md#unknownrecord) ? `TSTypeForgeInternals.RecordUpdatedImplRecordCase`\<`R`, `Path`, `ValueAfter`\> : `R`

Defined in: [record/record-path.d.mts:192](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/record-path.d.mts#L192)

Creates a new record type based on `R`, where the value at the specified `Path` (using specific tuple indices)
is updated to have the type `ValueAfter`.

#### Type Parameters

##### R

`R`

The original record or tuple type.

##### Path

`Path` _extends_ [`RecordPaths`](#recordpaths)\<`R`\>

The path to the value to update (from `Paths<R>`).

##### ValueAfter

`ValueAfter`

The new type for the value at the path.

#### Returns

A new record or tuple type with the updated value type at the specified path.

#### Example

```ts
type Data = { a: { b: [string, boolean] } };
type Updated = RecordUpdated<Data, ['a', 'b', 1], number>;
// Updated = { readonly a: { readonly b: readonly [string, number]; }; }
type UpdatedRoot = RecordUpdated<Data, [], null>; // null
```

---

### RecordValueAtPath\<R, Path\>

> **RecordValueAtPath**\<`R`, `Path`\> = `Path` _extends_ readonly \[infer Head, `...(infer Rest)`\] ? `Head` _extends_ keyof `R` ? `Rest` _extends_ [`RecordPaths`](#recordpaths)\<`R`\[`Head`\]\> ? [`RecordValueAtPath`](#recordvalueatpath)\<`R`\[`Head`\], `Rest`\> : `never` : `never` : `R`

Defined in: [record/record-path.d.mts:262](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/record-path.d.mts#L262)

Extracts the type of the value at a specific `Path` within a nested record `R`.
Uses specific number literal indices for tuples.

#### Type Parameters

##### R

`R`

The record or tuple type.

##### Path

`Path` _extends_ [`RecordPaths`](#recordpaths)\<`R`\>

The path to the value (from `Paths<R>`).

#### Returns

The type of the value at the specified path. Returns `R` if `Path` is `[]`.

#### Example

```ts
type Data = { a: { b: [string, boolean] } };
type V1 = RecordValueAtPath<Data, ['a', 'b', 0]>; // string
type V2 = RecordValueAtPath<Data, ['a']>; // { b: [string, boolean] }
type V3 = RecordValueAtPath<Data, []>; // { a: { b: [string, boolean] } }
```

---

### RecordValueAtPathWithIndex\<R, Path\>

> **RecordValueAtPathWithIndex**\<`R`, `Path`\> = `TSTypeForgeInternals.RecordValueAtPathWithIndexImpl`\<`R`, `Path`, `never`\>

Defined in: [record/record-path.d.mts:286](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/record-path.d.mts#L286)

Extracts the type of the value at a specific `Path` within a nested record `R`.
Allows `number` as an index type for arrays. May include `undefined` in the result
if the path involves a `number` index (as array elements might not exist at runtime).

#### Type Parameters

##### R

`R`

The record or array type.

##### Path

`Path` _extends_ [`RecordPathsWithIndex`](#recordpathswithindex)\<`R`\>

The path to the value (from `PathsWithIndex<R>`).

#### Returns

The type of the value at the specified path, potentially including `undefined`. Returns `R` if `Path` is `[]`.

#### Example

```ts
type Data = { a: { b: string[]; c: number } };
type V1 = RecordValueAtPathWithIndex<Data, ['a', 'b', number]>; // string | undefined
type V2 = RecordValueAtPathWithIndex<Data, ['a', 'c']>; // number
type V3 = RecordValueAtPathWithIndex<Data, []>; // { a: { b: string[]; c: number } }
```

## References

### TSTypeForgeInternals

Re-exports [TSTypeForgeInternals](../branded-types/brand/namespaces/TSTypeForgeInternals/README.md)
