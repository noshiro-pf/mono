[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / array/tuple

# array/tuple

## Functions

### tuple()

> **tuple**\<`A`\>(`types`, `options?`): [`Type`](../type/README.md#type)\<`MapTuple`\<`A`\>\>

Defined in: [src/array/tuple.mts:17](https://github.com/noshiro-pf/ts-fortress/blob/main/src/array/tuple.mts#L17)

#### Type Parameters

##### A

`A` _extends_ readonly `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>[]

#### Parameters

##### types

`A`

##### options?

`Partial`\<`Readonly`\<\{ `typeName?`: `string`; \}\>\>

#### Returns

[`Type`](../type/README.md#type)\<`MapTuple`\<`A`\>\>
