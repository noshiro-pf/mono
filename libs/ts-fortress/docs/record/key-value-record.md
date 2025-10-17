[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / record/key-value-record

# record/key-value-record

## Functions

### keyValueRecord()

> **keyValueRecord**\<`K`, `V`\>(`keyType`, `valueType`, `options?`): [`Type`](../type/README.md#type)\<`RecordResultType`\<`K`, `V`\>\>

Defined in: [src/record/key-value-record.mts:18](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/key-value-record.mts#L18)

#### Type Parameters

##### K

`K` *extends* `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is string`; `cast`: (`a`) => `string`; `defaultValue`: `string`; `fill`: (`a`) => `string`; `is`: (`a`) => `a is string`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`string`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

##### V

`V` *extends* `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

#### Parameters

##### keyType

`K`

##### valueType

`V`

##### options?

`Partial`\<`Readonly`\<\{ `typeName`: `string`; \}\>\>

#### Returns

[`Type`](../type/README.md#type)\<`RecordResultType`\<`K`, `V`\>\>
