[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / record/partial

# record/partial

## Type Aliases

### PartialType

> **PartialType**\<`R`, `KeysToBeOptional`\> = [`RecordType`](../type/README.md#recordtype)\<`PartialTypeShape`\<`R`, `KeysToBeOptional`\>\>

Defined in: [src/record/partial.mts:71](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/partial.mts#L71)

#### Type Parameters

##### R

`R` _extends_ `ReadonlyRecord`\<`string`, [`Type`](../type/README.md#type)\<`unknown`\>\>

##### KeysToBeOptional

`KeysToBeOptional` _extends_ `NonEmptyArray`\<keyof `R` & `string`\> \| `undefined`

## Functions

### partial()

> **partial**\<`R`, `KeysToBeOptional`\>(`recordType`, `options?`): [`PartialType`](#partialtype)\<`R`, `KeysToBeOptional`\>

Defined in: [src/record/partial.mts:11](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/partial.mts#L11)

Creates a Partial type. If keysToBeOptional is set, only those keys are
optional, otherwise, all properties are optional.

#### Type Parameters

##### R

`R` _extends_ `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

##### KeysToBeOptional

`KeysToBeOptional` _extends_ readonly \[keyof `R` & `string`, keyof `R` & `string`\]

#### Parameters

##### recordType

[`RecordType`](../type/README.md#recordtype)\<`R`\>

##### options?

`Partial`\<`Readonly`\<\{ `allowExcessProperties`: `boolean`; `keysToBeOptional`: `KeysToBeOptional`; `typeName`: `string`; \}\>\>

#### Returns

[`PartialType`](#partialtype)\<`R`, `KeysToBeOptional`\>
