[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / record/key-value-record

# record/key-value-record

## Functions

### keyValueRecord()

> **keyValueRecord**\<`K`, `V`\>(`keyType`, `valueType`, `options?`): [`Type`](../type.md#type)\<`RecordResultType`\<`K`, `V`\>\>

Defined in: [record/key-value-record.mts:18](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/key-value-record.mts#L18)

#### Type Parameters

##### K

`K` _extends_ `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is string`; `cast`: (`a`) => `string`; `defaultValue`: `string`; `fill`: (`a`) => `string`; `is`: (`a`) => `a is string`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`string`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

##### V

`V` _extends_ `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

#### Parameters

##### keyType

`K`

##### valueType

`V`

##### options?

`Readonly`\<\{ `typeName?`: `string`; \}\>

#### Returns

[`Type`](../type.md#type)\<`RecordResultType`\<`K`, `V`\>\>
