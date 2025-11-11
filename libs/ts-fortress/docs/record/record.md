[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / record/record

# record/record

## Functions

### record()

> **record**\<`R`, `ExcessValidation`\>(`shape`, `options?`): [`RecordType`](../type/README.md#recordtype)\<`R`, `ExcessValidation`\>

Defined in: [src/record/record.mts:18](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/record.mts#L18)

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](../utils/validation-error.md#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

##### ExcessValidation

`ExcessValidation` *extends* [`ExcessPropertyBehavior`](../type/README.md#excesspropertybehavior) = `"strip"`

#### Parameters

##### shape

`R`

##### options?

`Partial`\<`Readonly`\<\{ `excessPropertyFill`: [`ExcessPropertyFillBehavior`](../type/README.md#excesspropertyfillbehavior); `excessPropertyValidation`: `ExcessValidation`; `typeName`: `string`; \}\>\>

#### Returns

[`RecordType`](../type/README.md#recordtype)\<`R`, `ExcessValidation`\>

***

### strictRecord()

> **strictRecord**\<`R`\>(`source`, `options?`): [`RecordType`](../type/README.md#recordtype)\<`R`, `"error"`\>

Defined in: [src/record/record.mts:220](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/record.mts#L220)

Creates a strict record type that does not allow excess properties.
This is an alias for `record(source, { excessPropertyValidation: 'error' })`.

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](../utils/validation-error.md#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

#### Parameters

##### source

`R`

The record schema definition

##### options?

`Partial`\<`Readonly`\<\{ `excessPropertyFill`: `"allow"` \| `"strip"`; `typeName`: `string`; \}\>\>

Optional configuration

#### Returns

[`RecordType`](../type/README.md#recordtype)\<`R`, `"error"`\>

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
