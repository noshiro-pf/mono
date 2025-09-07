[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / utils/create-type

# utils/create-type

## Functions

### createType()

> **createType**\<`A`\>(`__namedParameters`): [`Type`](../type/README.md#type)\<`A`\>

Defined in: [src/utils/create-type.mts:6](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/create-type.mts#L6)

#### Type Parameters

##### A

`A`

#### Parameters

##### \_\_namedParameters

`Readonly`\<\{ `defaultValue`: `A`; `fill?`: [`Type`](../type/README.md#type)\<`A`\>\[`"fill"`\]; `typeName`: `string`; `validate`: [`Type`](../type/README.md#type)\<`A`\>\[`"validate"`\]; \}\>

#### Returns

[`Type`](../type/README.md#type)\<`A`\>
