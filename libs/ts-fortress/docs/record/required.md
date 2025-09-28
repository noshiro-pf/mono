[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / record/required

# record/required

## Type Aliases

### RequiredType

> **RequiredType**\<`R`, `KeysToBeRequired`\> = [`RecordType`](../type/README.md#recordtype)\<`RequiredTypeShape`\<`R`, `KeysToBeRequired`\>\>

Defined in: [src/record/required.mts:86](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/required.mts#L86)

#### Type Parameters

##### R

`R` _extends_ `ReadonlyRecord`\<`string`, [`Type`](../type/README.md#type)\<`unknown`\>\>

##### KeysToBeRequired

`KeysToBeRequired` _extends_ `NonEmptyArray`\<keyof `R` & `string`\> \| `undefined`

## Functions

### required()

> **required**\<`R`, `KeysToBeRequired`\>(`recordType`, `options?`): [`RequiredType`](#requiredtype)\<`R`, `KeysToBeRequired`\>

Defined in: [src/record/required.mts:15](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/required.mts#L15)

Creates a Required type. If keysToBeRequired is set, only those keys are
made required, otherwise, all properties are made required.

#### Type Parameters

##### R

`R` _extends_ `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

##### KeysToBeRequired

`KeysToBeRequired` _extends_ readonly \[keyof `R` & `string`, keyof `R` & `string`\]

#### Parameters

##### recordType

[`RecordType`](../type/README.md#recordtype)\<`R`\>

##### options?

`Partial`\<`Readonly`\<\{ `allowExcessProperties`: `boolean`; `keysToBeRequired`: `KeysToBeRequired`; `typeName`: `string`; \}\>\>

#### Returns

[`RequiredType`](#requiredtype)\<`R`, `KeysToBeRequired`\>
