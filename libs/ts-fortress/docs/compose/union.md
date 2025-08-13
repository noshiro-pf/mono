[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / compose/union

# compose/union

## Functions

### union()

> **union**\<`Types`\>(`types`, `options?`): `UnionType`\<`Types`\>

Defined in: [compose/union.mts:10](https://github.com/noshiro-pf/ts-fortress/blob/main/src/compose/union.mts#L10)

#### Type Parameters

##### Types

`Types` _extends_ readonly \[`Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `string`[]\>; \}\>, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `string`[]\>; \}\>\]

#### Parameters

##### types

`Types`

##### options?

`Partial`\<`Readonly`\<\{ `defaultType`: `UnionType`\<`Types`\>; `typeName`: `string`; \}\>\>

#### Returns

`UnionType`\<`Types`\>
