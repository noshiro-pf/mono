[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / other-types/refine

# other-types/refine

## Functions

### refine()

> **refine**\<`Base`, `R`\>(`__namedParameters`): [`Type`](../type.md#type)\<`R`\>

Defined in: [src/other-types/refine.mts:9](https://github.com/noshiro-pf/ts-fortress/blob/main/src/other-types/refine.mts#L9)

#### Type Parameters

##### Base

`Base` _extends_ `string` \| `number` \| `bigint` \| `boolean`

##### R

`R` _extends_ `string` \| `number` \| `bigint` \| `boolean`

#### Parameters

##### \_\_namedParameters

`Readonly`\<\{ `baseType`: [`Type`](../type.md#type)\<`Base`\>; `defaultValue`: `R`; `is`: (`a`) => `a is R`; `typeName?`: `string`; \}\>

#### Returns

[`Type`](../type.md#type)\<`R`\>
