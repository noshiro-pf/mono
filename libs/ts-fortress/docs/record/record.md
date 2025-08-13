[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / record/record

# record/record

## Functions

### record()

> **record**\<`R`\>(`source`, `options?`): [`Type`](../type.md#type)\<`RecordTypeValue`\<`R`\>\>

Defined in: [record/record.mts:11](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/record.mts#L11)

#### Type Parameters

##### R

`R` _extends_ `Record`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

#### Parameters

##### source

`R`

##### options?

`Partial`\<`Readonly`\<\{ `typeName`: `string`; \}\>\>

#### Returns

[`Type`](../type.md#type)\<`RecordTypeValue`\<`R`\>\>
