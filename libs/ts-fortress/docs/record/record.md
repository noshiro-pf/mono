[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / record/record

# record/record

## Functions

### record()

> **record**\<`R`\>(`shape`, `options?`): [`RecordType`](../type/README.md#recordtype)\<`R`\>

Defined in: [src/record/record.mts:17](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/record.mts#L17)

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

#### Parameters

##### shape

`R`

##### options?

`Partial`\<`Readonly`\<\{ `allowExcessProperties`: `boolean`; `typeName`: `string`; \}\>\>

#### Returns

[`RecordType`](../type/README.md#recordtype)\<`R`\>

***

### strictRecord()

> **strictRecord**\<`R`\>(`source`, `options?`): [`RecordType`](../type/README.md#recordtype)\<`R`\>

Defined in: [src/record/record.mts:153](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/record.mts#L153)

Creates a strict record type that does not allow excess properties.
This is an alias for `record(source, { allowExcessProperties: false })`.

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

#### Parameters

##### source

`R`

The record schema definition

##### options?

`Partial`\<`Readonly`\<\{ `typeName`: `string`; \}\>\>

Optional configuration (allowExcessProperties will be overridden to false)

#### Returns

[`RecordType`](../type/README.md#recordtype)\<`R`\>

A Type that validates records without allowing excess properties

#### Example

```typescript
import { strictRecord, string, number } from 'ts-fortress';

const User = strictRecord({
  name: string(),
  age: number()
});

User.is({ name: "John", age: 30 }); // true
User.is({ name: "John", age: 30, extra: "not allowed" }); // false
```
