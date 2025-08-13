[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / utils/create-is-fn

# utils/create-is-fn

## Functions

### createIsFn()

> **createIsFn**\<`T`\>(`validate`): (`a`) => `a is T`

Defined in: [utils/create-is-fn.mts:5](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/create-is-fn.mts#L5)

#### Type Parameters

##### T

`T`

#### Parameters

##### validate

(`a`) => `Result`\<`T`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>

#### Returns

> (`a`): `a is T`

##### Parameters

###### a

`unknown`

##### Returns

`a is T`
