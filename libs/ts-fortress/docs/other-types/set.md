[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / other-types/set

# other-types/set

## Functions

### SetType()

> **SetType**\<`T`\>(`elementType`, `options?`): [`Type`](../type/README.md#type)\<`SetResultType`\<`T`\>\>

Defined in: [src/other-types/set.mts:14](https://github.com/noshiro-pf/ts-fortress/blob/main/src/other-types/set.mts#L14)

#### Type Parameters

##### T

`T` _extends_ `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

#### Parameters

##### elementType

`T`

##### options?

`Readonly`\<\{ `typeName?`: `string`; \}\>

#### Returns

[`Type`](../type/README.md#type)\<`SetResultType`\<`T`\>\>
