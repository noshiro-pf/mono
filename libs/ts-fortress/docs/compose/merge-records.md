[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / compose/merge-records

# compose/merge-records

## Functions

### mergeRecords()

> **mergeRecords**\<`Types`\>(`types`, `options?`): `IntersectionType`\<`Types`\>

Defined in: [src/compose/merge-records.mts:12](https://github.com/noshiro-pf/ts-fortress/blob/main/src/compose/merge-records.mts#L12)

#### Type Parameters

##### Types

`Types` _extends_ readonly \[`Readonly`\<\{ `assertIs`: (`a`) => `asserts a is UnknownRecord`; `cast`: (`a`) => `A`; `defaultValue`: `A`; `fill`: (`a`) => `A`; `is`: (`a`) => `a is UnknownRecord`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`UnknownRecord`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is UnknownRecord`; `cast`: (`a`) => `A`; `defaultValue`: `A`; `fill`: (`a`) => `A`; `is`: (`a`) => `a is UnknownRecord`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`UnknownRecord`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\]

#### Parameters

##### types

`Types`

##### options?

`Partial`\<`Readonly`\<\{ `defaultType`: `IntersectionType`\<`Types`\>; `typeName`: `string`; \}\>\>

#### Returns

`IntersectionType`\<`Types`\>
