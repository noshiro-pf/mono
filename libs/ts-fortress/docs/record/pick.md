[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / record/pick

# record/pick

## Functions

### pick()

> **pick**\<`R`, `KeysToPick`\>(`recordType`, `keysToPick`, `options?`): `PickedType`\<`R`, `KeysToPick`\>

Defined in: [record/pick.mts:11](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/pick.mts#L11)

Creates a record type with keys picked.

#### Type Parameters

##### R

`R` _extends_ `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is UnknownRecord`; `cast`: (`a`) => `A`; `defaultValue`: `A`; `fill`: (`a`) => `A`; `is`: (`a`) => `a is UnknownRecord`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`UnknownRecord`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

##### KeysToPick

`KeysToPick` _extends_ readonly keyof [`TypeOf`](../type.md#typeof)\<`R`\> & `string`[]

#### Parameters

##### recordType

`R`

##### keysToPick

`KeysToPick`

##### options?

`Partial`\<`Readonly`\<\{ `typeName`: `string`; \}\>\>

#### Returns

`PickedType`\<`R`, `KeysToPick`\>
