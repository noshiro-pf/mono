[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / record/omit

# record/omit

## Type Aliases

### OmittedType

> **OmittedType**\<`R`, `KeysToOmit`\> = [`RecordType`](../type/README.md#recordtype)\<`Omit`\<`R`, `ArrayElement`\<`KeysToOmit`\>\>\>

Defined in: [src/record/omit.mts:28](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/omit.mts#L28)

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, [`Type`](../type/README.md#type)\<`unknown`\>\>

##### KeysToOmit

`KeysToOmit` *extends* readonly keyof `R`[]

## Functions

### omit()

> **omit**\<`R`, `KeysToOmit`\>(`recordType`, `keysToOmit`, `options?`): [`OmittedType`](#omittedtype)\<`R`, `KeysToOmit`\>

Defined in: [src/record/omit.mts:7](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/omit.mts#L7)

Creates a record type with keys omitted.

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

##### KeysToOmit

`KeysToOmit` *extends* readonly keyof `R` & `string`[]

#### Parameters

##### recordType

[`RecordType`](../type/README.md#recordtype)\<`R`\>

##### keysToOmit

`KeysToOmit`

##### options?

`Partial`\<`Readonly`\<\{ `allowExcessProperties`: `boolean`; `typeName`: `string`; \}\>\>

#### Returns

[`OmittedType`](#omittedtype)\<`R`, `KeysToOmit`\>
