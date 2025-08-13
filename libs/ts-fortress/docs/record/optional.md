[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / record/optional

# record/optional

## Type Aliases

### OptionalPropertyType\<T\>

> **OptionalPropertyType**\<`T`\> = `T` & `PartiallyRequired`\<`T`, `"optional"`\>

Defined in: [record/optional.mts:3](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/optional.mts#L3)

#### Type Parameters

##### T

`T` _extends_ [`Type`](../type.md#type)\<`unknown`\>

## Functions

### isOptionalProperty()

> **isOptionalProperty**\<`T`\>(`t`): `t is OptionalPropertyType<T>`

Defined in: [record/optional.mts:13](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/optional.mts#L13)

#### Type Parameters

##### T

`T` _extends_ `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

#### Parameters

##### t

`T`

#### Returns

`t is OptionalPropertyType<T>`

---

### optional()

> **optional**\<`T`\>(`t`): [`OptionalPropertyType`](#optionalpropertytype)\<`T`\>

Defined in: [record/optional.mts:6](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/optional.mts#L6)

#### Type Parameters

##### T

`T` _extends_ `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

#### Parameters

##### t

`T`

#### Returns

[`OptionalPropertyType`](#optionalpropertytype)\<`T`\>
