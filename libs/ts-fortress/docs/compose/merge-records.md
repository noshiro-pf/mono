[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / compose/merge-records

# compose/merge-records

## Functions

### mergeRecords()

> **mergeRecords**\<`Types`\>(`types`, `options?`): `IntersectionType`\<`Types`\>

Defined in: [compose/merge-records.mts:10](https://github.com/noshiro-pf/ts-fortress/blob/main/src/compose/merge-records.mts#L10)

#### Type Parameters

##### Types

`Types` _extends_ readonly \[`Readonly`\<\{ `assertIs`: (`a`) => `asserts a is UnknownRecord`; `cast`: (`a`) => `A`; `defaultValue`: `A`; `fill`: (`a`) => `A`; `is`: (`a`) => `a is UnknownRecord`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`UnknownRecord`, readonly `string`[]\>; \}\>, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is UnknownRecord`; `cast`: (`a`) => `A`; `defaultValue`: `A`; `fill`: (`a`) => `A`; `is`: (`a`) => `a is UnknownRecord`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`UnknownRecord`, readonly `string`[]\>; \}\>\]

#### Parameters

##### types

`Types`

##### options?

`Partial`\<`Readonly`\<\{ `defaultType`: `IntersectionType`\<`Types`\>; `typeName`: `string`; \}\>\>

#### Returns

`IntersectionType`\<`Types`\>
