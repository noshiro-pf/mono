[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / utils/create-primitive-type

# utils/create-primitive-type

## Functions

### createPrimitiveType()

> **createPrimitiveType**\<`A`\>(`__namedParameters`): [`Type`](../type.md#type)\<`A`\>

Defined in: [utils/create-primitive-type.mts:7](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/create-primitive-type.mts#L7)

#### Type Parameters

##### A

`A` _extends_ `Primitive`

#### Parameters

##### \_\_namedParameters

`Readonly`\<\{ `defaultValue`: `A`; `is`: (`value`) => `value is A`; `typeName`: `string`; \}\>

#### Returns

[`Type`](../type.md#type)\<`A`\>
