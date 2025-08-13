[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / utils/create-assert-fn

# utils/create-assert-fn

## Functions

### createAssertFn()

> **createAssertFn**\<`T`\>(`validate`): (`a`) => `asserts a is T`

Defined in: [utils/create-assert-fn.mts:12](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/create-assert-fn.mts#L12)

#### Type Parameters

##### T

`T`

#### Parameters

##### validate

(`a`) => `Result`\<`T`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>

#### Returns

> (`a`): `asserts a is T`

##### Parameters

###### a

`unknown`

##### Returns

`asserts a is T`
