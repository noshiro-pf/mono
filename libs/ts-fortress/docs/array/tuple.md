[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / array/tuple

# array/tuple

## Functions

### tuple()

> **tuple**\<`A`\>(`types`, `options?`): [`Type`](../type.md#type)\<`MapTuple`\<`A`\>\>

Defined in: [array/tuple.mts:14](https://github.com/noshiro-pf/ts-fortress/blob/main/src/array/tuple.mts#L14)

#### Type Parameters

##### A

`A` _extends_ readonly `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `string`[]\>; \}\>[]

#### Parameters

##### types

`A`

##### options?

`Partial`\<`Readonly`\<\{ `typeName?`: `string`; \}\>\>

#### Returns

[`Type`](../type.md#type)\<`MapTuple`\<`A`\>\>
