[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / compose/intersection

# compose/intersection

## Functions

### intersection()

> **intersection**\<`Types`\>(`types`, `defaultType`, `options?`): `IntersectionType`\<`Types`\>

Defined in: [compose/intersection.mts:10](https://github.com/noshiro-pf/ts-fortress/blob/main/src/compose/intersection.mts#L10)

#### Type Parameters

##### Types

`Types` _extends_ readonly \[`Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `string`[]\>; \}\>, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `string`[]\>; \}\>\]

#### Parameters

##### types

`Types`

##### defaultType

`IntersectionType`\<`Types`\>

##### options?

`Partial`\<`Readonly`\<\{ `typeName`: `string`; \}\>\>

#### Returns

`IntersectionType`\<`Types`\>
