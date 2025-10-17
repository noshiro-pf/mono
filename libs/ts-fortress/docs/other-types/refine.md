[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / other-types/refine

# other-types/refine

## Functions

### refine()

> **refine**\<`Base`, `R`\>(`__namedParameters`): [`Type`](../type/README.md#type)\<`R`\>

Defined in: [src/other-types/refine.mts:9](https://github.com/noshiro-pf/ts-fortress/blob/main/src/other-types/refine.mts#L9)

#### Type Parameters

##### Base

`Base` *extends* `string` \| `number` \| `bigint` \| `boolean`

##### R

`R` *extends* `string` \| `number` \| `bigint` \| `boolean`

#### Parameters

##### \_\_namedParameters

`Readonly`\<\{ `baseType`: [`Type`](../type/README.md#type)\<`Base`\>; `defaultValue`: `R`; `is`: (`a`) => `a is R`; `typeName?`: `string`; \}\>

#### Returns

[`Type`](../type/README.md#type)\<`R`\>
