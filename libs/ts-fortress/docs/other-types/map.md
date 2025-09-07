[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / other-types/map

# other-types/map

## Functions

### MapType()

> **MapType**\<`K`, `V`\>(`keyType`, `valueType`, `options?`): [`Type`](../type/README.md#type)\<`MapResultType`\<`K`, `V`\>\>

Defined in: [src/other-types/map.mts:18](https://github.com/noshiro-pf/ts-fortress/blob/main/src/other-types/map.mts#L18)

#### Type Parameters

##### K

`K` _extends_ `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

##### V

`V` _extends_ `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

#### Parameters

##### keyType

`K`

##### valueType

`V`

##### options?

`Readonly`\<\{ `typeName?`: `string`; \}\>

#### Returns

[`Type`](../type/README.md#type)\<`MapResultType`\<`K`, `V`\>\>
