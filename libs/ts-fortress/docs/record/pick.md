[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / record/pick

# record/pick

## Type Aliases

### PickedType\<R, KeysToPick\>

> **PickedType**\<`R`, `KeysToPick`\> = [`RecordType`](../type/README.md#recordtype)\<`Pick`\<`R`, `ArrayElement`\<`KeysToPick`\>\>\>

Defined in: [src/record/pick.mts:28](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/pick.mts#L28)

#### Type Parameters

##### R

`R` _extends_ `ReadonlyRecord`\<`string`, [`Type`](../type/README.md#type)\<`unknown`\>\>

##### KeysToPick

`KeysToPick` _extends_ readonly keyof `R`[]

## Functions

### pick()

> **pick**\<`R`, `KeysToPick`\>(`recordType`, `keysToPick`, `options?`): [`PickedType`](#pickedtype)\<`R`, `KeysToPick`\>

Defined in: [src/record/pick.mts:7](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/pick.mts#L7)

Creates a record type with keys picked.

#### Type Parameters

##### R

`R` _extends_ `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

##### KeysToPick

`KeysToPick` _extends_ readonly keyof `R` & `string`[]

#### Parameters

##### recordType

[`RecordType`](../type/README.md#recordtype)\<`R`\>

##### keysToPick

`KeysToPick`

##### options?

`Partial`\<`Readonly`\<\{ `allowExcessProperties`: `boolean`; `typeName`: `string`; \}\>\>

#### Returns

[`PickedType`](#pickedtype)\<`R`, `KeysToPick`\>
