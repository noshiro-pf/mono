[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / record/record

# record/record

## Functions

### record()

> **record**\<`R`\>(`source`, `options?`): [`Type`](../type.md#type)\<`RecordTypeValue`\<`R`\>\>

Defined in: [record/record.mts:13](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/record.mts#L13)

#### Type Parameters

##### R

`R` _extends_ `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

#### Parameters

##### source

`R`

##### options?

`Partial`\<`Readonly`\<\{ `allowExcessProperties`: `boolean`; `typeName`: `string`; \}\>\>

#### Returns

[`Type`](../type.md#type)\<`RecordTypeValue`\<`R`\>\>

---

### strictRecord()

> **strictRecord**\<`R`\>(`source`, `options?`): [`Type`](../type.md#type)\<`RecordTypeValue`\<`R`\>\>

Defined in: [record/record.mts:187](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/record.mts#L187)

Creates a strict record type that does not allow excess properties.
This is an alias for `record(source, { allowExcessProperties: false })`.

#### Type Parameters

##### R

`R` _extends_ `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

#### Parameters

##### source

`R`

The record schema definition

##### options?

`Partial`\<`Readonly`\<\{ `typeName`: `string`; \}\>\>

Optional configuration (allowExcessProperties will be overridden to false)

#### Returns

[`Type`](../type.md#type)\<`RecordTypeValue`\<`R`\>\>

A Type that validates records without allowing excess properties

#### Example

```typescript
import { strictRecord, string, number } from 'ts-fortress';

const User = strictRecord({
    name: string(),
    age: number(),
});

User.is({ name: 'John', age: 30 }); // true
User.is({ name: 'John', age: 30, extra: 'not allowed' }); // false
```
